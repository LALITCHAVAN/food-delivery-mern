const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// ===============================
// DATABASE
// ===============================

connectDB();

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Food Delivery Backend is Running 🚀",
  });
});

// ===============================
// AUTH
// ===============================

app.use(
  "/api/auth",
  require("./routes/auth")
);

// ===============================
// CATEGORY
// ===============================

app.use(
  "/api/categories",
  require("./routes/category")
);

// ===============================
// RESTAURANT
// ===============================

app.use(
  "/api/restaurants",
  require("./routes/restaurant")
);

// ===============================
// FOOD
// ===============================

app.use(
  "/api/foods",
  require("./routes/food")
);

// ===============================
// REVIEW
// ===============================

app.use(
  "/api/reviews",
  require("./routes/review")
);

// ===============================
// CART
// ===============================

app.use(
  "/api/cart",
  require("./routes/cart")
);

// ===============================
// ORDER
// ===============================

app.use(
  "/api/orders",
  require("./routes/order")
);

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});