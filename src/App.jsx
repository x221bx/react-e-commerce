import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Authcomponents/ProtectedRoute";
import Navbar from "./components/layout/Navbar";

// auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";

// public
import Home from "./pages/Home";
import Shop from "./pages/Shop"; // 👈 مؤقتًا فاضية
import Favorites from "./pages/Favorites"; // 👈 جديدة

// admin
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";

export default function App() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />

        {/* 🧡 Favorites محمية */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />

        {/* 🛠️ Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>

        {/* 🚫 Forbidden Page */}
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
