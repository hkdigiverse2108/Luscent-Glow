import React, { createContext, useContext, useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  isAdmin?: boolean;
  profilePicture?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface AuthContextType {
  user: User | null;
  admin: User | null;
  login: (userData: User) => void;
  adminLogin: (adminData: User) => void;
  logout: () => void;
  adminLogout: () => void;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  syncUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [admin, setAdmin] = useState<User | null>(() => {
    const savedAdmin = localStorage.getItem("admin");
    try {
      return savedAdmin ? JSON.parse(savedAdmin) : null;
    } catch {
      return null;
    }
  });

  const { syncCart, clearCart } = useCart();
  const { syncWithServer: syncWishlist, clearWishlist } = useWishlist();

  const syncUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const refreshUser = async () => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;

    try {
      const response = await fetch(getApiUrl(`/api/users/${userId}`));
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        // Only update if there's a difference to avoid infinite loops
        if (JSON.stringify(userData) !== JSON.stringify(user)) {
          syncUser(userData);
          console.log("Profile synchronized with sanctuary.");
        }
      }
    } catch (error) {
      console.error("Sanctuary sync interrupted.");
    }
  };

  // Handle server-side data sync on mount if logged in
  useEffect(() => {
    if (user) {
      refreshUser();
      syncCart();
      syncWishlist();
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Trigger background syncs immediately
    syncCart();
    syncWishlist();
  };

  const adminLogin = (adminData: User) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    clearCart();
    clearWishlist();
    toast.success("Signed out of your sanctuary successfully");
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    toast.success("Administrative clearance revoked.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      admin, 
      login, 
      adminLogin, 
      logout, 
      adminLogout, 
      isAuthenticated: !!user,
      isAdminAuthenticated: !!admin,
      syncUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
