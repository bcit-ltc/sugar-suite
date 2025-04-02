from typing import Annotated
import json
import dagger
from dagger import DefaultPath, dag, function, object_type, Secret, Doc


@object_type
class SugarSuite:

    @function
    async def publish(self, source: Annotated[dagger.Directory, DefaultPath("./")], registry: str, username: str, token: Annotated[dagger.Secret, Doc("GitHub API token")], tags: str) -> str:
        """Publish the application container to a registry"""
        # Split the tags by comma and strip any whitespace
        tag_list = [t.strip() for t in tags.split(",")]   
    
        # Call Dagger Function to build the application image
        image = (
            self.build(source)
            .with_secret_variable("GITHUB_TOKEN", token)
            .with_registry_auth(registry, username, token)
            )
    
        # Publish the image for each tag
        for tag in tag_list:
            await image.publish(f"{registry}:{tag}")
    
        return f"Published with tags: {', '.join(tag_list)}"
    
    @function
    def build(self, source: Annotated[dagger.Directory, DefaultPath("./")]) -> dagger.Container:
        """Build a ready-to-use production environment"""
        builder_output = (
            self.installdependencies(source)
            .with_exec(["npm", "run", "build"])
            .directory("./")
        )
        return (
            dag.container()
            .from_("nginxinc/nginx-unprivileged")
            .with_directory("/usr/share/nginx/html/css", builder_output.directory('css'))
            .with_directory("/usr/share/nginx/html/js", builder_output.directory('js'))
            .with_directory("/usr/share/nginx/html/assets", builder_output.directory('assets'))
            .with_directory("/usr/share/nginx/html/html", builder_output.directory('html'))
            .with_file("/usr/share/nginx/html/index.html", builder_output.file('index.html'))
            .with_file("/usr/share/nginx/html/favicon.ico", builder_output.file('favicon.ico'))
            # .with_exposed_port(8080)
        )

    @function
    async def semanticrelease(self, source: Annotated[dagger.Directory, DefaultPath("./")], branch: str) -> str:
        """Run the semantic-release tool and return version information"""
        
        # Use the semantic-release container and copy files from dependencies_container
        semantic_release_container = await (
            dag.container()
            .from_("ghcr.io/bcit-ltc/semantic-release:arv2")  # Use prebuilt semantic-release container
            # Configure Git to use HTTPS with GITHUB_TOKEN
            .with_exec(["git", "config", "--global", "url.https://github.com/.insteadOf", "git@github.com:"])
            .with_exec(["git", "config", "--global", "user.name", "github-actions[bot]"])
            .with_exec(["git", "config", "--global", "user.email", "github-actions[bot]@users.noreply.github.com"])
            # Set the GITHUB_TOKEN environment variable
            .with_env_variable("GITHUB_TOKEN", "$GITHUB_TOKEN")
            # Copy all files from dependencies_container except node_modules
            .with_directory("/usr/share/nginx/html/.git", source.directory(".git"))
            # Preserve the pre-installed node_modules in the semantic-release container
            .with_workdir("/usr/share/nginx/html")
            # Run semantic-release
            .with_exec(["npx", "semantic-release"])
        )
    
        # Capture the container's output directory
        output_directory = semantic_release_container.directory("/usr/share/nginx/html")
    
        # Extract the NEXT_VERSION and CURRENT_VERSION files
        next_version = await output_directory.file("NEXT_VERSION").contents()
    
        return next_version

    
    @function
    def unittesting(self, source: Annotated[dagger.Directory, DefaultPath("./")]) -> str:
        """Return the result of running unit tests"""
        
        return (
            self.installdependencies(source)
            .with_exec(["npm", "run", "test"])
            .stdout()
        )
    
    @function
    def installdependencies(self, source: Annotated[dagger.Directory, DefaultPath("./")]) -> dagger.Container:
        """Install all dependencies"""
        # create a Dagger cache volume for node_modules
        node_modules_cache = dag.cache_volume("node_modules_cache")
        
        return (
            dag.container()
            # start from a base Node.js container
            .from_("node:18-alpine")
            # add the source code at /app
            .with_directory("/usr/share/nginx/html", source)
            # mount the cache volume at /app/node_modules
            .with_mounted_cache("/usr/share/nginx/html/node_modules", node_modules_cache)
            # change the working directory to /app
            .with_workdir("/usr/share/nginx/html")
            # install dependencies
            .with_exec(["npm", "install"])
        )