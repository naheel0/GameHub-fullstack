import { createContext, useContext, useState, useEffect } from "react";
import { BaseUrl } from "../../../Services/api";
const BASE_API = BaseUrl;

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const convertPurchaseToOrder = (purchase, user) => {
    return {
      id: purchase.id,
      orderId: `ORD-${purchase.id.slice(-8).toUpperCase()}`,
      email: user.email,
      userFullName: `${user.firstName} ${user.lastName}`,
      status: purchase.status || "Completed",
      items: purchase.items.map((item) => ({
        id: item.gameId,
        name: item.name,
        price: item.price,
        qty: item.quantity,
        image: item.image,
      })),
      total: parseFloat(purchase.summary.total),
      subtotal: parseFloat(purchase.summary.subtotal),
      tax: parseFloat(purchase.summary.tax),
      date: purchase.date,
      paymentMethod: purchase.paymentMethod,
      shippingAddress: user.addresses?.[0] || {},
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading admin data...");
        const [productsRes, usersRes] = await Promise.all([
          fetch(`${BASE_API}/games`),
          fetch(`${BASE_API}/users`),
        ]);

        if (!productsRes.ok) throw new Error("Failed to fetch products");
        if (!usersRes.ok) throw new Error("Failed to fetch users");

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();

        console.log("Loaded users:", usersData);
        console.log("Loaded products:", productsData);

        setProducts(productsData || []);
        setUsers(usersData || []);

        const allOrders = [];
        usersData.forEach((user) => {
          if (user.purchaseHistory && user.purchaseHistory.length > 0) {
            user.purchaseHistory.forEach((purchase) => {
              if (typeof purchase === "object" && purchase.id) {
                const order = convertPurchaseToOrder(purchase, user);
                allOrders.push(order);
              }
            });
          }
        });

        console.log("Generated orders:", allOrders);
        setOrders(allOrders);
      } catch (error) {
        console.error("Error loading admin data:", error);
        setError(error.message);
        setProducts([]);
        setUsers([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addProduct = async (productData) => {
    try {
      const newProduct = {
        id: Date.now().toString(),
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        rating: 4.0,
        inStock: true,
      };

      const response = await fetch(`${BASE_API}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Failed to add product");

      const savedProduct = await response.json();
      setProducts((prev) => [...prev, savedProduct]);
      return { success: true, product: savedProduct };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  };

  const editProduct = async (id, productData) => {
    try {
      const updatedProduct = {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
      };

      const response = await fetch(`${BASE_API}/games/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const savedProduct = await response.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? savedProduct : p)));
      return { success: true, product: savedProduct };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${BASE_API}/games/${id}`, {
        method: "DELETE",
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
      const response = await fetch(`${BASE_API}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const updatedUser = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

      if (userData.firstName || userData.lastName || userData.email) {
        setOrders((prev) =>
          prev.map((order) =>
            order.email === updatedUser.email
              ? {
                  ...order,
                  email: updatedUser.email,
                  userFullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
                }
              : order
          )
        );
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (id) => {
    try {
      const userToDelete = users.find((u) => u.id === id);
      const response = await fetch(`${BASE_API}/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== id));

      if (userToDelete) {
        setOrders((prev) =>
          prev.filter((order) => order.email !== userToDelete.email)
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const orderToUpdate = orders.find((order) => order.id === orderId);
      if (!orderToUpdate) throw new Error("Order not found");
      const user = users.find((u) => u.email === orderToUpdate.email);
      if (!user) throw new Error("User not found");

      const updatedPurchaseHistory = user.purchaseHistory.map((purchase) =>
        typeof purchase === "object" && purchase.id === orderId
          ? { ...purchase, status }
          : purchase
      );

      const response = await fetch(`${BASE_API}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purchaseHistory: updatedPurchaseHistory }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      const updatedUser = await response.json();

      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      return { success: true, order: { ...orderToUpdate, status } };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const orderToDelete = orders.find((order) => order.id === orderId);
      if (!orderToDelete) throw new Error("Order not found");

      const user = users.find((u) => u.email === orderToDelete.email);
      if (!user) throw new Error("User not found");

      const updatedPurchaseHistory = user.purchaseHistory.filter(
        (purchase) => !(typeof purchase === "object" && purchase.id === orderId)
      );

      const response = await fetch(`${BASE_API}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purchaseHistory: updatedPurchaseHistory }),
      });

      if (!response.ok) throw new Error("Failed to delete order");

      const updatedUser = await response.json();

      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
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
