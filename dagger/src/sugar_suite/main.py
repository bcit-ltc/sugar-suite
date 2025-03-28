from typing import Annotated

import dagger
from dagger import Doc, dag, function, object_type

@object_type
class SugarSuite:

    @function
    async def semanticrelease(
        self,
        source: Annotated[dagger.Directory, Doc("Source code to build")],
        token: Annotated[dagger.Secret, Doc("GitHub Action token")],
        project_url: Annotated[str, Doc("The repository URL")],
    ) -> str:
        """Run semantic-release"""

        return await (
            dag.container()
            # Use prebuilt semantic-release container
            .from_("ghcr.io/bcit-ltc/semantic-release:gitlab-original")
            # GITHUB_TOKEN env var is required
            .with_secret_variable("GITHUB_TOKEN", token)
            # Set working directory
            .with_workdir("/app")
            # Copy source code
            .with_directory("/app", source)
            # Run semantic-release
            .with_exec(
                [
                    "semantic-release",
                    "--debug",
                    "--repository-url", ( f"{project_url}" ),
                    "--dry-run",
                    "--no-ci"
                ]
            )
            # Return the current and next versions
            .with_exec(
                [
                    "sh", "-c", 
                    'echo "Current version: $(cat CURRENT_VERSION)"; '
                    'if [ -f NEXT_VERSION ]; then echo "Next version: $(cat NEXT_VERSION)"; fi'
                ]
            )
            .stdout()
        )
