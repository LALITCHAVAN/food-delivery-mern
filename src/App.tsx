import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Categories from '@/pages/Categories';
import Restaurants from '@/pages/Restaurants';
import RestaurantDetail from '@/pages/RestaurantDetail';
import FoodDetails from '@/pages/FoodDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import Profile from '@/pages/Profile';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminFoods from '@/pages/admin/AdminFoods';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminRestaurants from '@/pages/admin/AdminRestaurants';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              {/* ---------- Admin (no site chrome) ---------- */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="foods" element={<AdminFoods />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="restaurants" element={<AdminRestaurants />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* ---------- Main site ---------- */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/categories/:categoryName" element={<Categories />} />
                        <Route path="/restaurants" element={<Restaurants />} />
                        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                        <Route path="/foods/:id" element={<FoodDetails />} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="*" element={<Home />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
