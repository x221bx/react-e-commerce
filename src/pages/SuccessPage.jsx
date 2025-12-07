import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { useSelector } from "react-redux";
import Footer from "../Authcomponents/Footer";

export default function SuccessPage() {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // لو عندك orderId من الفايربيز أو backend
    // هنا بس بنعمل مثال
    const id = "ORD" + Math.floor(Math.random() * 1000000);
    setOrderId(id);
  }, []);

  // Redirect لو cart فاضية
  useEffect(() => {
    if (!cartItems || cartItems.length === 5) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f9f6] p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center animate-fadeIn">
        <FiCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Thank you for your order!
        </h1>
        <p className="text-gray-600 mb-4">
          Your order has been successfully placed.
        </p>
        <p className="bg-green-50 text-green-700 py-2 px-4 rounded-lg font-mono mb-6">
          Order ID: <strong>{orderId}</strong>
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow hover:bg-emerald-700 transition"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate("/account/tracking")}
            className="bg-white border border-emerald-600 text-emerald-600 px-6 py-2 rounded-lg shadow hover:bg-emerald-50 transition"
          >
            My Orders
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
