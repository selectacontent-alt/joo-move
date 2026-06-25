"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load cart on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('Al Rehab_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
    setCartLoaded(true);
  }, []);

  // Save cart when items change
  useEffect(() => {
    if (!cartLoaded) return;
    if (cartItems.length > 0) {
      localStorage.setItem('Al Rehab_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('Al Rehab_cart');
    }
  }, [cartItems, cartLoaded]);

  // Handle auto-clearing notification toast
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i?.product?.id === item?.product?.id && i?.optionIndex === item?.optionIndex);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], quantity: (next[existing].quantity || 1) + (item.quantity || 1) };
        return next;
      }
      return [...prev, item];
    });
    setNotification(t('app.addedToCart'));
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const undoAddToCart = (productId, optionIndex) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i?.product?.id === productId && i?.optionIndex === optionIndex);
      if (existing >= 0) {
        const next = [...prev];
        if (next[existing].quantity > 1) {
          next[existing] = { ...next[existing], quantity: next[existing].quantity - 1 };
        } else {
          next.splice(existing, 1);
        }
        return next;
      }
      return prev;
    });
  };

  const updateCartQuantity = (index, delta) => {
    setCartItems(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: Math.max(1, (next[index].quantity || 1) + delta) };
      }
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('Al Rehab_cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      undoAddToCart,
      updateCartQuantity,
      clearCart,
      notification,
      setNotification
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
