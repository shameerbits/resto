# Smart Restaurant ERP System - Production Implementation Plan

**TL;DR:** Build a production-grade restaurant ERP with modular NestJS backend, transactional inventory/billing core, Next.js PWA frontend for POS + Online + KDS, running without Docker on single restaurant. Organized in 5 phases: backend setup → core APIs → frontend layer → system integration → production hardening.

---

## Phase 1: Backend Architecture & Database Setup

**Goal:** Establish NestJS modular foundation, migrate MySQL schema, prepare core infrastructure.

**Steps:**

### 1. Project initialization (*parallel execution possible*)
- Migrate from Express to NestJS (keep existing MySQL database, add TypeORM)
- Install core dependencies: `@nestjs/core`, `@nestjs/common`, `typeorm`, `mysql2`, `redis`, `class-validator`, `@nestjs/passport`, `@nestjs/jwt`
- Create NestJS project structure with module organization
- Set up environment configuration (dev/production/test)

### 2. Module structure creation (*depends on step 1*)
- Create 7 core modules: `auth`, `menu`, `order`, `kitchen`, `billing`, `inventory`, `recipe`
- Each module gets: controller, service, entity, DTOs (create/update/response)
- Create shared utilities: `apiResponse`, `errorHandler`, `logger`, `database`
- Set up `ConfigModule` for environment variables

### 3. Database schema enhancement (*parallel with step 1*)
- Audit current MySQL schema (`menu_items`, `ingredients`, `recipes`, `orders`, `order_items`)
- Add missing tables: `users`, `roles`, `tables`, `invoices`, `payments`, `inventory_transactions`, `purchases`, `suppliers`, `sync_queue`
- Add columns: `deleted_at` (soft delete), `created_at`, `updated_at`, `synced_at`, `audit_log_id`
- Create migration script: `20260417_migration_express_to_nestjs.sql`
- Implement transaction handling with proper isolation levels

### 4. Authentication & Authorization foundation
- Create User & Role entities with enums: ADMIN, MANAGER, CASHIER, KITCHEN, DELIVERY
- Implement JWT strategy with `JwtModule` + custom guards
- Create `AuthService` with login/refresh token logic (no registration for MVP, admin-created users)
- Add audit logging for sensitive operations (order creation, inventory changes)

### 5. Data access layer (TypeORM setup)
- Create repositories for each entity (UserRepository, MenuRepository, OrderRepository, etc.)
- Set up connection pooling for MySQL (min: 5, max: 20)
- Create database transaction utility for order + inventory consistency
- Set up seed script with sample menu data + users for demo

**Critical Files to Create/Modify:**
- `backend/src/main.ts` — NestJS app bootstrap
- `backend/src/modules/` — 7 module folders with controller/service/entity/dto
- `backend/src/common/` — Shared utilities, guards, filters
- `backend/src/database/` — TypeORM config, migrations, transaction helpers
- `backend/scripts/migrations/` — Database migration scripts
- `backend/.env.example` — Environment variables template

**Verification:**
- [ ] NestJS app starts on `localhost:3000`
- [ ] Database connects successfully with TypeORM
- [ ] Seed script runs and creates demo data
- [ ] JWT authentication guard works (test with Postman)
- [ ] All modules can be imported without errors

---

## Phase 2: Core API Implementation

**Goal:** Implement transactional business logic for orders, inventory, billing. This is the critical phase.

**Steps:**

### 1. Menu Module - Read-only endpoints (*can run first, low complexity*)
- `GET /api/menu/categories` — fetch all categories (cached in Redis)
- `GET /api/menu/items` — fetch items with variants and add-ons (filter by availability + category)
- `GET /api/menu/items/:id/recipe` — fetch recipe (ingredients + quantities + unit cost)
- Cache results in Redis with 1-hour TTL
- Endpoint response time target: < 50ms

### 2. Recipe Engine Service (*depends on menu entities, critical*)
- Create `RecipeEngine` service that maps menu_item → ingredients → cost calculation
- `calculateItemCost(itemId, variants, addOns)` — returns COGS per dish
- `validateRecipeCompleteness(itemId)` — ensure recipe has ingredients with unit costs
- `recalculateCOGS()` — batch recalculate all items (for bulk ingredient cost updates)
- Unit test this service thoroughly (test with sample menu items)

### 3. Inventory Module - Transaction core (*CRITICAL - high complexity*)
- Create `InventoryService` with database transaction wrapper
- `deductInventory(orderItems)` — atomic operation:
  * Lock ingredient rows for write
  * Calculate required quantities per ingredient (sum across recipe ingredients)
  * Verify sufficient stock exists
  * Deduct quantities
  * Log transaction (inventory_transactions table)
  * Return or rollback on error
- `addStock(purchaseId)` — inverse operation when purchase GRN is received
- Implement pessimistic locking (SELECT FOR UPDATE in MySQL)
- Create `InventoryAudit` log for every deduction (for wastage tracking later)

### 4. Order Module - Order creation with inventory sync (*depends on steps 2-3*)
- `POST /api/orders/create` — main order creation endpoint
- Request: { orderId, orderType (dine-in|takeaway|online), tableId?, items: [{menuItemId, quantity, variants, addOns, specialInstructions}], customerDetails? }
- Flow:
  * Validate order (all items available, recipe complete)
  * Calculate subtotal using RecipeEngine (for admin cost tracking)
  * START TRANSACTION
  * Insert Order (status: PENDING, timestamp)
  * Insert OrderItems
  * Call `InventoryService.deductInventory()`
  * INSERT INTO orders, order_items
  * COMMIT or ROLLBACK
- Return: OrderId, totalAmount, estimatedTime, status
- Error handling: stock insufficient → rollback + return error message

### 5. Kitchen Module (KDS preparation)
- `GET /api/kitchen/queue` — fetch all pending → preparing orders (WebSocket ready)
- `PUT /api/kitchen/:orderId/status` — update order status: PENDING → PREPARING → READY
- `GET /api/kitchen/:orderId/details` — fetch full order + ingredient list + special instructions
- Implement order prioritization (FIFO with timestamp)
- Prepare WebSocket events for KDS real-time updates (implemented in Phase 3)

### 6. Billing Module - GST-ready invoicing
- Create `BillingService` with calculation logic:
  * Subtotal = sum(item costs)
  * Discount (percentage or fixed amount)
  * Taxable amount = subtotal - discount
  * GST calculation: 5% (most food items in Kerala) or configurable per item
  * Total = taxable + GST
- `POST /api/billing/calculate` — calculates total and tax breakdown (preview before payment)
- `POST /api/billing/invoice/create` — create invoice (after payment confirmed)
- Implement split payments (multiple payment methods per order)
- `POST /api/billing/payment` — process payment: { orderId, amount, method (UPI|CASH|CARD), reference }
- Create Invoice entity with PDF generation ready (use node-html-pdf or similar)

### 7. Table Management Module (*supports dine-in*)
- `GET /api/tables` — fetch all tables with status (available|occupied|reserved)
- `POST /api/tables/:id/occupy` — mark table occupied, link to order
- `POST /api/tables/:id/release` — mark table available (triggered on payment)
- Implement table status sync for POS display

### 8. Error Handling & Response Standardization
- Create global exception filter in NestJS (handle all errors uniformly)
- Standard response format: `{ success: boolean, data?: any, error?: {code, message}, statusCode }`
- Custom exceptions: `InsufficientStockException`, `InvalidOrderException`, `PaymentFailedException`
- Implement request logging + error tracking (prepare for observability later)

**Critical Files:**
- `backend/src/modules/order/order.service.ts` — transactional order creation
- `backend/src/modules/inventory/inventory.service.ts` — stock deduction with locks
- `backend/src/modules/recipe/recipe.service.ts` — cost calculation
- `backend/src/modules/billing/billing.service.ts` — GST + payment handling
- `backend/src/common/database/transaction.helper.ts` — transaction wrapper

**Verification:**
- [ ] Order creation API creates order + deducts inventory atomically
- [ ] Stock insufficient error properly rolls back changes
- [ ] Concurrent order requests don't cause race conditions (use MySQL benchmarks: 10 concurrent orders)
- [ ] GST calculation correct (test with 5% rate on Kerala menu items)
- [ ] Invoice data structure supports PDF generation
- [ ] All calculations accurate with unit tests (test 50+ scenarios)

---

## Phase 3: Frontend - Next.js PWA with POS, Online, KDS

**Goal:** Build mobile-first PWA for POS staff + online customers + kitchen display.

**Steps:**

### 1. Next.js project setup (*can start in parallel with Phase 2*)
- Initialize Next.js 14+ with App Router
- Install: `next-pwa`, `zustand` (state), `axios`, `tailwind`, `react-query`, `socket.io-client`
- Create folder structure: `app/` (routes), `components/`, `hooks/`, `utils/`, `services/`, `offline/`
- Set up environment variables for API endpoints (local vs. cloud sync)

### 2. Offline-first architecture (*foundation for PWA*)
- Install `idb` (IndexedDB wrapper) for local data persistence
- Create `offlineService.ts` — handles syncing with `sync_queue` table
- When offline: queue operations locally, sync when internet returns
- Conflict resolution: last-write-wins for menu/tables, transaction locks for orders (queued for server validation)
- Store menu items + categories locally (cached offline)

### 3. Authentication UI (*uses Phase 2 auth API*)
- `app/login/page.tsx` — login form (email + password, roles displayed)
- Token stored in secure HTTP-only cookie (if possible) + localStorage fallback
- Role-based route guards using middleware
- Logout + token refresh on 401

### 4. POS UI - Order Creation
- `app/pos/page.tsx` — main POS screen
- Left side: Menu categories (buttons) + items grid (quick-add buttons, touch-friendly)
- Right side: Active order cart (edit qty, remove, add notes)
- Features:
  * Search items by name
  * Quick modifiers for variants + add-ons
  * Running total price calculation (client-side using RecipeEngine copy)
  * Table selection dropdown (dine-in orders)
  * "Place Order" button → API call → confirmation modal
- Performance: < 200ms for adding item to cart, < 100ms for item search

### 5. POS UI - Kitchen Queue / Bill Payment
- `app/pos/kitchen-queue` — tab showing order status (for kitchen staff reference)
- `app/pos/bills` — after order placed, show bill details:
  * Item breakdown with unit price + tax
  * Apply discounts (manager approval if >10%)
  * Payment button → payment method selection
  * Success confirmation with order number (print receipt if thermal printer available)

### 6. Kitchen Display System (KDS)
- `app/kitchen/page.tsx` — real-time order queue
- Layout: Large order cards showing:
  * Order number + table (if dine-in) + timestamp
  * Item list with ingredients + special instructions (highlight allergies in red if tracked)
  * Status buttons: [START PREPARING] → [READY] → [SERVED]
- WebSocket connection to backend for live updates
- Sound + visual alert when new order received
- Filters: show pending/preparing, hide served (auto-hide after 5 min)

### 7. Online Ordering (Customer-facing)
- `app/order/page.tsx` — similar to POS but for public orders
- No table selection (takeaway only initially)
- Show wait time estimate (calculated from current orders)
- "Check Order Status" feature (link via order ID or phone number)

### 8. Admin Dashboard (MVP)
- `app/dashboard/page.tsx` — read-only summary:
  * Today's revenue, # of orders, avg order value
  * Low stock alerts (inventory < threshold)
  * Quick links: Menu management, User management (defer full UI)
- Real-time charts (orders placed per hour, revenue trend)

### 9. PWA Configuration
- `next-pwa` plugin with offline fallback page
- Service worker caches API responses (GET requests only, bypass POST)
- Install prompt for "Add to Home Screen"
- Background sync for queued orders (when internet returns)

**Critical Files:**
- `frontend/app/pos/page.tsx` — POS main screen
- `frontend/app/kitchen/page.tsx` — KDS display
- `frontend/app/order/page.tsx` — Online ordering
- `frontend/services/api.ts` — API client with offline queue
- `frontend/utils/offlineSync.ts` — sync logic
- `frontend/components/OrderCart.tsx` — cart UI (reused in POS + online)

**Verification:**
- [ ] POS loads menu in < 1 second (online)
- [ ] Can add items + calculate price (no network needed)
- [ ] Order creation takes < 500ms on 4G connection
- [ ] KDS shows order updates in real-time (< 100ms latency via WebSocket)
- [ ] Works offline: menu loads, orders can be created, sync queues locally
- [ ] PWA installable on mobile (add to home screen works)
- [ ] Responsive on 5-inch phone screens (touch-friendly minimum 48px buttons)

---

## Phase 4: System Integration & Advanced Features

**Steps:**

### 1. Real-time features (WebSocket integration)
- Implement Nest `@nestjs/websockets` gateway
- Kitchen: Order status changes broadcast to KDS clients
- POS: Menu/table updates broadcast (if admin changes availability)
- Order tracking: Customer can subscribe to order status (Phase 2)

### 2. Purchase & Supplier Management
- `POST /api/purchase/create` — create purchase order (itemId, quantity, supplier, expectedDelivery)
- `POST /api/purchase/:id/grn` — Goods Receipt Note (receive stock, update inventory)
- Track purchase history for cost trends

### 3. Analytics Dashboard (enhanced)
- Ingredient usage trends (which items sold most, profitability per item)
- Wastage tracking (link to inventory deductions + purchases)
- Break-even analysis per menu item

### 4. Audit & Compliance
- Log all financial transactions (orders, payments, adjustments)
- Implement audit trail viewing (admin only)

### 5. Sync Service setup (*prepare for Phase 5*)
- Create background job service (NestJS Scheduling)
- Daily sync of local server data to cloud (if connected)
- Cloud backup of invoices + inventory snapshots

**Verification:**
- [ ] KDS updates in real-time when order status changes
- [ ] Purchase module integrates with inventory correctly
- [ ] Analytics show accurate trends with test data

---

## Phase 5: Production Hardening & Deployment

**Steps:**

### 1. Performance optimization
- Implement caching layer (Redis) for frequently accessed data (menu, exchange rates)
- Database query optimization (add indexes, analyze slow queries)
- Frontend bundle optimization (code splitting in Next.js)
- Load testing: verify system handles 100+ concurrent orders

### 2. Security hardening
- CORS configuration (restrict to restaurant domain only)
- Rate limiting on APIs
- SQL injection prevention (already in TypeORM)
- Input validation on all endpoints (class-validator)
- HTTPS setup (self-signed cert for local network)

### 3. Deployment setup (*NO DOCKER*)
- Backend: PM2 configuration for Node.js process management
- AI service: systemd service file (when Phase 2 is done)
- Database: MySQL local installation + backup strategy
- Frontend: build Next.js production bundle, serve via PM2 or nginx

### 4. Monitoring & Logging
- Winston or Pino for structured logging
- Error tracking (LocalStorage for now, external service later)
- Health checks for all services

### 5. Testing
- Unit tests for critical services (OrderService, InventoryService, BillingService)
- Integration tests for transaction flows
- Manual load testing (concurrent orders)

**Verification:**
- [ ] System handles 100 concurrent order placements without errors
- [ ] All security checks pass
- [ ] Services restart automatically on crash (PM2)
- [ ] Database backups run automatically

---

## Relevant Files & Architecture Reference

**Backend Structure:**
```
backend/
  src/
    main.ts
    app.module.ts
    modules/
      auth/             # JWT + role-based access
      menu/             # Items, categories, variants
      order/            # Transaction-heavy order creation
      kitchen/          # KDS queue + status tracking
      billing/          # GST + payment processing
      inventory/        # Stock deduction + auditing
      recipe/           # Cost calculation engine
    common/
      guards/           # Auth guards
      filters/          # Global exception handling
      database/         # Transaction helpers, connection pool
    config/             # Environment config
    database/           # TypeORM config, migrations
  .env.example
  package.json
```

**Frontend Structure:**
```
frontend/
  app/
    login/
    pos/               # POS screens
    kitchen/           # KDS display
    order/             # Online ordering
    dashboard/         # Admin read-only
  components/          # Reusable React components
  services/            # API calls + offline sync
  utils/               # Helpers, constants
  offline/             # Offline storage logic
  public/              # Static assets
```

**Database Core Tables:**
- `users, roles` — authentication
- `menu_items, categories, menu_variants, menu_addons` — menu structure
- `recipes, recipe_ingredients` — ingredient mapping + unit costs
- `orders, order_items` — order data with timestamps
- `inventory, inventory_transactions` — stock + audit trail
- `tables` — dine-in table management
- `invoices, payments` — billing data
- `purchases, suppliers, purchase_items` — supplier + purchase management
- `sync_queue` — offline sync tracking

---

## Verification Steps (End-to-End)

### 1. Order to Kitchen Flow:
- [ ] Place order via POS → inventory deducts → KDS shows order → Kitchen updates status → Customer sees status
- [ ] All happens in single transaction (order + inventory atomic)

### 2. Billing & Payment:
- [ ] Order total = COGS-based cost + GST 5% (Kerala)
- [ ] Invoice generated with proper tax breakdown
- [ ] Payment recorded + order marked complete

### 3. Offline Capability:
- [ ] Disconnect network → create order locally → order queued
- [ ] Reconnect → sync occurs → order appears in backend + KDS

### 4. Performance:
- [ ] POS response time < 200ms for most operations
- [ ] Supports 100+ concurrent orders without errors

---

## Decisions & Execution Guardrails

**Included in MVP:**
- Single restaurant only
- Auth + all 7 core modules
- Transaction-based order + inventory
- Next.js PWA with offline support
- Dine-in + takeaway + online ordering
- POS + KDS + basic admin dashboard
- GST-ready billing (India-focused)

**Deliberately Excluded (Phase 2+):**
- WhatsApp ordering integration
- AI engine (demand prediction, pricing suggestions)
- Multi-branch/franchise support
- Advanced analytics
- Print integration (thermal printers)
- Mobile app (PWA is primary)

**Tech Stack Locked:**
- NestJS (for modularity + transaction support)
- MySQL (existing, no migration to PostgreSQL)
- Next.js App Router (offline-first)
- No Docker (PM2 + systemd)
- Redis (caching + queue foundation)

---

## Timeline Estimate

- **Phase 1 (Backend setup):** 3-4 days
- **Phase 2 (Core APIs):** 5-7 days
- **Phase 3 (Frontend):** 4-5 days
- **Phase 4 (Integration):** 2-3 days
- **Phase 5 (Hardening):** 2-3 days

**Total: ~2-3 weeks** for production-ready MVP

---

## Next Steps After Approval

1. Review this plan for any adjustments
2. Proceed to Phase 1: Create NestJS project structure + migrate database
3. Implement stock deduction logic first (Phase 2, step 3) — the most critical transaction
