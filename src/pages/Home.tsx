import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Clock,
  Truck,
  ShieldCheck,
  Smartphone,
  Apple,
  Play,
} from "lucide-react";
import api from "@/lib/api";
import type { Category, Food, Restaurant } from "@/lib/types";
import FoodCard from "@/components/FoodCard";
import RestaurantCard from "@/components/RestaurantCard";
import Spinner from "@/components/Spinner";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularFoods, setPopularFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, foodRes, restRes] = await Promise.all([
          api.get("/categories"),
          api.get("/foods"),
          api.get("/restaurants"),
        ]);

        const categoriesData = catRes.data?.categories || [];

        const foodsData = foodRes.data?.foods || [];

        const restaurantsData = restRes.data?.restaurants || [];

        setCategories(
          [...categoriesData]
            .sort((a: Category, b: Category) =>
              a.name.localeCompare(b.name)
            )
        );

        setPopularFoods(
          [...foodsData]
            .sort(
              (a: Food, b: Food) =>
                (b.rating || 0) - (a.rating || 0)
            )
            .slice(0, 8)
        );

        setRestaurants(
          [...restaurantsData]
            .sort(
              (a: Restaurant, b: Restaurant) =>
                (b.rating || 0) - (a.rating || 0)
            )
            .slice(0, 6)
        );
      } catch (error) {
        console.error("Failed to load home data:", error);

        setCategories([]);
        setPopularFoods([]);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (search.trim()) {
      navigate(
        `/categories?search=${encodeURIComponent(search.trim())}`
      );
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="home">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-badge">
              Free delivery on orders above ₹199
            </span>

            <h1 className="hero-title">
              Delicious food, <br />
              <span className="hero-title-accent">
                delivered fast
              </span>
            </h1>

            <p className="hero-subtitle">
              Order from your favorite restaurants and get fresh
              meals delivered to your door in minutes.
            </p>

            <form
              className="hero-search"
              onSubmit={handleSearch}
            >
              <Search
                size={20}
                className="hero-search-icon"
              />

              <input
                type="text"
                placeholder="Search for pizza, burger, biryani..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                type="submit"
                className="btn btn-primary"
              >
                Search
              </button>
            </form>

            <div className="hero-stats">
              <div>
                <strong>500+</strong>
                <span>Restaurants</span>
              </div>

              <div>
                <strong>10k+</strong>
                <span>Dishes</span>
              </div>

              <div>
                <strong>50k+</strong>
                <span>Happy Customers</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.pexels.com/photos/3756523/pexels-photo-3756523.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Delicious food spread"
            />
          </div>
        </div>
      </section>

      {/* ---------- Features strip ---------- */}
      <section className="features-strip">
        <div className="container features-inner">
          <div className="feature-item">
            <Truck size={28} />
            <div>
              <strong>Fast Delivery</strong>
              <span>30 min average</span>
            </div>
          </div>

          <div className="feature-item">
            <ShieldCheck size={28} />
            <div>
              <strong>Secure Payment</strong>
              <span>100% protected</span>
            </div>
          </div>

          <div className="feature-item">
            <Star size={28} />
            <div>
              <strong>Top Rated</strong>
              <span>Best restaurants</span>
            </div>
          </div>

          <div className="feature-item">
            <Clock size={28} />
            <div>
              <strong>24/7 Service</strong>
              <span>Always open</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            Explore Categories
          </h2>

          <p className="section-subtitle">
            Pick your favorite cuisine and start ordering
          </p>

          <div className="category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.name}`}
                className="category-card"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                />

                <span className="category-overlay">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Popular Foods ---------- */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            Popular Foods
          </h2>

          <p className="section-subtitle">
            Most loved dishes by our customers
          </p>

          <div className="food-grid">
            {popularFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
              />
            ))}
          </div>

          <div className="home-see-all">
            <Link
              to="/categories"
              className="btn btn-secondary"
            >
              View All Foods
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Featured Restaurants ---------- */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            Featured Restaurants
          </h2>

          <p className="section-subtitle">
            Top-rated places to eat near you
          </p>

          <div className="restaurant-grid">
            {restaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Offers Banner ---------- */}
      <section className="section">
        <div className="container">
          <div className="offers-banner">
            <div className="offers-content">
              <span className="offers-tag">
                Limited Time
              </span>

              <h2>
                Get 50% OFF on your first order
              </h2>

              <p>
                Use code <strong>FOODHUB50</strong> at
                checkout to enjoy half-price on your first
                meal.
              </p>

              <Link
                to="/categories"
                className="btn btn-primary"
              >
                Order Now
              </Link>
            </div>

            <div className="offers-image">
              <img
                src="https://images.pexels.com/photos/4005229/pexels-photo-4005229.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Food offer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Customer Reviews ---------- */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            What Our Customers Say
          </h2>

          <p className="section-subtitle">
            Real reviews from real food lovers
          </p>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-stars">
                ★★★★★
              </div>

              <p>
                "Amazing service! The food arrived hot and
                fresh in just 25 minutes. The pizza was
                incredible!"
              </p>

              <div className="review-author">
                <img
                  src="https://images.pexels.com/photos/19838484/pexels-photo-19838484.jpeg?auto=compress&cs=tinysrgb&h=120&w=120"
                  alt="Priya"
                />

                <div>
                  <strong>Priya Sharma</strong>
                  <span>Mumbai</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-stars">
                ★★★★★
              </div>

              <p>
                "Best food delivery app I've used. The variety
                of restaurants and cuisines is fantastic!"
              </p>

              <div className="review-author">
                <img
                  src="https://images.pexels.com/photos/8749997/pexels-photo-8749997.jpeg?auto=compress&cs=tinysrgb&h=120&w=120"
                  alt="Rahul"
                />

                <div>
                  <strong>Rahul Verma</strong>
                  <span>Bengaluru</span>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-stars">
                ★★★★☆
              </div>

              <p>
                "Great app with smooth ordering. Love the
                real-time order tracking feature. Highly
                recommend!"
              </p>

              <div className="review-author">
                <img
                  src="https://images.pexels.com/photos/3801413/pexels-photo-3801413.jpeg?auto=compress&cs=tinysrgb&h=120&w=120"
                  alt="Anjali"
                />

                <div>
                  <strong>Anjali Gupta</strong>
                  <span>Delhi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Download App ---------- */}
      <section className="section">
        <div className="container">
          <div className="download-section">
            <div className="download-content">
              <h2>
                Download the FoodHub App
              </h2>

              <p>
                Order food on the go with our mobile app.
                Available on iOS and Android.
              </p>

              <div className="download-buttons">
                <button className="download-btn">
                  <Apple size={24} />

                  <div>
                    <small>Download on the</small>
                    <strong>App Store</strong>
                  </div>
                </button>

                <button className="download-btn">
                  <Play size={24} />

                  <div>
                    <small>GET IT ON</small>
                    <strong>Google Play</strong>
                  </div>
                </button>
              </div>
            </div>

            <div className="download-phones">
              <Smartphone
                size={180}
                className="download-phone-icon"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}