# 2-Step Planner ✈️

![Status](https://img.shields.io/badge/status-WIP-yellow)

A cross-platform holiday planner that helps you organize the places you want to visit 
and track them in real time while you travel.

## Features

- 📍 **Wish List** — Add, edit and organize places you want to visit
- 🗺️ **Live Map** — See your saved places on a map and track your current location
- 📡 **Nearby Places** — Get a quick list of your saved places close to where you are
- 🏙️ **Groups & Routes** — Organize places by city or custom groups

## Tech Stack

- **Mobile** — React Native (Expo)
- **Web** — Next.js
- **API** — Node.js / Express
- **Database** — PostgreSQL (Prisma ORM)
- **Monorepo** — Turborepo

## Project Structure
```
2-step-planner/
├── apps/
│   ├── mobile/       # React Native (Expo)
│   ├── web/          # Next.js
│   └── api/          # Node/Express
└── packages/
    └── shared/       # Shared types and utilities
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop
- npm

### Installation
```bash
# Clone the repo
git clone https://github.com/SebastianPellitero/2-step-planner.git
cd 2-step-planner

# Install dependencies
npm install

# Start the database
docker run --name holiday-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=holiday_planner \
  -p 5432:5432 -d postgres

# Run migrations
cd apps/api && npm run db:migrate

# Start everything
turbo dev
```

### Environment Variables

Create a `.env` file in `apps/api/`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/holiday_planner"
```

## License

MIT — see [LICENSE](./LICENSE)

## Support

If you find this project useful, consider buying me a coffee ☕  
<!-- add your donation link here -->
