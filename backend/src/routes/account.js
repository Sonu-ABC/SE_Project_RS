import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getBalance, getReports } from "../controllers/accountController.js";

const router = Router();

// GET /api/account/balance — Manager and Sales Clerk
router.get("/balance", auth(["MANAGER", "SALES_CLERK"]), getBalance);

export default router;
