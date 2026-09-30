import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getFoods,
  checkAvailability,
  createFood,
  updateFood,
} from "../controllers/foodController.js";

const router = Router();

// GET /api/foods — public
router.get("/", getFoods);

// GET /api/foods/:id/availability — public
router.get("/:id/availability", checkAvailability);

// POST /api/foods — Manager only
router.post("/", auth(["MANAGER"]), createFood);

// PATCH /api/foods/:id — Manager only
router.patch("/:id", auth(["MANAGER"]), updateFood);

export default router;
