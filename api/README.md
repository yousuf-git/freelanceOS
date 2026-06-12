# FreelanceOS Backend

Express REST API + socket.io for freelanceOS.

## Quick Start

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
```

## Seed Demo Data

```bash
npm run seed
# Login: demo@freelanceos.app / Password123!
```

## Test

```bash
npm test
```

## API Base URL

All endpoints: `/api/v1/...`

## Key Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Production server |
| `npm run dev` | Dev server with nodemon |
| `npm run seed` | Seed demo data |
| `npm test` | Run unit + API tests |
