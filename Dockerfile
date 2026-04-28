FROM node:24

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
