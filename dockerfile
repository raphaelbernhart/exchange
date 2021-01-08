FROM node:12.18.3-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app
RUN npm run build

FROM node:12.18.3-alpine AS production
WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=build /app/dist /app
RUN mkdir -p /app/storage/uploads

CMD [ "npm", "start" ]