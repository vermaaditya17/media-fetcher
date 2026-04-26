FROM node:18-bullseye-slim
RUN apt-get update && apt-get install -y python3 ffmpeg curl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]