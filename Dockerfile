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

# Clone the repository and checkout 'dev' branch
WORKDIR /tmp
RUN git clone . /usr/src/app && cd /usr/src/app && git checkout dev

WORKDIR /usr/src/app

# Default command
CMD ["npm", "run", "dev"]
