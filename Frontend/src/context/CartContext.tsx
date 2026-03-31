import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  selectedShade?: string;
  selectedSize?: string;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed" | "shipping";
  value: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, selectedShade?: string, selectedSize?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedShade?: string, selectedSize?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("luscent-glow-cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const getLoggedInUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const validCoupons: Coupon[] = [
    { code: "GLOW20", discountType: "percentage", value: 20 },
    { code: "FESTIVE15", discountType: "percentage", value: 15 },
    { code: "GLOWUP", discountType: "fixed", value: 500 },
    { code: "FREESHIP", discountType: "shipping", value: 99 },
    { code: "GLOW15", discountType: "percentage", value: 15 },
  ];

  const fetchServerCart = useCallback(async () => {
    const user = getLoggedInUser();
    if (!user || !user.mobileNumber) return;

    try {
      const response = await fetch(getApiUrl(`/cart/${user.mobileNumber}`));
      if (response.ok) {
        const serverCart = await response.json();
        // Overwrite local cart with server data when logged in
        if (serverCart && Array.isArray(serverCart)) {
          setItems(serverCart);
        }
      }
    } catch (error) {
      console.error("Error fetching cart from server:", error);
    }
  }, []);

  // Sync with server on mount or when user changes
  useEffect(() => {
    fetchServerCart();
    
    // Periodically check for user changes in localStorage (simple way to detect login/logout)
    const interval = setInterval(() => {
      const user = getLoggedInUser();
      if (user && items.length === 0) {
        // If user just logged in and client cart is empty, try to fetch
        fetchServerCart();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchServerCart]);

  useEffect(() => {
    localStorage.setItem("luscent-glow-cart", JSON.stringify(items));
  }, [items]);

  const addItem = async (newItem: CartItem) => {
    const user = getLoggedInUser();
    
    // If user is logged in, sync with backend
    if (user?.mobileNumber) {
      try {
        await fetch(getApiUrl("/cart/add"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMobile: user.mobileNumber,
            productId: newItem.id,
            quantity: newItem.quantity,
            selectedShade: newItem.selectedShade,
            selectedSize: newItem.selectedSize
          }),
        });
      } catch (error) {
        console.error("Error adding to cart on server:", error);
      }
    }

    setItems((prev) => {
      const existing = prev.find(
        (item) => 
          item.id === newItem.id && 
          item.selectedShade === newItem.selectedShade && 
          item.selectedSize === newItem.selectedSize
      );

      if (existing) {
        toast.success(`Increased ${newItem.name} quantity in cart!`);
        return prev.map((item) =>
          item.id === newItem.id &&
          item.selectedShade === newItem.selectedShade &&
          item.selectedSize === newItem.selectedSize
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      toast.success(`${newItem.name} added to cart!`);
      return [...prev, newItem];
    });
  };

  const removeItem = async (id: string, selectedShade?: string, selectedSize?: string) => {
    const user = getLoggedInUser();
    
    if (user?.mobileNumber) {
      try {
        await fetch(getApiUrl("/cart/remove"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMobile: user.mobileNumber,
            productId: id,
            selectedShade,
            selectedSize,
            quantity: 0
          }),
        });
      } catch (error) {
        console.error("Error removing from cart on server:", error);
      }
    }

    setItems((prev) => prev.filter(
      (item) => 
        !(item.id === id && 
          item.selectedShade === selectedShade && 
          item.selectedSize === selectedSize)
    ));
    toast.info("Item removed from cart");
  };

  const updateQuantity = async (id: string, quantity: number, selectedShade?: string, selectedSize?: string) => {
    if (quantity < 1) return;
    const user = getLoggedInUser();

    if (user?.mobileNumber) {
      try {
        await fetch(getApiUrl("/cart/update"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMobile: user.mobileNumber,
            productId: id,
            quantity,
            selectedShade,
            selectedSize
          }),
        });
      } catch (error) {
        console.error("Error updating quantity on server:", error);
      }
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedShade === selectedShade &&
        item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    const user = getLoggedInUser();
    
    if (user?.mobileNumber) {
      try {
        await fetch(getApiUrl(`/cart/clear/${user.mobileNumber}`), {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error clearing cart on server:", error);
      }
    }

    setItems([]);
    setAppliedCoupon(null);
    toast.info("Cart cleared");
  };

  const applyCoupon = (code: string): boolean => {
    const coupon = validCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`Coupon ${coupon.code} applied successfully!`);
      return true;
    }
    toast.error("Invalid coupon code");
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discountAmount = appliedCoupon 
    ? appliedCoupon.discountType === "percentage" 
      ? (subtotal * appliedCoupon.value) / 100 
      : appliedCoupon.discountType === "fixed" 
        ? appliedCoupon.value 
        : 0
    : 0;

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      subtotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      discountAmount,
      syncCart: fetchServerCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
