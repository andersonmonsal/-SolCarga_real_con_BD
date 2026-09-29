FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd backend && npm install

# Copy application files
COPY backend ./backend
COPY frontend ./frontend
COPY database ./database

# Create directory for SQLite db
RUN mkdir -p /app/database

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/backend
CMD ["npm", "start"]
