from typing import Annotated
import json

import dagger
from dagger import DefaultPath, Doc, dag, function, object_type
from .semanticrelease_runner import semanticrelease as semrel # Import semantic-release

@object_type
class SugarSuite:

    @function
    async def semanticrelease(
        self,
        source: Annotated[dagger.Directory, DefaultPath("./"), Doc("Source code to build")],
        token: Annotated[dagger.Secret, Doc("GitHub Action token")],
        project_url: Annotated[str, Doc("The repository URL")] = ".",
        pipeline_debug: bool = False,
    ) -> str:
        """Run semantic-release"""
        return await semrel(source, token, project_url, pipeline_debug)
