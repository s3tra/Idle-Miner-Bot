FROM node:23

WORKDIR /github/Idle-Miner-Bot

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle src
COPY . .

CMD ["node", "./src/index.js"]