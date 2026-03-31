import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Product } from "@/data/products";
import { getApiUrl } from "@/lib/api";

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  syncWithServer: () => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem("luscent-glow-wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const getLoggedInUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const fetchServerWishlist = useCallback(async () => {
    const user = getLoggedInUser();
    if (!user || !user.mobileNumber) return;

    try {
      const response = await fetch(getApiUrl(`/wishlist/${user.mobileNumber}`));
      if (response.ok) {
        const serverWishlist = await response.json();
        // Merge or replace? For simplicity, we'll replace the local with server data
        // but you could also implement merging logic here.
        setWishlist(serverWishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist from server:", error);
    }
  }, []);

  // Fetch from server on mount if logged in
  useEffect(() => {
    fetchServerWishlist();
  }, [fetchServerWishlist]);

  // Save to localStorage whenever local state changes
  useEffect(() => {
    localStorage.setItem("luscent-glow-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = async (product: Product) => {
    const productId = product._id || product.id;
    const user = getLoggedInUser();

    // Optimistic update for UI
    let action: "added" | "removed" = "added";
    
    setWishlist((prev) => {
      const exists = prev.find((item) => (item._id || item.id) === productId);
      if (exists) {
        action = "removed";
        return prev.filter((item) => (item._id || item.id) !== productId);
      } else {
        action = "added";
        return [...prev, product];
      }
    });

    if (action === "added") {
      toast.success(`${product.name} added to wishlist`);
    } else {
      toast.info(`${product.name} removed from wishlist`);
    }

    // Sync with server if logged in
    if (user && user.mobileNumber) {
      try {
        await fetch(getApiUrl("/wishlist/toggle"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMobile: user.mobileNumber,
            productId: productId
          })
        });
      } catch (error) {
        console.error("Error toggling wishlist on server:", error);
        toast.error("Cloud sync failed. Item saved locally.");
      }
    }
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => (item._id || item.id) === id);
  };

  const clearWishlist = async () => {
    const user = getLoggedInUser();
    setWishlist([]);
    
    if (user && user.mobileNumber) {
      try {
        await fetch(getApiUrl(`/wishlist/clear/${user.mobileNumber}`), { method: "DELETE" });
      } catch (error) {
        console.error("Error clearing wishlist on server:", error);
      }
    }
  };

  const syncWithServer = async () => {
    await fetchServerWishlist();
  };

  const removeFromWishlist = async (productId: string) => {
    const user = getLoggedInUser();
    
    // Optimistic local update
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    
    // Sync with server if logged in
    if (user && user.mobileNumber) {
      try {
        await fetch(getApiUrl("/wishlist/remove"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMobile: user.mobileNumber,
            productId: productId
          })
        });
      } catch (error) {
        console.error("Error removing from wishlist on server:", error);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist, syncWithServer, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
