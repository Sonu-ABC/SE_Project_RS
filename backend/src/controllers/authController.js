import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * POST /api/auth/register
 * Creates a new user account.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "CUSTOMER" } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(password, 10),
      role,
    });
    res.status(201).json({ id: user._id, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Unable to create account" });
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT token + user info.
 */
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
    return res.status(401).json({ message: "Invalid credentials" });
  res.json({
    token: jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret"
    ),
    user: { id: user._id, name: user.name, role: user.role },
  });
};
