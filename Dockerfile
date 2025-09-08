# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY . ./

RUN npm install
RUN npm run build


# Clean

FROM nginx:alpine AS cleaner

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/css ./css/
COPY --from=builder /app/js ./js/
COPY --from=builder /app/assets ./assets/
COPY --from=builder /app/html ./html/
COPY --from=builder /app/index.html ./
COPY --from=builder /app/favicon.ico ./


## Release/production

FROM nginxinc/nginx-unprivileged AS release

LABEL maintainer="courseproduction@bcit.ca"

WORKDIR /usr/share/nginx/html

COPY --from=cleaner /usr/share/nginx/html/ ./
