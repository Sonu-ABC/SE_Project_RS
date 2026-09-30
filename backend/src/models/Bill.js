import mongoose from "mongoose";

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

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
