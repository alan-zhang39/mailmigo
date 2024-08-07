# Build the Angular App
# basically, this compiles the Angular project to static HTML and js files.
FROM node:20-alpine as build
WORKDIR /app
RUN npm -g install npm@10.8.1
COPY . ./
WORKDIR /app/projects/web
ENV PATH /app/projects/web/node_modules/.bin:$PATH
RUN npm ci --silent
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY angular.json ./
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN ls
RUN npm run build

# Serve these static files with NGINX.
FROM nginx:1.21.6-alpine
COPY --from=build /app/dist/web/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# EXPOSE 4200
# CMD ["npm", "run", "start-dev"]
