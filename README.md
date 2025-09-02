# Sugar-Suite Framework

Sugar-Suite is a "Framework Factory" used to produce customized stylesheets designed for building online courses in HTML. It is built using Sass/Compass which provides an expressive and programmatic method for authoring the CSS. In order to produce the CSS, the Sass files (.scss) are "pre-processed".

## Development

**Requirements**: Docker, NodeJS

```bash
docker compose up --build
```

If you encounter an error, consider the following:

* Ensure Node.js (and npm) are installed on your computer
* Ensure you run the command from the project root (same folder as package.json)

## Deployment

This package was modified to run on Kubernetes. To build and test the image locally, run:

```bash
docker build -t sugar-suite-v1 .

docker run -p 8080:8080 sugar-suite-v1
```

Browse to `http://localhost:8080/` to view the container.
