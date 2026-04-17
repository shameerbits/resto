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

## Menu Items (CRUD)

### API Endpoints

- `POST /api/menu`
- `GET /api/menu`
- `GET /api/menu/:id`
- `PUT /api/menu/:id`
- `DELETE /api/menu/:id`

### Sample payload for create/update

```json
{
	"name": "Chicken Biryani",
	"description": "Aromatic rice with chicken",
	"price": 12.5,
	"isAvailable": true
}
```

### Quick curl tests

```bash
curl -X POST http://localhost:4000/api/menu \
	-H "Content-Type: application/json" \
	-d '{"name":"Chicken Biryani","description":"Aromatic rice with chicken","price":12.5,"isAvailable":true}'

curl http://localhost:4000/api/menu
curl http://localhost:4000/api/menu/1

curl -X PUT http://localhost:4000/api/menu/1 \
	-H "Content-Type: application/json" \
	-d '{"name":"Chicken Biryani (Large)","description":"Large serving","price":14.0,"isAvailable":true}'

curl -X DELETE http://localhost:4000/api/menu/1
```