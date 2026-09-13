const express = require("express");

const Review = require("../models/Review");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Get reviews for food
router.get("/food/:foodId", async (req, res) => {
  try {
    const reviews = await Review.find({
      food: req.params.foodId,
    })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.json({
      reviews: reviews.map((review) => ({
        id: review._id.toString(),
        user_id: review.user?._id?.toString() || "",
        food_id: review.food.toString(),
        user_name:
          review.userName ||
          review.user?.name ||
          "User",
        rating: review.rating,
        comment: review.comment,
        created_at: review.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);

    res.status(500).json({
      message: "Failed to fetch reviews.",
    });
  }
});

// Create review
router.post("/", protect, async (req, res) => {
  try {
    const {
      food_id,
      rating,
      comment,
    } = req.body;

    if (!food_id || !rating || !comment) {
      return res.status(400).json({
        message: "Food, rating and comment are required.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      food: food_id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      message: "Review added successfully.",
      review: {
        id: review._id.toString(),
        user_id: review.user.toString(),
        food_id: review.food.toString(),
        user_name: review.userName,
        rating: review.rating,
        comment: review.comment,
        created_at: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    res.status(500).json({
      message: error.message || "Failed to create review.",
    });
  }
});

module.exports = router;