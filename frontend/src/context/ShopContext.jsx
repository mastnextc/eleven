import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('eleven_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const savedWish = localStorage.getItem('eleven_wishlist');
    return savedWish ? JSON.parse(savedWish) : [];
  });
  const [token, setToken] = useState(localStorage.getItem('eleven_token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('eleven_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch active coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/coupons`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('eleven_cart', JSON.stringify(cart));
  }, [cart]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('eleven_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Login
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('eleven_token', data.token);
      localStorage.setItem('eleven_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  // Register
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('eleven_token', data.token);
      localStorage.setItem('eleven_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('eleven_token');
    localStorage.removeItem('eleven_user');
  };

  // Add to Cart
  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setCart((prev) => {
      const existsIndex = prev.findIndex(
        (item) => item.product._id === product._id && item.size === size && item.color === color
      );
      if (existsIndex > -1) {
        const updated = [...prev];
        updated[existsIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, size, color }];
    });
  };

  // Update Cart Quantity
  const updateCartQty = (productId, size, color, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  // Remove from Cart
  const removeFromCart = (productId, size, color) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product._id === productId && item.size === size && item.color === color)
      )
    );
  };

  // Clear Cart
  const clearCart = () => setCart([]);

  // Toggle Wishlist
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  // Get total cart items count
  const getCartCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Get total cart price
  const getCartTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + price * item.quantity;
    }, 0);
  };

  return (
    <ShopContext.Provider value={{
      products,
      fetchProducts,
      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      token,
      user,
      login,
      register,
      logout,
      searchQuery,
      setSearchQuery,
      getCartCount,
      getCartTotal,
      coupons,
      API_URL
    }}>
      {children}
    </ShopContext.Provider>
  );
};
