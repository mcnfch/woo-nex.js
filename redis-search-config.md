# Redis Search Configuration

Add the following to your `.env.local` file:

```
# Redis Cart (existing)
CART_REDIS_URL=redis://username:password@localhost:6379/0

# Redis Search (new)
SEARCH_REDIS_URL=redis://localhost:6380/0
```

This configures:
1. The existing Redis cart instance on port 6379
2. The new Redis search instance on port 6380
