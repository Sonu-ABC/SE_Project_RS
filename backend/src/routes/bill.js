import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createBill, payBill } from "../controllers/billController.js";

const router = Router();

// POST /api/bills — Customer and Sales Clerk
router.post("/", auth(["CUSTOMER", "SALES_CLERK"]), createBill);

// POST /api/bills/:id/pay — Customer and Sales Clerk
router.post("/:id/pay", auth(["CUSTOMER", "SALES_CLERK"]), payBill);

export default router;
