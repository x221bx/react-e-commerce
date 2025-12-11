import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, signOut } from "../../features/auth/authSlice";
import { UseTheme } from "../../theme/ThemeProvider";
import { FiUser, FiMail, FiPhone, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function DeliveryProfile() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen px-4 py-10 flex items-center justify-center ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-slate-900"
      }`}
    >
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-xl p-8 ${
          isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-emerald-500 uppercase tracking-[0.2em]">
              Delivery profile
            </p>
            <h1 className="text-3xl font-extrabold">Courier Account</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Keep your info handy. Contact admin if anything needs an update.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/delivery"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border text-sm font-semibold bg-transparent border-slate-300 dark:border-slate-700"
            >
              <FiArrowLeft /> Back
            </Link>
            <button
              onClick={() => dispatch(signOut())}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div
            className={`rounded-2xl p-5 border ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl font-bold">
                <FiUser />
              </div>
              <div>
                <p className="text-xs uppercase text-emerald-500 font-semibold">Name</p>
                <p className="text-lg font-bold">{user?.name || "Courier"}</p>
                <p className="text-sm text-slate-500">
                  Username: {user?.username || "-"}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FiMail /> {user?.email || "No email"}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FiPhone /> {user?.phone || "No phone"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Role: Delivery
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 border ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-sm font-semibold mb-2">Quick tips</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>Mark orders promptly to keep tracking accurate.</li>
              <li>Use clear notes when canceling; customers see them.</li>
              <li>Contact admin if your assignment list looks wrong.</li>
            </ul>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Need changes? Email support or ping admin in the roster.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
