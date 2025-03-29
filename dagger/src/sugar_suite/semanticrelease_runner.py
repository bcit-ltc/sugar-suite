from typing import Annotated
import dagger
from dagger import DefaultPath, Doc, dag
from .releaserc_generator import write_releaserc_file  # Import releaserc config generator

async def semanticrelease(
    source: Annotated[dagger.Directory, DefaultPath("./"), Doc("Source code to build")],
    token: Annotated[dagger.Secret | None, Doc("GitHub Action token")],
    project_url: Annotated[str, Doc("The repository URL")] = ".",
    pipeline_debug: bool = False,
) -> str:
    """Run semantic-release"""

    # Write the .releaserc file to the source directory
    source = write_releaserc_file(project_url, source)

    # Initialize and configure the container
    container = _initialize_container(token, source, project_url, pipeline_debug)

    # Return the container's stdout
    return await container.stdout()

def _initialize_container(
    token: dagger.Secret, 
    source: dagger.Directory, 
    project_url: str,
    pipeline_debug: bool,
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
        additional_flags += " --debug --dry-run"

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
            semantic-release {additional_flags} --repository-url {project_url} && \
            for file in CURRENT_VERSION NEXT_VERSION; do \
                if [ -s "$file" ] && grep -q '[^[:space:]]' "$file"; then \
                    echo "$(echo $file | tr '_' ' ' | sed 's/.*/\\u&/'): v$(cat $file)"; \
                else \
                    echo "$(echo $file | tr '_' ' ' | sed 's/.*/\\u&/') is empty or not found."; \
                fi; \
            done
            """
        ]
    )

    # Conditionally add a debug step to print the contents of the directory and additional files
    if pipeline_debug:
        container = container.with_exec(
            [
            "sh", "-c",
            f"""
            echo 'Contents of /app directory:' && ls -lah && echo ''; \
            echo 'Environment variables:' && printenv && echo ''; \
            for file in .releaserc CURRENT_VERSION NEXT_VERSION; do \
                if [ -f "$file" ]; then \
                    echo "Contents of $file:" && cat "$file" && echo ''; \
                else \
                    echo "$file does not exist."; \
                fi; \
            done
            """
            ]
        )

    return container