# Declare the base image
FROM node:alpine AS build
WORKDIR /frontend
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install
# 4. Copy the source code to /app dir
COPY . .
RUN npm run build

FROM alpine:latest
COPY --from=build /frontend/dist /frontend/dist
