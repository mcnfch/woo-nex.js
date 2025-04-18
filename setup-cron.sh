#!/bin/bash

# Make this script executable
chmod +x "$0"

# Get the absolute path to the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create the cron job to run hourly
CRON_JOB="0 * * * * cd ${PROJECT_DIR} && node src/scripts/load-products-to-redis.js >> ${PROJECT_DIR}/redis-sync.log 2>&1"

# Add the cron job to the current user's crontab
(crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -

echo "Hourly cron job has been set up to update Redis search database"
echo "It will run: ${CRON_JOB}"
echo "Logs will be written to: ${PROJECT_DIR}/redis-sync.log"
