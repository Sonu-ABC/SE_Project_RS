# Savoury — Restaurant Automation System (RAS)

A full-stack MERN web application for restaurant management, supporting three distinct roles: **Customer**, **Sales Clerk**, and **Manager**.

---

## Project Overview

The Restaurant Automation System (RAS) automates the day-to-day operations of a restaurant — from customer ordering and payment to inventory monitoring, stock purchasing, and financial reporting.

### System Modules

| Module | Status |
|---|---|
| **Authentication / User Management** | ✅ Implemented |
| **Menu / Food Catalogue** | ✅ Implemented |
| **Sales & Billing** | ✅ Implemented |
| **Inventory Monitoring** | ✅ Implemented |
| **Purchase Orders (Ingredient Restocking)** | ✅ Implemented |
| **Price Management** | ✅ Implemented |
| **Financial Reports** | ⚠️ Partially implemented (static UI, live backend totals) |
| **Supplier Invoice & Payment detail** | 🔲 Planned |

---

## System Architecture

```
React Frontend  (Vite · port 5173)
       │
       │  HTTP / JSON  (proxied via Vite dev server)
       ▼
Express / Node.js Backend  (port 5000)
       │
       │  Mongoose ODM
       ▼
MongoDB Atlas / Local MongoDB
```

**Backend responsibilities:** REST API, JWT authentication, business logic, database operations, seed data.

**Frontend responsibilities:** UI rendering, session storage, API call abstraction, role-based navigation.

---

## Module Architecture

### Authentication
- Users register and log in with email + password.
- Passwords are hashed with bcrypt.
- A JWT is issued on login and stored in `localStorage`.
- The JWT is sent as a `Bearer` token on all protected requests.
- Three roles: `CUSTOMER`, `SALES_CLERK`, `MANAGER`.

### Menu / Food Catalogue
- A seeded catalogue of 10 food items is available on first run.
- Each food item has a name, selling price, ingredient cost, and a recipe (list of ingredient IDs + quantities).
- Customers and clerks browse available items and add them to a cart.
- Managers can update selling prices.

### Sales & Billing
- Adding a food item to the cart triggers a live ingredient stock check.
- Checkout creates a draft bill, then a payment call deducts stock and records the sale.
- Bills record total amount, cost, and profit.
- After payment, a `.txt` bill receipt can be downloaded.

### Inventory Monitoring
- Ingredients are seeded with 20 items on first run.
- Consumption is recorded in `InventoryTransaction` on every paid sale.
- A dynamic reorder threshold is calculated from the last 30 minutes of consumption.
- Sales Clerks see a live "Needs attention" panel with low-stock ingredients.

### Purchase Orders
- Clerks can place a purchase order for a low-stock ingredient.
- The required quantity is auto-calculated: `max(ceil(threshold − currentStock), 1)`.
- Paying the order deducts the cost from the restaurant balance and restocks the ingredient.

### Price Management
- Managers can update the selling price of any food item directly from the Prices tab.

### Financial Reports
- The `/api/reports` endpoint returns live totals (total sales, total profit).
- The Reports UI currently displays static placeholder bar charts alongside the live totals.

---

## Repository Structure

```text
SE_Project_RS/
│
├── backend/
│   ├── src/
│   │   ├── app.js                    ← Express setup, middleware, routes
│   │   ├── server.js                 ← DB connect + server.listen entry point
│   │   ├── config/
│   │   │   └── db.js                 ← MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js     ← register, login
│   │   │   ├── foodController.js     ← CRUD + availability check
│   │   │   ├── inventoryController.js← ingredients + warnings
│   │   │   ├── orderController.js    ← ingredient orders
│   │   │   ├── billController.js     ← bill creation + payment
│   │   │   └── accountController.js  ← balance + reports
│   │   ├── middleware/
│   │   │   └── auth.js               ← JWT auth middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Food.js
│   │   │   ├── Ingredient.js
│   │   │   ├── IngredientOrder.js
│   │   │   ├── Bill.js
│   │   │   ├── FinancialTransaction.js
│   │   │   ├── RestaurantAccount.js
│   │   │   └── InventoryTransaction.js
│   │   ├── routes/
│   │   │   ├── auth.js               ← /api/auth
│   │   │   ├── food.js               ← /api/foods
│   │   │   ├── inventory.js          ← /api/ingredients, /api/inventory
│   │   │   ├── order.js              ← /api/restaurant/orders
│   │   │   ├── bill.js               ← /api/bills
│   │   │   ├── account.js            ← /api/account
│   │   │   └── reports.js            ← /api/reports
│   │   └── utils/
│   │       └── seed.js               ← Ingredient + food seed data
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  ← Root + createRoot entry point
│   │   ├── App.jsx                   ← App shell, layout, global state
│   │   ├── styles.css                ← All application styles
│   │   ├── api/
│   │   │   ├── authApi.js            ← login, register
│   │   │   ├── foodApi.js            ← getFoods, checkAvailability, updatePrice
│   │   │   ├── inventoryApi.js       ← warnings, orders, place, pay
│   │   │   ├── billApi.js            ← createBill, payBill
│   │   │   └── accountApi.js         ← getAccountBalance
│   │   ├── components/
│   │   │   ├── Card.jsx              ← Reusable stat card
│   │   │   └── PaymentSummary.jsx    ← Checkout / order summary panel
│   │   └── pages/
│   │       ├── AuthPage.jsx          ← Login + registration
│   │       ├── MenuPage.jsx          ← Food grid + cart bar
│   │       ├── InventoryPage.jsx     ← Low-stock warnings + ingredient orders
│   │       ├── PriceManagerPage.jsx  ← Manager price editor
│   │       ├── ReportsPage.jsx       ← Sales/profit/expense charts
│   │       └── BillsPage.jsx         ← Paid bill display + download
│   ├── public/
│   │   └── images/                   ← Food item images
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── package.json                      ← Root scripts (dev, server, client)
└── README.md
```

---

## Requirements

- Node.js 18 or later
- MongoDB (local or Atlas)

---

## Installation

```bash
# From the project root
npm install

# Copy and configure the backend environment file
copy backend\.env.example backend\.env
```

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/restaurant_manager
PORT=5000
JWT_SECRET=replace-this-secret
```

---

## Running the Application

Start both backend and frontend together:

```bash
npm run dev
```

Or separately in two terminals:

```bash
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/foods` | Public | List available food items |
| GET | `/api/foods/:id/availability` | Public | Check ingredient stock |
| POST | `/api/foods` | MANAGER | Add food item |
| PATCH | `/api/foods/:id` | MANAGER | Update food (e.g. price) |
| GET | `/api/ingredients` | MGR, CLERK | List ingredients |
| POST | `/api/ingredients` | MANAGER | Add ingredient |
| GET | `/api/inventory/warnings` | MGR, CLERK | Low-stock ingredients |
| GET | `/api/restaurant/orders` | MGR, CLERK | List ingredient orders |
| POST | `/api/restaurant/orders` | MGR, CLERK | Place ingredient order |
| POST | `/api/restaurant/orders/:id/pay` | MGR, CLERK | Pay supplier order |
| POST | `/api/restaurant/orders/:id/arrive` | MGR, CLERK | Mark order arrived |
| POST | `/api/bills` | CUST, CLERK | Create bill |
| POST | `/api/bills/:id/pay` | CUST, CLERK | Pay bill |
| GET | `/api/account/balance` | MGR, CLERK | Restaurant balance |
| GET | `/api/reports` | MANAGER | Sales summary |
| GET | `/api/health` | Public | Health check |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Empty menu | Confirm MongoDB is running; restart backend (seeding is automatic) |
| `404` API errors | Stop old Node processes, restart with `npm run dev` |
| Stale UI | Hard-refresh with `Ctrl + F5` |
| MongoDB error | Check `backend/.env` and verify MongoDB is on the correct port |
