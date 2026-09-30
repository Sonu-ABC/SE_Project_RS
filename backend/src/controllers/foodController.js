import Food from "../models/Food.js";
import Ingredient from "../models/Ingredient.js";

/**
 * GET /api/foods
 * Returns all available food items.
 */
export const getFoods = async (req, res) => {
  res.json(await Food.find({ isAvailable: true }).lean());
};

/**
 * GET /api/foods/:id/availability
 * Checks whether a food item can currently be prepared based on ingredient stock.
 */
export const checkAvailability = async (req, res) => {
  const food = await Food.findById(req.params.id).lean();
  if (!food) return res.status(404).json({ message: "Food not found" });
  for (const part of food.ingredients) {
    const ingredient = await Ingredient.findById(part.ingredientId).lean();
    if (!ingredient || ingredient.currentStock < part.quantityRequired)
      return res.json({
        available: false,
        message: `Sorry, ${food.name} is unavailable because an ingredient is out of stock.`,
      });
  }
  res.json({ available: true });
};

/**
 * POST /api/foods
 * Creates a new food item. Manager only.
 */
export const createFood = async (req, res) => {
  res.status(201).json(await Food.create(req.body));
};

/**
 * PATCH /api/foods/:id
 * Updates a food item (e.g. selling price). Manager only.
 */
export const updateFood = async (req, res) => {
  res.json(
    await Food.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
};
