import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useWishlist } from "./WishlistContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  selectedShade?: string;
  selectedSize?: string;
  metadata?: any;
}

export interface Coupon {
  id?: string;
  _id?: string;
  code: string;
  discountType: "percentage" | "fixed" | "shipping";
  value: number;
  minPurchase?: number;
  expiryDate: string;
  description?: string;
  isActive: boolean;
}

export interface AppliedGiftCard {
  code: string;
  balance: number;
  theme?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, selectedShade?: string, selectedSize?: string, metadata?: any) => void;
  updateQuantity: (id: string, quantity: number, selectedShade?: string, selectedSize?: string, metadata?: any) => void;
  clearCart: () => void;
  totalItems: number;
  productCount: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  appliedGiftCard: AppliedGiftCard | null;
  applyGiftCard: (code: string) => Promise<boolean>;
  removeGiftCard: () => void;
  giftCardDiscount: number;
  receivedGiftCards: AppliedGiftCard[];
  availableCoupons: Coupon[];
  fetchReceivedGiftCards: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getLoggedInUser = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "undefined") return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

// Helper for Guest ID
const getGuestId = () => {
    let id = localStorage.getItem("luscent-glow-guest-id");
    if (!id) {
        id = `guest_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
        localStorage.setItem("luscent-glow-guest-id", id);
    }
    return id;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { removeFromWishlist } = useWishlist();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("luscent-glow-cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem("luscent-glow-applied-coupon");
    return saved ? JSON.parse(saved) : null;
  });
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(() => {
    const saved = localStorage.getItem("luscent-glow-applied-giftcard");
    return saved ? JSON.parse(saved) : null;
  });
  const [receivedGiftCards, setReceivedGiftCards] = useState<AppliedGiftCard[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/coupons/"));
      if (response.ok) {
        const data = await response.json();
        setAvailableCoupons(data);
      }
    } catch (error) {
      console.error("Error fetching available coupons:", error);
    }
  }, []);

  const fetchServerCart = useCallback(async () => {
    const user = getLoggedInUser();
    const guestId = getGuestId();
    const identifier = user?.mobileNumber || guestId;

    try {
      const response = await fetch(getApiUrl(`/api/cart/${identifier}`));
      if (response.ok) {
        const serverCart = await response.json();
        if (serverCart && Array.isArray(serverCart)) {
          setItems(serverCart);
        }
      }
    } catch (error) {
      console.error("Error fetching cart from server:", error);
    }
  }, []);

  const fetchReceivedGiftCards = useCallback(async () => {
    const user = getLoggedInUser();
    if (!user || !user.mobileNumber) return;

    try {
      const response = await fetch(getApiUrl(`/api/gift-cards/received/${user.mobileNumber}`));
      if (response.ok) {
        const data = await response.json();
        setReceivedGiftCards(data);
      }
    } catch (error) {
      console.error("Error fetching received gift cards:", error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchServerCart();
    fetchReceivedGiftCards();
  }, [fetchCoupons, fetchServerCart, fetchReceivedGiftCards]);

  useEffect(() => {
    localStorage.setItem("luscent-glow-cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("luscent-glow-applied-coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("luscent-glow-applied-coupon");
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (appliedGiftCard) {
      localStorage.setItem("luscent-glow-applied-giftcard", JSON.stringify(appliedGiftCard));
    } else {
      localStorage.removeItem("luscent-glow-applied-giftcard");
    }
  }, [appliedGiftCard]);

  const addItem = async (newItem: CartItem) => {
    const user = getLoggedInUser();
    const guestId = getGuestId();
    
    // Always sync with backend
    try {
      await fetch(getApiUrl("/api/cart/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMobile: user?.mobileNumber || null,
          guestId: user?.mobileNumber ? null : guestId,
          productId: newItem.id,
          quantity: newItem.quantity,
          price: newItem.price,
          name: newItem.name,
          image: newItem.image,
          selectedShade: newItem.selectedShade,
          selectedSize: newItem.selectedSize,
          metadata: newItem.metadata
        }),
      });
    } catch (error) {
      console.error("Error adding to cart on server:", error);
    }

    setItems((prev) => {
      const existing = prev.find(
        (item) => 
          item.id === newItem.id && 
          item.selectedShade === newItem.selectedShade && 
          item.selectedSize === newItem.selectedSize &&
          JSON.stringify(item.metadata) === JSON.stringify(newItem.metadata)
      );

      if (existing) {
        toast.success(`Increased ${newItem.name} quantity in cart!`);
        return prev.map((item) =>
          item.id === newItem.id &&
          item.selectedShade === newItem.selectedShade &&
          item.selectedSize === newItem.selectedSize &&
          JSON.stringify(item.metadata) === JSON.stringify(newItem.metadata)
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      toast.success(`${newItem.name} added to cart!`);
      return [...prev, newItem];
    });
  };

  const removeItem = async (id: string, selectedShade?: string, selectedSize?: string, metadata?: any) => {
    const user = getLoggedInUser();
    const guestId = getGuestId();

    // Universal Removal from DB
    try {
      await fetch(getApiUrl("/api/cart/remove"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMobile: user?.mobileNumber || null,
          guestId: user?.mobileNumber ? null : guestId,
          productId: id,
          selectedShade,
          selectedSize,
          quantity: 0,
          metadata: metadata || null
        }),
      });
    } catch (error) {
      console.error("Error removing from cart on server:", error);
    }

    setItems((prev) => prev.filter(
      (item) => 
        !(item.id === id && 
          item.selectedShade === selectedShade && 
          item.selectedSize === selectedSize &&
          JSON.stringify(item.metadata) === JSON.stringify(metadata))
    ));
    toast.info("Item removed from cart");
  };

  const updateQuantity = async (id: string, quantity: number, selectedShade?: string, selectedSize?: string, metadata?: any) => {
    if (quantity <= 0) {
      await removeItem(id, selectedShade, selectedSize, metadata);
      return;
    }
    const user = getLoggedInUser();
    const guestId = getGuestId();

    try {
      await fetch(getApiUrl("/api/cart/update"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMobile: user?.mobileNumber || null,
          guestId: user?.mobileNumber ? null : guestId,
          productId: id,
          quantity,
          selectedShade,
          selectedSize,
          metadata: metadata || null
        }),
      });
    } catch (error) {
      console.error("Error updating cart quantity on server:", error);
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedShade === selectedShade &&
        item.selectedSize === selectedSize &&
        JSON.stringify(item.metadata) === JSON.stringify(metadata)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    const user = getLoggedInUser();
    const guestId = getGuestId();
    const identifier = user?.mobileNumber || guestId;

    try {
      await fetch(getApiUrl(`/api/cart/clear/${identifier}`), {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error clearing cart on server:", error);
    }

    setItems([]);
    setAppliedCoupon(null);
    setAppliedGiftCard(null);
    localStorage.removeItem("luscent-glow-cart");
    localStorage.removeItem("luscent-glow-applied-coupon");
    localStorage.removeItem("luscent-glow-applied-giftcard");
  };

  const applyCoupon = (code: string): boolean => {
    const coupon = availableCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      if (!coupon.isActive) {
        toast.error("This coupon is no longer active");
        return false;
      }
      if (appliedGiftCard) {
        setAppliedGiftCard(null);
        toast.info("Gift card removed. Only one offer can be applied at a time.");
      }
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

  const applyGiftCard = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(getApiUrl(`/api/gift-cards/validate/${code}`));
      if (response.ok) {
        const data = await response.json();
        if (appliedCoupon) {
          setAppliedCoupon(null);
          toast.info("Coupon removed. Only one offer can be applied at a time.");
        }
        setAppliedGiftCard({
          code: data.code,
          balance: data.balance,
          theme: data.theme,
          image: data.image
        });
        toast.success(`Gift card ₹${data.balance} applied!`);
        return true;
      }
    } catch (error) {
      console.error("Error validating gift card:", error);
    }
    toast.error("Invalid or empty gift card");
    return false;
  };

  const removeGiftCard = () => {
    setAppliedGiftCard(null);
    toast.info("Gift card removed");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const productCount = items.length;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") discountAmount = (subtotal * appliedCoupon.value) / 100;
    else if (appliedCoupon.discountType === "fixed") discountAmount = appliedCoupon.value;
    else if (appliedCoupon.discountType === "shipping") discountAmount = 50;
  }

  const giftCardDiscount = appliedGiftCard ? Math.min(subtotal - discountAmount, appliedGiftCard.balance) : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        productCount,
        subtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        appliedGiftCard,
        applyGiftCard,
        removeGiftCard,
        giftCardDiscount,
        receivedGiftCards,
        availableCoupons,
        fetchReceivedGiftCards,
        syncCart: fetchServerCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
};
