import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getOrders,
  placeOrder,
  payOrder,
  markOrderArrived,
} from "../controllers/orderController.js";

const router = Router();

// GET /api/restaurant/orders — Manager and Sales Clerk
router.get("/", auth(["MANAGER", "SALES_CLERK"]), getOrders);

// POST /api/restaurant/orders — Manager and Sales Clerk
router.post("/", auth(["SALES_CLERK", "MANAGER"]), placeOrder);

// POST /api/restaurant/orders/:id/pay — Manager and Sales Clerk
router.post("/:id/pay", auth(["SALES_CLERK", "MANAGER"]), payOrder);

// POST /api/restaurant/orders/:id/arrive — Manager and Sales Clerk
router.post("/:id/arrive", auth(["SALES_CLERK", "MANAGER"]), markOrderArrived);

export default router;
