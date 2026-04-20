# Finch-Like Self-Care App

A production-ready MVP of a Finch-like self-care mobile app featuring a virtual pet, mood tracking, journaling, goals/habits, quests, and gamification.

## 🏗️ Architecture

```
finch-app/
├── backend/          # NestJS API (Node.js + TypeScript)
├── mobile/           # Flutter mobile app (iOS + Android)
├── docker-compose.yml
└── README.md
```

### Tech Stack

**Backend:**
- NestJS with TypeScript
- PostgreSQL (database)
- Redis (caching, rate limiting, job queues)
- Prisma (ORM)
- JWT authentication (access + refresh tokens)
- BullMQ (background jobs)

**Mobile:**
- Flutter (latest stable)
- Riverpod (state management)
- go_router (navigation)
- Dio (HTTP client)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Flutter SDK (latest stable)
- Node.js 20+ (for local development)

### 1. Start the Backend

```bash
# Clone and navigate to project
cd finch-app

# Start all services (API, Postgres, Redis)
docker-compose up -d

# View logs
docker-compose logs -f api
```

The API will be available at `http://localhost:3000`.

### 2. Run Migrations & Seed Data

```bash
# Run migrations (happens automatically on container start, but manual if needed)
docker-compose exec api npx prisma migrate deploy

# Seed the database with demo data
docker-compose exec api npx prisma db seed
```

### 3. Run the Flutter App

```bash
cd mobile

# Get dependencies
flutter pub get

# Run on iOS Simulator
flutter run -d ios

# Run on Android Emulator
flutter run -d android

# Run on Chrome (for quick testing)
flutter run -d chrome
```

### API URL Configuration

The mobile app automatically detects the platform and uses the appropriate API URL:

| Platform | API URL |
|----------|---------|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical Device | Set `API_BASE_URL` in `.env` |
| Production | Set in environment config |

## 🔑 Demo Credentials

A demo user is seeded automatically:

| Field | Value |
|-------|-------|
| Email | `demo@example.com` |
| Password | `demo123` |

### Demo User Data

The demo user comes with:
- A pet named "Pip" (Level 3, with some XP and energy)
- 5 predefined goals (Sleep, Exercise, Meditation, etc.)
- 3 sample journal entries
- Some mood entries from the past week
- 500 coins and 50 gems in wallet
- A few inventory items equipped

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create new account |
| `/auth/login` | POST | Login and get tokens |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Invalidate refresh token |

### User

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/me` | GET | Get current user profile |
| `/me/settings` | PATCH | Update user settings |
| `/me/push-token` | POST | Register push notification token |

### Pet

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pet` | GET | Get user's pet |
| `/pet` | PATCH | Update pet (name, pronouns) |
| `/pet/inventory` | GET | Get user's item inventory |
| `/pet/inventory/equip` | POST | Equip an item |
| `/pet/inventory/unequip` | POST | Unequip an item |

### Self-Care

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/moods` | POST | Log a mood entry |
| `/moods` | GET | Get mood entries |
| `/goals` | GET | Get all goals |
| `/goals` | POST | Create a new goal |
| `/goals/:id/complete` | POST | Mark goal complete for today |
| `/journal` | GET | Get journal entries |
| `/journal` | POST | Create journal entry |
| `/journal/:id` | GET | Get single journal entry |
| `/journal/:id` | PATCH | Update journal entry |
| `/journal/:id` | DELETE | Delete journal entry |
| `/breathing/complete` | POST | Complete a breathing exercise |

### Quests & Rewards

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/quests/today` | GET | Get today's quests |
| `/quests/:id/claim` | POST | Claim quest reward |
| `/streaks` | GET | Get user's streaks |
| `/wallet` | GET | Get wallet balances |
| `/transactions` | GET | Get transaction history |

### Shop

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/shop/catalog` | GET | Get shop items |
| `/shop/purchase` | POST | Purchase an item |

### Insights

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/insights/summary` | GET | Get insights summary |

### Subscription

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/subscription` | GET | Get subscription status |
| `/subscription/upgrade` | POST | Upgrade to premium (mock) |

## 🧪 Running Tests

### Backend

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Mobile

```bash
cd mobile

# Run tests
flutter test

# Analyze code
flutter analyze
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run in development mode
npm run start:dev

# Run database migrations
npx prisma migrate dev
```

### Mobile Development

```bash
cd mobile

# Get dependencies
flutter pub get

# Generate code (for freezed/json_serializable if used)
flutter pub run build_runner build

# Run with hot reload
flutter run
```

## 📁 Project Structure

### Backend

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── pet/            # Pet & inventory
│   ├── selfcare/       # Moods, goals, journal, breathing
│   ├── quests/         # Quests & streaks
│   ├── rewards/        # Wallet & transactions
│   ├── shop/           # Item shop
│   ├── insights/       # Analytics & insights
│   ├── subscription/   # Subscription management
│   ├── notifications/  # Push notification stubs
│   └── common/         # Shared utilities
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Database migrations
│   └── seed.ts         # Seed data
├── test/               # E2E tests
└── docker/             # Docker configs
```

### Mobile

```
mobile/
├── lib/
│   ├── core/
│   │   ├── api/        # API client & interceptors
│   │   ├── models/     # Data models
│   │   ├── theme/      # App theme & styling
│   │   └── widgets/    # Shared widgets
│   └── features/
│       ├── auth/       # Login & registration
│       ├── pet/        # Pet home screen
│       ├── moods/      # Mood tracking
│       ├── goals/      # Goals & habits
│       ├── journal/    # Journaling
│       ├── quests/     # Quests & rewards
│       ├── shop/       # Item shop
│       └── profile/    # Settings & profile
├── assets/             # Images, fonts, etc.
└── test/               # Unit & widget tests
```

## 📋 TODO / Future Work

### Phase 2 Features
- [ ] Social features (friends, sharing achievements)
- [ ] Advanced analytics and mood insights
- [ ] Real App Store / Play Store subscription integration
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Seasonal events and limited-time items
- [ ] Pet evolution system
- [ ] Community challenges

### Technical Improvements
- [ ] GraphQL API option
- [ ] WebSocket for real-time updates
- [ ] Offline mode with local database sync
- [ ] End-to-end encryption for journal entries
- [ ] Advanced caching strategies
- [ ] Performance monitoring (Sentry, etc.)
- [ ] A/B testing framework

### Content Expansion
- [ ] More breathing exercises with guided audio
- [ ] Meditation sessions
- [ ] Sleep tracking integration
- [ ] Custom pet species
- [ ] Expanded item catalog
- [ ] Achievement badges

## 📄 License

MIT License - feel free to use this as a starting point for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

Built with ❤️ using NestJS and Flutter

