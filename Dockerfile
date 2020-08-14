FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD npm start
#CMD tail -f /dev/null