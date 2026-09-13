const express = require("express");
const mongoose = require("mongoose");

const Food = require("../models/Food");

const router = express.Router();

function formatFood(food) {
  return {
    id: food._id.toString(),

    title: food.name,
    name: food.name,

    description: food.description,

    image: food.image,

    price: food.price,

    category_id:
      food.category?._id?.toString() ||
      food.category?.toString() ||
      null,

    restaurant_id:
      food.restaurant?._id?.toString() ||
      food.restaurant?.toString() ||
      null,

    rating: 0,

    available: food.isAvailable,

    created_at: food.createdAt,

    categories: food.category?._id
      ? {
          id: food.category._id.toString(),
          name: food.category.name,
          image: food.category.image,
          created_at: food.category.createdAt,
        }
      : null,

    restaurants: food.restaurant?._id
      ? {
          id: food.restaurant._id.toString(),
          name: food.restaurant.name,
          address: food.restaurant.address,
          image: food.restaurant.image,
          rating: food.restaurant.rating,
          delivery_time: food.restaurant.deliveryTime,
          created_at: food.restaurant.createdAt,
        }
      : null,
  };
}

// GET all foods
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find({
      isAvailable: true,
    })
      .populate("category")
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.json({
      foods: foods.map(formatFood),
    });
  } catch (error) {
    console.error("Get Foods Error:", error);

    res.status(500).json({
      message: "Failed to fetch foods.",
    });
  }
});

// GET foods by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.categoryId
      )
    ) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const foods = await Food.find({
      category: req.params.categoryId,
      isAvailable: true,
    })
      .populate("category")
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.json({
      foods: foods.map(formatFood),
    });
  } catch (error) {
    console.error("Get Category Foods Error:", error);

    res.status(500).json({
      message: "Failed to fetch category foods.",
    });
  }
});

// GET foods by restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.restaurantId
      )
    ) {
      return res.status(400).json({
        message: "Invalid restaurant ID.",
      });
    }

    const foods = await Food.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    })
      .populate("category")
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.json({
      foods: foods.map(formatFood),
    });
  } catch (error) {
    console.error("Get Restaurant Foods Error:", error);

    res.status(500).json({
      message: "Failed to fetch restaurant foods.",
    });
  }
});

// GET single food
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid food ID.",
      });
    }

    const food = await Food.findOne({
      _id: req.params.id,
    })
      .populate("category")
      .populate("restaurant");

    if (!food) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    res.json({
      food: formatFood(food),
    });
  } catch (error) {
    console.error("Get Food Error:", error);

    res.status(500).json({
      message: "Failed to fetch food.",
    });
  }
});

// CREATE food
router.post("/", async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      price,
      image,
      category,
      category_id,
      restaurant,
      restaurant_id,
      isAvailable,
      available,
    } = req.body;

    const food = await Food.create({
      name: name || title,
      description,
      price: Number(price),
      image,
      category: category || category_id,
      restaurant: restaurant || restaurant_id,
      isAvailable:
        isAvailable !== undefined
          ? isAvailable
          : available !== undefined
          ? available
          : true,
    });

    const populatedFood = await Food.findById(food._id)
      .populate("category")
      .populate("restaurant");

    res.status(201).json({
      message: "Food created successfully.",
      food: formatFood(populatedFood),
    });
  } catch (error) {
    console.error("Create Food Error:", error);

    res.status(500).json({
      message: error.message || "Failed to create food.",
    });
  }
});

// UPDATE food
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      price,
      image,
      category,
      category_id,
      restaurant,
      restaurant_id,
      isAvailable,
      available,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    } else if (title !== undefined) {
      updateData.name = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    if (category !== undefined) {
      updateData.category = category;
    } else if (category_id !== undefined) {
      updateData.category = category_id;
    }

    if (restaurant !== undefined) {
      updateData.restaurant = restaurant;
    } else if (restaurant_id !== undefined) {
      updateData.restaurant = restaurant_id;
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    } else if (available !== undefined) {
      updateData.isAvailable = available;
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category")
      .populate("restaurant");

    if (!food) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    res.json({
      message: "Food updated successfully.",
      food: formatFood(food),
    });
  } catch (error) {
    console.error("Update Food Error:", error);

    res.status(500).json({
      message: error.message || "Failed to update food.",
    });
  }
});

// DELETE food
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(
      req.params.id
    );

    if (!food) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    res.json({
      message: "Food deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Food Error:", error);

    res.status(500).json({
      message: "Failed to delete food.",
    });
  }
});

module.exports = router;