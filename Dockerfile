FROM node:10-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY . .
EXPOSE 80
CMD ["yarn", "start"]
