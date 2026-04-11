import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, ShieldCheck, 
  Settings, LogOut, ChevronRight, 
  Camera, ShoppingBag, Heart, CreditCard, Gift,
  Lock, CheckCircle2, AlertCircle, Plus,
  MapPin, Home, Globe, Building, Sparkles, ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import LogoutConfirmation from "@/components/auth/LogoutConfirmation";

type ProfileView = "details" | "orders" | "wishlist" | "password" | "giftcards";

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

  const [loading, setLoading] = useState(false);
  
  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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
    }
  }, [user]);

  useEffect(() => {
    if (activeView === "giftcards" && user?.mobileNumber) {
      fetchReceivedCards();
    }
  }, [activeView, user]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
          profilePicture,
          shippingAddress: {
            street,
            city,
            state,
            zipCode
          }
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
                  the <span className="text-charcoal font-medium">Valued Member</span>
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
                    className={`flex-shrink-0 lg:flex-shrink-1 flex items-center justify-between py-3 px-4 md:py-4 md:px-6 rounded-2xl md:rounded-[2rem] transition-all duration-500 group relative overflow-hidden ${
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
                  className="flex-shrink-0 lg:flex-shrink-1 flex items-center gap-4 py-3 px-4 md:py-4 md:px-6 rounded-2xl md:rounded-[2rem] text-rose-brand/60 hover:text-rose-brand hover:bg-rose-brand/5 transition-all mt-0 lg:mt-4 group"
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
                            className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
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
                                className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
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
                            <input
                              type="text"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                required
                              />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gold/10">
                        <div className="flex items-center gap-3 text-gold mb-4">
                          <MapPin size={22} className="opacity-80" />
                          <h4 className="font-display text-xl md:text-2xl font-bold text-charcoal">Shipping Address</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-1.5 group">
                            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">Street Address</label>
                            <div className="relative">
                              <Home className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                              <input
                                type="text"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                placeholder="House no., Street name, Area"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1.5 group">
                              <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">City</label>
                              <div className="relative">
                                <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                  type="text"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5 group">
                              <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">State</label>
                              <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors z-10" size={18} />
                                <select
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-12 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500 appearance-none cursor-pointer"
                                >
                                  <option value="" disabled className="text-muted-foreground">Select State</option>
                                  {INDIAN_STATES.map((s) => (
                                    <option key={s} value={s} className="bg-white text-charcoal">{s}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/30 pointer-events-none group-focus-within:text-gold transition-colors" size={16} />
                              </div>
                            </div>
                            <div className="col-span-2 lg:col-span-1 space-y-1.5 group">
                              <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">ZIP Code</label>
                              <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                  type="text"
                                  value={zipCode}
                                  onChange={(e) => setZipCode(e.target.value)}
                                  className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-10">
                        <button
                          disabled={loading}
                          type="submit"
                          className="w-full py-6 md:py-8 bg-charcoal text-white font-body font-bold uppercase tracking-[0.3em] rounded-2xl md:rounded-[2rem] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl relative overflow-hidden group"
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
                      
                      <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-1.5 group">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gold rounded-full" />
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 px-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-1.5 group">
                            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                              <span className="w-1 h-1 bg-gold rounded-full" />
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 px-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                          <div className="space-y-1.5 group">
                            <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-3 flex items-center gap-2">
                              <span className="w-1 h-1 bg-gold rounded-full" />
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 px-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-10">
                          <button
                            disabled={passwordLoading}
                            type="submit"
                            className="w-full py-6 md:py-8 bg-charcoal text-white font-body font-bold uppercase tracking-[0.3em] rounded-2xl md:rounded-[2rem] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl overflow-hidden"
                          >
                            {passwordLoading ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </form>
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
                          <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Personal Sanctuary</span>
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
    </div>
  );
};

export default Profile;
