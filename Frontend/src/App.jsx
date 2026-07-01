import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import ProtectedAdminRoute from "./pages/Admin/ProtectedAdminRoute";
import { AdminProvider } from "./pages/Admin/contexts/AdminContext";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Main/Home"));
const Products = lazy(() => import("./pages/Main/Products"));
const About = lazy(() => import("./pages/Main/About"));
const Contact = lazy(() => import("./components/layout/Contact"));
const ProductDetails = lazy(() => import("./pages/Main/ProductDetails"));
const Wishlist = lazy(() => import("./pages/Main/Wishlist"));
const Cart = lazy(() => import("./pages/Main/Cart"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const PaymentMethods = lazy(() => import("./components/PaymentMethods/PaymentPage"));
const OrderConfirmation = lazy(() => import("./pages/Main/OrderConfirmation"));
const Profile = lazy(() => import("./pages/Main/Profile"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminHome = lazy(() => import("./pages/Admin/AdminHome"));
const AdminProducts = lazy(() => import("./pages/Admin/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUserDetails"));
const AdminOrders = lazy(() => import("./pages/Admin/AdminOrders"));
const AdminAddProducts = lazy(() => import("./pages/Admin/AdminAddProducts"));

const NotFound = lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
        >
          Back to Home
        </a>
      </div>
    ),
  })
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

const Wrap = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

function App() {
  const location = useLocation();

  useEffect(() => {
    // 1. Unregister any stale service workers that might cache API responses
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((r) => r.unregister());
        })
        .catch(() => {/* ignore */});
    }

    // 2. Delete corrupted Cache Storage entries that cause ERR_CACHE_READ_FAILURE.
    //    These are left behind by old service workers and can survive SW unregistration.
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      }).catch(() => {/* ignore */});
    }
  }, []);

  const adminPrefixes = ['/admin'];
  const authPrefixes = ['/login', '/signup'];

  const shouldShowNavbar = !adminPrefixes.some((p) =>
    location.pathname.startsWith(p)
  ) && !authPrefixes.some((p) => location.pathname.startsWith(p));

  const shouldShowFooter = !adminPrefixes.some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-black flex flex-col">
            {shouldShowNavbar && <Navbar />}

            <main className="grow">
              <Routes>
                {/* Public routes */}
                <Route path="/"               element={<Wrap><Home /></Wrap>} />
                <Route path="/products"       element={<Wrap><Products /></Wrap>} />
                <Route path="/about"          element={<Wrap><About /></Wrap>} />
                <Route path="/contact"        element={<Wrap><Contact /></Wrap>} />
                <Route path="/product/:id"    element={<Wrap><ProductDetails /></Wrap>} />
                <Route path="/wishlist"       element={<Wrap><Wishlist /></Wrap>} />
                <Route path="/cart"           element={<Wrap><Cart /></Wrap>} />
                <Route path="/login"          element={<Wrap><Login /></Wrap>} />
                <Route path="/signup"         element={<Wrap><Signup /></Wrap>} />
                <Route path="/payment"        element={<Wrap><PaymentMethods /></Wrap>} />
                <Route path="/order-confirmation" element={<Wrap><OrderConfirmation /></Wrap>} />
                <Route path="/profile"        element={<Wrap><Profile /></Wrap>} />

                {/* Admin routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedAdminRoute>
                      <AdminProvider>
                        <Wrap>
                          <AdminDashboard />
                        </Wrap>
                      </AdminProvider>
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index                    element={<Wrap><AdminHome /></Wrap>} />
                  <Route path="products"          element={<Wrap><AdminProducts /></Wrap>} />
                  <Route path="products/add"      element={<Wrap><AdminAddProducts /></Wrap>} />
                  <Route path="users"             element={<Wrap><AdminUsers /></Wrap>} />
                  <Route path="orders"            element={<Wrap><AdminOrders /></Wrap>} />
                </Route>

                {/* 404 catch-all */}
                <Route path="*" element={<Wrap><NotFound /></Wrap>} />
              </Routes>
            </main>

            {shouldShowFooter && <Footer />}
            <ToastContainer
              theme="dark"
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
