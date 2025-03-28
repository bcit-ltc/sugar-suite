from typing import Annotated
import json

import dagger
from dagger import DefaultPath, Doc, dag, function, object_type
from .semanticrelease_runner import semanticrelease  # Import semantic-release

@object_type
class SugarSuite:

    @function
    async def semanticrelease(
        self,
        source: Annotated[dagger.Directory, DefaultPath("./"), Doc("Source code to build")],
        token: Annotated[dagger.Secret | None, Doc("GitHub Action token")],
        project_url: Annotated[str, Doc("The repository URL")] = ".",
    ) -> str:
        """Run semantic-release"""
        return await semanticrelease(source, token, project_url)
