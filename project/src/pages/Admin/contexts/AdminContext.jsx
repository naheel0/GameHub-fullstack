import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BaseUrl, buildAuthHeaders, normalizeGame } from "../../../Services/api";
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

const buildGameFormData = async (productData) => {
  const formData = new FormData();

  formData.append("Name", productData.name);
  formData.append("Genre", productData.genre);
  formData.append("Platform", productData.platform);
  formData.append("Price", String(productData.price));
  formData.append("Rating", String(productData.rating));
  formData.append("InStock", String(productData.inStock));
  formData.append("Description", productData.description || "");

  const imageUrls = (productData.images || []).filter((url) => url);
  const imageFiles = await Promise.all(
    imageUrls.map(async (url, index) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        return new File([blob], `image-${index}.${ext}`, { type: blob.type });
      } catch (error) {
        console.error("Image download failed:", error);
        return null;
      }
    })
  );

  imageFiles.filter(Boolean).forEach((file) => {
    formData.append("ImageFiles", file);
  });

  if (productData.trailer) {
    try {
      const response = await fetch(productData.trailer);
      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith("video/")) {
          const ext = blob.type.split("/")[1] || "mp4";
          const trailerFile = new File([blob], `trailer.${ext}`, { type: blob.type });
          formData.append("TrailerFile", trailerFile);
        }
      }
    } catch (error) {
      console.error("Trailer download failed:", error);
    }
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
  const { user } = useAuth();
  const token = user?.accessToken;

  // Debug: log API base and token presence for troubleshooting
  console.debug("AdminProvider init", { API_BASE, tokenPresent: Boolean(token) });

  const fetchGames = useCallback(async () => {
    const response = await fetch(`${API_BASE}/games?pageSize=100`);
    let payload = null;
    try {
      payload = await response.json();
    } catch (err) {
      console.error("fetchGames: failed to parse JSON", err);
    }
    console.debug("fetchGames", { url: `${API_BASE}/games?pageSize=100`, status: response.status, ok: response.ok, payload });

    if (!response.ok) throw new Error("Failed to fetch products");

    const items = payload?.data?.items || payload?.items || payload || [];
    return items.map(normalizeGame).filter(Boolean);
  }, [API_BASE]);

  const fetchUsers = useCallback(async () => {
    const response = await fetch(`${API_BASE}/admin/users?pageSize=100`, {
      headers: {
        ...buildAuthHeaders(token),
      },
      credentials: "include",
    });

    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      console.error("fetchUsers: failed to parse JSON", err);
    }
    console.debug("fetchUsers", { url: `${API_BASE}/admin/users?pageSize=100`, status: response.status, ok: response.ok, data });

    if (!response.ok) throw new Error("Failed to fetch users");

    return mapUsers(data);
  }, [API_BASE, token]);

  const fetchOrders = useCallback(async (gamesById) => {
    const response = await fetch(`${API_BASE}/admin/orders?pageSize=100`, {
      headers: {
        ...buildAuthHeaders(token),
      },
      credentials: "include",
    });

    let list = null;
    try {
      list = await response.json();
    } catch (err) {
      console.error("fetchOrders: failed to parse JSON", err);
    }
    console.debug("fetchOrders", { url: `${API_BASE}/admin/orders?pageSize=100`, status: response.status, ok: response.ok, list });

    if (!response.ok) throw new Error("Failed to fetch orders");

    const detailedOrders = await Promise.all(
      (list || []).map(async (order) => {
        try {
          const detailResponse = await fetch(`${API_BASE}/admin/orders/${order.id}`, {
            headers: {
              ...buildAuthHeaders(token),
            },
            credentials: "include",
          });

          if (!detailResponse.ok) {
            return {
              id: order.id,
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
            const game = gamesById.get(item.gameId);
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
            id: detail.id,
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
  }, [API_BASE, token]);

  const refreshAdminData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Admin authorization required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const games = await fetchGames();
      const gamesById = new Map(games.map((game) => [game.id, game]));
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
    }
  }, [fetchGames, fetchOrders, fetchUsers, token]);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const addProduct = async (productData) => {
    try {
      const formData = await buildGameFormData(productData);
      const response = await fetch(`${API_BASE}/admin/games`, {
        method: "POST",
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      const savedProduct = normalizeGame(await response.json());
      setProducts((prev) => [...prev, savedProduct]);
      return { success: true, product: savedProduct };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  };

  const editProduct = async (id, productData) => {
    try {
      const formData = await buildGameFormData(productData);
      const response = await fetch(`${API_BASE}/admin/games/${id}`, {
        method: "PUT",
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update product");

      const savedProduct = normalizeGame(await response.json());
      setProducts((prev) => prev.map((p) => (p.id === id ? savedProduct : p)));
      return { success: true, product: savedProduct };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/games/${id}`, {
        method: "DELETE",
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (id, userData) => {
    try {
      if (userData.role) {
        const response = await fetch(`${API_BASE}/admin/users/${id}/role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...buildAuthHeaders(token),
          },
          credentials: "include",
          body: JSON.stringify({ role: userData.role }),
        });

        if (!response.ok) throw new Error("Failed to update user role");
      }

      if (userData.status) {
        const endpoint = userData.status === "blocked" ? "block" : "activate";
        const response = await fetch(`${API_BASE}/admin/users/${id}/${endpoint}`, {
          method: "PUT",
          headers: {
            ...buildAuthHeaders(token),
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to update user status");
      }

      await refreshAdminData();
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: "include",
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
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(token),
        },
        credentials: "include",
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
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: "include",
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
