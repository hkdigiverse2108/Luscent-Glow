import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, ShieldCheck, 
  Settings, LogOut, ChevronRight, 
  Camera, ShoppingBag, Heart, CreditCard,
  Lock, CheckCircle2, AlertCircle, Plus,
  MapPin, Home, Globe, Building, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LogoutConfirmation from "@/components/auth/LogoutConfirmation";

type ProfileView = "details" | "orders" | "wishlist" | "payments" | "password";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/auth/profile/update"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || user._id,
          mobileNumber,
          fullName,
          email,
          profilePicture: profilePicture || undefined,
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
      const response = await fetch(getApiUrl("/auth/change-password"), {
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
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start mb-16 md:mb-24 text-center md:text-left relative">
            <div className="relative group">
              <div className="relative z-10 w-36 h-36 md:w-48 md:h-48 rounded-full p-1.5 bg-gradient-to-tr from-gold/40 via-gold/10 to-transparent">
                <div className="w-full h-full rounded-full bg-white border border-gold/10 flex items-center justify-center text-gold overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt={fullName} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
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
            
            <div className="space-y-4 md:space-y-6 pt-0 md:pt-4">
              <div className="flex items-center justify-center md:justify-start gap-4 text-gold">
                <div className="h-[1px] w-8 bg-gold/40" />
                <span className="text-[10px] md:text-xs font-body font-bold uppercase tracking-[0.4em] mb-0.5">Verified Member</span>
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal tracking-tight lowercase leading-[0.9]">
                  {user.fullName}
                </h1>
                <p className="font-display text-xl md:text-2xl text-muted-foreground/60 italic font-light lowercase">
                  the <span className="text-charcoal font-medium">Radiance Guardian</span>
                </p>
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-body max-w-sm italic leading-relaxed">
                "A curator of radiance and keeper of sacred wellness ritual protocols."
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-10">

              <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-2 md:gap-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {[
                  { id: "details", label: "Profile Details", icon: <User size={18} /> },
                  { id: "orders", label: "Order History", icon: <ShoppingBag size={18} /> },
                  { id: "wishlist", label: "My Wishlist", icon: <Heart size={18} /> },
                  { id: "payments", label: "Payment Methods", icon: <CreditCard size={18} /> },
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
                    className={`flex-shrink-0 lg:flex-shrink-1 flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[2rem] transition-all duration-500 group relative overflow-hidden ${
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
                  className="flex-shrink-0 lg:flex-shrink-1 flex items-center gap-4 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-rose-brand/60 hover:text-rose-brand hover:bg-rose-brand/5 transition-all mt-0 lg:mt-10 group"
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
                    className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 lg:p-20 shadow-ethereal border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative space-y-12">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold">
                          <Sparkles size={14} className="opacity-50" />
                          <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Profile Info</span>
                        </div>
                        <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Profile <span className="text-gold italic font-light">Details</span></h3>
                      </div>
                      
                      <form onSubmit={handleUpdate} className="space-y-12">
                        <div className="space-y-5 group">
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

                        <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
                          <div className="space-y-5 group">
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
                          <div className="space-y-5 group">
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

                      <div className="pt-8 border-t border-gold/10">
                        <div className="flex items-center gap-3 text-gold mb-8">
                          <MapPin size={22} className="opacity-80" />
                          <h4 className="font-display text-xl md:text-2xl font-bold text-charcoal">Shipping Address</h4>
                        </div>
                        
                        <div className="space-y-8">
                          <div className="space-y-4 group">
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

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-4 group">
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
                            <div className="space-y-4 group">
                              <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">State</label>
                              <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                  type="text"
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  className="w-full bg-white/40 border border-gold/5 rounded-2xl md:rounded-[1.5rem] py-5 md:py-7 pl-16 md:pl-20 pr-8 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 focus:shadow-xl focus:shadow-gold/5 outline-none transition-all duration-500"
                                />
                              </div>
                            </div>
                            <div className="col-span-2 lg:col-span-1 space-y-4 group">
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
                    className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 lg:p-20 shadow-ethereal border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative space-y-12">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold">
                          <Lock size={14} className="opacity-50" />
                          <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Password Settings</span>
                        </div>
                        <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Security <span className="text-gold italic font-light">Settings</span></h3>
                      </div>
                      
                      <form onSubmit={handleChangePassword} className="space-y-10">
                        <div className="space-y-5 group">
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
                          <div className="space-y-5 group">
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
                          <div className="space-y-5 group">
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

                {activeView === "payments" && (
                  <motion.div
                    key="payments"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 lg:p-20 shadow-ethereal border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative space-y-12">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gold">
                            <CreditCard size={14} className="opacity-50" />
                            <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Payment Methods</span>
                          </div>
                          <h3 className="font-display text-4xl md:text-5xl font-bold text-charcoal capitalize">Saved <span className="text-gold italic font-light">Cards</span></h3>
                        </div>
                        <button className="flex items-center gap-3 px-8 py-4 bg-gold/10 text-gold rounded-full hover:bg-gold hover:text-charcoal transition-all duration-500 text-[10px] font-body font-bold uppercase tracking-[0.2em] shadow-lg shadow-gold/5">
                          <Plus size={16} /> Add New Card
                        </button>
                      </div>

                      <div className="space-y-8">
                        {/* Premium Card Mockup 1 */}
                        <motion.div 
                          whileHover={{ y: -10 }}
                          className="relative group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-[#1a1a1a] rounded-[2rem] md:rounded-[2.5rem] transform transition-transform group-hover:scale-[1.03] duration-700 shadow-2xl" />
                          <div className="relative p-10 md:p-12 flex flex-col justify-between h-[280px] md:h-[320px] text-white">
                            <div className="flex justify-between items-start">
                              <div className="w-16 h-12 bg-white/5 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/10">
                                <span className="font-display text-sm italic font-medium">LCSNT</span>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] uppercase tracking-[0.4em] text-gold opacity-60">Aura Tier</p>
                                <p className="text-xs font-display italic">Platinum Member</p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-body">Primary Payment Card</p>
                                <p className="font-display text-2xl md:text-3xl tracking-[0.2em] font-light">•••• •••• •••• 4242</p>
                              </div>
                              <div className="flex gap-16 pt-4 border-t border-white/5">
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest text-white/30">Validity</p>
                                  <p className="text-xs font-body font-medium tracking-widest">12 / 26</p>
                                </div>
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest text-white/30">Holder</p>
                                  <p className="text-xs font-body font-medium tracking-widest capitalize">{user.fullName}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Decorative element */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
                          </div>
                        </motion.div>

                        {/* Mockup 2 - UPI */}
                        <div className="p-10 rounded-[2.5rem] border border-gold/5 bg-white shadow-xl shadow-gold/5 flex flex-col sm:flex-row justify-between items-center group hover:border-gold/30 transition-all duration-700 gap-8">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-gold/5 rounded-[1.5rem] flex items-center justify-center text-charcoal transition-transform duration-500 group-hover:scale-110">
                              <ShieldCheck size={28} className="text-gold" />
                            </div>
                            <div>
                              <p className="text-[10px] font-body font-bold text-charcoal/40 uppercase tracking-[0.3em] mb-1">Saved UPI</p>
                              <p className="text-lg font-display font-medium text-charcoal tracking-tight">{user.mobileNumber}@upi</p>
                            </div>
                          </div>
                          <button className="px-8 py-3 rounded-full text-[10px] font-body font-bold text-rose-brand border border-rose-brand/10 hover:bg-rose-brand hover:text-white transition-all duration-500 uppercase tracking-widest">Remove Card</button>
                        </div>
                      </div>
                      
                      <div className="mt-12 p-10 bg-[#fdfcfb] rounded-[2.5rem] border border-gold/5 flex gap-6 items-start relative overflow-hidden group">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                          <AlertCircle size={20} />
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 font-body leading-loose tracking-wide">
                          Your payment details are protected within our <span className="text-charcoal font-bold">Secure Payment System</span>. We never retain full card details or CVVs on our physical architecture, ensuring your details remain safe and secure.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />

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
