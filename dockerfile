FROM node:12.18.3-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . /app
RUN npm run build

EXPOSE 80

CMD [ "npm", "start" ]