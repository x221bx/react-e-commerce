// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase"; // عدّل المسار لو لازم
import { analyzeWithGemini } from "../../utils/gemini"; // لاحقًا توصلها للـ Cloud Function
import { format } from "date-fns";

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
  PackageCheck,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

/** ألوان الهوية البيطرية */
const BRAND = {
  green1: "#16A34A",
  green2: "#22C55E",
  teal: "#0D9488",
  sky: "#38BDF8",
  amber: "#F59E0B",
  brown: "#A16207",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("الذكاء الاصطناعي غير متاح حالياً");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usernames, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // جلب كل الداتا من Firebase
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsSnap, catsSnap, usernamesSnap, ordersSnap] =
        await Promise.all([
          getDocs(
            query(collection(db, "products"), orderBy("createdAt", "desc"))
          ),
          getDocs(collection(db, "categories")),
          getDocs(
            query(collection(db, "usernames"), orderBy("createdAt", "desc"))
          ),
          getDocs(
            query(collection(db, "orders"), orderBy("createdAt", "desc"))
          ),
        ]);

      const productsList = productsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const categoriesList = catsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const usersList = usernamesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const ordersList = ordersSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          totalValue:
            data.total ||
            data.totals?.total ||
            (data.totals?.subtotal || 0) + (data.totals?.shipping || 0) ||
            0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      setProducts(productsList);
      setCategories(categoriesList);
      setUsers(usersList);
      setOrders(ordersList);

      // حاول تشغيل تحليل AI (إذا متاح) — يطلب رابط Cloud Function أو يعيد رسالة بديلة
      try {
        const aiText = await analyzeWithGemini({
          products: productsList,
          categories: categoriesList,
          usernames: usersList,
          orders: ordersList,
        });
        if (aiText) setAnalysis(aiText);
      } catch (aiErr) {
        console.warn("AI analysis failed:", aiErr);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // احصائيات محسوبة ديناميكياً
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter((p) => (p.stock ?? 0) > 0).length;
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
    const lowStockCount = products.filter(
      (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5
    ).length;

    const totalCategories = categories.length;
    const totalUsers = usernames.length;

    const totalOrders = orders.length;
    const totalSales = orders.reduce((s, o) => s + (o.totalValue || 0), 0);
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const customerMap = {};
    orders.forEach((o) => {
      const uid = o.uid || o.userId || o.phone || o.email || `unknown_${o.id}`;
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

    // recent products (حسب createdAt)
    const recentProducts = [...products]
      .sort(
        (a, b) =>
          (b.createdAt?.getTime ? b.createdAt.getTime() : 0) -
          (a.createdAt?.getTime ? a.createdAt.getTime() : 0)
      )
      .slice(0, 6);

    return {
      totalProducts,
      availableProducts,
      outOfStock,
      lowStockCount,
      totalCategories,
      totalUsers,
      totalOrders,
      totalSales,
      avgOrderValue,
      repeatRate,
      recentProducts,
      customerMap,
    };
  }, [products, categories, usernames, orders]);

  // البيانات الخاصة بالـ Charts
  const charts = useMemo(() => {
    // daily sales (dd/MM)
    const dailyMap = {};
    orders.forEach((o) => {
      const key = format(new Date(o.createdAt), "dd/MM");
      dailyMap[key] = (dailyMap[key] || 0) + (o.totalValue || 0);
    });
    const dailySales = Object.keys(dailyMap)
      .map((k) => ({ date: k, amount: dailyMap[k] }))
      .sort((a, b) => {
        // sort by day/month lexicographically is OK for recent range; optionally parse
        const [da, ma] = a.date.split("/").map(Number);
        const [db, mb] = b.date.split("/").map(Number);
        return ma === mb ? da - db : ma - mb;
      });

    // product distribution
    const productDistribution = [
      { name: "متوفر", value: stats.availableProducts, color: BRAND.green2 },
      { name: "نفد المخزون", value: stats.outOfStock, color: "#EF4444" },
      { name: "منخفض المخزون", value: stats.lowStockCount, color: BRAND.amber },
    ];

    // users by month
    const usersByMonth = {};
    usernames.forEach((u) => {
      const month = format(new Date(u.createdAt || Date.now()), "MMM yyyy");
      usersByMonth[month] = (usersByMonth[month] || 0) + 1;
    });
    const userGrowth = Object.keys(usersByMonth)
      .map((m) => ({ month: m, users: usersByMonth[m] }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // product sales (revenue)
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

    // top customers
    const topCustomers = Object.entries(stats.customerMap)
      .map(([uid, info]) => ({
        customer: uid.length > 12 ? uid.slice(0, 10) + "..." : uid,
        revenue: info.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return {
      dailySales,
      productDistribution,
      userGrowth,
      productSales,
      topCustomers,
    };
  }, [orders, usernames, stats]);

  // عرض Loading / Error / Main
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-950 via-emerald-900 to-slate-900 text-white">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 animate-spin opacity-90 mb-4" />
          <h2 className="text-2xl font-bold">
            جاري تحميل البيانات من Firebase…
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-950 via-emerald-900 to-slate-900 text-white">
        <div className="text-center p-6 bg-red-900/30 rounded-2xl">
          <h2 className="text-xl font-bold">حدث خطأ أثناء جلب البيانات</h2>
          <p className="mt-3 text-sm opacity-90">{String(error)}</p>
        </div>
      </div>
    );
  }

  const productData = [
    { name: "Available", value: availableProducts },
    { name: "Out of Stock", value: outOfStock },
  ];

  const PRODUCT_COLORS = ["#1ABC9C", "#E74C3C"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-slate-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300">
              لوحة تحكم Farm-Vet
            </h1>
            <p className="text-slate-300 mt-2">
              بيانات حية من Firebase · هوية بيطرية متوافقة
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchAllData}
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow"
            >
              <RefreshCw size={18} /> تحديث الكل
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl shadow"
            >
              طباعة
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <KPICard
            icon={Package}
            label="المنتجات"
            value={stats.totalProducts}
            gradient="from-green-600 to-emerald-700"
          />
          <KPICard
            icon={PackageCheck}
            label="المتوفر"
            value={stats.availableProducts}
            gradient="from-emerald-500 to-teal-600"
          />
          <KPICard
            icon={AlertCircle}
            label="نفد المخزون"
            value={stats.outOfStock}
            gradient="from-red-500 to-orange-600"
          />
          <KPICard
            icon={ShoppingCart}
            label="الطلبات"
            value={stats.totalOrders}
            gradient="from-cyan-600 to-teal-700"
          />
          <KPICard
            icon={DollarSign}
            label="إجمالي المبيعات"
            value={`${stats.totalSales.toLocaleString()} ج.م`}
            gradient="from-teal-700 to-green-700"
          />
          <KPICard
            icon={Users}
            label="المستخدمين"
            value={stats.totalUsers}
            gradient="from-blue-600 to-cyan-600"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ChartCard title="تريند المبيعات اليومي">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.dailySales}>
                <CartesianGrid stroke="#113" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#9AE6B4" />
                <YAxis stroke="#9AE6B4" />
                <Tooltip wrapperStyle={{ background: "#052" }} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={BRAND.green2}
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="أفضل المنتجات مبيعًا">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.productSales} layout="vertical">
                <CartesianGrid stroke="#113" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#9AE6B4" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9AE6B4"
                  width={140}
                />
                <Tooltip wrapperStyle={{ background: "#052" }} />
                <Bar
                  dataKey="amount"
                  fill={BRAND.amber}
                  radius={[8, 8, 8, 8]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="نمو المستخدمين الشهري">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.userGrowth}>
                <CartesianGrid stroke="#113" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#9AE6B4" />
                <YAxis stroke="#9AE6B4" />
                <Tooltip wrapperStyle={{ background: "#052" }} />
                <Bar dataKey="users" fill={BRAND.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* secondary charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <ChartCard title="توزيع حالة المنتجات">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={charts.productDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={4}
                  label
                >
                  {charts.productDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ background: "#052" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="أقوى العملاء (إيرادات)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.topCustomers}>
                <CartesianGrid stroke="#113" strokeDasharray="3 3" />
                <XAxis dataKey="customer" stroke="#9AE6B4" />
                <YAxis stroke="#9AE6B4" />
                <Tooltip wrapperStyle={{ background: "#052" }} />
                <Bar
                  dataKey="revenue"
                  fill={BRAND.green1}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="مخزون المنتجات (أدنى 8)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[...products]
                  .sort((a, b) => (a.stock || 0) - (b.stock || 0))
                  .slice(0, 8)
                  .map((p) => ({
                    name: p.title || p.name || "غير معروف",
                    stock: p.stock || 0,
                  }))}
              >
                <CartesianGrid stroke="#113" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9AE6B4" />
                <YAxis stroke="#9AE6B4" />
                <Tooltip wrapperStyle={{ background: "#052" }} />
                <Bar dataKey="stock" fill={BRAND.brown} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent products + AI insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-emerald-700/20">
            <h3 className="text-xl font-bold mb-4">أحدث المنتجات</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stats.recentProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-gradient-to-br from-emerald-800/30 to-green-900/10 rounded-xl p-3 flex flex-col gap-2"
                >
                  <img
                    src={p.thumbnailUrl || p.imageUrl || "/placeholder.png"}
                    alt={p.title || p.name}
                    className="w-full h-28 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-semibold">
                      {p.title || p.name || "بدون عنوان"}
                    </p>
                    <p className="text-sm text-slate-300">
                      {p.categoryName || ""}
                    </p>
                    <p className="text-sm text-slate-200 mt-1">
                      المخزون: {p.stock ?? 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/30 p-6 rounded-2xl border border-emerald-700/30">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={28} className="text-lime-300" />
              <h3 className="text-xl font-bold">تحليل الذكاء الاصطناعي</h3>
            </div>
            <div className="text-sm text-slate-200 max-h-72 overflow-auto leading-relaxed">
              {analysis || "لا توجد نتائج تحليلية حالياً."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== Subcomponents ====== */
function KPICard({
  icon: Icon,
  label,
  value,
  gradient = "from-emerald-500 to-emerald-600",
}) {
  return (
    <div
      className={`p-4 rounded-2xl shadow-md bg-gradient-to-br ${gradient} h-36 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-white/90 font-medium">{label}</p>
        <Icon size={26} className="text-white/80" />
      </div>
      <p className="text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 p-4 border border-emerald-700/10">
      <h4 className="text-md font-bold mb-3 text-slate-200">{title}</h4>
      <div style={{ width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}
