const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");
const Restaurant = require("./models/Restaurant");
const Food = require("./models/Food");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

const categoriesData = [
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Indian",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Biryani",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chinese",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
  },
];

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Atlas Connected");

    // --------------------------------------------------
    // CLEAR OLD SAMPLE DATA
    // --------------------------------------------------

    console.log("🗑️ Removing existing categories, restaurants and foods...");

    await Food.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});

    console.log("✅ Old food data removed");

    // --------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------

    console.log("📂 Creating categories...");

    const categories = await Category.insertMany(categoriesData);

    const categoryMap = {};

    categories.forEach((category) => {
      categoryMap[category.name] = category._id;
    });

    console.log(`✅ ${categories.length} categories created`);

    // --------------------------------------------------
    // RESTAURANTS
    // --------------------------------------------------

    const restaurantsData = [
      {
        name: "Pizza Palace",
        address: "FC Road, Pune",
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
        rating: 4.7,
        deliveryTime: "25-35 min",
      },
      {
        name: "Burger House",
        address: "Baner Road, Pune",
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80",
        rating: 4.6,
        deliveryTime: "20-30 min",
      },
      {
        name: "Spice Kitchen",
        address: "Kothrud, Pune",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
        rating: 4.5,
        deliveryTime: "30-40 min",
      },
      {
        name: "Royal Biryani",
        address: "Viman Nagar, Pune",
        image:
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80",
        rating: 4.8,
        deliveryTime: "25-35 min",
      },
      {
        name: "Dragon Wok",
        address: "Hinjewadi, Pune",
        image:
          "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80",
        rating: 4.4,
        deliveryTime: "30-40 min",
      },
      {
        name: "Sweet Treats",
        address: "Aundh, Pune",
        image:
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1000&q=80",
        rating: 4.6,
        deliveryTime: "20-30 min",
      },
    ];

    const restaurants = await Restaurant.insertMany(
      restaurantsData
    );

    console.log(`✅ ${restaurants.length} restaurants created`);

    // --------------------------------------------------
    // FOODS
    // --------------------------------------------------

    const foodsData = [
      // =========================
      // PIZZA PALACE
      // =========================

      {
        name: "Margherita Pizza",
        description:
          "Classic pizza topped with tomato sauce, mozzarella and fresh basil.",
        price: 249,
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Pizza"],
        restaurant: restaurants[0]._id,
        isAvailable: true,
      },
      {
        name: "Farmhouse Pizza",
        description:
          "Loaded pizza with fresh vegetables, capsicum, onion and mushrooms.",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Pizza"],
        restaurant: restaurants[0]._id,
        isAvailable: true,
      },
      {
        name: "Paneer Tikka Pizza",
        description:
          "Indian-style pizza topped with spicy paneer tikka and vegetables.",
        price: 379,
        image:
          "https://images.unsplash.com/photo-1593560708920-61dd98c8a03c?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Pizza"],
        restaurant: restaurants[0]._id,
        isAvailable: true,
      },

      // =========================
      // BURGER HOUSE
      // =========================

      {
        name: "Classic Cheese Burger",
        description:
          "Juicy vegetable patty with cheese, lettuce, tomato and special sauce.",
        price: 179,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Burger"],
        restaurant: restaurants[1]._id,
        isAvailable: true,
      },
      {
        name: "Crispy Chicken Burger",
        description:
          "Crispy chicken patty with lettuce, cheese and creamy sauce.",
        price: 229,
        image:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Burger"],
        restaurant: restaurants[1]._id,
        isAvailable: true,
      },
      {
        name: "Double Cheese Burger",
        description:
          "Double patty burger loaded with melted cheese and signature sauce.",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Burger"],
        restaurant: restaurants[1]._id,
        isAvailable: true,
      },

      // =========================
      // SPICE KITCHEN
      // =========================

      {
        name: "Paneer Butter Masala",
        description:
          "Soft paneer cooked in a rich, creamy tomato and butter gravy.",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Indian"],
        restaurant: restaurants[2]._id,
        isAvailable: true,
      },
      {
        name: "Dal Tadka",
        description:
          "Yellow lentils tempered with garlic, cumin, spices and ghee.",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Indian"],
        restaurant: restaurants[2]._id,
        isAvailable: true,
      },
      {
        name: "Butter Naan",
        description:
          "Soft Indian flatbread brushed with butter.",
        price: 59,
        image:
          "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Indian"],
        restaurant: restaurants[2]._id,
        isAvailable: true,
      },

      // =========================
      // ROYAL BIRYANI
      // =========================

      {
        name: "Chicken Biryani",
        description:
          "Aromatic basmati rice cooked with tender chicken and traditional spices.",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Biryani"],
        restaurant: restaurants[3]._id,
        isAvailable: true,
      },
      {
        name: "Veg Biryani",
        description:
          "Fragrant basmati rice cooked with fresh vegetables and aromatic spices.",
        price: 229,
        image:
          "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Biryani"],
        restaurant: restaurants[3]._id,
        isAvailable: true,
      },
      {
        name: "Mutton Biryani",
        description:
          "Rich and aromatic biryani prepared with tender mutton and fragrant spices.",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Biryani"],
        restaurant: restaurants[3]._id,
        isAvailable: true,
      },

      // =========================
      // DRAGON WOK
      // =========================

      {
        name: "Veg Hakka Noodles",
        description:
          "Stir-fried noodles tossed with fresh vegetables and Chinese sauces.",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Chinese"],
        restaurant: restaurants[4]._id,
        isAvailable: true,
      },
      {
        name: "Veg Manchurian",
        description:
          "Crispy vegetable balls tossed in spicy Indo-Chinese Manchurian sauce.",
        price: 219,
        image:
          "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Chinese"],
        restaurant: restaurants[4]._id,
        isAvailable: true,
      },
      {
        name: "Schezwan Fried Rice",
        description:
          "Spicy fried rice tossed with vegetables and Schezwan sauce.",
        price: 229,
        image:
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Chinese"],
        restaurant: restaurants[4]._id,
        isAvailable: true,
      },

      // =========================
      // SWEET TREATS
      // =========================

      {
        name: "Chocolate Cake",
        description:
          "Rich and moist chocolate cake topped with creamy chocolate frosting.",
        price: 149,
        image:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Desserts"],
        restaurant: restaurants[5]._id,
        isAvailable: true,
      },
      {
        name: "Chocolate Brownie",
        description:
          "Warm, fudgy chocolate brownie with a rich chocolate flavor.",
        price: 129,
        image:
          "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Desserts"],
        restaurant: restaurants[5]._id,
        isAvailable: true,
      },
      {
        name: "Strawberry Cheesecake",
        description:
          "Creamy cheesecake topped with fresh strawberry sauce.",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        category: categoryMap["Desserts"],
        restaurant: restaurants[5]._id,
        isAvailable: true,
      },
    ];

    const foods = await Food.insertMany(foodsData);

    console.log(`✅ ${foods.length} foods created`);

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    console.log("\n=================================");
    console.log("🎉 DATABASE SEEDING COMPLETED");
    console.log("=================================");
    console.log(`Categories  : ${categories.length}`);
    console.log(`Restaurants : ${restaurants.length}`);
    console.log(`Foods       : ${foods.length}`);
    console.log("=================================\n");

    await mongoose.disconnect();

    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ SEEDING FAILED");
    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

seedDatabase();