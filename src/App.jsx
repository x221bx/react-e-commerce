import { Routes, Route, Navigate } from "react-router-dom";
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
import About from "./pages/About";
import ContactUs from "./pages/contactus";
import Checkout from "./pages/Checkout";
// import Notifications from "./pages/Notifications";
import OrderDetails from "./pages/OrderDetails";

// user/admin order pages
// import UserOrders from "./features/orders/UserOrders";
import AdminOrders from "./pages/admin/AdminOrders";

// account/settings
import UserSettings from "./pages/UserSettings";
import AccountLayout from "./pages/account/AccountLayout";
import OrderTracking from "./pages/account/OrderTracking";
import OrderHistory from "./pages/account/OrderHistory";
import SavedProducts from "./pages/account/SavedProducts";
import FavoriteArticles from "./pages/account/FavoriteArticles";
import AiConversations from "./pages/account/AiConversations";
import SupportCenter from "./pages/account/SupportCenter";
import PaymentMethods from "./pages/account/PaymentMethods";

// admin pages
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";

export default function App() {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50">
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contactus" element={<ContactUs />} />
        {/* <Route path="/notifications" element={<Notifications />} /> */}

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />

        {/* User Orders (protected) */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/UserOrders" element={<UserOrders />} /> */}
          <Route path="/UserOrders/:id" element={<OrderDetails />} />
          <Route path="/adminorders/:id" element={<OrderDetails />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Account nested */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Navigate to="tracking" replace />} />
            <Route
              path="settings"
              element={<UserSettings variant="embedded" />}
            />
            <Route path="payments" element={<PaymentMethods />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="tracking" element={<OrderTracking />} />
            <Route path="saved" element={<SavedProducts />} />
            <Route path="articles" element={<FavoriteArticles />} />
            <Route path="ai" element={<AiConversations />} />
            <Route path="support" element={<SupportCenter />} />
          </Route>
        </Route>

        {/* Admin protected */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            {/* <Route path="notifications" element={<Notifications />} /> */}
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="adminorders" element={<AdminOrders />} />
            <Route path="/adminorders/:id" element={<OrderDetails />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
