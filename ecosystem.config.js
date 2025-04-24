module.exports = {
  apps: [
    {
      name: 'woo-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3040',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3040
      }
    },
    {
      name: 'redis-sync',
      script: 'src/scripts/load-products-to-redis.js',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 */1 * * *', // Run every 1 hour
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
