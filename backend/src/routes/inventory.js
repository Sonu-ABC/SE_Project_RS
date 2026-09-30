import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getIngredients,
  createIngredient,
  getInventoryWarnings,
} from "../controllers/inventoryController.js";

const router = Router();

// GET /api/ingredients — Manager and Sales Clerk
router.get("/ingredients", auth(["MANAGER", "SALES_CLERK"]), getIngredients);

// POST /api/ingredients — Manager only
router.post("/ingredients", auth(["MANAGER"]), createIngredient);

// GET /api/inventory/warnings — Manager and Sales Clerk
router.get(
  "/inventory/warnings",
  auth(["MANAGER", "SALES_CLERK"]),
  getInventoryWarnings
);

export default router;
