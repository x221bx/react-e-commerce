import { NavLink } from "react-router-dom";
import {
  FiShoppingBag,
  FiTag,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import PageHeader from "../../admin/PageHeader";
import {
  useProductsCount,
  useProductsAvailableCount,
  useCategoriesCount,
  useUsersCount,
  useUsersStats,
} from "../../hooks/useCounts";
import { useProductsSorted } from "../../hooks/useProductsSorted";
import { UseTheme } from "../../theme/ThemeProvider";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const { theme } = UseTheme();
  const dark = theme === "dark";

  // 🧮 الإحصائيات
  const { data: totalProducts = 0 } = useProductsCount();
  const { data: availableProducts = 0 } = useProductsAvailableCount();
  const { data: totalCategories = 0 } = useCategoriesCount();
  const { data: totalUsers = 0 } = useUsersCount();
  const outOfStock = Math.max(0, totalProducts - availableProducts);

  // 👥 بيانات المستخدمين
  const { data: usersStats = [] } = useUsersStats();

  // 🛒 أحدث المنتجات
  const { data: recent = [], isLoading: loadingRecent } = useProductsSorted({
    sortBy: "createdAt",
    dir: "desc",
    qText: "",
    status: "all",
  });
  const recent3 = (recent || []).slice(0, 3);
  const lowStock = (recent || []).filter((p) => p.stock <= 5);

  const productData = [
    { name: "Available", value: availableProducts },
    { name: "Out of Stock", value: outOfStock },
  ];

  const PRODUCT_COLORS = ["#1ABC9C", "#E74C3C"];

  return (
    <div>
      <PageHeader title="Dashboard Overview" />

      {/* 🔢 كروت الإحصائيات */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mt-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<FiShoppingBag className="text-[#34495E]" />}
          link={{ to: "/admin/products", label: "Manage" }}
          dark={dark}
        />
        <StatCard
          title="Available"
          value={availableProducts}
          icon={<FiCheckCircle className="text-[#1ABC9C]" />}
          link={{ to: "/admin/products?filter=available", label: "View" }}
          dark={dark}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStock}
          icon={<FiClock className="text-[#E74C3C]" />}
          link={{ to: "/admin/products?filter=outofstock", label: "Review" }}
          dark={dark}
        />
        <StatCard
            title="Categories"
            value={totalCategories}
            icon={<FiTag className="text-[#9B59B6]" />}
            link={{ to: "/admin/categories", label: "Manage" }}
            dark={dark}
        />
        <StatCard
          title="Users"
          value={totalUsers}
          icon={<FiUsers className="text-[#F39C12]" />}
          link={{ to: "/admin/users", label: "Manage" }}
          dark={dark}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStock.length}
          icon={<FiAlertCircle className="text-[#E67E22]" />}
          link={{ to: "/admin/products?filter=lowstock", label: "Check" }}
          dark={dark}
        />
      </div>

      {/* 📊 Products Pie Chart */}
      <section
        className={`
          mt-8 rounded-2xl border p-6 shadow-sm
          ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
        `}
      >
        <h2 className="mb-4 text-base font-semibold">Products Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={productData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={4}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {productData.map((entry, index) => (
                <Cell key={index} fill={PRODUCT_COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* 👥 Users Analytics */}
      <section
        className={`
          mt-8 rounded-2xl border p-6 shadow-sm
          ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
        `}
      >
        <h2 className="mb-4 text-base font-semibold">User Growth Analytics</h2>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={usersStats}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#244" : "#eee"} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="daily" fill="#3498DB" name="Users / Day" radius={[4,4,0,0]} />
            <Bar dataKey="monthly" fill="#F39C12" name="Users / Month" radius={[4,4,0,0]} />
            <Bar dataKey="yearly" fill="#9B59B6" name="Users / Year" radius={[4,4,0,0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      {/* 🆕 Recent Products */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Products</h2>
          <NavLink
            to="/admin/products"
            className="text-sm font-medium text-[#2A9D8F] hover:underline"
          >
            See all →
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingRecent
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    h-72 animate-pulse rounded-2xl
                    ${dark ? "bg-[#1a2e2e]" : "bg-gray-50"}
                  `}
                />
              ))
            : recent3.map((p) => (
                <div
                  key={p.id}
                  className={`
                    flex flex-col rounded-2xl border p-4 shadow-sm h-full transition
                    ${dark
                      ? "bg-[#0f2222] border-[#1e3a3a] hover:shadow-lg"
                      : "bg-white border-gray-200 hover:shadow-md"}
                  `}
                >
                  <img
                    src={p.thumbnailUrl || "/placeholder.png"}
                    className="h-60 w-full rounded-lg object-cover mb-3"
                    alt=""
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate">
                      {p.title}
                    </p>
                    <p className="text-xs opacity-70 mt-1 truncate">
                      {p.category?.category || p.category}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {p.createdAt ? formatDate(p.createdAt) : "—"}
                    </p>
                  </div>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-sm text-center ${
                      p.isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.isAvailable ? "Available" : "Out of stock"}
                  </span>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
}

/* ========== STAT CARD ========== */
function StatCard({ title, value, icon, link, dark }) {
  return (
    <div
      className={`
        rounded-2xl border p-5 shadow-sm transition duration-200
        hover:shadow-md hover:scale-[1.02]
        ${dark ? "bg-[#0f2222] border-[#1e3a3a] text-[#cfecec]" 
               : "bg-white border-gray-100 text-gray-900"}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium opacity-80">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="mt-1 text-3xl font-bold">{value}</div>

      {link && (
        <NavLink
          to={link.to}
          className="mt-3 inline-block text-sm font-semibold text-[#2A9D8F] hover:text-[#1e6f67]"
        >
          {link.label} →
        </NavLink>
      )}
    </div>
  );
}

/* ========== FORMAT DATE ========== */
function formatDate(ts) {
  if (!ts) return "—";
  const ms = ts.toMillis
    ? ts.toMillis()
    : ts.seconds
    ? ts.seconds * 1000
    : +new Date(ts);
  return new Date(ms).toLocaleDateString();
}
