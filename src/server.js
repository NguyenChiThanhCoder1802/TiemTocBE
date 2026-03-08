import express from "express";
import cors from "cors";
import { connectDB } from "./config/mongodb.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import {env } from "./config/environment.js";
import { APIS } from "./routes/index.routes.js";

const app = express();
const PORT = env.PORT;
const HOST = env.HOST;
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

connectDB();
app.use("/api", APIS);

app.get("/", (req, res) => {
  res.send("Welcome to the HariSalon API server");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
