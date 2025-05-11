# Use Node.js LTS (Long Term Support) as base image
FROM node:23-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY . .

# Bundle the server
RUN npm run build

# Expose the port your server runs on
EXPOSE 3005

# Start the server
CMD ["npm", "run", "start"]