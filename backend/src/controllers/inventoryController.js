import Ingredient from "../models/Ingredient.js";
import InventoryTransaction from "../models/InventoryTransaction.js";

/**
 * GET /api/ingredients
 * Returns all ingredients. Manager and Sales Clerk only.
 */
export const getIngredients = async (req, res) => {
  res.json(await Ingredient.find().lean());
};

/**
 * POST /api/ingredients
 * Creates a new ingredient. Manager only.
 */
export const createIngredient = async (req, res) => {
  res.status(201).json(await Ingredient.create(req.body));
};

/**
 * GET /api/inventory/warnings
 * Returns ingredients that are at or below their dynamic reorder threshold,
 * calculated from the consumption in the last 30 minutes.
 */
export const getInventoryWarnings = async (req, res) => {
  const since = new Date(Date.now() - 30 * 60 * 1000);
  const usage = await InventoryTransaction.aggregate([
    {
      $match: {
        type: "SALE_CONSUMPTION",
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: "$ingredientId",
        used: { $sum: { $abs: "$quantity" } },
      },
    },
  ]);
  const usageMap = Object.fromEntries(usage.map((x) => [String(x._id), x.used]));
  const ingredients = await Ingredient.find().lean();
  res.json(
    ingredients
      .map((i) => ({
        ...i,
        calculatedThreshold: ((usageMap[String(i._id)] || 0) / 3) * 2,
      }))
      .filter(
        (i) => i.currentStock <= i.calculatedThreshold || i.currentStock <= 0
      )
  );
};
