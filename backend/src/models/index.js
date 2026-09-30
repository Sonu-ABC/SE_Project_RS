import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: String,
  costPrice: Number,
  currentStock: Number,
  reorderThreshold: Number,
  unit: String,
});
const foodSchema = new mongoose.Schema({
  name: String,
  sellingPrice: Number,
  totalIngredientCost: Number,
  profit: Number,
  ingredients: [
    { ingredientId: mongoose.Schema.Types.ObjectId, quantityRequired: Number },
  ],
  isAvailable: { type: Boolean, default: true },
});
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: {
    type: String,
    enum: ["MANAGER", "SALES_CLERK", "CUSTOMER"],
    default: "CUSTOMER",
  },
});
const billSchema = new mongoose.Schema({
  billNumber: String,
  customerId: mongoose.Schema.Types.ObjectId,
  createdBy: mongoose.Schema.Types.ObjectId,
  items: [
    {
      foodId: mongoose.Schema.Types.ObjectId,
      foodName: String,
      quantity: Number,
      sellingPriceAtPurchase: Number,
      ingredientCostAtPurchase: Number,
      profitAtPurchase: Number,
    },
  ],
  totalAmount: Number,
  totalCost: Number,
  totalProfit: Number,
  paymentMethod: String,
  paymentStatus: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});
const orderSchema = new mongoose.Schema({
  ingredientId: mongoose.Schema.Types.ObjectId,
  ingredientName: String,
  quantity: Number,
  amount: Number,
  status: { type: String, default: "PLACED" },
  orderedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});
const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  referenceId: mongoose.Schema.Types.ObjectId,
  note: String,
  createdAt: { type: Date, default: Date.now },
});
const accountSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
});
const inventoryTransactionSchema = new mongoose.Schema({
  ingredientId: mongoose.Schema.Types.ObjectId,
  type: String,
  quantity: Number,
  amount: Number,
  referenceId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

export const Ingredient = mongoose.model("Ingredient", ingredientSchema);
export const Food = mongoose.model("Food", foodSchema);
export const User = mongoose.model("User", userSchema);
export const Bill = mongoose.model("Bill", billSchema);
export const IngredientOrder = mongoose.model("IngredientOrder", orderSchema);
export const FinancialTransaction = mongoose.model(
  "FinancialTransaction",
  transactionSchema,
);
export const RestaurantAccount = mongoose.model(
  "RestaurantAccount",
  accountSchema,
);
export const InventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);
