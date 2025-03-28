import json

def generate_releaserc_config(project_url: str) -> dict:
    """Generate the .releaserc configuration as a dictionary."""
    releaserc_config = {
        "branches": ["**"],
        "plugins": [
            "@semantic-release/commit-analyzer",
            [
                "@semantic-release/exec",
                {
                    "verifyReleaseCmd": "echo ${nextRelease.version} > NEXT_VERSION; echo ${lastRelease.version} > CURRENT_VERSION"
                }
            ]
        ]
    }

    # Add additional plugins if project_url is not "."
    if project_url != ".":
        releaserc_config["plugins"].extend([
            "@semantic-release/release-notes-generator",
            "@semantic-release/github"
        ])

    return releaserc_config

def write_releaserc_file(project_url: str, output_path: str = ".releaserc") -> str:
    """Generate and write the .releaserc file to the specified path."""
    # Generate the configuration
    releaserc_config = generate_releaserc_config(project_url)

    # Convert the configuration to JSON
    releaserc_json = json.dumps(releaserc_config, indent=4)

    # Write the JSON to the specified file
    with open(output_path, "w") as file:
        file.write(releaserc_json)

    return releaserc_json