import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from local storage on startup
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('agriCart')) || [];
    setCart(savedCart);
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem('agriCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => setCart([]);

  const updateQty = (id, newQty) => {
  setCart(prev => prev.map(item => 
    item._id === id ? { ...item, qty: Math.max(1, newQty) } : item
  ));
};

return (
  <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
    {children}
  </CartContext.Provider>
);
};

export const useCart = () => useContext(CartContext);