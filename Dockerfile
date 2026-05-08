FROM node:20-alpine
RUN apk add --no-cache socat
# Install deps to /deps so the bind-mounted /app never shadows node_modules
WORKDIR /deps
COPY package*.json ./
RUN npm ci
ENV PATH="/deps/node_modules/.bin:$PATH" \
    NODE_PATH="/deps/node_modules"
WORKDIR /app
EXPOSE 4321 4001
CMD ["npm", "run", "dev"]
