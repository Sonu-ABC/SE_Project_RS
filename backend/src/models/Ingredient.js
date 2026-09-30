import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: String,
  costPrice: Number,
  currentStock: Number,
  reorderThreshold: Number,
  unit: String,
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
export default Ingredient;
