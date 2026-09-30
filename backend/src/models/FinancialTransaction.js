import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  referenceId: mongoose.Schema.Types.ObjectId,
  note: String,
  createdAt: { type: Date, default: Date.now },
});

const FinancialTransaction = mongoose.model("FinancialTransaction", transactionSchema);
export default FinancialTransaction;
