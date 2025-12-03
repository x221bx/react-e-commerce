import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { analyzeWithGemini } from "../../utils/gemini";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { UseTheme } from "../../theme/ThemeProvider";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("Loading insights...");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userNameMap, setUserNameMap] = useState({});
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter((p) => (p.stock || 0) > 0).length;
    const outOfStock = totalProducts - availableProducts;
    const lowStockCount = products.filter(
      (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5
    ).length;

    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const customerMap = {};
    orders.forEach((o) => {
      const uid = o.uid || o.userId || o.phone || o.email || "unknown_" + o.id;
      if (!customerMap[uid]) customerMap[uid] = { orders: 0, revenue: 0 };
      customerMap[uid].orders += 1;
      customerMap[uid].revenue += o.totalValue || 0;
    });
    const repeatCustomers = Object.values(customerMap).filter(
      (c) => c.orders > 1
    );
    const repeatRate =
      Object.keys(customerMap).length > 0
        ? (
            (repeatCustomers.length / Object.keys(customerMap).length) *
            100
          ).toFixed(1)
        : "0";

    return {
      totalProducts,
      availableProducts,
      outOfStock,
      lowStockCount,
      totalUsers,
      totalOrders,
      totalSales,
      avgOrderValue,
      repeatRate,
      customerMap,
    };
  }, [products, users, orders]);

  const charts = useMemo(() => {
    const dailySalesMap = {};
    orders.forEach((o) => {
      const dateKey = format(o.createdAt || new Date(), "dd/MM");
      dailySalesMap[dateKey] =
        (dailySalesMap[dateKey] || 0) + (o.totalValue || 0);
    });
    const dailySales = Object.keys(dailySalesMap)
      .map((date) => ({ date, amount: dailySalesMap[date] }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const productSalesMap = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || item.productName || "Unnamed product";
        const revenue = (item.price || 0) * (item.quantity || 1);
        productSalesMap[name] = (productSalesMap[name] || 0) + revenue;
      });
    });
    const productSales = Object.entries(productSalesMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    const topCustomers = Object.entries(stats.customerMap)
      .map(([uid, info]) => ({
        customer: userNameMap[uid] || "Customer",
        revenue: info.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock <= 5
    );

    return {
      dailySales,
      productSales,
      topCustomers,
      lowStockProducts,
    };
  }, [stats, orders, products]);

  const fetchAllData = async () => {
    setLoading(true);
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    try {
      const [productsSnap, catsSnap, ordersSnap] = await Promise.all([
        getDocs(
          query(collection(db, "products"), orderBy("createdAt", "desc"))
        ),
        getDocs(collection(db, "categories")),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
      ]);

      setProducts(
        productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setCategories(
        catsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      const usersList = usersSnap.docs.map((doc) => {
        const data = doc.data() || {};

        return {
          id: doc.id,
          fullName: data.fullName || data.name || "Customer",
          email: data.email || "unknown@email",
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt || Date.now()),
        };
      });

      setUsers(usersList);
      const nameMap = Object.fromEntries(
        usersList.map((u) => [u.id, u.fullName])
      );
      setUserNameMap(nameMap);

      setOrders(
        ordersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          totalValue:
            doc.data().total ||
            doc.data().totals?.total ||
            (doc.data().totals?.subtotal || 0) +
              (doc.data().totals?.shipping || 0) ||
            0,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))
      );

      const aiText = await analyzeWithGemini(
        ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setAnalysis(aiText);
    } catch (err) {
      console.error(err);
      setAnalysis("Unable to load analysis right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-green-950 to-blue-950 text-white"
          : "bg-white text-slate-900"
      }`}
    >
      <div className="max-w-full mx-auto p-6 lg:p-10">
        <div className="flex justify-between items-center mb-10">
          <h1
            className={`text-4xl lg:text-5xl font-bold ${
              isDark
                ? "bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500"
                : "text-emerald-700"
            }`}
          >
            Admin Dashboard
          </h1>
          <button
            onClick={fetchAllData}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow ${
              isDark
                ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            } transition`}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={22} />{" "}
            Refresh data
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl animate-pulse">Loading data...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <KPICard
                icon={Package}
                label="Total products"
                value={stats.totalProducts}
                gradient="from-green-500 to-blue-500"
                isDark={isDark}
              />
              <KPICard
                icon={ShoppingCart}
                label="Total orders"
                value={stats.totalOrders}
                gradient="from-blue-500 to-indigo-600"
                isDark={isDark}
              />
              <KPICard
                icon={DollarSign}
                label="Total sales"
                value={`${stats.totalSales.toLocaleString()} EGP`}
                gradient="from-green-600 to-blue-700"
                isDark={isDark}
              />
              <KPICard
                icon={Users}
                label="Total users"
                value={stats.totalUsers}
                gradient="from-indigo-500 to-purple-600"
                isDark={isDark}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
              <ChartCard title="Daily sales trend" isDark={isDark}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={charts.dailySales}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#334155" : "#e2e8f0"}
                    />
                    <XAxis dataKey="date" stroke={isDark ? "#94a3b8" : "#475569"} />
                    <YAxis stroke={isDark ? "#94a3b8" : "#475569"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        color: isDark ? "#e2e8f0" : "#0f172a",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#22c55e"
                      strokeWidth={4}
                      dot={{ fill: "#3b82f6", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top products by revenue" isDark={isDark}>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={charts.productSales} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#334155" : "#e2e8f0"}
                    />
                    <XAxis type="number" stroke={isDark ? "#94a3b8" : "#475569"} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke={isDark ? "#FFFFFF" : "#0f172a"}
                      width={110}
                    />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#10b981" radius={[0, 12, 12, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top customers by revenue" isDark={isDark}>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={charts.topCustomers}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#334155" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="customer"
                      stroke={isDark ? "#F9FAF9" : "#0f172a"}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke={isDark ? "#94a3b8" : "#475569"} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ChartCard title="Low stock products" isDark={isDark}>
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {charts.lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg border ${
                        isDark
                          ? "bg-red-900/40 border-red-500 text-red-100"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <p className="text-sm font-semibold">{p.title}</p>
                      <p className="text-xs">Stock: {p.stock}</p>
                    </div>
                  ))}
                  {charts.lowStockProducts.length === 0 && (
                    <p className={isDark ? "text-gray-400" : "text-slate-500"}>
                      No low-stock products right now.
                    </p>
                  )}
                </div>
              </ChartCard>

              <div
                className={`col-span-2 rounded-3xl p-8 shadow-2xl border ${
                  isDark
                    ? "bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-xl border-green-500/30"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className={isDark ? "text-yellow-400" : "text-amber-500"} size={32} />
                  <h2 className="text-2xl font-bold">AI insights on recent orders</h2>
                </div>
                <div
                  className={`text-sm leading-relaxed max-h-96 overflow-y-auto ${
                    isDark ? "text-gray-200 prose prose-invert" : "text-slate-700"
                  }`}
                >
                  {analysis}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, gradient, isDark }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${
        isDark
          ? `bg-gradient-to-br ${gradient}`
          : "bg-white border border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className={isDark ? "text-white/80 text-sm" : "text-slate-500 text-sm"}>
          {label}
        </p>
        <Icon size={36} className={isDark ? "opacity-80 text-white" : "text-emerald-500"} />
      </div>
      <p className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-slate-900"}>
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children, isDark }) {
  return (
    <div
      className={`p-8 rounded-3xl ${
        isDark
          ? "bg-slate-900/70 backdrop-blur-xl border border-green-500/20 shadow-2xl"
          : "bg-white border border-slate-200 shadow-md"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-6 text-center ${
          isDark
            ? "bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
            : "text-slate-800"
        }`}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
