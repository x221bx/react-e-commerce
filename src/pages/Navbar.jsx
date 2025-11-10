import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { signOut } from "../features/auth/authSlice";

export default function Navbar() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(signOut());
  };

  return (
    <nav className="bg-[#2F7E80] text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* شعار الموقع */}
        <NavLink
          to="/"
          className="text-lg font-bold tracking-wide hover:text-[#B8E4E6] transition"
        >
          🌿 GreenMarket
        </NavLink>

        {/* روابط الناف */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-[#B8E4E6] transition ${
                isActive ? "underline font-semibold" : ""
              }`
            }
          >
            Home
          </NavLink>

          {/* 🔐 لو المستخدم أدمن يظهر رابط الأدمن */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className="hover:text-[#B8E4E6] transition font-medium"
            >
              Admin Dashboard
            </NavLink>
          )}

          {/* 👤 حالة المستخدم */}
          {user ? (
            <>
              <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                Hi, {user.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-[#2F7E80] px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#B8E4E6] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="bg-white text-[#2F7E80] px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#B8E4E6] transition"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="text-sm font-medium hover:text-[#B8E4E6]"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
