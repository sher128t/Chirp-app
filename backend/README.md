# Finch Backend API

NestJS backend for the Finch self-care app.

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Auth**: JWT (access + refresh tokens)
- **Jobs**: BullMQ (stub for MVP)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### Development

```bash
# Start in development mode
npm run start:dev

# Start in production mode
npm run start:prod
```

### Docker

```bash
# From project root
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout

### User
- `GET /api/me` - Get current user
- `PATCH /api/me/settings` - Update settings
- `POST /api/me/push-token` - Register push token

### Pet
- `GET /api/pet` - Get user's pet
- `PATCH /api/pet` - Update pet
- `GET /api/pet/inventory` - Get inventory
- `POST /api/pet/inventory/equip` - Equip item
- `POST /api/pet/inventory/unequip` - Unequip item

### Self-Care
- `POST /api/moods` - Log mood
- `GET /api/moods` - Get moods
- `GET /api/moods/stats` - Get mood stats
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get goals
- `POST /api/goals/:id/complete` - Complete goal
- `POST /api/journal` - Create journal entry
- `GET /api/journal` - Get journal entries
- `POST /api/breathing/complete` - Complete breathing session

### Quests & Rewards
- `GET /api/quests/today` - Get today's quests
- `POST /api/quests/:id/claim` - Claim quest
- `GET /api/streaks` - Get streaks
- `GET /api/wallet` - Get wallet
- `GET /api/transactions` - Get transactions

### Shop
- `GET /api/shop/catalog` - Get shop items
- `POST /api/shop/purchase` - Purchase item

### Insights
- `GET /api/insights/summary` - Get insights

### Subscription
- `GET /api/subscription` - Get subscription
- `POST /api/subscription/upgrade` - Upgrade (mock)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Database

### Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Studio

```bash
npx prisma studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | - |
| `REDIS_URL` | Redis connection URL | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_EXPIRATION` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiry | `7d` |
| `PORT` | Server port | `3000` |

