import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from ".//Authcomponents/ProtectedRoute";

// صفحاتك
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Home from "./pages/Home"; // مثلًا
import Dashboard from "./pages/Dashboard"; // صفحة محمية

export default function App() {
  return (
    <Router>
      <Routes>
        {/* صفحات عامة */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />

        {/* صفحات محمية */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
