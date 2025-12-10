// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import i18n from "./i18n";
import ProtectedRoute from "./Authcomponents/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import { Toaster } from "react-hot-toast";
import { auth, db } from "./services/firebase";
import { setCurrentUser, setAuthInitialized } from "./features/auth/authSlice";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
// import AdminMessages from "./pages/admin/AdminMessages";

// Lazy load all components for better performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Reset = lazy(() => import("./pages/Reset"));
const Home = lazy(() => import("./pages/Home"));

const Products = lazy(() => import("./pages/Products"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Cart = lazy(() => import("./pages/Cart"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));
const ContactUs = lazy(() => import("./pages/contactus"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));

const ArticlesList = lazy(() => import("./pages/articles/ArticlesList"));
const ArticleDetails = lazy(() => import("./pages/articles/ArticleDetails"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const OrderTracking = lazy(() => import("./pages/account/OrderTracking"));
const OrderHistory = lazy(() => import("./pages/account/OrderHistory"));
const OrderInvoice = lazy(() => import("./pages/account/OrderInvoice"));
const SavedProducts = lazy(() => import("./pages/account/SavedProducts"));
const FavoriteArticles = lazy(() => import("./pages/account/FavoriteArticles"));
const SupportCenterProfessional = lazy(() => import("./pages/account/SupportCenterProfessional"));
const Complaints = lazy(() => import("./pages/account/Complaints"));
const PaymentMethods = lazy(() => import("./pages/account/PaymentMethods"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminComplaints = lazy(() => import("./pages/admin/AdminComplaintsDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./pages/admin/AdminOrderDetails"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ChatBot = lazy(() => import("./components/Ai/ChatBot"));
const AiConversations = lazy(() => import("./pages/account/AiConversations"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaypalCallback = lazy(() => import("./pages/PaypalCallback"));
const PaymobCallback = lazy(() => import("./pages/PaymobCallback"));

// Loading component for Suspense fallback
const LoadingSpinner = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    {text && <p className="text-gray-600 dark:text-gray-300">{text}</p>}
  </div>
);

export default function App() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Listen to Firebase Auth state changes and sync with Redux
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User is signed in, fetch their profile data
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            let username = userData.username || "";

            // If no username in user doc, try to find it in usernames collection
            if (!username) {
              const usernameQuery = query(
                collection(db, "usernames"),
                where("uid", "==", firebaseUser.uid)
              );
              const usernameDocs = await getDocs(usernameQuery);
              if (!usernameDocs.empty) {
                username = usernameDocs.docs[0].id;
              }
            }

            const isAdmin = userData.isAdmin || userData.role === "admin";

            const userPayload = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName,
              username,
              isAdmin,
              role: isAdmin ? "admin" : "user",
            };

            dispatch(setCurrentUser(userPayload));
            // Store in localStorage for persistence
            localStorage.setItem("authUser", JSON.stringify(userPayload));
          } else {
            // User document doesn't exist, sign them out
            console.warn("User document not found, signing out");
            dispatch(setCurrentUser(null));
            localStorage.removeItem("authUser");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          dispatch(setCurrentUser(null));
          localStorage.removeItem("authUser");
        }
      } else {
        // User is signed out
        dispatch(setCurrentUser(null));
        localStorage.removeItem("authUser");
      }

      // Mark auth as initialized
      dispatch(setAuthInitialized(true));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

       <Toaster
        position={i18n.language === "ar" ? "top-left" : "top-right"}
        reverseOrder={false}
      />

      {/* Routes */}
      <Suspense fallback={<LoadingSpinner text={t("common.loading", "Loading...")} />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/category/:categoryId" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />{" "}
          {/* ده الصح */}
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/articles" element={<ArticlesList />} />
          <Route path="/articles/:articleId" element={<ArticleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/about" element={<About />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/paypal/callback" element={<PaypalCallback />} />
          <Route path="/paymob/callback" element={<PaymobCallback />} />
          <Route path="/paymob-result" element={<PaymobCallback />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/success" element={<SuccessPage />} />
          {/* Authenticated User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/checkout/confirmation"
              element={<OrderConfirmation />}
            />
              <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="tracking" replace />} />
              <Route
                path="settings"
                element={<UserSettings variant="embedded" />}
              />
              <Route path="payments" element={<PaymentMethods />} />
              <Route path="OrderHistory" element={<OrderHistory />} />
              <Route path="tracking" element={<OrderTracking />} />
              <Route path="tracking/:orderId" element={<OrderTracking />} />
              <Route path="invoice/:orderId" element={<OrderInvoice />} />
              <Route path="saved" element={<SavedProducts />} />
              <Route path="articles" element={<FavoriteArticles />} />
              <Route path="ai" element={<AiConversations />} />
              <Route path="support" element={<SupportCenterProfessional />} />
              <Route path="complaints" element={<Complaints />} />
            </Route>
          </Route>
          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetails />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="complaints" element={<AdminComplaints />} />
            </Route>
          </Route>
          {/* Forbidden */}
          <Route
            path="/403"
            element={
              <div className="flex h-screen items-center justify-center flex-col">
                <h1 className="text-4xl font-bold text-red-600">
                  {t("errors.403_code")} {t("errors.403_title")}
                </h1>
                <p className="text-gray-600 mt-2 dark:text-gray-300">
                  {t("errors.403_message")}
                </p>
              </div>
            }
          />
          {/* Not Found - Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ChatBot />
    </div>
  );
}
