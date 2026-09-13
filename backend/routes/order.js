const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// CREATE ORDER
// POST /api/orders
// ======================================================
router.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      total_price,
      delivery_charge,
      gst,
      grand_total,
      payment_method,
      delivery_name,
      delivery_mobile,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode,
    } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required.",
      });
    }

    if (!delivery_name || !delivery_mobile || !delivery_address) {
      return res.status(400).json({
        message: "Delivery details are required.",
      });
    }

    // -----------------------------
    // Validate food IDs
    // -----------------------------
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.food_id)) {
        return res.status(400).json({
          message: `Invalid food ID: ${item.food_id}`,
        });
      }
    }

    // -----------------------------
    // Convert frontend items
    // to MongoDB Order format
    // -----------------------------
    const orderItems = items.map((item) => ({
      food: item.food_id,
      name: item.title || item.name || "Food Item",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || "",
    }));

    // -----------------------------
    // Convert payment method
    // -----------------------------
    let paymentMethod = "COD";

    if (
      payment_method === "Card" ||
      payment_method === "Wallet" ||
      payment_method === "ONLINE"
    ) {
      paymentMethod = "ONLINE";
    }

    // -----------------------------
    // Build complete address
    // -----------------------------
    const fullAddress = [
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode,
    ]
      .filter(Boolean)
      .join(", ");

    // -----------------------------
    // Create order
    // -----------------------------
    const order = await Order.create({
      user: req.user._id,

      items: orderItems,

      totalAmount:
        Number(grand_total) ||
        Number(total_price) +
          Number(delivery_charge || 0) +
          Number(gst || 0),

      address: fullAddress,

      phone: delivery_mobile,

      paymentMethod,

      paymentStatus: "Pending",

      orderStatus: "Pending",
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order: {
        id: order._id.toString(),
        user_id: order.user.toString(),

        items: order.items.map((item) => ({
          food_id: item.food.toString(),
          title: item.name,
          image: item.image || "",
          price: item.price,
          quantity: item.quantity,
        })),

        total_price: Number(total_price) || 0,
        delivery_charge: Number(delivery_charge) || 0,
        gst: Number(gst) || 0,
        grand_total: order.totalAmount,

        payment_method: order.paymentMethod,

        order_status: order.orderStatus,

        delivery_name: delivery_name,
        delivery_mobile: delivery_mobile,
        delivery_address: delivery_address,
        delivery_city: delivery_city,
        delivery_state: delivery_state,
        delivery_pincode: delivery_pincode,

        created_at: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to place order.",
    });
  }
});

// ======================================================
// GET MY ORDERS
// GET /api/orders
// ======================================================
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.food")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      user_id: order.user.toString(),

      items: order.items.map((item) => ({
        food_id: item.food?._id?.toString() || item.food?.toString(),
        title: item.name,
        image: item.image || item.food?.image || "",
        price: item.price,
        quantity: item.quantity,
      })),

      total_price: order.totalAmount,
      delivery_charge: 0,
      gst: 0,
      grand_total: order.totalAmount,

      payment_method: order.paymentMethod,
      order_status: order.orderStatus,

      delivery_name: "",
      delivery_mobile: order.phone,
      delivery_address: order.address,
      delivery_city: "",
      delivery_state: "",
      delivery_pincode: "",

      created_at: order.createdAt,
    }));

    return res.json({
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
});

// ======================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ======================================================
router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.food");

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.json({
      order: {
        id: order._id.toString(),
        user_id: order.user.toString(),

        items: order.items.map((item) => ({
          food_id: item.food?._id?.toString() || item.food?.toString(),
          title: item.name,
          image: item.image || item.food?.image || "",
          price: item.price,
          quantity: item.quantity,
        })),

        total_price: order.totalAmount,
        delivery_charge: 0,
        gst: 0,
        grand_total: order.totalAmount,

        payment_method: order.paymentMethod,
        order_status: order.orderStatus,

        delivery_mobile: order.phone,
        delivery_address: order.address,

        created_at: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Single Order Error:", error);

    return res.status(500).json({
      message: "Failed to fetch order.",
    });
  }
});

// ======================================================
// ADMIN — GET ALL ORDERS
// GET /api/orders/admin/all
// ======================================================
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.food")
      .sort({ createdAt: -1 });

    return res.json({
      orders,
    });
  } catch (error) {
    console.error("Admin Orders Error:", error);

    return res.status(500).json({
      message: "Failed to fetch all orders.",
    });
  }
});

// ======================================================
// ADMIN — UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// ======================================================
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      message: "Failed to update order status.",
    });
  }
});

module.exports = router;