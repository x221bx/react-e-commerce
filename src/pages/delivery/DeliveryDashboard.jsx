// scr/pages/delivery/DeliveryDashboard.jsx
import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiTruck,
  FiCheckCircle,
  FiPhone,
  FiUser,
  FiPackage,
  FiRefreshCw,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiMail,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useOrders from "../../hooks/useOrders";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";

const statusTone = {
  "Out for delivery":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30  -amber-100 dark:border-amber-700/40",
  Delivered:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30  -emerald-100 dark:border-emerald-700/40",
  Canceled:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30  -rose-100 dark:border-rose-700/40",
  Processing:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30  -sky-100 dark:border-sky-700/40",
  Pending:
    "bg-slate-50 text-slate-800 border-slate-300 dark:bg-slate-800/40  -slate-100 dark:border-slate-700/50",
};

export default function DeliveryDashboard() {
  const { theme, toggle } = UseTheme(); // هنا استخدم toggle بدل setTheme
  const isDark = theme === "dark";
  const driver = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const { orders, loading, updateOrderStatus, refreshOrders } = useOrders(
    null,
    true
  );
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelNote, setCancelNote] = useState("");
  const [expanded, setExpanded] = useState({});

  const completedOrders = useMemo(() => {
    const driverId = driver?.uid || "__none__";
    return orders.filter(
      (o) =>
        (o.assignedDeliveryId || o.deliveryId) === driverId &&
        ["Delivered", "Canceled"].includes((o.status || "").trim())
    );
  }, [orders, driver]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const driverId = driver?.uid || "__none__";
    const assigned = orders.filter(
      (o) =>
        (o.assignedDeliveryId || o.deliveryId) === driverId &&
        !["Delivered", "Canceled"].includes((o.status || "").trim())
    );

    if (!q) return assigned;

    return assigned.filter((o) => {
      const num = (o.orderNumber || "").toString().toLowerCase();
      const phone = (o.phone || "").toLowerCase();
      const name = (o.fullName || "").toLowerCase();
      return num.includes(q) || phone.includes(q) || name.includes(q);
    });
  }, [orders, query, driver]);

  const handleUpdate = async (order, newStatus, note) => {
    if ((order.assignedDeliveryId || order.deliveryId) !== driver?.uid) {
      toast.error("You are not assigned to this order.");
      return;
    }
    setUpdating(`${order.id}-${newStatus}`);
    try {
      await updateOrderStatus(order.id, newStatus, null, "delivery", {
        actorId: driver?.uid,
        actorName: driver?.name || driver?.username || driver?.email,
        note: note || "",
        paymentMethod: order.paymentMethod,
      });
      toast.success(`Order #${order.orderNumber} marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setUpdating(null);
      setCancelTarget(null);
      setCancelNote("");
    }
  };

  const openCancel = (order) => {
    setCancelTarget(order);
    setCancelNote("");
  };

  const submitCancel = () => {
    if (!cancelTarget) return;
    if (!cancelNote.trim()) {
      toast.error("Please add a detailed cancellation reason.");
      return;
    }
    if (cancelNote.trim().length < 20) {
      toast.error("Please provide more details (minimum 20 characters).");
      return;
    }
    
    // Check if payment method is specified in the note
    const isPrepaid = cancelTarget.paymentMethod !== "cod";
    if (isPrepaid && !cancelNote.toLowerCase().includes("refund")) {
      toast.error("For prepaid orders, please mention the refund process in your reason.");
      return;
    }
    
    handleUpdate(cancelTarget, "Canceled", cancelNote.trim());
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className={`min-h-[70vh] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <p className="text-sm font-semibold text-emerald-600">Delivery workspace</p>
          <h1 className="text-3xl font-extrabold">Delivery Control</h1>
          <p className="text-sm text-slate-800  -slate-300">
            Search by order number, phone, or name. Update status or cancel with a note the admin can see.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 border text-sm ${
              isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="text-left leading-tight">
              <div className="font-semibold">{driver?.name || "Courier"}</div>
              <div className="text-xs text-slate-700">{driver?.email}</div>
            </div>
          </div>

          {/* زرار تغيير الثيم */}
          <button
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={() => dispatch(signOut())}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-700"
          >
            <FiLogOut /> Logout
          </button>
          <Link
            to="/delivery/profile"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-slate-900  -emerald-200 dark:border-slate-700"
          >
            Profile
          </Link>
          <button
            onClick={refreshOrders}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
            }`}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border shadow-sm p-4 mb-6 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500  -slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order number, phone, or customer name"
              className={`w-full rounded-xl pl-10 pr-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-400"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              }`}
            />
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              isDark ? "bg-slate-800" : "bg-emerald-50"
            }`}
          >
            <FiTruck className="text-emerald-500" />
            <div className="text-sm">
              <div className="font-semibold">Assigned to you</div>
              <div className="text-xs text-slate-700">
                {filteredOrders.length} active orders
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-700">
          No active deliveries assigned to you.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const badge =
              statusTone[order.status] ||
              "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50  -slate-100 dark:border-slate-700";
            return (
              <div
                key={order.id}
                className={`rounded-2xl border shadow-sm p-5 ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <FiPackage />
                      <span className="font-bold text-base md:text-lg text-slate-900  -slate-100">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${badge}`}
                      >
                        <FiClock className="w-3 h-3" />
                        {order.status}
                      </span>
                    </div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <FiUser />
                      {order.fullName || "Customer"}
                    </div>
                    <div className="text-sm text-slate-800 flex items-center gap-2">
                      <FiPhone /> {order.phone || "No phone"}
                    </div>
                    <div className="text-sm text-slate-800 flex items-center gap-2">
                      <FiMail /> {order.userEmail || "No email"}
                    </div>
                    <div className="text-xs text-slate-700 flex items-center gap-2">
                      <FiMapPin />
                      {order.address || order.shipping?.addressLine1 || "-"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status !== "Out for delivery" && (
                      <ActionButton
                        label="Out for delivery"
                        onClick={() => handleUpdate(order, "Out for delivery")}
                        loading={updating === `${order.id}-Out for delivery`}
                        variant="ghost"
                      />
                    )}
                    <ActionButton
                      label="Delivered"
                      onClick={() => handleUpdate(order, "Delivered")}
                      loading={updating === `${order.id}-Delivered`}
                      icon={<FiCheckCircle />}
                    />
                    <ActionButton
                      label="Cancel"
                      onClick={() => openCancel(order)}
                      loading={updating === `${order.id}-Canceled`}
                      icon={<FiXCircle />}
                      variant="danger"
                    />
                  </div>
                </div>

                {/* Order meta + items */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-700  -slate-300">
                  <div className={`rounded-lg px-3 py-2 border ${badge}`}>
                    {order.items?.length || 0} item(s)
                  </div>
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800  -slate-100"
                  >
                    {expanded[order.id] ? <FiChevronUp /> : <FiChevronDown />}
                    {expanded[order.id] ? "Hide details" : "View details"}
                  </button>
                </div>

                {expanded[order.id] && (
                  <div className="mt-3 space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/40 text-slate-800  -slate-200">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">Items</p>
                      {(order.items || []).map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-700 py-2"
                        >
                          <span className="font-semibold text-slate-800  -slate-100">
                            {it.name || it.title}
                          </span>
                          <span className="text-slate-700  -slate-300">
                            {it.quantity} x {Number(it.price).toLocaleString()} EGP
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">Status history</p>
                      {(order.statusHistory || []).map((h, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-slate-800  -slate-300 flex items-center gap-3"
                        >
                          <span className="font-semibold">{h.status}</span>
                          <span className="text-slate-700">
                            {h.changedAt ? new Date(h.changedAt).toLocaleString() : "-"}
                          </span>
                          {h.note && (
                            <span className="italic text-rose-500">
                              “{h.note}”
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-3 text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${
                    isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  <FiTruck />
                  Last update:{" "}
                  {order.statusHistory?.length
                    ? new Date(
                        order.statusHistory[order.statusHistory.length - 1]
                          .changedAt
                      ).toLocaleString()
                    : "-"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity log */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Activity log</h2>
          <span className="text-sm text-slate-700  -slate-300">
            Delivered / canceled orders you handled
          </span>
        </div>
        {completedOrders.length === 0 ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"
            }`}
          >
            No completed orders yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {completedOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                  isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"
                }`}
              >
                <div className="space-y-1">
                    <div className="text-base font-bold text-slate-900  -slate-100">
                      #{order.orderNumber} — {order.fullName || "Customer"}
                    </div>
                  <div className="text-xs text-slate-500  -slate-300 flex items-center gap-2">
                    <FiClock />{" "}
                    {order.statusHistory?.length
                      ? new Date(
                          order.statusHistory[order.statusHistory.length - 1]?.changedAt
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {order.status === "Delivered" ? (
                    <span className="text-emerald-600  -emerald-300">
                      Delivered
                    </span>
                  ) : (
                    <span className="text-rose-600  -rose-300">
                      Canceled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500 font-semibold">
                  Cancel order
                </p>
                <h3 className="text-xl font-bold mt-1">
                  #{cancelTarget.orderNumber} — {cancelTarget.fullName}
                </h3>
                <p className="text-sm text-slate-500  -slate-300">
                  Add a clear reason. Customer will see it, and admin notes will
                  store it.
                </p>
              </div>
              <button
                onClick={() => setCancelTarget(null)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <FiXCircle size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-sm font-semibold">Cancellation Reason</label>
              <textarea
                className={`w-full rounded-xl border px-3 py-2 text-sm min-h-[120px] ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
                placeholder="Example: Customer requested cancellation; refund to original payment method. Cash on delivery: address unclear."
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
              />
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">Important:</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Prepaid orders:</strong> Customer's money was already deducted. Clearly state refund process and timeline.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  <strong>COD orders:</strong> No money deducted. Explain why delivery couldn't be completed.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold border ${
                  isDark
                    ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Close
              </button>
              <button
                onClick={submitCancel}
                disabled={updating === `${cancelTarget.id}-Canceled`}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {updating === `${cancelTarget.id}-Canceled` ? (
                  <span className="h-4 w-4 border-2 border-white/70 border-b-transparent rounded-full animate-spin" />
                ) : (
                  <FiXCircle />
                )}
                Cancel order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ label, onClick, loading, variant = "solid", icon }) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition";

  const styles =
    variant === "ghost"
      ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30  -amber-100"
      : variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-emerald-600 text-white hover:bg-emerald-700";

  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${styles} disabled:opacity-60`}>
      {loading ? (
        <span className="h-4 w-4 border-2 border-white/60 border-b-transparent rounded-full animate-spin" />
      ) : (
        icon || <FiTruck />
      )}
      {label}
    </button>
  );
}
