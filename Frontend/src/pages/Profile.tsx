import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, ShieldCheck, 
  Settings, LogOut, ChevronRight, 
  Camera, ShoppingBag, Heart, CreditCard, Gift,
  Lock, CheckCircle2, AlertCircle, Plus,
  MapPin, Home, Globe, Building, Sparkles, ChevronDown, X,
  Tag, Landmark, Scan, Smartphone, ArrowRight, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import LogoutConfirmation from "@/components/auth/LogoutConfirmation";
import { PhoneInput } from "@/components/PhoneInput";

type ProfileView = "details" | "orders" | "wishlist" | "password" | "giftcards" | "addresses";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Profile = () => {
  const { user, syncUser, logout } = useAuth();
  const [activeView, setActiveView] = useState<ProfileView>("details");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  
  // Shipping Address State
  const [street, setStreet] = useState(user?.shippingAddress?.street || "");
  const [city, setCity] = useState(user?.shippingAddress?.city || "");
  const [state, setState] = useState(user?.shippingAddress?.state || "");
  const [zipCode, setZipCode] = useState(user?.shippingAddress?.zipCode || "");

  const [addresses, setAddresses] = useState<any[]>(user?.addresses || []);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    fullName: "",
    mobile: "",
    street: "",
    city: "",
    state: "Gujarat",
    zipCode: "",
    isDefault: false
  });

  const [loading, setLoading] = useState(false);
  
  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isOldPasswordVerified, setIsOldPasswordVerified] = useState(false);
  const [verifyingOldPassword, setVerifyingOldPassword] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  // Gift Cards state
  const [receivedCards, setReceivedCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setMobileNumber(user.mobileNumber);
      setProfilePicture(user.profilePicture || "");
      setStreet(user.shippingAddress?.street || "");
      setCity(user.shippingAddress?.city || "");
      setState(user.shippingAddress?.state || "");
      setZipCode(user.shippingAddress?.zipCode || "");
      setAddresses(user.addresses || []);
    }
  }, [user]);

  useEffect(() => {
    if (activeView === "giftcards" && user?.mobileNumber) {
      fetchReceivedCards();
    }
  }, [activeView, user]);

  useEffect(() => {
    if (oldPassword.length > 0 && !isOldPasswordVerified && !verifyingOldPassword) {
      const timer = setTimeout(() => {
        handleAutoVerifyPassword();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (oldPassword.length === 0) {
      setOldPasswordError("");
    }
  }, [oldPassword]);

  const handleAutoVerifyPassword = async () => {
    if (!user || !oldPassword) return;
    
    setVerifyingOldPassword(true);
    setOldPasswordError("");
    try {
      const response = await fetch(getApiUrl("/api/auth/verify-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: user.mobileNumber,
          password: oldPassword
        }),
      });

      const data = await response.json();
      if (response.ok && data.isValid) {
        setIsOldPasswordVerified(true);
        toast.success("Identity verified.");
      } else {
        setOldPasswordError(data.detail || "Incorrect password.");
      }
    } catch (error: any) {
      setOldPasswordError("System connection error.");
    } finally {
      setVerifyingOldPassword(false);
    }
  };

  const fetchReceivedCards = async () => {
    setCardsLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/gift-cards/received/${user?.mobileNumber}`));
      if (response.ok) {
        const data = await response.json();
        setReceivedCards(data);
      }
    } catch (error) {
      toast.error("Could not fetch the gift card details.");
    } finally {
      setCardsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();
      if (response.ok) {
        setProfilePicture(data.url);
        toast.success("Image uploaded. Please save changes to finalize.");
      } else {
        toast.error(data.detail || "Upload failed.");
      }
    } catch (error) {
      toast.error("System connection error during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const isEditing = !!editingAddress;
      const url = isEditing 
        ? getApiUrl(`/api/auth/addresses/${editingAddress.id}`)
        : getApiUrl("/api/auth/addresses");
      
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || user._id,
          address: addressForm
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setAddresses(data.addresses);
        syncUser(data.user);
        setIsAddressModalOpen(false);
        toast.success(isEditing ? "Address updated successfully." : "Address added successfully.");
      } else {
        throw new Error(data.detail || "Failed to save address.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation for mobile number (last part should be 10 digits)
    const mobileParts = mobileNumber.split(" ");
    const pureNumber = mobileParts.length === 2 ? mobileParts[1] : mobileNumber.replace(/\D/g, "");
    
    if (pureNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/auth/profile/update"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || user._id,
          mobileNumber,
          fullName,
          email,
          profilePicture
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        syncUser(data.user);
        toast.success("Personal details updated successfully");
      } else {
        throw new Error(data.detail || "Update failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOldPassword = async () => {
    // Keep this for manual backup if needed, but UI now uses handleAutoVerifyPassword
    handleAutoVerifyPassword();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/auth/change-password"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: user.mobileNumber,
          oldPassword,
          newPassword
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        toast.success("Security credentials updated");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsOldPasswordVerified(false);
        setActiveView("details");
      } else {
        throw new Error(data.detail || "Password change failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] relative overflow-hidden">
      <Header />
      
      {/* Luxury Aura Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px] opacity-40" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[-5%] w-[40%] h-[50%] bg-rose-light/10 rounded-full blur-[100px] opacity-30" 
        />
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] right-[10%] w-[25%] h-[35%] bg-secondary/10 rounded-full blur-[100px] opacity-20" 
        />
      </div>
      
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-14 lg:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start mb-10 md:mb-14 text-center md:text-left relative">
            <div className="relative group">
              <div className="relative z-10 w-36 h-36 md:w-48 md:h-48 rounded-full p-1.5 bg-gradient-to-tr from-gold/40 via-gold/10 to-transparent">
                <div className="w-full h-full rounded-full bg-white border border-gold/10 flex items-center justify-center text-gold overflow-hidden">
                  {profilePicture ? (
                    <img src={getAssetUrl(profilePicture)} alt={fullName} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <span className="font-display text-5xl md:text-6xl font-light">{user.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 w-10 h-10 md:w-12 md:h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-gold hover:text-charcoal transition-all duration-500 scale-90 group-hover:scale-100"
              >
                <Camera size={18} />
              </button>
              
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-gold/10 rounded-full blur-2xl -z-10 animate-pulse" />
            </div>
            
            <div className="space-y-2 md:space-y-4 pt-0 md:pt-4">
              <div className="flex items-center justify-center md:justify-start gap-4 text-gold">
                <div className="h-[1px] w-8 bg-gold/40" />
                <span className="text-[10px] md:text-xs font-body font-bold uppercase tracking-[0.4em] mb-0.5">Verified Member</span>
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal tracking-tight lowercase leading-[0.9]">
                  {user.fullName}
                </h1>
                <p className="font-display text-xl md:text-2xl text-muted-foreground/60 italic font-light lowercase">
                  our <span className="text-charcoal font-medium">Valued Member</span>
                </p>
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-body max-w-sm italic leading-relaxed">
                "Experience the glow with our premium skincare collections."
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-6">

              <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-2 md:gap-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {[
                  { id: "details", label: "Profile Details", icon: <User size={18} /> },
                  { id: "addresses", label: "Saved Addresses", icon: <MapPin size={18} /> },
                  { id: "orders", label: "Order History", icon: <ShoppingBag size={18} /> },
                  { id: "wishlist", label: "My Wishlist", icon: <Heart size={18} /> },
                  { id: "giftcards", label: "My Gift Cards", icon: <Gift size={18} /> },
                  { id: "password", label: "Security Settings", icon: <Lock size={18} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "orders") {
                        window.location.href = "/orders";
                      } else if (item.id === "wishlist") {
                        window.location.href = "/wishlist";
                      } else {
                        setActiveView(item.id as ProfileView);
                      }
                    }}
                    className={`flex-shrink-0 lg:flex-shrink-1 flex items-center justify-between py-3 px-4 md:py-3 md:px-5 rounded-2xl md:rounded-[2rem] transition-all duration-500 group relative overflow-hidden ${
                      activeView === item.id 
                        ? "bg-white shadow-xl shadow-gold/5 text-charcoal translate-x-2" 
                        : "text-muted-foreground/60 hover:text-gold hover:bg-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-2 rounded-xl transition-all duration-500 ${activeView === item.id ? "bg-gold/10 text-gold" : "group-hover:text-gold"}`}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] md:text-xs font-body font-bold uppercase tracking-[0.2em] leading-none">{item.label}</span>
                    </div>
                    {activeView === item.id && (
                      <motion.div 
                        layoutId="active-marker"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gold rounded-full" 
                      />
                    )}
                    <ChevronRight size={14} className={`transition-all duration-500 opacity-0 lg:block ${activeView === item.id ? "opacity-100 translate-x-0" : "-translate-x-4 opacity-0 group-hover:opacity-40"}`} />
                  </button>
                ))}
                
                <button 
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className="flex-shrink-0 lg:flex-shrink-1 flex items-center gap-4 py-3 px-4 md:py-3 md:px-5 rounded-2xl md:rounded-[2rem] text-rose-brand/60 hover:text-rose-brand hover:bg-rose-brand/5 transition-all mt-0 lg:mt-4 group"
                >
                  <div className="p-2 rounded-xl bg-rose-brand/5">
                    <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <span className="text-[10px] md:text-xs font-body font-bold uppercase tracking-[0.2em]">Logout</span>
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeView === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-10 lg:p-12 shadow-ethereal border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold">
                          <Sparkles size={14} className="opacity-50" />
                          <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Profile Info</span>
                        </div>
                        <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Profile <span className="text-gold italic font-light">Details</span></h3>
                      </div>
                      
                      <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-1.5 group">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gold rounded-full" />
                            Full Name
                          </label>
                        <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-4 md:py-5 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                            required
                          />
                        </div>
                      </div>

                        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                          <div className="space-y-1.5 group">
                            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                              <span className="w-1 h-1 bg-gold rounded-full" />
                              Email Address
                            </label>
                          <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                            <input
                              type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-4 md:py-5 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                required
                              />
                          </div>
                        </div>
                          <div className="space-y-1.5 group">
                            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                              <span className="w-1 h-1 bg-gold rounded-full" />
                              Mobile Number
                            </label>
                          <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                            <PhoneInput 
                              value={mobileNumber}
                              onChange={(val) => setMobileNumber(val)}
                              className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-2 md:py-2.5 pl-12 md:pl-16 pr-8 font-body text-sm md:text-base focus-within:bg-white focus-within:border-gold/30 focus-within:shadow-xl focus-within:shadow-gold/5 outline-none transition-all duration-500"
                              placeholder="00000 00000"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-10">
                          <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 md:py-4 bg-charcoal text-white font-body font-bold uppercase tracking-[0.3em] rounded-xl md:rounded-2xl hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl relative overflow-hidden group"
                          >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 size={18} />
                                <span>Update Profile</span>
                              </>
                            )}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

                {activeView === "password" && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-10 lg:p-12 shadow-ethereal border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold">
                          <Lock size={14} className="opacity-50" />
                          <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Password Settings</span>
                        </div>
                        <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Security <span className="text-gold italic font-light">Settings</span></h3>
                      </div>
                      
                      <form onSubmit={handleChangePassword} className="space-y-8">
                        <div className="space-y-4 group">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gold rounded-full" />
                            Current Password
                          </label>
                          <div className="flex flex-col gap-3">
                            <div className="relative">
                              <input
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                disabled={isOldPasswordVerified}
                                onChange={(e) => {
                                  setOldPassword(e.target.value);
                                  setOldPasswordError("");
                                }}
                                className={`w-full bg-white/40 border rounded-2xl md:rounded-[1.2rem] py-3 md:py-4 pl-8 pr-16 font-body text-sm md:text-base outline-none transition-all duration-500 ${
                                  isOldPasswordVerified 
                                    ? "border-emerald-500/30 bg-emerald-500/[0.02] text-emerald-600" 
                                    : oldPasswordError 
                                      ? "border-rose-500/30 bg-rose-500/[0.02]" 
                                      : "border-gold/5 focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5"
                                }`}
                                placeholder="••••••••"
                                required
                              />
                              
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                {verifyingOldPassword && (
                                  <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                )}
                                
                                {isOldPasswordVerified && (
                                  <div className="text-emerald-500 flex items-center gap-2 pr-2">
                                    <ShieldCheck size={18} />
                                    <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">Verified</span>
                                  </div>
                                )}

                                {!isOldPasswordVerified && (
                                  <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="text-muted-foreground hover:text-gold transition-colors"
                                  >
                                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                )}

                                {isOldPasswordVerified && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOldPasswordVerified(false);
                                      setOldPassword("");
                                      setOldPasswordError("");
                                    }}
                                    className="text-[9px] font-black uppercase tracking-widest text-gold hover:underline"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {oldPasswordError && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl"
                              >
                                <AlertCircle size={14} className="text-rose-500" />
                                <span className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest">{oldPasswordError}</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {isOldPasswordVerified && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -20 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -20 }}
                              className="overflow-hidden space-y-8"
                            >
                              <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                              
                              <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-1.5 group">
                                  <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold rounded-full" />
                                    New Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={showNewPassword ? "text" : "password"}
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.2rem] py-3 md:py-4 pl-8 pr-16 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                      placeholder="••••••••"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                      className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                                    >
                                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1.5 group">
                                  <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-gold rounded-full" />
                                    Confirm Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={showConfirmPassword ? "text" : "password"}
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.2rem] py-3 md:py-4 pl-8 pr-16 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                      placeholder="••••••••"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                                    >
                                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2">
                                <button
                                  disabled={passwordLoading}
                                  type="submit"
                                  className="w-full py-3 md:py-4 bg-charcoal text-white font-body font-bold uppercase tracking-[0.3em] rounded-xl md:rounded-2xl hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl overflow-hidden group relative"
                                >
                                  <span className="relative z-10 flex items-center justify-center gap-3">
                                    {passwordLoading ? (
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <ShieldCheck size={18} />
                                        <span>Update Password</span>
                                      </>
                                    )}
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </form>
                    </div>
                  </motion.div>
                )}



                {activeView === "addresses" && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-10 lg:p-12 shadow-ethereal border border-white/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        <div className="relative space-y-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gold">
                                        <MapPin size={14} className="opacity-50" />
                                        <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Addresses</span>
                                    </div>
                                    <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Saved <span className="text-gold italic font-light">Addresses</span></h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingAddress(null);
                                        setAddressForm({
                                            label: "Home",
                                            fullName: user?.fullName || "",
                                            mobile: user?.mobileNumber || "",
                                            street: "",
                                            city: "",
                                            state: "Gujarat",
                                            zipCode: "",
                                            isDefault: addresses.length === 0
                                        });
                                        setIsAddressModalOpen(true);
                                    }}
                                    className="flex items-center gap-3 px-5 py-2.5 bg-charcoal text-white rounded-full font-body text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-xl shadow-charcoal/10"
                                >
                                    <Plus size={16} /> Add New Address
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {addresses.map((addr, idx) => (
                                    <motion.div
                                        key={addr.id || idx}
                                        whileHover={{ y: -5 }}
                                        className="bg-white p-8 rounded-[2rem] border border-gold/10 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 transition-all duration-500 relative group"
                                    >
                                        {addr.isDefault && (
                                            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                                                <Sparkles size={10} className="text-gold" />
                                                <span className="text-[9px] font-bold text-gold uppercase tracking-widest">Default</span>
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-gold/40">
                                                {addr.label === "Home" ? <Home size={18} /> : addr.label === "Work" ? <Building size={18} /> : <MapPin size={18} />}
                                                <span className="text-xs font-bold uppercase tracking-[0.2em]">{addr.label}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-display text-xl font-bold text-charcoal">{addr.fullName}</p>
                                                <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">{addr.state}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-body text-sm text-charcoal/80 leading-relaxed italic">
                                                    {addr.street}, {addr.city} - {addr.zipCode}
                                                </p>
                                                <p className="font-body text-[10px] text-muted-foreground/50">
                                                    Mobile: {addr.mobile}
                                                </p>
                                            </div>
                                            <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => {
                                                        setEditingAddress(addr);
                                                        setAddressForm(addr);
                                                        setIsAddressModalOpen(true);
                                                    }}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                {!addr.isDefault && (
                                                    <>
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch(getApiUrl(`/api/auth/addresses/${addr.id}/default`), {
                                                                        method: "PUT",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ userId: user.id })
                                                                    });
                                                                    if (res.ok) {
                                                                        const data = await res.json();
                                                                        setAddresses(data.addresses);
                                                                        syncUser(data.user);
                                                                        toast.success("Default address updated.");
                                                                    }
                                                                } catch (err) {
                                                                    toast.error("Failed to update address.");
                                                                }
                                                            }}
                                                            className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
                                                        >
                                                            Set as Default
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                if (!confirm("Are you sure you want to delete this address?")) return;
                                                                try {
                                                                    const res = await fetch(getApiUrl(`/api/auth/addresses/${addr.id}?userId=${user.id}`), {
                                                                        method: "DELETE"
                                                                    });
                                                                    if (res.ok) {
                                                                        const data = await res.json();
                                                                        setAddresses(data.addresses);
                                                                        syncUser(data.user);
                                                                        toast.success("Address removed from the network.");
                                                                    }
                                                                } catch (err) {
                                                                    toast.error("Failed to remove the address.");
                                                                }
                                                            }}
                                                            className="text-[10px] font-bold uppercase tracking-widest text-rose-500/60 hover:text-rose-500 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                {addresses.length === 0 && (
                                    <div className="md:col-span-2 text-center py-20 border-2 border-dashed border-gold/10 rounded-[3rem] space-y-6">
                                        <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto text-gold/30">
                                            <MapPin size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-display text-2xl font-bold text-charcoal">No Saved Addresses.</h4>
                                            <p className="text-xs font-body text-muted-foreground uppercase tracking-widest italic font-light">Add an address to speed up your checkout.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}

                {activeView === "giftcards" && (
                  <motion.div
                    key="giftcards"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-10 lg:p-12 shadow-ethereal border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold">
                          <Gift size={14} className="opacity-50" />
                          <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">My Account</span>
                        </div>
                        <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Gifting <span className="text-gold italic font-light">History</span></h3>
                      </div>

                      {cardsLoading ? (
                        <div className="space-y-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-48 bg-secondary/20 animate-pulse rounded-[2.5rem]" />
                            ))}
                        </div>
                      ) : receivedCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {receivedCards.map((card, idx) => (
                            <motion.div
                              key={idx}
                              whileHover={{ y: -10 }}
                              className="relative aspect-[16/10] bg-charcoal rounded-[2.5rem] overflow-hidden shadow-2xl group border border-gold/10"
                            >
                              <img src={getAssetUrl(card.image)} className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white bg-black/30 backdrop-blur-[2px]">
                                <div className="flex justify-between items-start">
                                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <span className="font-display text-[10px] tracking-widest uppercase font-bold text-white">{card.code}</span>
                                  </div>
                                  <div className="font-display text-2xl lg:text-3xl font-bold text-gold">₹{card.balance.toLocaleString()}</div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-[1px] bg-white/20 w-full" />
                                  <p className="text-[9px] uppercase tracking-[0.3em] font-medium opacity-60 text-white">Recipient</p>
                                  <p className="font-display text-xl lg:text-2xl font-bold italic text-white">{card.recipientName}</p>
                                  {card.message && (
                                    <p className="text-xs font-body font-light italic mt-3 opacity-90 line-clamp-2 text-white/90">"{card.message}"</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-secondary/5 rounded-[3rem] border border-dashed border-gold/20 flex flex-col items-center justify-center">
                           <div className="w-20 h-20 bg-gold/5 rounded-full flex items-center justify-center mb-6 text-gold/20">
                             <Gift size={40} />
                           </div>
                           <h4 className="font-display text-2xl font-bold text-charcoal opacity-60">No Gift Cards Found.</h4>
                           <p className="text-[10px] font-body text-muted-foreground mt-4 italic max-w-xs leading-relaxed uppercase tracking-widest">
                             Cards added via the Admin Panel will appear here for the registered recipient.
                           </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <LogoutConfirmation 
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutDialogOpen(false);
          window.location.href = "/";
        }}
      />

      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#faf9f6] rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gold">
                      <MapPin size={14} className="opacity-50" />
                      <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Address Manager</span>
                    </div>
                    <h3 className="font-display text-4xl font-bold text-charcoal">{editingAddress ? "Update" : "Add New"} <span className="text-gold italic font-light">Address</span></h3>
                  </div>
                  <button 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="w-10 h-10 border border-gold/10 rounded-full flex items-center justify-center text-charcoal/40 hover:text-gold hover:border-gold/30 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitAddress} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Tag size={10} /> Address Type
                      </label>
                      <div className="relative">
                        <select 
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                          className="w-full h-16 bg-white border border-gold/10 rounded-2xl px-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none shadow-sm"
                        >
                          <option value="Home">Home Address</option>
                          <option value="Work">Office Address</option>
                          <option value="Other">Other Address</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/40 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <User size={10} /> Full Name
                      </label>
                      <div className="relative">
                        <input 
                          type="text" required
                          className="w-full h-16 bg-white border border-gold/10 rounded-2xl px-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                          placeholder="Recipient Name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                      <Building size={10} /> Street Address
                    </label>
                    <textarea 
                      required rows={2}
                      className="w-full bg-white border border-gold/10 rounded-2xl p-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm resize-none"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                      placeholder="Street, Building, Unit"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <MapPin size={10} /> City
                      </label>
                      <input 
                        type="text" required
                        className="w-full h-16 bg-white border border-gold/10 rounded-2xl px-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Landmark size={10} /> State
                      </label>
                      <div className="relative">
                        <select 
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                          className="w-full h-16 bg-white border border-gold/10 rounded-2xl px-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none shadow-sm"
                        >
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/40 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Scan size={10} /> Pincode
                      </label>
                      <input 
                        type="text" required maxLength={6}
                        className="w-full h-16 bg-white border border-gold/10 rounded-2xl px-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value.replace(/\D/g, "")})}
                        placeholder="6-digit Pincode"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 pl-1 group-focus-within:text-gold transition-colors flex items-center gap-2">
                        <Smartphone size={10} /> Mobile Number
                      </label>
                      <input 
                        type="tel" required
                        className="w-full h-16 bg-white border border-gold/10 rounded-2xl px-6 font-body text-charcoal focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                        value={addressForm.mobile}
                        onChange={(e) => setAddressForm({...addressForm, mobile: e.target.value})}
                        placeholder="Mobile Number"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4 pl-2">
                    <input 
                      type="checkbox"
                      id="isDefault"
                      className="w-5 h-5 rounded-lg border-gold/30 text-gold focus:ring-gold/20"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    />
                    <label htmlFor="isDefault" className="text-xs font-bold text-charcoal/60 uppercase tracking-widest cursor-pointer hover:text-gold transition-colors">
                      Set as default shipping address
                    </label>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 md:h-16 bg-charcoal text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-2xl shadow-charcoal/20 flex items-center justify-center gap-4 group"
                  >
                    {loading ? "Saving..." : (
                      <>
                        {editingAddress ? "Update Address" : "Save Address"}
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
