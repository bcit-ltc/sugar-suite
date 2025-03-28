from typing import Annotated
import dagger
from dagger import DefaultPath, Doc, dag
from .releaserc_generator import write_releaserc_file  # Import releaserc config generator

async def semanticrelease(
    source: Annotated[dagger.Directory, DefaultPath("./"), Doc("Source code to build")],
    token: Annotated[dagger.Secret | None, Doc("GitHub Action token")],
    project_url: Annotated[str, Doc("The repository URL")] = ".",
) -> str:
    """Run semantic-release"""

    # Write the .releaserc file and get its JSON content
    releaserc_json = write_releaserc_file(project_url)

    # Initialize and configure the container
    container = _initialize_container(token, source, releaserc_json, project_url)

    # Return the container's stdout
    return await container.stdout()

def _initialize_container(
    token: dagger.Secret | None, 
    source: dagger.Directory, 
    releaserc_json: str, 
    project_url: str,
) -> dagger.Container:
    """Initialize and configure the Dagger container."""
    container = dag.container().from_("ghcr.io/bcit-ltc/semantic-release:gitlab-original")

    # Conditionally add the GITHUB_TOKEN environment variable if the token is provided on the command line
    if token:
        container = container.with_secret_variable("GITHUB_TOKEN", token)

    # Add the --dry-run and --no-ci flags to semantic-release command if running locally
    additional_flags = "--dry-run --no-ci" if project_url == "." else ""

    # Configure the container
    container = (
        container
        .with_workdir("/app")  # Set working directory
        .with_directory("/app", source)  # Copy source code
        .with_exec(
            [
                "sh", "-c",
                f"""
                semantic-release {additional_flags} --repository-url {project_url} && \
                if [ -s CURRENT_VERSION ]; then echo "Current version: v$(cat CURRENT_VERSION)"; else echo "No previous release found."; fi && \
                if [ -f NEXT_VERSION ]; then echo "Next version: v$(cat NEXT_VERSION)"; fi
                """
            ]
        )
    )

    return container