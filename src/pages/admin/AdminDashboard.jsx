// src/components/AdminDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { analyzeWithGemini } from "../../utils/gemini";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  PackageCheck,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("جاري تحليل البيانات...");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // الحسابات الديناميكية
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

  // Charts Data
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
        const name = item.name || item.productName || "غير معروف";
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
        customer: uid.length > 12 ? uid.slice(0, 10) + "..." : uid,
        revenue: info.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Low stock products
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
    try {
      const [productsSnap, catsSnap, usersSnap, ordersSnap] = await Promise.all(
        [
          getDocs(
            query(collection(db, "products"), orderBy("createdAt", "desc"))
          ),
          getDocs(collection(db, "categories")),
          getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
          getDocs(
            query(collection(db, "orders"), orderBy("createdAt", "desc"))
          ),
        ]
      );

      setProducts(
        productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setCategories(
        catsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setUsers(usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      setAnalysis("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-blue-950 text-white">
      <div className="max-w-full mx-auto p-6 lg:p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500">
            لوحة تحكم المتجر البيطري
          </h1>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 py-3 rounded-xl shadow-xl transition"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={22} />{" "}
            تحديث الكل
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl animate-pulse">جارٍ تحميل البيانات...</div>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
              <KPICard
                icon={Package}
                label="المنتجات"
                value={stats.totalProducts}
                gradient="from-green-500 to-blue-500"
              />
              <KPICard
                icon={PackageCheck}
                label="متوفر"
                value={stats.availableProducts}
                gradient="from-green-400 to-cyan-500"
              />
              <KPICard
                icon={ShoppingCart}
                label="الطلبات"
                value={stats.totalOrders}
                gradient="from-blue-500 to-indigo-600"
              />
              <KPICard
                icon={DollarSign}
                label="إجمالي المبيعات"
                value={`${stats.totalSales.toLocaleString()} ج.م`}
                gradient="from-green-600 to-blue-700"
              />
              <KPICard
                icon={Users}
                label="عدد المستخدمين"
                value={stats.totalUsers}
                gradient="from-indigo-500 to-purple-600"
              />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
              <ChartCard title="تريند المبيعات اليومي">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={charts.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
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

              <ChartCard title="أفضل المنتجات مبيعًا">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={charts.productSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      width={110}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="amount"
                      fill="#f97316"
                      radius={[0, 12, 12, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="أقوى العملاء">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={charts.topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="customer"
                      stroke="#94a3b8"
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar
                      dataKey="revenue"
                      fill="#22c55e"
                      radius={[12, 12, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Low Stock Highlight + AI Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ChartCard title="المنتجات منخفضة المخزون">
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {charts.lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-red-900/40 p-3 rounded-lg border border-red-500"
                    >
                      <p className="text-sm font-semibold">{p.title}</p>
                      <p className="text-xs text-gray-300">
                        المخزون: {p.stock}
                      </p>
                    </div>
                  ))}
                  {charts.lowStockProducts.length === 0 && (
                    <p className="text-gray-400">
                      لا توجد منتجات منخفضة المخزون
                    </p>
                  )}
                </div>
              </ChartCard>

              <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-green-500/30 col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="text-yellow-400" size={32} />
                  <h2 className="text-2xl font-bold">
                    تحليل الذكاء الاصطناعي اللحظي
                  </h2>
                </div>
                <div className="text-sm leading-relaxed text-gray-200 max-h-96 overflow-y-auto prose prose-invert text-sm">
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

function KPICard({ icon: Icon, label, value, gradient }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/80 text-sm">{label}</p>
        <Icon size={36} className="opacity-80" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-green-500/20">
      <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        {title}
      </h2>
      {children}
    </div>
  );
}
