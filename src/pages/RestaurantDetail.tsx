import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Restaurant } from "@/lib/types";
import RestaurantCard from "@/components/RestaurantCard";
import Spinner from "@/components/Spinner";
import "./Restaurants.css";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await api.get("/restaurants");

        setRestaurants(
          (response.data.restaurants || []) as Restaurant[]
        );
      } catch (error) {
        console.error("Failed to load restaurants:", error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Restaurants</h1>
        <p className="text-muted">
          Discover the best restaurants near you
        </p>
      </div>

      <div className="restaurant-grid">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
          />
        ))}
      </div>
    </div>
  );
}