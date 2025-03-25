FROM node:23.10.0-alpine3.21

WORKDIR /github/Idle-Miner-Bot

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle src
COPY . .

CMD ["node", "./src/index.js"]