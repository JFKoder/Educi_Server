# Use official Node image
FROM node:20-bullseye

# Set working directory
WORKDIR /usr/src/app

# Install dependencies separately for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Install git
RUN apt-get update && apt-get install -y git 

# Default command
CMD ["npm", "run", "dev"]
