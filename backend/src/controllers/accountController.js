import FinancialTransaction from "../models/FinancialTransaction.js";
import RestaurantAccount from "../models/RestaurantAccount.js";
import Bill from "../models/Bill.js";

/**
 * GET /api/account/balance
 * Returns the restaurant's current balance, total sales, and total expenses.
 * Manager and Sales Clerk only.
 */
export const getBalance = async (req, res) => {
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
};

/**
 * GET /api/reports
 * Returns summary financial report. Manager only.
 */
export const getReports = async (req, res) => {
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
};
