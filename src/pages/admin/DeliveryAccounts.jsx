import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  FiTruck,
  FiMail,
  FiPhone,
  FiUser,
  FiPlus,
  FiRefreshCw,
  FiMapPin,
  FiShield,
  FiKey,
  FiUserCheck,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  createDeliveryAccount,
  listDeliveryAccounts,
  updateDeliveryAccount,
  deactivateDeliveryAccount,
  sendDeliveryPasswordReset,
  deleteDeliveryAccount,
} from "../../services/deliveryService";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";

const defaultForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  vehicleType: "",
  zone: "",
};

export default function DeliveryAccounts() {
  const admin = useSelector(selectCurrentUser);
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", vehicleType: "", zone: "", active: true });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [disablingId, setDisablingId] = useState(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await listDeliveryAccounts();
      setAccounts(
        data
          .map((d) => ({
            ...d,
            createdAt:
              d.createdAt?.toDate?.()?.toISOString?.() ||
              d.createdAt ||
              null,
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.id)?.getTime?.() -
              new Date(a.createdAt || a.id)?.getTime?.()
          )
      );
    } catch (err) {
      console.error("Failed to fetch delivery accounts", err);
      toast.error(err.message || "Failed to fetch delivery accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating) return;

    if (!form.name || !form.email || !form.username || !form.password) {
      toast.error("Name, email, username, and password are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      await createDeliveryAccount({
        ...form,
        createdBy: admin,
      });
      toast.success("Delivery account created");
      setForm(defaultForm);
      await loadAccounts();
    } catch (err) {
      console.error("Create delivery account failed", err);
      toast.error(err.message || "Failed to create delivery account");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (acc) => {
    setEditingId(acc.id);
    setEditForm({
      name: acc.name || "",
      phone: acc.phone || "",
      vehicleType: acc.vehicleType || "",
      zone: acc.zone || "",
      username: acc.username || "",
      active: acc.active !== false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSavingId(editingId);
    try {
      await updateDeliveryAccount(editingId, editForm);
      toast.success("Delivery account updated");
      setEditingId(null);
      await loadAccounts();
    } catch (err) {
      console.error("Update delivery account failed", err);
      toast.error(err.message || "Failed to update delivery account");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (acc) => {
    if (!acc?.id) return;
    if (!window.confirm(`Delete ${acc.name || acc.email}? This cannot be undone.`)) return;
    setDeletingId(acc.id);
    try {
      await deleteDeliveryAccount(acc.id);
      toast.success("Delivery account deleted");
      if (editingId === acc.id) setEditingId(null);
      await loadAccounts();
    } catch (err) {
      console.error("Delete delivery account failed", err);
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDisable = async (acc) => {
    if (!acc?.id) return;
    if (!window.confirm(`Disable ${acc.name || acc.email}?`)) return;
    setDisablingId(acc.id);
    try {
      await deactivateDeliveryAccount(acc.id, admin);
      toast.success("Delivery account disabled");
      if (editingId === acc.id) setEditingId(null);
      await loadAccounts();
    } catch (err) {
      console.error("Disable delivery account failed", err);
      toast.error(err.message || "Failed to disable account");
    } finally {
      setDisablingId(null);
    }
  };

  const totalActive = useMemo(
    () => accounts.filter((a) => a.active !== false).length,
    [accounts]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-500 font-semibold">
            Delivery Ops
          </p>
          <h1 className="text-2xl font-bold">Delivery Accounts</h1>
          <p className="text-sm text-slate-500  -slate-300">
            Create and manage courier logins. Admin sessions stay intact while creating new users.
          </p>
        </div>
        <button
          onClick={loadAccounts}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm transition ${
            isDark
              ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
          }`}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total couriers"
          value={accounts.length}
          icon={<FiTruck />}
          isDark={isDark}
        />
        <StatCard
          title="Active couriers"
          value={totalActive}
          icon={<FiShield />}
          isDark={isDark}
        />
        <StatCard
          title="Zones covered"
          value={new Set(accounts.map((a) => a.zone || "N/A")).size}
          icon={<FiMapPin />}
          isDark={isDark}
        />
      </div>

      <div
        className={`rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <FiPlus />
          </div>
          <div>
            <p className="text-sm font-semibold">Create delivery account</p>
            <p className="text-xs text-slate-500  -slate-400">
              Generates a Firebase auth user with the delivery role.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            icon={<FiUser />}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            icon={<FiMail />}
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            helper="Used for login. Must be unique."
          />
          <Input
            label="Temporary password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            helper="Share it with the courier and ask them to change it."
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            icon={<FiPhone />}
          />
          <Input
            label="Vehicle / Notes"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            icon={<FiTruck />}
            placeholder="Bike / Car / Van"
          />
          <Input
            label="Zone / City"
            value={form.zone}
            onChange={(e) => setForm({ ...form, zone: e.target.value })}
            icon={<FiMapPin />}
            placeholder="Cairo, Giza..."
          />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              {creating ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/70 border-b-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus /> Create account
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div
        className={`rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Delivery roster</p>
            <p className="text-xs text-slate-500  -slate-400">
              {loading ? "Fetching..." : `${accounts.length} account(s)`}
            </p>
          </div>
          <button
            onClick={loadAccounts}
            className="inline-flex items-center gap-2 text-sm text-emerald-600  -emerald-300"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Reload
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className={isDark ? "bg-slate-800/60" : "bg-slate-50"}>
              <tr className="text-left">
                <Th>Courier</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Zone</Th>
                <Th>Vehicle</Th>
                <Th>Username</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">
                    No delivery accounts yet.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const isEditing = editingId === acc.id;
                  return (
                    <tr
                      key={acc.id}
                      className={`border-t ${
                        isDark ? "border-slate-800" : "border-slate-100"
                      }`}
                    >
                      <Td>
                        {isEditing ? (
                          <input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm bg-white   border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          <>
                            <div className="font-semibold text-emerald-700  -emerald-300">
                              {acc.name || acc.username}
                            </div>
                            <div className="text-xs text-slate-500">
                              @{acc.username}
                            </div>
                          </>
                        )}
                      </Td>
                      <Td>{acc.email}</Td>
                      <Td>
                        {isEditing ? (
                          <input
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, phone: e.target.value }))
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm bg-white   border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          acc.phone || "-"
                        )}
                      </Td>
                      <Td>
                        {isEditing ? (
                          <input
                            value={editForm.zone}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, zone: e.target.value }))
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm bg-white   border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          acc.zone || "-"
                        )}
                      </Td>
                      <Td>
                        {isEditing ? (
                          <input
                            value={editForm.vehicleType}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, vehicleType: e.target.value }))
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm bg-white   border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          acc.vehicleType || "-"
                        )}
                      </Td>
                      <Td>
                        {isEditing ? (
                          <input
                            value={editForm.username || acc.username || ""}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, username: e.target.value }))
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm bg-white   border-slate-300 dark:border-slate-700"
                          />
                        ) : (
                          <span>@{acc.username}</span>
                        )}
                      </Td>
                      <Td>
                        {isEditing ? (
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!editForm.active}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, active: e.target.checked }))
                              }
                            />
                            Active
                          </label>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              acc.active !== false
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40  -emerald-200"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40  -rose-200"
                            }`}
                          >
                            {acc.active !== false ? "Active" : "Inactive"}
                          </span>
                        )}
                      </Td>
                      <Td>
                        {acc.createdAt
                          ? new Date(acc.createdAt).toLocaleString()
                          : "-"}
                      </Td>
                      <Td>
                        {isEditing ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={savingId === acc.id}
                              className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold disabled:opacity-60 flex items-center gap-1"
                            >
                              {savingId === acc.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 rounded-md border text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                setResettingId(acc.id);
                                try {
                                  await sendDeliveryPasswordReset(acc.email);
                                  toast.success("Password reset email sent");
                                } catch (err) {
                                  toast.error(err.message || "Failed to send reset email");
                                } finally {
                                  setResettingId(null);
                                }
                              }}
                              disabled={resettingId === acc.id}
                              className="px-3 py-1 rounded-md border text-xs font-semibold flex items-center gap-1"
                            >
                              <FiKey />
                              {resettingId === acc.id ? "Sending..." : "Reset pass"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => startEdit(acc)}
                              className="px-3 py-1 rounded-md border text-xs font-semibold flex items-center gap-1"
                            >
                              <FiUserCheck /> Edit
                            </button>
                            <button
                              onClick={() => handleDisable(acc)}
                              disabled={disablingId === acc.id}
                              className="px-3 py-1 rounded-md bg-amber-500 text-white text-xs font-semibold disabled:opacity-60 flex items-center gap-1"
                            >
                              {disablingId === acc.id ? "Working..." : "Disable"}
                            </button>
                            <button
                              onClick={() => handleDelete(acc)}
                              disabled={deletingId === acc.id}
                              className="px-3 py-1 rounded-md bg-rose-600 text-white text-xs font-semibold disabled:opacity-60 flex items-center gap-1"
                            >
                              <FiTrash2 />
                              {deletingId === acc.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isDark }) {
  return (
    <div
      className={`rounded-xl border shadow-sm p-4 flex items-center gap-3 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500  -slate-400">
          {title}
        </p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Input({ label, helper, icon, ...rest }) {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const inputClass = isDark
    ? "bg-slate-100 text-slate-900 border-slate-200 placeholder:text-slate-500"
    : "bg-white text-slate-900 border-slate-200 placeholder:text-slate-500";

  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      <span className="text-slate-700  -slate-800 flex items-center gap-2">
        {icon && <span className="text-emerald-500">{icon}</span>}
        {label}
      </span>
      <input
        {...rest}
        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${inputClass}`}
      />
      {helper && (
        <span className="text-xs text-slate-500  -slate-500">
          {helper}
        </span>
      )}
    </label>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500  -slate-300">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
