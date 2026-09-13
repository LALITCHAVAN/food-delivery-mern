import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import type { Food } from '@/lib/types';
import { formatPrice } from '@/lib/helpers';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import './FoodCard.css';

export default function FoodCard({ food }: { food: Food }) {
  const { addToCart } = useCart();
  const { profile } = useAuth();
  const { show } = useToast();

  async function handleAdd() {
    if (!profile) {
      show('Please sign in to add items to cart', 'info');
      return;
    }
    try {
      await addToCart(food.id);
      show(`${food.title} added to cart!`);
    } catch {
      show('Could not add to cart', 'error');
    }
  }

  return (
    <div className="food-card">
      <Link to={`/foods/${food.id}`} className="food-card-image">
        <img src={food.image} alt={food.title} loading="lazy" />
        {!food.available && <span className="food-card-unavailable">Out of Stock</span>}
        <span className="food-card-rating">
          <Star size={14} fill="currentColor" /> {food.rating}
        </span>
      </Link>
      <div className="food-card-body">
        <Link to={`/foods/${food.id}`}>
          <h3 className="food-card-title">{food.title}</h3>
        </Link>
        <p className="food-card-desc">{food.description}</p>
        {food.restaurants && (
          <p className="food-card-restaurant">{food.restaurants.name}</p>
        )}
        <div className="food-card-footer">
          <span className="food-card-price">{formatPrice(food.price)}</span>
          <button
            className="btn btn-primary food-card-btn"
            onClick={handleAdd}
            disabled={!food.available}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
