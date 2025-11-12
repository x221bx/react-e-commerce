import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Authcomponents/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import { Toaster } from "react-hot-toast";

// auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";

// public pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
// admin pages
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";

export default function App() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>

        {/* Forbidden */}
        <Route
          path="/403"
          element={
            <div className="flex h-screen items-center justify-center flex-col">
              <h1 className="text-4xl font-bold text-red-600">403 Forbidden</h1>
              <p className="text-gray-600 mt-2 dark:text-gray-300">
                You do not have permission to access this page.
              </p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
