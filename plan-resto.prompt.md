## Plan: Smart Restaurant ERP MVP Scaffold

Build a modular-monolith restaurant ERP in small, testable increments with a single-location scope, Express backend, plain HTML/JS frontend first, and MySQL persistence. Start with the order flow because it gives the fastest end-to-end vertical slice: schema, API, simple UI, and testable behavior. Keep each increment shippable before moving to the next.

**Steps**
1. Establish the repo scaffold and runtime conventions.
   - Create a minimal monorepo layout with `backend`, `frontend`, and `database` areas.
   - Add root scripts for local development and tests.
   - Define environment config, logging, and shared request/error handling patterns up front.
   - *Depends on none.*
2. Build the foundational backend slice for restaurant operations.
   - Implement Express app bootstrap, MySQL connection layer, health check, and a small module structure under `src/modules`.
   - Add the first domain tables for menu items, tables, orders, order items, and stock movements.
   - Keep business rules in service functions and HTTP handlers thin.
   - *Depends on step 1.*
3. Deliver Menu Management as the first complete feature.
   - Add CRUD APIs for menu categories and menu items.
   - Add minimal UI screens for listing, creating, and editing menu items.
   - Verify the feature entirely through API and UI before adding orders.
   - *Depends on step 2.*
4. Deliver Order Management as the first end-to-end operational flow.
   - Add dine-in order creation against a table and a basic online order path.
   - Support order item add/remove, status changes, and order retrieval.
   - Expose a simple UI to create an order from menu data and review open orders.
   - *Depends on step 3 and shares menu data.*
5. Add Billing as a separate, narrow increment.
   - Implement bill generation from an order, totals, taxes/charges if needed, and payment marking.
   - Keep billing state changes explicit so orders cannot be paid twice.
   - Verify via API first, then the minimal UI path.
   - *Depends on step 4.*
6. Add basic inventory deduction.
   - Introduce ingredient or stock-item tracking and deduct stock on paid orders or finalized order events.
   - Start with deterministic deduction rules, not recipe complexity.
   - Add low-stock visibility as a simple read endpoint or dashboard section.
   - *Depends on step 5.*
7. Tighten production structure without expanding scope.
   - Add validation, tests, and a repeatable local setup guide.
   - Improve naming, module boundaries, and error handling only after each feature works end to end.
   - *Runs after the first feature slices are stable.*

**Relevant files**
- `/workspaces/resto/README.md` — replace the placeholder with project overview and local run instructions.
- `/workspaces/resto/package.json` — root scripts and workspace coordination.
- `/workspaces/resto/backend/package.json` — backend dependencies and scripts.
- `/workspaces/resto/backend/src/server.js` — Express bootstrap and app wiring.
- `/workspaces/resto/backend/src/config/*` — environment and MySQL configuration.
- `/workspaces/resto/backend/src/modules/*` — bounded feature modules for menus, orders, billing, and inventory.
- `/workspaces/resto/database/schema.sql` — initial schema and migration seed path.
- `/workspaces/resto/frontend/index.html` — first UI shell.
- `/workspaces/resto/frontend/app.js` — minimal client logic for API-backed screens.
- `/workspaces/resto/frontend/styles.css` — lightweight UI styling.

**Verification**
1. After scaffold creation, run backend startup plus a health check to confirm server and DB wiring.
2. After each feature slice, exercise the API with a small deterministic request set and confirm expected database changes.
3. For the UI slice, verify the browser can create and list records without manual database edits.
4. Add at least one test per feature boundary before moving to the next increment.
5. Keep a short runbook in the README for starting the app and verifying the latest slice.

**Decisions**
- Single restaurant location only for the MVP.
- No auth or role system in the first phase.
- Express is the backend framework.
- Plain HTML/JS is the frontend starting point to reduce build complexity.
- Modular monolith only; no service split or Docker in this phase.
- Scope is intentionally narrow: menu, orders, billing, and basic inventory deduction only.

**Further Considerations**
1. Confirm whether basic online orders mean guest checkout only or should include customer accounts later.
2. Confirm whether inventory deduction should happen on order placement, kitchen confirmation, or payment completion.
3. Confirm whether tax/service charge rules are fixed or should be configurable from the start.
