import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { BaseUrl, normalizeGame, invalidateGameCache } from "../../../Services/api";
import { useAuth } from "../../../contexts/AuthContext";

const AdminContext = createContext();

const mapUsers = (items) => {
  return (items || []).map((user) => {
    const fullName = user.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    return {
      id: user.id,
      firstName: firstName || "",
      lastName: lastName || "",
      email: user.email,
      phone: user.phone || "",
      role: (user.role || "user").toLowerCase(),
      status: (user.status || "active").toLowerCase(),
      createdAt: user.createdAt,
    };
  });
};

const buildGameFormData = (productData) => {
  const formData = new FormData();

  formData.append("Name", productData.name);
  formData.append("Genre", productData.genre);
  formData.append("Platform", productData.platform);
  formData.append("Price", String(productData.price));
  formData.append("Rating", String(productData.rating));
  formData.append("InStock", String(productData.inStock));
  formData.append("Description", productData.description || "");

  const newImageFiles = (productData.imageFiles || []).filter(Boolean);
  newImageFiles.forEach((file) => formData.append("ImageFiles", file));

  const existingUrls = (productData.images || []).filter(Boolean);
  existingUrls.forEach((url) => formData.append("ExistingImages", url));

  if (productData.trailerFile) {
    formData.append("TrailerFile", productData.trailerFile);
  } else if (productData.trailer) {
    formData.append("ExistingTrailer", productData.trailer);
  }

  return formData;
};

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = BaseUrl;
  const { authFetch, user } = useAuth();

  // Keep a ref so refreshAdminData can read the latest user without
  // being re-created every time user changes (which caused an infinite loop).
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Guard against concurrent refreshes
  const refreshingRef = useRef(false);

  const fetchGames = useCallback(async () => {
    // Public endpoint — plain fetch, no credentials needed.
    // Using authFetch here caused status-0 CORS failures on cross-origin deployments.
    const response = await fetch(`${API_BASE}/games?pageSize=100`);
    if (!response.ok) throw new Error(`Failed to fetch products (${response.status})`);
    const payload = await response.json();
    const items = payload?.data?.items || payload?.items || payload || [];
    return items.map(normalizeGame).filter(Boolean);
  }, [API_BASE]);

  const fetchUsers = useCallback(async () => {
    const url = `${API_BASE}/admin/adminusers`;
    const response = await authFetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 401) throw new Error("Unauthorized: token expired or invalid. Please log out and log in again.");
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch users (${response.status})${text ? ": " + text : ""}`);
    }

    const data = await response.json();
    return mapUsers(data);
  }, [API_BASE, authFetch]);

  const fetchOrders = useCallback(async (gamesById) => {
    const url = `${API_BASE}/admin/adminorders`;
    const response = await authFetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 401) throw new Error("Unauthorized: token expired or invalid. Please log out and log in again.");
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to fetch orders (${response.status})${text ? ": " + text : ""}`);
    }

    const list = await response.json();

    const detailedOrders = await Promise.all(
      (list || []).map(async (order) => {
        try {
          const detailResponse = await authFetch(`${API_BASE}/admin/adminorders/${order.orderId}`);

          if (!detailResponse.ok) {
            return {
              id: order.orderId,
              orderId: order.orderId,
              email: order.customerEmail,
              userFullName: order.customerName,
              status: order.status,
              items: [],
              total: order.total,
              subtotal: order.total,
              tax: 0,
              date: order.orderDate,
              paymentMethod: "",
              shippingAddress: {},
            };
          }

          const detail = await detailResponse.json();
          const items = (detail.items || []).map((item) => {
            const game = gamesById.get(String(item.gameId));
            return {
              id: item.gameId,
              name: item.gameName || game?.name || "Unknown Game",
              price: item.price,
              qty: item.quantity,
              quantity: item.quantity,
              image: game?.images?.[0] || "",
            };
          });

          return {
            id: detail.orderId,
            orderId: detail.orderId,
            email: detail.customerEmail,
            userFullName: detail.customerName,
            status: detail.status,
            items,
            total: detail.total,
            subtotal: detail.subTotal,
            tax: detail.tax,
            date: detail.orderDate,
            paymentMethod: detail.paymentMethod,
            shippingAddress: detail.shippingAddress,
          };
        } catch (error) {
          console.error("Error loading order details:", error);
          return null;
        }
      })
    );

    return detailedOrders.filter(Boolean);
  }, [API_BASE, authFetch]);

  const refreshAdminData = useCallback(async () => {
    if (refreshingRef.current) return; // already in flight
    if (!userRef.current) {
      setLoading(false);
      setError("Admin authorization required");
      return;
    }

    refreshingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      const games = await fetchGames();
      const gamesById = new Map(games.map((game) => [String(game.id), game]));
      const [usersData, ordersData] = await Promise.all([
        fetchUsers(),
        fetchOrders(gamesById),
      ]);

      setProducts(games);
      setUsers(usersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setError(error.message || "Failed to load admin data");
      setProducts([]);
      setUsers([]);
      setOrders([]);
    } finally {
      setLoading(false);
      refreshingRef.current = false;
    }
  }, [fetchGames, fetchOrders, fetchUsers]); // no user dep — read via ref

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const addProduct = async (productData) => {
    try {
      const formData = buildGameFormData(productData);
      const response = await authFetch(`${API_BASE}/admin/games`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Failed to add product (${response.status})${text ? ": " + text : ""}`);
      }

      const savedProduct = normalizeGame(await response.json());
      invalidateGameCache(savedProduct.id);
      setProducts((prev) => [...prev, savedProduct]);
      return { success: true, product: savedProduct };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  };

  const editProduct = async (id, productData) => {
    try {
      const formData = buildGameFormData(productData);
      const response = await authFetch(`${API_BASE}/admin/games/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Failed to update product (${response.status})${text ? ": " + text : ""}`);
      }

      const savedProduct = normalizeGame(await response.json());
      invalidateGameCache(savedProduct.id);
      setProducts((prev) => prev.map((p) => (p.id === id ? savedProduct : p)));
      return { success: true, product: savedProduct };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await authFetch(`${API_BASE}/admin/games/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      invalidateGameCache(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (id, userData) => {
    try {
      if (userData.role !== undefined) {
        const response = await authFetch(`${API_BASE}/admin/adminusers/${id}/role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",

          },
          body: JSON.stringify({ role: userData.role }),
        });
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`Failed to update role (${response.status})${text ? ": " + text : ""}`);
        }
      }

      if (userData.status !== undefined) {
        const endpoint = userData.status === "blocked" ? "block" : "activate";
        const response = await authFetch(`${API_BASE}/admin/adminusers/${id}/${endpoint}`, {
          method: "PUT",
          headers: {},
        });
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`Failed to update status (${response.status})${text ? ": " + text : ""}`);
        }
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await authFetch(`${API_BASE}/admin/adminusers/${id}`, {
        method: "DELETE",
        headers: {

        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await authFetch(`${API_BASE}/admin/adminorders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      setOrders((prev) => prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ));

      return { success: true };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await authFetch(`${API_BASE}/admin/adminorders/${orderId}`, {
        method: "DELETE",
        headers: {

        },
      });

      if (!response.ok) throw new Error("Failed to delete order");

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting order:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    products,
    users,
    orders,
    loading,
    error,
    addProduct,
    editProduct,
    deleteProduct,
    updateUser,
    deleteUser,
    updateOrderStatus,
    deleteOrder,
    refreshAdminData,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
