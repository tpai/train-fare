FROM node:12-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Add required assets
COPY . .

EXPOSE 8000
CMD ["yarn", "start"]
