import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  Ingredient,
  Food,
  User,
  Bill,
  IngredientOrder,
  FinancialTransaction,
  RestaurantAccount,
  InventoryTransaction,
} from "./models/index.js";
import { seedCatalog } from "./seed/catalog.js";
import { auth } from "./middleware/auth.js";
import { connectDatabase } from "./config/db.js";
dotenv.config();
dotenv.config({ path: "backend/.env" });

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "CUSTOMER" } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(password, 10),
      role,
    });
    res.status(201).json({ id: user._id, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Unable to create account" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
    return res.status(401).json({ message: "Invalid credentials" });
  res.json({
    token: jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
    ),
    user: { id: user._id, name: user.name, role: user.role },
  });
});
app.get("/api/foods", async (req, res) =>
  res.json(await Food.find({ isAvailable: true }).lean()),
);
app.get(
  "/api/account/balance",
  auth(["MANAGER", "SALES_CLERK"]),
  async (req, res) => {
    const totals = await FinancialTransaction.aggregate([
      { $match: { type: { $in: ["SALE", "INGREDIENT_EXPENSE"] } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const sales = totals.find((entry) => entry._id === "SALE")?.total || 0;
    const expenses =
      totals.find((entry) => entry._id === "INGREDIENT_EXPENSE")?.total || 0;
    res.json({
      balance: sales - expenses,
      totalSales: sales,
      totalExpenses: expenses,
    });
  },
);
app.get("/api/foods/:id/availability", async (req, res) => {
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
});
app.post("/api/foods", auth(["MANAGER"]), async (req, res) =>
  res.status(201).json(await Food.create(req.body)),
);
app.patch("/api/foods/:id", auth(["MANAGER"]), async (req, res) =>
  res.json(
    await Food.findByIdAndUpdate(req.params.id, req.body, { new: true }),
  ),
);
app.get(
  "/api/ingredients",
  auth(["MANAGER", "SALES_CLERK"]),
  async (req, res) => res.json(await Ingredient.find().lean()),
);
app.post("/api/ingredients", auth(["MANAGER"]), async (req, res) =>
  res.status(201).json(await Ingredient.create(req.body)),
);
app.get(
  "/api/inventory/warnings",
  auth(["MANAGER", "SALES_CLERK"]),
  async (req, res) => {
    const since = new Date(Date.now() - 30 * 60 * 1000);
    const usage = await InventoryTransaction.aggregate([
      { $match: { type: "SALE_CONSUMPTION", createdAt: { $gte: since } } },
      {
        $group: { _id: "$ingredientId", used: { $sum: { $abs: "$quantity" } } },
      },
    ]);
    const usageMap = Object.fromEntries(
      usage.map((x) => [String(x._id), x.used]),
    );
    const ingredients = await Ingredient.find().lean();
    res.json(
      ingredients
        .map((i) => ({
          ...i,
          calculatedThreshold: ((usageMap[String(i._id)] || 0) / 3) * 2,
        }))
        .filter(
          (i) => i.currentStock <= i.calculatedThreshold || i.currentStock <= 0,
        ),
    );
  },
);
app.get(
  "/api/restaurant/orders",
  auth(["MANAGER", "SALES_CLERK"]),
  async (req, res) =>
    res.json(await IngredientOrder.find().sort({ createdAt: -1 }).lean()),
);
app.post(
  "/api/restaurant/orders",
  auth(["SALES_CLERK", "MANAGER"]),
  async (req, res) => {
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
  },
);
app.post(
  "/api/restaurant/orders/:id/pay",
  auth(["SALES_CLERK", "MANAGER"]),
  async (req, res) => {
    const order = await IngredientOrder.findById(req.params.id);
    if (!order) return res.sendStatus(404);
    if (order.status === "PAID") return res.json(order);
    const account = await RestaurantAccount.findOne({ key: "MAIN" });
    if (!account || account.balance < order.amount)
      return res
        .status(409)
        .json({
          message: "Restaurant balance is insufficient for this payment",
        });
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
  },
);
app.post(
  "/api/restaurant/orders/:id/arrive",
  auth(["SALES_CLERK", "MANAGER"]),
  async (req, res) => {
    const o = await IngredientOrder.findById(req.params.id);
    const i = await Ingredient.findById(o.ingredientId);
    i.currentStock += o.quantity;
    await i.save();
    o.status = "ARRIVED";
    await o.save();
    res.json(o);
  },
);
app.post("/api/bills", auth(["CUSTOMER", "SALES_CLERK"]), async (req, res) => {
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
      0,
    ),
    totalCost = items.reduce((s, x) => s + x.ingredientCostAtPurchase, 0);
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
});
app.post(
  "/api/bills/:id/pay",
  auth(["CUSTOMER", "SALES_CLERK"]),
  async (req, res) => {
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
          { new: true },
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
      { upsert: true, new: true },
    );
    res.json(bill);
  },
);
app.get("/api/reports", auth(["MANAGER"]), async (req, res) => {
  const [sales] = await FinancialTransaction.aggregate([
    { $match: { type: "SALE" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const bills = await Bill.find({ paymentStatus: "PAID" });
  const account = await RestaurantAccount.findOne({ key: "MAIN" }).lean();
  res.json({
    totalRestaurantAmount: account?.balance || sales?.total || 0,
    totalSales: sales?.total || 0,
    totalProfit: bills.reduce((s, b) => s + b.totalProfit, 0),
    totalExpenses: 0,
    monthlySales: [],
  });
});
const port = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_manager";

connectDatabase(mongoUri)
  .then(() => {
    return seedCatalog();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
