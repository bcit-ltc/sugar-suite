from typing import Annotated
from dagger import Container, DaggerError, DefaultPath, Directory, Doc, QueryError, Secret, dag, function, object_type

@object_type
class SugarSuite:

    @function
    async def semanticrelease(self, 
                              source: Annotated[Directory, DefaultPath("./"), Doc("Source directory containing the project files")],
                              token: Annotated[Secret, Doc("GitHub API token for authentication")]
                              ) -> str:
        """Run the semantic-release tool to determine the next version and publish the release"""
        
        # Use the semantic-release container and copy files from dependencies_container
        semantic_release_container = await (
            dag.container()
            .from_("ghcr.io/bcit-ltc/semantic-release:arv2")  # Use prebuilt semantic-release container
            # Configure Git to use HTTPS with GITHUB_TOKEN
            .with_exec(["git", "config", "--global", "url.https://github.com/.insteadOf", "git@github.com:"])
            .with_exec(["git", "config", "--global", "user.name", "github-actions[bot]"])
            .with_exec(["git", "config", "--global", "user.email", "github-actions[bot]@users.noreply.github.com"])
            .with_secret_variable("GITHUB_TOKEN", token)
            # Copy all files from dependencies_container except node_modules
            .with_directory("/usr/share/nginx/html/.git", source.directory(".git"))
            # Preserve the pre-installed node_modules in the semantic-release container
            .with_workdir("/usr/share/nginx/html")
            # Run semantic-release
            .with_exec(["npx", "semantic-release", "--no-ci"])
        )

        # Capture the container's output directory
        output_directory = semantic_release_container.directory("/usr/share/nginx/html")
        next_version_file = output_directory.file("NEXT_VERSION")

        try:
            return (await next_version_file.contents()).strip()
        except QueryError:  # Catch the error if the file doesn't exist
            try:
                # If the NEXT_VERSION file doesn't exist, try to get the last tag
                git_container = semantic_release_container.with_exec(["git", "describe", "--tags", "--abbrev=0"])
                last_tag = (await git_container.stdout()).strip()
                return last_tag
            except Exception:
                # If no tags are found, default to 0.0.0
                return "0.0.0"

    @function
    def determineenvironment(self, 
                            source: Annotated[Directory, DefaultPath("./"), Doc("Source directory containing the project files")],
                            ) -> str:
        return (
            dag.determine_environment()
		    .getenv()
        )
    
    @function
    async def publish(self,
                      source: Annotated[Directory, DefaultPath("./"), Doc("Source directory containing the project files")],
                      tags: Annotated[str, Doc("Comma-separated list of tags for the container")],
                      registry: Annotated[str | None, Doc("Registry URL to publish the container")],
                      username: Annotated[str | None, Doc("Username for registry authentication")],
                      token: Annotated[Secret | None, Doc("GitHub API token for registry authentication")]
                      ) -> str:
        """Publish the application container to a registry"""
        if (token is None) != (username is None):  # XOR check: one is provided but not the other
            raise DaggerError("Both 'token' and 'username' must be provided together, or neither.")
        
        # Split the tags by comma and strip any whitespace
        tag_list = [t.strip() for t in tags.split(",")]   
        
        # do a unit test
        await self.unittesting(source)

        registry_path = registry
        # Retrieve the repository name from the Git URL
        if registry_path is None:
            # install git in the container and get the remote URL
            git_container = (
                dag.container()
                .from_("node:18-alpine")
                .with_directory("/usr/share/nginx/html/.git", source.directory(".git"))
                .with_workdir("/usr/share/nginx/html")
                .with_exec(["apk", "add", "--no-cache", "git"])
                .with_exec(["git", "config", "--get", "remote.origin.url"])
            )
            git_url = (await git_container.stdout()).strip()
        
        # Extract the repository location from the Git URL
        if git_url.startswith("git@"):
            # SSH format (if run locally): git@github.com:my-org/repo-name.git
            repo_location = git_url.split(":", 1)[1].rsplit(".", 1)[0].lower()  # Get the part after `:` and remove `.git`
        elif git_url.startswith("https://"):
            # HTTPS format (if run from CI): https://github.com/my-org/repo-name:some-branch
            repo_location = git_url.split("/", 3)[-1].split(":", 1)[0].lower()  # Get the part after the domain and before `:`
        else:
            raise DaggerError(f"Unsupported Git URL format: {git_url}")

        registry_path = f"ghcr.io/{repo_location}" 
        final_container = self.build(source)
        
        if token is not None and username is not None:
            # Authenticate to the registry using the provided username and token
            final_container = (
                final_container
                .with_secret_variable("GITHUB_TOKEN", token)
                .with_registry_auth(registry_path, username, token)
            )
  
        # Publish the image for each tag
        for tag in tag_list:
            await final_container.publish(f"{registry_path}:{tag}")
    
        return f"Published with tags: {', '.join(tag_list)}"


    @function
    def build(self,
              source: Annotated[Directory, DefaultPath("./"), Doc("Source directory containing the project files")]
              ) -> Container:
        """Build a ready-to-use production environment"""
        builder_output = (
            self.installdependencies(source)
            .with_exec(["npm", "run", "build"])
            .directory("./")
        )
        return (
            dag.container()
            .from_("nginxinc/nginx-unprivileged")
            # Add the built files and directories to the Nginx container
            .with_directory("/usr/share/nginx/html/css", builder_output.directory('css'))
            .with_directory("/usr/share/nginx/html/js", builder_output.directory('js'))
            .with_directory("/usr/share/nginx/html/assets", builder_output.directory('assets'))
            .with_directory("/usr/share/nginx/html/html", builder_output.directory('html'))
            .with_file("/usr/share/nginx/html/index.html", builder_output.file('index.html'))
            .with_file("/usr/share/nginx/html/favicon.ico", builder_output.file('favicon.ico'))
            # .with_exposed_port(8080)
        )

    

    @function
    def unittesting(self,
                    source: Annotated[Directory, DefaultPath("./"), Doc("Source directory containing the project files")]
                    ) -> str:
        """Return the result of running unit tests"""
        
        return (
            self.installdependencies(source)
            .with_exec(["npm", "run", "test"])
            .stdout()
        )
    
    @function
    def installdependencies(self,
                            source: Annotated[Directory, DefaultPath("./"), Doc("Source directory containing the project files")]
                            ) -> Container:
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