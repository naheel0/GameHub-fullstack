import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../src/components/layout/NavBar";
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
const Login = lazy(() => import("../src/pages/Auth/Login"));
const Signup = lazy(() => import("../src/pages/Auth/Signup"));
const PaymentMethods = lazy(() => import("../src/components/PaymentMethods/PaymentPage"));
const OrderConfirmation = lazy(() => import("./pages/Main/OrderConfirmation"));
const Profile = lazy(() => import("./pages/Main/Profile"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminHome = lazy(() => import("./pages/Admin/AdminHome"));
const AdminProducts = lazy(() => import("./pages/Admin/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUserDetails"));
const AdminOrders = lazy(() => import("./pages/Admin/AdminOrders"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

function App() {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/admin",
    "/admin/*"
  ];
  const hideFooterRoutes = ["/admin", "/admin/*"];
  
  const shouldShowNavbar = !hideNavbarRoutes.some(route => 
    location.pathname.startsWith(route.replace('/*', ''))
  );
  const shouldShowFooter = !hideFooterRoutes.some(route => 
    location.pathname.startsWith(route.replace('/*', ''))
  );

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-black flex flex-col">
              {shouldShowNavbar && <Navbar />}

              <main className="grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
                  <Route path="/products" element={<Suspense fallback={<LoadingFallback />}><Products /></Suspense>} />
                  <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
                  <Route path="/product/:id" element={<Suspense fallback={<LoadingFallback />}><ProductDetails /></Suspense>} />
                  <Route path="/wishlist" element={<Suspense fallback={<LoadingFallback />}><Wishlist /></Suspense>} />
                  <Route path="/cart" element={<Suspense fallback={<LoadingFallback />}><Cart /></Suspense>} />
                  <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
                  <Route path="/signup" element={<Suspense fallback={<LoadingFallback />}><Signup /></Suspense>} />
                  <Route path="/payment" element={<Suspense fallback={<LoadingFallback />}><PaymentMethods /></Suspense>} />
                  <Route
                    path="/order-confirmation"
                    element={<Suspense fallback={<LoadingFallback />}><OrderConfirmation /></Suspense>}
                  />
                  <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />

                  {/* Admin Routes */}
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedAdminRoute>
                        <AdminProvider>
                          <Suspense fallback={<LoadingFallback />}>
                            <AdminDashboard />
                          </Suspense>
                        </AdminProvider>
                      </ProtectedAdminRoute>
                    }
                  >
                    <Route index element={<Suspense fallback={<LoadingFallback />}><AdminHome /></Suspense>} />
                    <Route path="products" element={<Suspense fallback={<LoadingFallback />}><AdminProducts /></Suspense>} />
                    <Route path="users" element={<Suspense fallback={<LoadingFallback />}><AdminUsers /></Suspense>} />
                    <Route path="orders" element={<Suspense fallback={<LoadingFallback />}><AdminOrders /></Suspense>} />
                  </Route>
                </Routes>
              </main>

              {shouldShowFooter && <Footer />}
              <ToastContainer theme="dark" />
            </div>
          </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;