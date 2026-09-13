const express = require("express");
const mongoose = require("mongoose");

const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");

const router = express.Router();

// GET all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({
      createdAt: -1,
    });

    res.json({
      restaurants: restaurants.map((restaurant) => ({
        id: restaurant._id.toString(),
        name: restaurant.name,
        address: restaurant.address,
        image: restaurant.image,
        rating: restaurant.rating,
        delivery_time: restaurant.deliveryTime,
        created_at: restaurant.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get Restaurants Error:", error);

    res.status(500).json({
      message: "Failed to fetch restaurants.",
    });
  }
});

// GET single restaurant + foods
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid restaurant ID.",
      });
    }

    const restaurant = await Restaurant.findById(
      req.params.id
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found.",
      });
    }

    const foods = await Food.find({
      restaurant: restaurant._id,
      isAvailable: true,
    })
      .populate("category")
      .populate("restaurant");

    res.json({
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        address: restaurant.address,
        image: restaurant.image,
        rating: restaurant.rating,
        delivery_time: restaurant.deliveryTime,
        created_at: restaurant.createdAt,
      },

      foods: foods.map((food) => ({
        id: food._id.toString(),
        title: food.name,
        name: food.name,
        description: food.description,
        image: food.image,
        price: food.price,
        category_id: food.category?._id?.toString() || null,
        restaurant_id:
          food.restaurant?._id?.toString() || null,
        rating: 0,
        available: food.isAvailable,
        created_at: food.createdAt,

        categories: food.category
          ? {
              id: food.category._id.toString(),
              name: food.category.name,
              image: food.category.image,
              created_at: food.category.createdAt,
            }
          : null,

        restaurants: food.restaurant
          ? {
              id: food.restaurant._id.toString(),
              name: food.restaurant.name,
              address: food.restaurant.address,
              image: food.restaurant.image,
              rating: food.restaurant.rating,
              delivery_time:
                food.restaurant.deliveryTime,
              created_at: food.restaurant.createdAt,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Get Restaurant Details Error:", error);

    res.status(500).json({
      message: "Failed to fetch restaurant.",
    });
  }
});

// CREATE restaurant
router.post("/", async (req, res) => {
  try {
    const {
      name,
      address,
      image,
      rating,
      deliveryTime,
      delivery_time,
    } = req.body;

    if (!name || !address || !image) {
      return res.status(400).json({
        message: "Name, address and image are required.",
      });
    }

    const restaurant = await Restaurant.create({
      name,
      address,
      image,
      rating: Number(rating) || 0,
      deliveryTime:
        deliveryTime ||
        delivery_time ||
        "30-40 min",
    });

    res.status(201).json({
      message: "Restaurant created successfully.",
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        address: restaurant.address,
        image: restaurant.image,
        rating: restaurant.rating,
        delivery_time: restaurant.deliveryTime,
        created_at: restaurant.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Restaurant Error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to create restaurant.",
    });
  }
});

// UPDATE restaurant
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      address,
      image,
      rating,
      deliveryTime,
      delivery_time,
    } = req.body;

    const restaurant =
      await Restaurant.findByIdAndUpdate(
        req.params.id,
        {
          ...(name !== undefined && { name }),
          ...(address !== undefined && { address }),
          ...(image !== undefined && { image }),
          ...(rating !== undefined && {
            rating: Number(rating),
          }),
          ...(deliveryTime !== undefined && {
            deliveryTime,
          }),
          ...(delivery_time !== undefined && {
            deliveryTime: delivery_time,
          }),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found.",
      });
    }

    res.json({
      message: "Restaurant updated successfully.",
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        address: restaurant.address,
        image: restaurant.image,
        rating: restaurant.rating,
        delivery_time: restaurant.deliveryTime,
        created_at: restaurant.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Restaurant Error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to update restaurant.",
    });
  }
});

// DELETE restaurant
router.delete("/:id", async (req, res) => {
  try {
    const restaurant =
      await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found.",
      });
    }

    // Remove foods belonging to deleted restaurant
    await Food.deleteMany({
      restaurant: restaurant._id,
    });

    res.json({
      message: "Restaurant deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Restaurant Error:", error);

    res.status(500).json({
      message: "Failed to delete restaurant.",
    });
  }
});

module.exports = router;