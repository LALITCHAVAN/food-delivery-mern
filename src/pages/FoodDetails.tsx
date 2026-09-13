import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  MapPin,
} from "lucide-react";

import api from "@/lib/api";
import type { Food, Review } from "@/lib/types";
import { formatPrice, ratingStars } from "@/lib/helpers";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Spinner from "@/components/Spinner";
import QuantitySelector from "@/components/QuantitySelector";

import "./FoodDetails.css";

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { profile } = useAuth();
  const { show } = useToast();

  const [food, setFood] = useState<Food | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadFoodDetails() {
      if (!id) return;

      setLoading(true);

      try {
        const [foodRes, reviewRes] = await Promise.all([
          api.get(`/foods/${id}`),
          api.get(`/reviews/food/${id}`),
        ]);

        const foodData =
          foodRes.data?.food || foodRes.data || null;

        const reviewsData =
          reviewRes.data?.reviews || [];

        setFood(foodData as Food | null);
        setReviews(reviewsData as Review[]);
      } catch (error) {
        console.error(
          "Failed to load food details:",
          error
        );

        setFood(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    loadFoodDetails();
  }, [id]);

  async function handleAddToCart() {
    if (!profile) {
      show(
        "Please sign in to add items to cart",
        "info"
      );

      navigate("/login");
      return;
    }

    if (!food) return;

    setAdding(true);

    try {
      await addToCart(food.id, quantity);

      show(
        `${quantity} × ${food.title} added to cart!`
      );
    } catch (error) {
      console.error("Add to cart error:", error);

      show(
        "Could not add to cart",
        "error"
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    if (!profile) {
      show(
        "Please sign in to continue",
        "info"
      );

      navigate("/login");
      return;
    }

    if (!food) return;

    try {
      await addToCart(food.id, quantity);

      navigate("/cart");
    } catch (error) {
      console.error("Buy now error:", error);

      show(
        "Something went wrong",
        "error"
      );
    }
  }

  if (loading) {
    return <Spinner />;
  }

  if (!food) {
    return (
      <div className="empty-state">
        <h2>Food not found</h2>

        <Link
          to="/categories"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Browse Foods
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <Link
        to="/categories"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Back to Foods
      </Link>

      <div className="food-detail">
        <div className="food-detail-image">
          <img
            src={food.image}
            alt={food.title}
          />

          {!food.available && (
            <span className="food-detail-unavailable">
              Out of Stock
            </span>
          )}
        </div>

        <div className="food-detail-info">
          {food.categories && (
            <Link
              to={`/categories/${food.categories.name}`}
              className="food-detail-category"
            >
              {food.categories.name}
            </Link>
          )}

          <h1 className="food-detail-title">
            {food.title}
          </h1>

          <div className="food-detail-meta">
            <span className="food-detail-rating">
              <Star
                size={18}
                fill="currentColor"
              />

              {food.rating}
            </span>

            {food.restaurants && (
              <span className="food-detail-restaurant">
                <MapPin size={16} />
                {food.restaurants.name}
              </span>
            )}
          </div>

          <p className="food-detail-desc">
            {food.description}
          </p>

          <div className="food-detail-price-row">
            <span className="food-detail-price">
              {formatPrice(food.price)}
            </span>

            <span className="food-detail-unit">
              per item
            </span>
          </div>

          <div className="food-detail-actions">
            <div className="food-detail-qty">
              <span className="form-label">
                Quantity
              </span>

              <QuantitySelector
                quantity={quantity}
                onDecrease={() =>
                  setQuantity((q) =>
                    Math.max(1, q - 1)
                  )
                }
                onIncrease={() =>
                  setQuantity((q) => q + 1)
                }
              />
            </div>

            <div className="food-detail-total">
              <span className="form-label">
                Total
              </span>

              <strong>
                {formatPrice(
                  food.price * quantity
                )}
              </strong>
            </div>
          </div>

          <div className="food-detail-buttons">
            <button
              className="btn btn-secondary"
              onClick={handleAddToCart}
              disabled={
                !food.available || adding
              }
            >
              <ShoppingCart size={18} />

              {adding
                ? "Adding..."
                : "Add to Cart"}
            </button>

            <button
              className="btn btn-primary"
              onClick={handleBuyNow}
              disabled={!food.available}
            >
              <CheckCircle size={18} />
              Buy Now
            </button>
          </div>

          {food.restaurants && (
            <div className="food-detail-restaurant-card">
              <img
                src={food.restaurants.image}
                alt={food.restaurants.name}
              />

              <div>
                <strong>
                  {food.restaurants.name}
                </strong>

                <span>
                  {food.restaurants.address}
                </span>

                <span className="food-detail-delivery">
                  {food.restaurants.delivery_time}
                </span>
              </div>

              <Link
                to={`/restaurants/${food.restaurants.id}`}
                className="btn btn-outline"
              >
                View
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Reviews ---------- */}

      <div className="food-reviews">
        <h2>
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-muted">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="review-item"
              >
                <div className="review-item-header">
                  <strong>
                    {r.user_name || "Anonymous"}
                  </strong>

                  <span className="review-item-stars">
                    {ratingStars(r.rating)}
                  </span>
                </div>

                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}