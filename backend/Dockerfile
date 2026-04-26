# Use a modern Linux version (Debian Bookworm) that has Python 3.11+
FROM node:20-bookworm-slim

# Install Python and FFmpeg
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