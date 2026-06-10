import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes"

import productRoutes from "./routes/product.routes";

import reviewRoutes from "./routes/review.routes";

import cartRoutes from "./routes/cart.routes";

import orderRoutes from "./routes/order.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/products", reviewRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

export default app;