# resto

## Backend Setup (Step 1)

Backend stack:
- Node.js + Express
- MySQL

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials.

### 3. Create database

```bash
mysql -u root -p < scripts/init.sql
```

### 4. Run backend

```bash
npm run dev
```

Server starts on `http://localhost:4000` by default.

### 5. Quick health checks

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/health/db
```