import React, { createContext, useContext, useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { toast } from "sonner";

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
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  syncUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { syncCart, clearCart } = useCart();
  const { syncWithServer: syncWishlist, clearWishlist } = useWishlist();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Trigger background syncs immediately
    syncCart();
    syncWishlist();
  };

  const syncUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    clearCart();
    clearWishlist();
    toast.success("Signed out of your sanctuary successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, syncUser }}>
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
