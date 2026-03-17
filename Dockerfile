FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source and build frontend
COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# Migrations run at startup (database only available at runtime, not build time)
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
