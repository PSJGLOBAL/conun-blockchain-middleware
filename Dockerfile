FROM node:12


RUN mkdir /conun-middleware-mainnet-v3
WORKDIR /conun-middleware-mainnet-v3

COPY . .
COPY package.json /conun-middleware-mainnet-v3

# Bundle app source
COPY . /conun-middleware-mainnet-v3
COPY hosts /etc/hosts
# Build assets

ENV NODE_ENV=development

# Install app dependencies
RUN npm install

ENV PORT 4000
EXPOSE 4000

CMD [ "npm", "start" ]