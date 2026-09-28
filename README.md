# Savoury Restaurant Management System

A MERN-stack restaurant ordering and inventory application with Customer, Sales Clerk, and Manager workflows.

## Features

- Customer menu with food images, stock checks, cart, payment simulation, and downloadable bills.
- Sales Clerk inventory warnings, dynamic thresholds, ingredient orders, supplier payments, and walk-in bills.
- Manager price management and sales, profit, and expense reports.
- JWT authentication and bcrypt password hashing.
- MongoDB persistence for users, food, ingredients, bills, financial transactions, inventory transactions, and restaurant balance.
- Automatic seed data for 20 ingredients and 10 food items.

## Structure

```text
SE_Project/
├── backend/src/server.js
├── backend/src/controllers/
├── backend/src/middleware/
├── backend/src/models/
├── backend/src/routes/
├── backend/src/utils/
├── backend/src/validators/
├── frontend/src/main.jsx
├── frontend/src/styles.css
├── frontend/public/images/
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or later
- MongoDB Community Server running locally
- MongoDB URI: `mongodb://localhost:27017/restaurant_manager`

## Installation

From the project root:

```bash
npm install
copy backend\.env.example backend\.env
```

Configure `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/restaurant_manager
PORT=5000
JWT_SECRET=replace-this-secret
```

## Run

Start both applications:

```bash
npm run dev
```

Or separately:

```bash
npm run server
npm run client
```

Open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000).

On the first backend startup, MongoDB is seeded with the food and ingredient catalog. Seeding is idempotent.

## Using the application

### Customer

1. Sign up or log in with the `Customer` role.
2. Browse the menu and click **Add to order**.
3. Ingredient availability is checked automatically.
4. Open the floating cart and click **Proceed to payment**.
5. Review the itemized order and click **Make Payment**.
6. Open **Bills** and download the generated bill.

### Sales Clerk

1. Sign up or log in with the `Sales Clerk` role.
2. Use **Menu** for walk-in orders.
3. Use **Inventory** for low-stock and out-of-stock warnings.
4. Click **Place order**; quantity and amount are calculated automatically.
5. Pay supplier orders individually from **Ingredient orders**.
6. Supplier payment reduces the restaurant balance, increases stock, removes resolved warnings, and records an inventory purchase transaction.

### Manager

1. Sign up or log in with the `Manager` role.
2. Use **Prices** to update food selling prices.
3. Use **Reports** for sales, profit, expense, and monthly charts.

## Inventory threshold

Ingredient consumption is recorded in `InventoryTransaction`. The threshold is calculated from the previous 30 minutes:

```text
threshold = (total ingredient quantity used in the last 30 minutes / 3) × 2
```

An ingredient appears in **Needs attention** when current stock is at or below that threshold, or when it is out of stock.

## Main API routes

```text
POST  /api/auth/register
POST  /api/auth/login
GET   /api/foods
PATCH /api/foods/:id
GET   /api/inventory/warnings
POST  /api/restaurant/orders
POST  /api/restaurant/orders/:id/pay
POST  /api/bills
POST  /api/bills/:id/pay
GET   /api/account/balance
GET   /api/reports
```

## Troubleshooting

- Empty menu: confirm MongoDB is running and restart the backend for seeding.
- `404` API errors: stop old Node processes and restart with `npm run dev`.
- Stale UI: hard-refresh with `Ctrl + F5`.
- MongoDB errors: verify `backend/.env` and that MongoDB is listening on port `27017`.
