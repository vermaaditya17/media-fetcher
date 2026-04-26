# Use Node.js base image
FROM node:18-bullseye-slim

# Install Python and FFmpeg (Required for yt-dlp)
RUN apt-get update && apt-get install -y python3 ffmpeg curl

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]