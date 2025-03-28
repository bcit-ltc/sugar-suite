from typing import Annotated
import dagger
from dagger import DefaultPath, Doc, dag
from .releaserc_generator import write_releaserc_file  # Import releaserc config generator

async def semanticrelease(
    source: Annotated[dagger.Directory, DefaultPath("./"), Doc("Source code to build")],
    token: Annotated[dagger.Secret | None, Doc("GitHub Action token")],
    project_url: Annotated[str, Doc("The repository URL")] = ".",
    pipeline_debug: bool = False,  # Rename debug to pipeline_debug
) -> str:
    """Run semantic-release"""

    # Write the .releaserc file to the source directory
    source = write_releaserc_file(project_url, source)

    # Initialize and configure the container
    container = _initialize_container(token, source, project_url, pipeline_debug)

    # Return the container's stdout
    return await container.stdout()

def _initialize_container(
    token: dagger.Secret | None, 
    source: dagger.Directory, 
    project_url: str,
    pipeline_debug: bool,  # Rename debug to pipeline_debug
) -> dagger.Container:
    """Initialize and configure the Dagger container."""
    container = dag.container().from_("ghcr.io/bcit-ltc/semantic-release:gitlab-original")

    # Conditionally add the GITHUB_TOKEN environment variable if the token is provided
    if token:
        container = container.with_secret_variable("GITHUB_TOKEN", token)

    # Add the --dry-run and --no-ci flags if project_url is "."
    additional_flags = "--dry-run --no-ci" if project_url == "." else ""

    # Add the --debug flag if pipeline_debug is True
    if pipeline_debug:
        additional_flags += " --debug"

    # Set the working directory and copy the source code
    container = (
        container
        .with_workdir("/app")  # Set working directory
        .with_directory("/app", source)  # Copy source code
    )

    # Add the main semantic-release execution step
    container = container.with_exec(
        [
            "sh", "-c",
            f"""
            semantic-release {additional_flags} --repository-url {project_url} --branch 6-riffing-on-dagger && \
            if [ -s CURRENT_VERSION ] && grep -q '[^[:space:]]' CURRENT_VERSION; then \
                echo "Current version: v$(cat CURRENT_VERSION)"; \
            else \
                echo "No previous release found."; \
            fi && \
            if [ -s NEXT_VERSION ]; then \
                echo "Next version: v$(cat NEXT_VERSION)"; \
            else \
                echo "NEXT_VERSION file is empty or not found."; \
            fi
            """
        ]
    )

    # Conditionally add a debug step to print the contents of the directory and additional files
    if pipeline_debug:
        container = container.with_exec(
            [
                "sh", "-c",
                f"""
                echo 'Contents of /app directory:' && ls -lah && echo '';
                # echo 'Contents of /app directory:' && ls -lah && echo ''; \
                # echo 'Contents of .releaserc:' && cat .releaserc && echo ''; \
                # echo 'Contents of CURRENT_VERSION:' && cat CURRENT_VERSION && echo ''; \
                # echo 'Contents of NEXT_VERSION:' && cat NEXT_VERSION && echo ''
                """
            ]
        )

    return container