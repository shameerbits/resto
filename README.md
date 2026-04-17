# Smart Restaurant ERP (Resto)

Production-focused Smart Restaurant ERP backend built with NestJS + MySQL.

## Current Status

- Backend framework migrated to NestJS.
- Core module structure is in place: auth, menu, order, kitchen, billing, inventory, recipe, table, health.
- Global API routing is configured with:
	- Base prefix: `/api`
	- Versioned routes: `/api/v{n}/...`
	- Version-neutral health route: `/api/health`
- Health endpoint is verified and returning HTTP 200.

## Tech Stack

- NestJS 10
- TypeORM + MySQL
- Redis (cache/session foundation)
- Winston logging
- Class Validator / Class Transformer

## Project Structure

```text
backend/
	src/
		main.ts
		app.module.ts
		common/
		config/
		database/
		modules/
	scripts/
		init.sql
		migrations/
```

## Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8+
- Redis (optional for local development, depending on enabled features)

## Local Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

Update database values in `.env`:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

3. Initialize database schema (if needed)

```bash
mysql -u root -p < scripts/init.sql
```

4. Build

```bash
npm run build
```

5. Run

```bash
npm run start
```

Server default URL:

- `http://localhost:3000`

## Key Scripts

From `backend/`:

- `npm run dev` - start in watch mode
- `npm run build` - compile TypeScript
- `npm run start` - build then run compiled app
- `npm run start:prod` - build then run compiled app
- `npm run test` - run unit tests

## API Routing Rules

- Version-neutral route example:
	- `GET /api/health`
- Versioned route pattern:
	- `GET /api/v1/...`

## Quick Verification

1. Health check

```bash
curl http://localhost:3000/api/health
```

Expected response format:

```json
{
	"success": true,
	"statusCode": 200,
	"message": "Service is healthy",
	"data": {
		"status": "ok",
		"timestamp": "2026-04-17T12:04:16.975Z"
	},
	"timestamp": "2026-04-17T12:04:16.975Z"
}
```

## Notes

- `npm run start` is configured to build before execution so `dist/main.js` exists.
- If startup fails with database connection errors, verify MySQL is running and credentials in `.env` are correct.

## Roadmap

Planned implementation phases are documented in:

- `.github/prompts/plan-smartRestaurantErp.prompt.md`