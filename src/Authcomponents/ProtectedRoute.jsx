// Authcomponents/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  selectCurrentUser,
  selectIsAuthInitialized,
} from "../features/auth/authSlice";

export default function ProtectedRoute({ requireAdmin = false }) {
  const user = useSelector(selectCurrentUser);
  const isInitialized = useSelector(selectIsAuthInitialized);

  // أثناء تحميل حالة المستخدم
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  // لو المستخدم مش داخل أصلاً
  if (!user) return <Navigate to="/login" replace />;

  // لو الصفحة للأدمن فقط والمستخدم مش أدمن
  if (requireAdmin && !user.isAdmin) return <Navigate to="/403" replace />;

  // عرض الصفحة المطلوبة
  return <Outlet />;
}
