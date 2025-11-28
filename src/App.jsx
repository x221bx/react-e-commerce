import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./Authcomponents/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import { Toaster } from "react-hot-toast";

// Lazy load all components for better performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Reset = lazy(() => import("./pages/Reset"));
const Home = lazy(() => import("./pages/Home"));

const Products = lazy(() => import("./pages/Products"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Cart = lazy(() => import("./pages/Cart"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));
const AnalysisDashboard = lazy(() => import("./pages/AnalysisDashboard"));
const ContactUs = lazy(() => import("./pages/contactus"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ArticlesList = lazy(() => import("./pages/articles/ArticlesList"));
const ArticleDetails = lazy(() => import("./pages/articles/ArticleDetails"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const OrderTracking = lazy(() => import("./pages/account/OrderTracking"));
const OrderHistory = lazy(() => import("./pages/account/OrderHistory"));
const SavedProducts = lazy(() => import("./pages/account/SavedProducts"));
const FavoriteArticles = lazy(() => import("./pages/account/FavoriteArticles"));
const AiConversations = lazy(() => import("./pages/account/AiConversations"));
const SupportCenter = lazy(() => import("./pages/account/SupportCenter"));
const Complaints = lazy(() => import("./pages/account/Complaints"));
const PaymentMethods = lazy(() => import("./pages/account/PaymentMethods"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const ChatBot = lazy(() => import("./components/Ai/ChatBot"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Routes */}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/analysis-dashboard" element={<AnalysisDashboard />} />
          <Route path="/articles" element={<ArticlesList />} />
          <Route path="/articles/:articleId" element={<ArticleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/about" element={<About />} />

          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<SuccessPage />} />

          {/* Authenticated User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/checkout/confirmation"
              element={<OrderConfirmation />}
            />
            <Route path="/settings" element={<UserSettings />} />
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
              <Route path="complaints" element={<Complaints />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="AdminOrders" element={<AdminOrders />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="articles" element={<AdminArticles />} />
            </Route>
          </Route>

          {/* Forbidden */}
          <Route
            path="/403"
            element={
              <div className="flex h-screen items-center justify-center flex-col">
                <h1 className="text-4xl font-bold text-red-600">
                  403 Forbidden
                </h1>
                <p className="text-gray-600 mt-2 dark:text-gray-300">
                  You do not have permission to access this page.
                </p>
              </div>
            }
          />
        </Routes>
      </Suspense>
      <ChatBot />
    </div>
  );
}
