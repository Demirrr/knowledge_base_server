FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY src/ ./src/

# Build the project
RUN npm run build

# Production stage
FROM node:22-alpine AS release

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment
ENV NODE_ENV=production

# Create volume mount point for persistent storage
VOLUME ["/app/data"]

# Set default storage path to volume
ENV KNOWLEDGE_BASE_FILE_PATH=/app/data/knowledge_base.jsonl

# Run the server
ENTRYPOINT ["node", "dist/index.js"]
