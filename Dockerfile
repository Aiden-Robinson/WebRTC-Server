# Use Node.js LTS version
FROM node:20-slim

# Install dependencies for canvas package and wrtc
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install node-pre-gyp globally first
RUN npm install -g node-pre-gyp

# Install dependencies
RUN npm install

# Copy server files
COPY server/ ./server/
COPY client/ ./client/
COPY *.pem ./

# Expose the HTTPS port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]