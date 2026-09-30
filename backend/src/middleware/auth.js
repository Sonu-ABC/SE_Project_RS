import jwt from "jsonwebtoken";

export const auth =
  (roles = []) =>
  async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Login required" });
      req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      if (roles.length && !roles.includes(req.user.role))
        return res.status(403).json({ message: "Insufficient permission" });
      next();
    } catch {
      res.status(401).json({ message: "Invalid session" });
    }
  };
