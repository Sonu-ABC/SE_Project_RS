import mongoose from "mongoose";

const ingredientOrderSchema = new mongoose.Schema({
  ingredientId: mongoose.Schema.Types.ObjectId,
  ingredientName: String,
  quantity: Number,
  amount: Number,
  status: { type: String, default: "PLACED" },
  orderedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const IngredientOrder = mongoose.model("IngredientOrder", ingredientOrderSchema);
export default IngredientOrder;
