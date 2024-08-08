FROM node:20.12.1
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . ./
EXPOSE 3000
CMD ["node", "index.js"]
