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
            .with_env_variable("PROJECT_URL", project_url)
            # # Set working directory
            # .with_workdir("/app")
            # Copy source code
            .with_directory("/app", source)
            # Run semantic-release
            .with_exec(["ls", "-la"])
            .with_exec(["semantic-release", "--debug", "--repository-url" "$PROJECT_URL", "--dry-run", "--no-ci"])
            .with_exec(["echo", "$(cat NEXT_VERSION)"])
            .stdout()
        )
