import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "backend/.env" });

import { connectDB } from "./config/db.js";
import { seedCatalog } from "./utils/seed.js";
import app from "./app.js";

const port = process.env.PORT || 5000;

connectDB()
  .then(() => seedCatalog())
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
