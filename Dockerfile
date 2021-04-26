FROM node:15-alpine3.10

WORKDIR /app
ADD *.js ./
ADD *.json ./

RUN npm install

CMD ["node", "main.js"]
