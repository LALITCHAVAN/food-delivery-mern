const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json({
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        created_at: category.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    res.status(500).json({
      message: "Failed to fetch categories.",
    });
  }
});

// GET single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    res.json({
      category: {
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        created_at: category.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Category Error:", error);

    res.status(500).json({
      message: "Failed to fetch category.",
    });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        message: "Name and image are required.",
      });
    }

    const category = await Category.create({
      name,
      image,
    });

    res.status(201).json({
      message: "Category created successfully.",
      category: {
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        created_at: category.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    res.status(500).json({
      message: error.message || "Failed to create category.",
    });
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const { name, image } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    res.json({
      message: "Category updated successfully.",
      category: {
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        created_at: category.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    res.status(500).json({
      message: error.message || "Failed to update category.",
    });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    res.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    res.status(500).json({
      message: "Failed to delete category.",
    });
  }
});

module.exports = router;