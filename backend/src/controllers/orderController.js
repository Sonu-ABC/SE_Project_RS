import Ingredient from "../models/Ingredient.js";
import IngredientOrder from "../models/IngredientOrder.js";
import FinancialTransaction from "../models/FinancialTransaction.js";
import RestaurantAccount from "../models/RestaurantAccount.js";
import InventoryTransaction from "../models/InventoryTransaction.js";

/**
 * GET /api/restaurant/orders
 * Returns all ingredient purchase orders, newest first.
 */
export const getOrders = async (req, res) => {
  res.json(await IngredientOrder.find().sort({ createdAt: -1 }).lean());
};

/**
 * POST /api/restaurant/orders
 * Places a new ingredient purchase order. Quantity is auto-calculated from
 * the dynamic reorder threshold vs. current stock.
 */
export const placeOrder = async (req, res) => {
  const i = await Ingredient.findById(req.body.ingredientId);
  if (!i) return res.status(404).json({ message: "Ingredient not found" });
  const since = new Date(Date.now() - 30 * 60 * 1000);
  const usage = await InventoryTransaction.aggregate([
    {
      $match: {
        ingredientId: i._id,
        type: "SALE_CONSUMPTION",
        createdAt: { $gte: since },
      },
    },
    { $group: { _id: null, used: { $sum: { $abs: "$quantity" } } } },
  ]);
  const threshold = ((usage[0]?.used || 0) / 3) * 2;
  const quantity = Math.max(Math.ceil(threshold - i.currentStock), 1);
  const order = await IngredientOrder.create({
    ingredientId: i._id,
    ingredientName: i.name,
    quantity,
    amount: quantity * i.costPrice,
    orderedBy: req.user.id,
  });
  res.status(201).json(order);
};

/**
 * POST /api/restaurant/orders/:id/pay
 * Pays a supplier order. Deducts the cost from the restaurant balance,
 * increases ingredient stock, and records financial + inventory transactions.
 */
export const payOrder = async (req, res) => {
  const order = await IngredientOrder.findById(req.params.id);
  if (!order) return res.sendStatus(404);
  if (order.status === "PAID") return res.json(order);
  const account = await RestaurantAccount.findOne({ key: "MAIN" });
  if (!account || account.balance < order.amount)
    return res
      .status(409)
      .json({ message: "Restaurant balance is insufficient for this payment" });
  const ingredient = await Ingredient.findById(order.ingredientId);
  ingredient.currentStock += order.quantity;
  await ingredient.save();
  order.status = "PAID";
  await order.save();
  account.balance -= order.amount;
  await account.save();
  await FinancialTransaction.create({
    type: "INGREDIENT_EXPENSE",
    amount: order.amount,
    referenceId: order._id,
    note: `Purchased ${order.ingredientName}`,
  });
  await InventoryTransaction.create({
    ingredientId: ingredient._id,
    type: "INGREDIENT_PURCHASE",
    quantity: order.quantity,
    amount: order.amount,
    referenceId: order._id,
  });
  res.json(order);
};

/**
 * POST /api/restaurant/orders/:id/arrive
 * Marks an order as arrived and increases ingredient stock.
 */
export const markOrderArrived = async (req, res) => {
  const o = await IngredientOrder.findById(req.params.id);
  const i = await Ingredient.findById(o.ingredientId);
  i.currentStock += o.quantity;
  await i.save();
  o.status = "ARRIVED";
  await o.save();
  res.json(o);
};
