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

## Orders API (Create + Fetch)

### API Endpoints

- `POST /api/orders`
- `GET /api/orders/:id`

### Sample payload for create order

```json
{
	"notes": "Table 4 - no onions",
	"items": [
		{ "menuItemId": 1, "quantity": 2 },
		{ "menuItemId": 2, "quantity": 1 }
	]
}
```

### How total is calculated

- Unit price comes from `menu_items.price` at order creation time.
- Line total = `unit_price * quantity`.
- Order total = sum of all line totals.

### Quick curl tests

```bash
curl -X POST http://localhost:4000/api/orders \
	-H "Content-Type: application/json" \
	-d '{"notes":"Table 4 - no onions","items":[{"menuItemId":1,"quantity":2},{"menuItemId":2,"quantity":1}]}'

curl http://localhost:4000/api/orders/1
```

## Billing API (Tax + Final Total)

### API Endpoint

- `GET /api/orders/:id/bill`

### Query Params

- `taxPercent` optional, number between `0` and `100`
- Default tax is `0` when omitted

### How billing is calculated

- `subtotal` comes from the saved order total
- `taxAmount = subtotal * (taxPercent / 100)`
- `finalTotal = subtotal + taxAmount`

### Quick curl tests

```bash
curl http://localhost:4000/api/orders/1/bill
curl "http://localhost:4000/api/orders/1/bill?taxPercent=5"
```

## Inventory Deduction (Recipe Based)

When `POST /api/orders` is called, inventory is deducted automatically based on recipe rows:

- `menu_item_recipes.quantity_required` defines ingredient usage for one menu item unit.
- Required stock is multiplied by ordered quantity.
- Order save + order_items save + inventory deduction run in one transaction.
- If stock is insufficient, order creation fails and nothing is saved.

### Seed ingredients and recipe example

```sql
INSERT INTO ingredients (name, unit, stock_quantity)
VALUES
	('Rice', 'kg', 20.000),
	('Chicken', 'kg', 10.000)
ON DUPLICATE KEY UPDATE
	unit = VALUES(unit),
	stock_quantity = VALUES(stock_quantity);

INSERT INTO menu_item_recipes (menu_item_id, ingredient_id, quantity_required)
VALUES
	(1, 1, 0.250),
	(1, 2, 0.200)
ON DUPLICATE KEY UPDATE
	quantity_required = VALUES(quantity_required);
```

### Verify deduction

1. Check stock before order:
```sql
SELECT id, name, stock_quantity FROM ingredients ORDER BY id;
```
2. Create order with `menuItemId: 1`.
3. Check stock again using the same select query.

Expected: stock decreases by recipe quantity multiplied by ordered quantity.