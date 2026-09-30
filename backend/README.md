# Backend — Restaurant Automation System

Express.js / Node.js REST API for the Savoury Restaurant Automation System.

---

## Technology Stack

| Tool | Purpose |
|---|---|
| Node.js (ESM) | Runtime |
| Express.js | HTTP framework |
| Mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment variables |

---

## Folder Structure

```text
backend/
├── src/
│   ├── app.js                     ← Express app: middleware + route registration
│   ├── server.js                  ← Entry point: DB connect → seed → listen
│   │
│   ├── config/
│   │   └── db.js                  ← connectDB() — Mongoose connection helper
│   │
│   ├── controllers/
│   │   ├── authController.js      ← register, login
│   │   ├── foodController.js      ← getFoods, checkAvailability, createFood, updateFood
│   │   ├── inventoryController.js ← getIngredients, createIngredient, getInventoryWarnings
│   │   ├── orderController.js     ← getOrders, placeOrder, payOrder, markOrderArrived
│   │   ├── billController.js      ← createBill, payBill
│   │   └── accountController.js   ← getBalance, getReports
│   │
│   ├── middleware/
│   │   └── auth.js                ← JWT auth middleware factory: auth(roles[])
│   │
│   ├── models/
│   │   ├── User.js                ← name, email, passwordHash, role
│   │   ├── Food.js                ← name, sellingPrice, ingredients[], isAvailable
│   │   ├── Ingredient.js          ← name, costPrice, currentStock, reorderThreshold, unit
│   │   ├── IngredientOrder.js     ← ingredientId, quantity, amount, status, orderedBy
│   │   ├── Bill.js                ← billNumber, items[], totalAmount, paymentStatus
│   │   ├── FinancialTransaction.js← type, amount, referenceId, note
│   │   ├── RestaurantAccount.js   ← key:"MAIN", balance, totalSales
│   │   └── InventoryTransaction.js← ingredientId, type, quantity, referenceId
│   │
│   ├── routes/
│   │   ├── auth.js                ← POST /api/auth/register, POST /api/auth/login
│   │   ├── food.js                ← GET/POST /api/foods, GET/PATCH /api/foods/:id
│   │   ├── inventory.js           ← GET/POST /api/ingredients, GET /api/inventory/warnings
│   │   ├── order.js               ← GET/POST /api/restaurant/orders, POST …/:id/pay|arrive
│   │   ├── bill.js                ← POST /api/bills, POST /api/bills/:id/pay
│   │   ├── account.js             ← GET /api/account/balance
│   │   └── reports.js             ← GET /api/reports
│   │
│   └── utils/
│       └── seed.js                ← Seed arrays + seedCatalog() (idempotent)
│
├── .env.example
└── package.json
```

---

## Separation of Concerns

| Layer | Responsibility |
|---|---|
| `server.js` | Load env → connect DB → seed → start HTTP server |
| `app.js` | Create Express instance, register middleware and routes |
| `config/db.js` | Mongoose `connect()` wrapped in a reusable function |
| `routes/` | Declare endpoints, attach middleware, delegate to controllers |
| `middleware/auth.js` | Verify JWT, check role, attach `req.user` |
| `controllers/` | Extract request data, call models, return HTTP response |
| `models/` | Mongoose schemas and model instances |
| `utils/seed.js` | One-time startup seed data (ingredients, foods, account) |

---

## Authentication

JWT tokens are issued on login and must be sent as:

```
Authorization: Bearer <token>
```

The `auth(roles)` middleware verifies the token and, if `roles` is non-empty, checks that `req.user.role` is included.

### Role permissions summary

| Endpoint group | CUSTOMER | SALES_CLERK | MANAGER |
|---|---|---|---|
| GET /api/foods | ✓ | ✓ | ✓ |
| POST /api/bills | ✓ | ✓ | — |
| GET /api/ingredients | — | ✓ | ✓ |
| GET /api/inventory/warnings | — | ✓ | ✓ |
| POST /api/restaurant/orders | — | ✓ | ✓ |
| PATCH /api/foods/:id | — | — | ✓ |
| GET /api/reports | — | — | ✓ |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
MONGO_URI=mongodb://localhost:27017/restaurant_manager
PORT=5000
JWT_SECRET=replace-this-secret
```

---

## Scripts

```bash
npm start        # node src/server.js
npm run dev      # node --watch src/server.js (hot restart)
```

---

## Data Models

### Food
```
name, sellingPrice, totalIngredientCost, profit,
ingredients: [{ ingredientId, quantityRequired }],
isAvailable
```

### Ingredient
```
name, costPrice, currentStock, reorderThreshold, unit
```

### Bill
```
billNumber, customerId, createdBy,
items: [{ foodId, foodName, quantity, sellingPriceAtPurchase,
          ingredientCostAtPurchase, profitAtPurchase }],
totalAmount, totalCost, totalProfit, paymentMethod, paymentStatus
```

### IngredientOrder
```
ingredientId, ingredientName, quantity, amount,
status: "PLACED"|"PAID"|"ARRIVED", orderedBy
```

### InventoryTransaction
```
ingredientId, type: "SALE_CONSUMPTION"|"INGREDIENT_PURCHASE",
quantity, amount, referenceId
```

### FinancialTransaction
```
type: "SALE"|"INGREDIENT_EXPENSE", amount, referenceId, note
```
