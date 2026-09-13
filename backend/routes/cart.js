const express = require("express");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// GET CART
// GET /api/cart
// ======================================================

router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.food",
      populate: [
        {
          path: "category",
          select: "name image",
        },
        {
          path: "restaurant",
          select: "name address image rating deliveryTime",
        },
      ],
    });

    if (!cart) {
      return res.json({
        items: [],
      });
    }

    const items = cart.items.map((item) => ({
      id: item.food?._id,
      cart_item_id: `${cart._id}_${item.food?._id}`,
      user_id: req.user._id,
      food_id: item.food?._id,
      quantity: item.quantity,
      created_at: cart.createdAt,

      foods: item.food
        ? {
            id: item.food._id,
            title: item.food.name,
            name: item.food.name,
            description: item.food.description,
            image: item.food.image,
            price: item.food.price,
            category_id: item.food.category?._id || null,
            restaurant_id: item.food.restaurant?._id || null,
            available: item.food.isAvailable,
            created_at: item.food.createdAt,

            categories: item.food.category
              ? {
                  id: item.food.category._id,
                  name: item.food.category.name,
                  image: item.food.category.image,
                  created_at: item.food.category.createdAt,
                }
              : null,

            restaurants: item.food.restaurant
              ? {
                  id: item.food.restaurant._id,
                  name: item.food.restaurant.name,
                  address: item.food.restaurant.address,
                  image: item.food.restaurant.image,
                  rating: item.food.restaurant.rating,
                  delivery_time: item.food.restaurant.deliveryTime,
                  created_at: item.food.restaurant.createdAt,
                }
              : null,
          }
        : null,
    }));

    res.json({ items });
  } catch (error) {
    console.error("Get Cart Error:", error);

    res.status(500).json({
      message: "Failed to load cart.",
      error: error.message,
    });
  }
});

// ======================================================
// ADD TO CART
// POST /api/cart
// ======================================================

router.post("/", protect, async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      return res.status(400).json({
        message: "Food ID is required.",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    if (!food.isAvailable) {
      return res.status(400).json({
        message: "This food is currently unavailable.",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            food: foodId,
            quantity,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.food.toString() === foodId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          food: foodId,
          quantity,
        });
      }

      await cart.save();
    }

    res.status(201).json({
      message: "Item added to cart.",
    });
  } catch (error) {
    console.error("Add Cart Error:", error);

    res.status(500).json({
      message: "Failed to add item to cart.",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE CART ITEM
// PUT /api/cart/:foodId
// ======================================================

router.put("/:foodId", protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { foodId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const item = cart.items.find(
      (item) => item.food.toString() === foodId
    );

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.json({
      message: "Cart updated successfully.",
    });
  } catch (error) {
    console.error("Update Cart Error:", error);

    res.status(500).json({
      message: "Failed to update cart.",
      error: error.message,
    });
  }
});

// ======================================================
// REMOVE CART ITEM
// DELETE /api/cart/:foodId
// ======================================================

router.delete("/:foodId", protect, async (req, res) => {
  try {
    const { foodId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.food.toString() !== foodId
    );

    await cart.save();

    res.json({
      message: "Item removed from cart.",
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);

    res.status(500).json({
      message: "Failed to remove cart item.",
      error: error.message,
    });
  }
});

// ======================================================
// CLEAR CART
// DELETE /api/cart
// ======================================================

router.delete("/", protect, async (req, res) => {
  try {
    await Cart.findOneAndDelete({
      user: req.user._id,
    });

    res.json({
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    res.status(500).json({
      message: "Failed to clear cart.",
      error: error.message,
    });
  }
});

module.exports = router;