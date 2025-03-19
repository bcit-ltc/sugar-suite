import dagger
from datetime import datetime
from dagger import dag, function, object_type


@object_type
class SugarSuite:


    @function
    async def publish(self, source: dagger.Directory, registry: str, tag: str) -> str:
        """Publish the application container after building and testing it on-the-fly"""
        # call Dagger Function to build the application image
        # publish to registry with tag
        return await self.production(source).publish(
            f"{registry}:{tag}"
        )
    
    @function
    def production(self, source: dagger.Directory) -> dagger.Container:
        """Build a ready-to-use production environment"""
        builder_output = (
            self.build_env(source)
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
    def development(self, source: dagger.Directory) -> dagger.Container:
        """Build a ready-to-use development environment"""
        builder_output = (
            self.build_env(source)
            .with_exec(["npm", "run", "build"])
            .directory("./")
        )
        
        return (
            dag.container()
            .from_("nginx:alpine")
            .with_directory("/usr/share/nginx/html", builder_output)
            .with_exposed_port(80)
    )

    @function
    def test(self, source: dagger.Directory) -> dagger.Container:
        """Build a ready-to-use test environment"""
        builder_output = (
            self.build_env(source)
            .with_exec(["npm", "run", "test"])
            .directory("./")
        )
        
        return (
            dag.container()
            .from_("node:18-alpine")
            .with_directory("/usr/share/nginx/html", builder_output)
        )
    
    @function
    def build_env(self, source: dagger.Directory) -> dagger.Container:
        """Build a ready-to-use development environment"""
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
