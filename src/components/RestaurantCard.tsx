import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import type { Restaurant } from '@/lib/types';
import './RestaurantCard.css';

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card">
      <div className="restaurant-card-image">
        <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
      </div>
      <div className="restaurant-card-body">
        <h3 className="restaurant-card-name">{restaurant.name}</h3>
        <p className="restaurant-card-address">
          <MapPin size={14} /> {restaurant.address}
        </p>
        <div className="restaurant-card-meta">
          <span className="restaurant-card-rating">
            <Star size={14} fill="currentColor" /> {restaurant.rating}
          </span>
          <span className="restaurant-card-time">
            <Clock size={14} /> {restaurant.delivery_time}
          </span>
        </div>
      </div>
    </Link>
  );
}
