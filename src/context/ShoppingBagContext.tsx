"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRedisCart } from "../hooks/useRedisCart";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
  size?: string;
  variation_id?: number;
  attributes?: string;
}

interface ShoppingBagContextType {
  isOpen: boolean;
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  openBag: () => void;
  closeBag: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearBag: () => void;
}

const ShoppingBagContext = createContext<ShoppingBagContextType | undefined>(undefined);

export function useShoppingBag() {
  const context = useContext(ShoppingBagContext);
  if (!context) {
    throw new Error("useShoppingBag must be used within a ShoppingBagProvider");
  }
  return context;
}

export const ShoppingBagProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    cartItems, 
    loading, 
    error, 
    addItem: addRedisItem, 
    removeItem: removeRedisItem, 
    updateQuantity: updateRedisQuantity, 
    clearBag: clearRedisBag 
  } = useRedisCart();

  const openBag = () => setIsOpen(true);
  const closeBag = () => setIsOpen(false);

  const addItem = (item: CartItem) => {
    addRedisItem(item);
    setIsOpen(true); // Open bag when item is added
  };

  const removeItem = (id: number) => {
    removeRedisItem(id);
  };

  const updateQuantity = (id: number, quantity: number) => {
    updateRedisQuantity(id, quantity);
  };

  const clearBag = () => clearRedisBag();

  return (
    <ShoppingBagContext.Provider
      value={{ 
        isOpen, 
        cartItems, 
        loading, 
        error, 
        openBag, 
        closeBag, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearBag 
      }}
    >
      {children}
    </ShoppingBagContext.Provider>
  );
};
