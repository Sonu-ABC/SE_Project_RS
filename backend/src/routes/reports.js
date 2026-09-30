import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getReports } from "../controllers/accountController.js";

const router = Router();

// GET /api/reports — Manager only
router.get("/", auth(["MANAGER"]), getReports);

export default router;
