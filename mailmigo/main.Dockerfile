# Build the Angular App
# basically, this compiles the Angular project to static HTML and js files.
FROM node:20-alpine as build
WORKDIR /app
COPY . ./
