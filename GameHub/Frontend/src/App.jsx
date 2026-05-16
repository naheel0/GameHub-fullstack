import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Main/Home";
import Products from "./pages/Main/Products";
import About from "./pages/Main/About";
import Contact from "../src/components/layout/Contact";
import Footer from "./components/layout/Footer";
import ProductDetails from "./pages/Main/ProductDetails";
import Wishlist from "./pages/Main/Wishlist";
import Cart from "./pages/Main/Cart";
import Login from "../src/pages/Auth/Login";
import Signup from "../src/pages/Auth/Signup";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import PaymentMethods from "../src/components/PaymentMethods/PaymentPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderConfirmation from "./pages/Main/OrderConfirmation";
import Navbar from "../src/components/layout/NavBar";
import Profile from "./pages/Main/Profile";

// Admin Components
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminHome from "./pages/Admin/AdminHome";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminUsers from "./pages/Admin/AdminUserDetails";
import AdminOrders from "./pages/Admin/AdminOrders";
import ProtectedAdminRoute from "./pages/Admin/ProtectedAdminRoute";
import { AdminProvider } from "./pages/Admin/contexts/AdminContext";

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
          <AdminProvider>
            <div className="min-h-screen bg-black flex flex-col">
              {shouldShowNavbar && <Navbar />}

              <main className="grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/payment" element={<PaymentMethods />} />
                  <Route
                    path="/order-confirmation"
                    element={<OrderConfirmation />}
                  />
                  <Route path="/profile" element={<Profile />} />

                  {/* Admin Routes */}
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  >
                    <Route index element={<AdminHome />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="orders" element={<AdminOrders />} />
                  </Route>
                </Routes>
              </main>

              {shouldShowFooter && <Footer />}
              <ToastContainer theme="dark" />
            </div>
          </AdminProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;