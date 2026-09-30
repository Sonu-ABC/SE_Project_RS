# Frontend — Restaurant Automation System

React + Vite frontend for the Savoury Restaurant Automation System.

---

## Technology Stack

| Tool | Purpose |
|---|---|
| React 19 | UI library |
| Vite 6 | Dev server + bundler |
| CSS (custom) | Styling (no Tailwind; hand-written stylesheet) |
| Fetch API | HTTP calls to backend |

---

## Folder Structure

```text
frontend/
├── src/
│   ├── main.jsx               ← Entry point: Root session wrapper + createRoot
│   ├── App.jsx                ← App shell: sidebar, header, tab routing, global state
│   ├── styles.css             ← All application CSS
│   │
│   ├── api/
│   │   ├── authApi.js         ← loginUser, registerUser
│   │   ├── foodApi.js         ← getFoods, checkFoodAvailability, updateFoodPrice
│   │   ├── inventoryApi.js    ← getInventoryWarnings, getIngredientOrders,
│   │   │                          placeIngredientOrder, payIngredientOrder
│   │   ├── billApi.js         ← createBill, payBill
│   │   └── accountApi.js      ← getAccountBalance
│   │
│   ├── components/
│   │   ├── Card.jsx           ← Reusable stat card (title, value, tone)
│   │   └── PaymentSummary.jsx ← Checkout / order summary + payment button
│   │
│   └── pages/
│       ├── AuthPage.jsx       ← Login / registration form
│       ├── MenuPage.jsx       ← Food grid, cart bar, availability check
│       ├── InventoryPage.jsx  ← Low-stock warnings + ingredient order management
│       ├── PriceManagerPage.jsx ← Manager: update food selling prices
│       ├── ReportsPage.jsx    ← Sales / profit / expense charts (Manager)
│       └── BillsPage.jsx      ← Most recent paid bill + static bill list
│
├── public/
│   └── images/                ← Food item images (served as static assets)
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Separation of Concerns

| Layer | Responsibility |
|---|---|
| `main.jsx` | Read/write session from localStorage; choose Auth vs App |
| `App.jsx` | Sidebar navigation, header, global cart/balance state, tab routing |
| `pages/` | Page-level layout, local state, compose components |
| `components/` | Reusable UI pieces (Card, PaymentSummary) |
| `api/` | All `fetch()` calls — one file per backend resource group |

---

## API Proxy

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`, so no CORS configuration is needed during development:

```js
// vite.config.js
server: { proxy: { '/api': 'http://localhost:5000' } }
```

---

## Session Storage

On login, the server response `{ token, user }` is stored in `localStorage` under the key `restaurantSession`.

- On reload, the session is restored from localStorage.
- On logout, the key is removed and the Auth page is shown.

The `Bearer` token is attached manually in each API module.

---

## Role-based Navigation

| Tab | CUSTOMER | SALES_CLERK | MANAGER |
|---|---|---|---|
| Menu | ✓ | ✓ | — |
| Inventory | — | ✓ | — |
| Bills | ✓ | ✓ | — |
| Prices | — | — | ✓ |
| Reports | — | — | ✓ |

---

## Scripts

```bash
npm run dev      # vite --host 0.0.0.0  (dev server on port 5173)
```

---

## Public Assets

Food images are served from `public/images/` and referenced directly in `MenuPage.jsx` via a name-to-path map:

```js
"Classic Veg Burger" → "/images/classic-veg-burger.png"
// ... etc
```
