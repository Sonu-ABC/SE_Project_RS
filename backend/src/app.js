import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import inventoryRoutes from "./routes/inventory.js";
import orderRoutes from "./routes/order.js";
import billRoutes from "./routes/bill.js";
import accountRoutes from "./routes/account.js";
import reportsRoutes from "./routes/reports.js";

const app = express();

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api", inventoryRoutes);           // mounts /api/ingredients + /api/inventory/warnings
app.use("/api/restaurant/orders", orderRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/reports", reportsRoutes);

export default app;
