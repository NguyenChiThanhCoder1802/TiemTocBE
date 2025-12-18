import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/mongodb.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import {env } from "./config/environment.js";

const app = express();
const PORT = env.PORT;

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Connect DB =====
connectDB();

// ===== Routes =====
app.use("/api/auth", authRoutes);

// ===== Test route (optional) =====
app.get("/", (req, res) => {
  res.send("API Quản Lý Tiệm Tóc đang chạy");
});

// ===== Error handler (luôn cuối) =====
app.use(errorHandler);

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
