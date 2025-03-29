from typing import Annotated
import json

import dagger
from dagger import DefaultPath, Doc, dag, function, object_type
from .semanticrelease_runner import semanticrelease as semrel  # Import semantic-release


@object_type
class SugarSuite:
    @function
    async def semanticrelease(
        self,
        source: Annotated[dagger.Directory, DefaultPath("./"), Doc("Source code to build")],
        token: Annotated[dagger.Secret | None, Doc("GitHub Action token")],
        project_url: Annotated[str, Doc("The repository URL")] = ".",
        pipeline_debug: bool = False,
    ) -> str:
        """
        Runs semantic-release to determine the next version number and publish the release.
        Args:
            source: Source code to build
            token: GitHub Action token
            project_url: The repository URL
            pipeline_debug: Enable pipeline debug mode
        Returns:
            str: The version number
        """
        return await semrel(source, token, project_url, pipeline_debug)

    @function
    def build(self, source: Annotated[dagger.Directory, DefaultPath("./")]) -> dagger.Container:
        """
        Build a container using the Dockerfile in the source directory.
        Args:
            source: Source code to build
        Returns:
            dagger.Container: The built container
        """
        # Install dependencies and build the project
        builder_output = (
            self.installdependencies(source)
            .with_exec(["npm", "run", "build"])  # Run the build process
            .directory("./")  # Return the build output directory
        )

        # Create the final Docker image
        return (
            dag.container()
            .from_("nginxinc/nginx-unprivileged")  # Use a lightweight NGINX image
            .with_directory("/usr/share/nginx/html/css", builder_output.directory("css"))
            .with_directory("/usr/share/nginx/html/js", builder_output.directory("js"))
            .with_directory("/usr/share/nginx/html/assets", builder_output.directory("assets"))
            .with_directory("/usr/share/nginx/html/html", builder_output.directory("html"))
            .with_file("/usr/share/nginx/html/index.html", builder_output.file("index.html"))
            .with_file("/usr/share/nginx/html/favicon.ico", builder_output.file("favicon.ico"))
            # .with_exposed_port(8080)
        )

    @function
    def installdependencies(self, source: Annotated[dagger.Directory, DefaultPath("./")]) -> dagger.Container:
        """
        Install all dependencies for the project.
        Args:
            source: Source code directory
        Returns:
            dagger.Container: The container with installed dependencies
        """
        # Create a Dagger cache volume for node_modules
        node_modules_cache = dag.cache_volume("node_modules_cache")

        # Use a Node.js container to install dependencies
        return (
            dag.container()
            .from_("node:18-alpine")  # Use a lightweight Node.js image
            .with_directory("/usr/share/nginx/html", source)  # Add the source code
            .with_mounted_cache("/usr/share/nginx/html/node_modules", node_modules_cache)  # Cache node_modules
            .with_workdir("/usr/share/nginx/html")  # Set the working directory
            .with_exec(["npm", "install"])  # Install dependencies
        )

    # Uncomment and implement this function if needed for running unit tests
    # @function
    # async def run_unit_tests(
    #     container: dagger.Container,
    #     test_directory: Annotated[
    #         dagger.Directory,
    #         DefaultPath("./tests"),
    #         Doc("Directory containing unit test scripts"),
    #     ],
    # ) -> str:
    #     """
    #     Runs unit tests inside the provided container.
    #     Args:
    #         container: The container to run tests in
    #         test_directory: Directory containing unit test scripts
    #     Returns:
    #         str: Test results
    #     """
    #     # Start the container in detached mode
    #     running_container = (
    #         container.with_workdir("/tests")  # Set the working directory to /tests
    #         .with_directory("/tests", test_directory)  # Mount the test scripts directory
    #         .with_exec(["nginx", "-g", "daemon off;"])  # Start the container
    #         .start()
    #     )
    #
    #     # Run unit tests inside the running container
    #     test_runner = (
    #         running_container
    #         .with_exec(["pytest", "--maxfail=1", "--disable-warnings"])  # Run pytest inside the container
    #     )
    #
    #     # Capture the test output
    #     test_output = await test_runner.stdout()
    #
    #     # Stop the running container
    #     await running_container.stop()
    #
    #     return test_output
