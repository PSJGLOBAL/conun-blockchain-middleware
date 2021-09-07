FROM node:12


RUN mkdir /conun-middleware-testnet-v3
WORKDIR /conun-middleware-testnet-v3

COPY . .
COPY package.json /conun-middleware-testnet-v3


ENV NODE_ENV=development

# Install app dependencies
RUN npm install

# Bundle app source
COPY . /conun-middleware-testnet-v3
COPY hosts /etc/
# Build assets

ENV PORT 4040
EXPOSE 4040

CMD [ "npm", "start" ]