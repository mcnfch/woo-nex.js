FROM redis:7-alpine

# Install Node.js, npm, and cron
RUN apk add --no-cache nodejs npm bash curl

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Copy the scripts directory
COPY src/scripts/load-products-to-redis.js ./
COPY src/lib ./src/lib

# Install dependencies
RUN npm install --only=production

# Create cron job file
RUN echo "0 * * * * cd /app && node load-products-to-redis.js >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Start Redis and cron
CMD crond -l 2 -f & redis-server --appendonly yes
