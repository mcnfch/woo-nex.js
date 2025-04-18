import Redis from 'ioredis';

// Create Redis client instance
const redis = new Redis({
  port: 6379,
  host: 'localhost',
  // Add any additional configuration options here
  // password: 'your-password', // if you set a password
  // db: 0, // default is 0
});

export default redis;
