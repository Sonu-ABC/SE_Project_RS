import mongoose from "mongoose";

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

const Food = mongoose.model("Food", foodSchema);
export default Food;
