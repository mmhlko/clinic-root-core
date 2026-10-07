FROM node:22-alpine

WORKDIR /app

ARG BACKEND_API_URL=http://localhost:3001
ENV BACKEND_API_URL=${BACKEND_API_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
