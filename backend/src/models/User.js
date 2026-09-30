import mongoose from "mongoose";

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

const User = mongoose.model("User", userSchema);
export default User;
