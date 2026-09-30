import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema({
  ingredientId: mongoose.Schema.Types.ObjectId,
  type: String,
  quantity: Number,
  amount: Number,
  referenceId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const InventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);
export default InventoryTransaction;
