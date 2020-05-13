# Docker Image which is used as foundation to create
# a custom Docker Image with this Dockerfile
FROM node:13.12.0-alpine

# A directory within the virtualized Docker environment
# Becomes more relevant when using Docker Compose later
WORKDIR /app

# ENV PATH /usr/src/app/node_modules/.bin:$PATH

ENV NODE_ENV dev

# Copies package.json and package-lock.json to Docker environment
COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm install react-scripts@3.4.1 -g --silent
RUN npm install typescript@3.7.2 -g --silent

# Copies everything over to Docker environment
COPY . ./

# Uses port which is used by the actual application
EXPOSE 3000

# Finally runs the application
CMD [ "npm", "start" ]