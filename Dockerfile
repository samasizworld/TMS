FROM node:16.18.1-alpine

WORKDIR /usr/nestapi/

COPY . .
RUN npm install
RUN npm install -g typescript@5.1.6
RUN npm rebuild

CMD ["npm", "run", "start:dev"]



