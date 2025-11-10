// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Authcomponents/ProtectedRoute";

// 🔐 Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";

// 🌿 Public pages
import Home from "./pages/Home";

// 🧑‍💼 Admin pages
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm"; // used for both new + edit
import AdminCategories from "./pages/admin/AdminCategories";

export default function App() {
  return (
    <Routes>
      {/* 🌿 صفحات عامة */}
      <Route path="/" element={<Home />} />

      {/* 🔐 صفحات تسجيل الدخول */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />

      {/* ⚙️ صفحات الأدمن - محمية */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          {/* Products list */}
          <Route path="products" element={<AdminProducts />} />

          {/* Create new product */}
          <Route path="products/new" element={<AdminProductForm />} />

          {/* Edit existing product (dynamic id) */}
          <Route path="products/:id/edit" element={<AdminProductForm />} />

          {/* Categories */}
          <Route path="categories" element={<AdminCategories />} />
          {/* optionally: new/edit category routes if you have them */}
        </Route>
      </Route>

      {/* 🚫 optional 403 / 404 pages */}
      <Route
        path="/403"
        element={
          <div className="flex h-screen items-center justify-center flex-col">
            <h1 className="text-4xl font-bold text-red-600">403 Forbidden</h1>
            <p className="text-gray-600 mt-2">
              You do not have permission to access this page.
            </p>
          </div>
        }
      />
    </Routes>
  );
}
