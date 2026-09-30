import Food from "../models/Food.js";
import Ingredient from "../models/Ingredient.js";
import Bill from "../models/Bill.js";
import FinancialTransaction from "../models/FinancialTransaction.js";
import RestaurantAccount from "../models/RestaurantAccount.js";
import InventoryTransaction from "../models/InventoryTransaction.js";

/**
 * POST /api/bills
 * Creates a new bill (draft). Validates stock before committing.
 */
export const createBill = async (req, res) => {
  const items = [];
  for (const line of req.body.items) {
    const food = await Food.findById(line.foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });
    let cost = 0;
    for (const part of food.ingredients) {
      const i = await Ingredient.findById(part.ingredientId);
      if (!i || i.currentStock < part.quantityRequired * line.quantity)
        return res.status(409).json({
          message: `Insufficient stock for ${i?.name || "ingredient"}`,
        });
      cost += i.costPrice * part.quantityRequired * line.quantity;
    }
    items.push({
      foodId: food._id,
      foodName: food.name,
      quantity: line.quantity,
      sellingPriceAtPurchase: food.sellingPrice,
      ingredientCostAtPurchase: cost,
      profitAtPurchase: food.sellingPrice * line.quantity - cost,
    });
  }
  const totalAmount = items.reduce(
    (s, x) => s + x.sellingPriceAtPurchase * x.quantity,
    0
  );
  const totalCost = items.reduce((s, x) => s + x.ingredientCostAtPurchase, 0);
  const bill = await Bill.create({
    billNumber: `B-${Date.now()}`,
    customerId: req.user.role === "CUSTOMER" ? req.user.id : null,
    createdBy: req.user.id,
    items,
    totalAmount,
    totalCost,
    totalProfit: totalAmount - totalCost,
    paymentMethod: req.body.paymentMethod || "CASH",
    paymentStatus: req.body.paymentMethod === "CASH" ? "PAID" : "PENDING",
  });
  res.status(201).json(bill);
};

/**
 * POST /api/bills/:id/pay
 * Marks a bill as paid. Deducts ingredient stock, records financial and
 * inventory transactions, and updates the restaurant account balance.
 */
export const payBill = async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.sendStatus(404);
  if (bill.paymentStatus === "PAID") return res.json(bill);
  for (const line of bill.items) {
    const food = await Food.findById(line.foodId).lean();
    if (!food)
      return res
        .status(409)
        .json({ message: `Recipe not found for ${line.foodName}` });
    for (const part of food.ingredients) {
      const quantityUsed = part.quantityRequired * line.quantity;
      const updatedIngredient = await Ingredient.findOneAndUpdate(
        { _id: part.ingredientId, currentStock: { $gte: quantityUsed } },
        { $inc: { currentStock: -quantityUsed } },
        { new: true }
      );
      if (!updatedIngredient)
        return res
          .status(409)
          .json({ message: `Insufficient stock for ${line.foodName}` });
      await InventoryTransaction.create({
        ingredientId: updatedIngredient._id,
        type: "SALE_CONSUMPTION",
        quantity: -quantityUsed,
        referenceId: bill._id,
      });
    }
  }
  bill.paymentStatus = "PAID";
  await bill.save();
  await FinancialTransaction.create({
    type: "SALE",
    amount: bill.totalAmount,
    referenceId: bill._id,
    note: "Paid order",
  });
  await RestaurantAccount.findOneAndUpdate(
    { key: "MAIN" },
    { $inc: { balance: bill.totalAmount, totalSales: bill.totalAmount } },
    { upsert: true, new: true }
  );
  res.json(bill);
};
