FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

CMD ["sh", "-c", "npm run db:deploy && npm run build && npm run start:prod"]
