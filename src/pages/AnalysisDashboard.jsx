// src/pages/AnalysisDashboard.jsx
// Dashboard uses Firebase collections (products, categories, users, orders).

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { analyzeWithGemini } from "../utils/gemini";
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
    TrendingUp,
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    RefreshCw,
    Sparkles,
    PackageCheck,
    AlertCircle,
    Tag,
    Calendar,
} from "lucide-react";
import { format } from "date-fns";

const COLORS = [
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
];

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState("جاري تحليل البيانات...");

    // البيانات الخام من Firebase
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);

    // الحسابات الديناميكية (useMemo عشان الأداء)
    const stats = useMemo(() => {
        // منتجات
        const totalProducts = products.length;
        const availableProducts = products.filter((p) => (p.stock || 0) > 0).length;
        const outOfStock = totalProducts - availableProducts;
        const lowStockCount = products.filter(
            (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5
        ).length;

        // فئات
        const totalCategories = categories.length;

        // مستخدمين
        const totalUsers = users.length;

        // طلبات & مبيعات
        const totalOrders = orders.length;
        const totalSales = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
        const avgOrderValue =
            totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

        // عملاء متكررين
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
        const repeatRevenue = repeatCustomers.reduce((s, c) => s + c.revenue, 0);
        const repeatRate =
            Object.keys(customerMap).length > 0
                ? (
                    (repeatCustomers.length / Object.keys(customerMap).length) *
                    100
                ).toFixed(1)
                : "0";

        // أحدث 6 منتجات
        const recentProducts = [...products]
            .sort(
                (a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)
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
            repeatRevenue,
            recentProducts,
            customerMap,
        };
    }, [products, categories, users, orders]);

    // Charts Data
    const charts = useMemo(() => {
        // 1. تريند المبيعات اليومي
        const dailySalesMap = {};
        orders.forEach((o) => {
            const dateKey = format(o.createdAt || new Date(), "dd/MM");
            dailySalesMap[dateKey] =
                (dailySalesMap[dateKey] || 0) + (o.totalValue || 0);
        });
        const dailySales = Object.keys(dailySalesMap)
            .map((date) => ({ date, amount: dailySalesMap[date] }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 2. توزيع المنتجات (Pie)
        const productDistribution = [
            { name: "متوفر", value: stats.availableProducts, color: "#10B981" },
            { name: "نفد", value: stats.outOfStock, color: "#EF4444" },
            { name: "منخفض المخزون", value: stats.lowStockCount, color: "#F59E0B" },
        ];

        // 3. نمو المستخدمين (Bar)
        const usersByMonth = {};
        users.forEach((u) => {
            const month = format(u.createdAt?.toDate() || new Date(), "MMM yyyy");
            usersByMonth[month] = (usersByMonth[month] || 0) + 1;
        });
        const userGrowth = Object.keys(usersByMonth)
            .map((month) => ({ month, users: usersByMonth[month] }))
            .sort((a, b) => new Date(a.month) - new Date(b.month));

        // 4. مبيعات حسب المنتج
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

        // 5. أفضل العملاء
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
    }, [stats, orders, users]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // جلب الكولكشنز بالتوازي
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

            const productsList = productsSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const categoriesList = catsSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const usersList = usersSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const ordersList = ordersSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                totalValue:
                    doc.data().total ||
                    doc.data().totals?.total ||
                    (doc.data().totals?.subtotal || 0) +
                    (doc.data().totals?.shipping || 0) ||
                    0,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));

            setProducts(productsList);
            setCategories(categoriesList);
            setUsers(usersList);
            setOrders(ordersList);

            // AI Analysis
            const aiText = await analyzeWithGemini(ordersList);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
            <div className="max-w-full mx-auto p-6 lg:p-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                        لوحة التحكم الإدارية الشاملة
                    </h1>
                    <button
                        onClick={fetchAllData}
                        className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl shadow-xl transition"
                    >
                        <RefreshCw className={loading ? "animate-spin" : ""} size={22} />
                        تحديث الكل
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-2xl animate-pulse">
                            جاري تحميل البيانات من Firebase...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* KPIs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
                            <KPICard
                                icon={Package}
                                label="إجمالي المنتجات"
                                value={stats.totalProducts}
                                gradient="from-blue-500 to-cyan-600"
                            />
                            <KPICard
                                icon={PackageCheck}
                                label="متوفر"
                                value={stats.availableProducts}
                                gradient="from-emerald-500 to-teal-600"
                            />
                            <KPICard
                                icon={AlertCircle}
                                label="نفد المخزون"
                                value={stats.outOfStock}
                                gradient="from-red-500 to-rose-600"
                            />
                            <KPICard
                                icon={Tag}
                                label="الفئات"
                                value={stats.totalCategories}
                                gradient="from-purple-500 to-pink-600"
                            />
                            <KPICard
                                icon={Users}
                                label="المستخدمين"
                                value={stats.totalUsers}
                                gradient="from-orange-500 to-amber-600"
                            />
                            <KPICard
                                icon={ShoppingCart}
                                label="الطلبات"
                                value={stats.totalOrders}
                                gradient="from-indigo-500 to-purple-600"
                            />
                            <KPICard
                                icon={DollarSign}
                                label="إجمالي المبيعات"
                                value={`${stats.totalSales.toLocaleString()} ج.م`}
                                gradient="from-emerald-600 to-teal-700"
                            />
                            <KPICard
                                icon={TrendingUp}
                                label="متوسط الطلب"
                                value={`${stats.avgOrderValue.toLocaleString()} ج.م`}
                                gradient="from-pink-500 to-rose-600"
                            />
                            <KPICard
                                icon={AlertCircle}
                                label="منخفض المخزون"
                                value={stats.lowStockCount}
                                gradient="from-yellow-500 to-orange-600"
                            />
                            <KPICard
                                icon={Users}
                                label="معدل التكرار"
                                value={`${stats.repeatRate}%`}
                                gradient="from-cyan-500 to-blue-600"
                            />
                        </div>

                        {/* Main Charts Row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
                            <ChartCard title="تريند المبيعات اليومي">
                                <ResponsiveContainer width="100%" height={420}>
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
                                            stroke="#EC4899"
                                            strokeWidth={5}
                                            dot={{ fill: "#8B5CF6", r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="نمو المستخدمين الشهري">
                                <ResponsiveContainer width="100%" height={420}>
                                    <BarChart data={charts.userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="month" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1e293b",
                                                borderRadius: "12px",
                                            }}
                                        />
                                        <Bar
                                            dataKey="users"
                                            fill="#8B5CF6"
                                            radius={[12, 12, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Secondary Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                            <ChartCard title="توزيع حالة المنتجات">
                                <ResponsiveContainer width="100%" height={380}>
                                    <PieChart>
                                        <Pie
                                            data={charts.productDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={130}
                                            paddingAngle={5}
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {charts.productDistribution.map((e, i) => (
                                                <Cell key={i} fill={e.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
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
                                            fill="#F59E0B"
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
                                            fill="#10B981"
                                            radius={[12, 12, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        {/* Recent Products + AI Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ChartCard title="أحدث المنتجات">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {stats.recentProducts.map((p) => (
                                        <div
                                            key={p.id}
                                            className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-purple-500/20 hover:border-purple-400 transition"
                                        >
                                            <img
                                                src={
                                                    p.thumbnailUrl || p.images?.[0] || "/placeholder.png"
                                                }
                                                alt={p.title}
                                                className="w-full h-40 object-cover rounded-lg mb-3"
                                            />
                                            <p className="text-sm font-semibold truncate">
                                                {p.title || "بدون عنوان"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {p.category?.name || "غير مصنف"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                المخزون: {p.stock || 0}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>

                            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-purple-500/30">
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

// Components
function KPICard({ icon: Icon, label, value, gradient }) {
    return (
        <div
            className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300`}
        >
            <div className="flex items-center justify-between mb-3 kpi-text">
                <p className="text-white/80 text-sm">{label}</p>
                <Icon size={36} className="opacity-80 kpi-icon" />
            </div>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                {title}
            </h2>
            {children}
        </div>
    );
}
