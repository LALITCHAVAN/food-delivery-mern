/* Shared TypeScript types for the Food Delivery app */

export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  address: string;
  blocked: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  delivery_time: string;
  created_at: string;
}

export interface Food {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category_id: string | null;
  restaurant_id: string | null;
  rating: number;
  available: boolean;
  created_at: string;
  /* joined fields (optional) */
  categories?: Category | null;
  restaurants?: Restaurant | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  created_at: string;
  foods?: Food;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered';

export interface OrderItemSnapshot {
  food_id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItemSnapshot[];
  total_price: number;
  delivery_charge: number;
  gst: number;
  grand_total: number;
  payment_method: string;
  order_status: OrderStatus;
  delivery_name: string;
  delivery_mobile: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  food_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
