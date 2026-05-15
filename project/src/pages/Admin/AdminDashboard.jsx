import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 flex justify-between items-center bg-gray-900/80 backdrop-blur-md text-white px-4 py-3 shadow-md z-50 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        <button onClick={toggleSidebar} className="text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 h-screen w-64
        bg-gray-900 backdrop-blur-xl border-r border-gray-800
        text-white p-6 flex flex-col z-40
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Logo */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white">GameHub Admin</h2>
          <p className="text-gray-400 text-sm mt-2">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="space-y-2">
            <NavLink
              to="/admin"
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              📊 Dashboard
            </NavLink>

            <NavLink
              to="/admin/products"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              🎮 Products
            </NavLink>

            <NavLink
              to="/admin/users"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              👥 Users
            </NavLink>

            <NavLink
              to="/admin/orders"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              📦 Orders
            </NavLink>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg transition duration-300 transform hover:scale-105"
          >
            <div className="flex flex-row gap-3 ">
              <FiLogOut size={24} /> Log out
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 min-h-screen overflow-auto bg-black">
        <div className="p-6 mt-16 md:mt-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
