import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
});

const RestaurantAccount = mongoose.model("RestaurantAccount", accountSchema);
export default RestaurantAccount;
