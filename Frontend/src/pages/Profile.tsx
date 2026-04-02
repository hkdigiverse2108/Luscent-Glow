import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, ShieldCheck, 
  Settings, LogOut, ChevronRight, 
  Camera, ShoppingBag, Heart, CreditCard,
  Lock, CheckCircle2, AlertCircle, Plus
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
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
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
      setProfilePicture(user.profilePicture || "");
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
          mobileNumber: user.mobileNumber,
          fullName,
          email,
          profilePicture: profilePicture || undefined
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
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start mb-12 md:mb-20 text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-gold overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-4xl md:text-5xl font-light">{user.fullName.charAt(0).toUpperCase()}</span>
                )}
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
                className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-8 h-8 md:w-10 md:h-10 bg-charcoal text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gold hover:text-charcoal transition-all"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <div className="space-y-3 md:space-y-4 pt-0 md:pt-4">
              <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 text-gold">
                <ShieldCheck size={16} />
                <span className="text-[9px] md:text-[10px] font-body font-bold uppercase tracking-[0.3em]">Verified Ritualist</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-charcoal tracking-tight lowercase leading-tight">
                {user.fullName.split(' ')[0]}<span className="text-gold">.</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-body max-w-md italic">
                A curator of radiance and keeper of sacred wellness.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Sidebar Navigation */}
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-3 md:gap-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { id: "details", label: "Details", icon: <User size={18} /> },
                { id: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
                { id: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
                { id: "payments", label: "Payments", icon: <CreditCard size={18} /> },
                { id: "password", label: "Security", icon: <Lock size={18} /> },
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
                  className={`flex-shrink-0 lg:flex-shrink-1 flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-500 group ${
                    activeView === item.id 
                      ? "bg-white shadow-lg border border-gold/10 text-charcoal" 
                      : "text-muted-foreground hover:bg-gold/5 bg-white/40 lg:bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`${activeView === item.id ? "text-gold" : "group-hover:text-gold"} transition-colors`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] md:text-xs font-body font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  {activeView === item.id && <ChevronRight size={16} className="text-gold hidden lg:block" />}
                </button>
              ))}
              
              <button 
                onClick={() => setIsLogoutDialogOpen(true)}
                className="flex-shrink-0 lg:flex-shrink-1 flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-2xl md:rounded-3xl text-rose-brand hover:bg-rose-brand/5 transition-all mt-0 lg:mt-8 group bg-rose-brand/5 lg:bg-transparent"
              >
                <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] md:text-xs font-body font-bold uppercase tracking-widest">Logout</span>
              </button>
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
                    className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-16 shadow-ethereal border border-gold/10"
                  >
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-charcoal">Identity Update</h3>
                    <form onSubmit={handleUpdate} className="space-y-10">
                      <div className="space-y-4 group">
                        <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-[#f8f8f8] border border-transparent rounded-xl md:rounded-2xl py-4 md:py-6 pl-14 md:pl-16 pr-6 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 outline-none transition-all duration-500 shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4 group">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors" size={18} />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#f8f8f8] border border-transparent rounded-xl md:rounded-2xl py-4 md:py-6 pl-14 md:pl-16 pr-6 font-body text-sm md:text-base focus:bg-white focus:border-gold/30 outline-none transition-all duration-500 shadow-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-4 group opacity-60">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">Mobile Number</label>
                          <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/30" size={18} />
                            <input
                              disabled
                              type="text"
                              value={user.mobileNumber}
                              className="w-full bg-[#f0f0f0] border border-transparent rounded-xl md:rounded-2xl py-4 md:py-6 pl-14 md:pl-16 pr-6 font-body text-sm md:text-base outline-none cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          disabled={loading}
                          type="submit"
                          className="w-full py-4 md:py-6 bg-charcoal text-white font-body font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] rounded-xl md:rounded-2xl hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-2xl overflow-hidden text-xs md:text-sm"
                        >
                          {loading ? "Syncing..." : "Update Details"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeView === "password" && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-ethereal border border-gold/10"
                  >
                    <h3 className="font-display text-3xl font-bold mb-12 text-charcoal">Security Sanctuary</h3>
                    <form onSubmit={handleChangePassword} className="space-y-8">
                      <div className="space-y-4 group">
                        <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">Current Password</label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-[#f8f8f8] border border-transparent rounded-2xl py-6 px-8 font-body focus:bg-white focus:border-gold/30 outline-none transition-all duration-500"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4 group">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#f8f8f8] border border-transparent rounded-2xl py-6 px-8 font-body focus:bg-white focus:border-gold/30 outline-none transition-all duration-500"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div className="space-y-4 group">
                          <label className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest pl-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#f8f8f8] border border-transparent rounded-2xl py-6 px-8 font-body focus:bg-white focus:border-gold/30 outline-none transition-all duration-500"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          disabled={passwordLoading}
                          type="submit"
                          className="w-full py-6 bg-charcoal text-white font-body font-bold uppercase tracking-[0.25em] rounded-2xl hover:bg-gold hover:text-charcoal transition-all duration-500 shadow-2xl"
                        >
                          {passwordLoading ? "Securing..." : "Update Security Credentials"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeView === "payments" && (
                  <motion.div
                    key="payments"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-ethereal border border-gold/10"
                  >
                    <div className="flex justify-between items-center mb-12">
                      <h3 className="font-display text-3xl font-bold text-charcoal">Saved Payments</h3>
                      <button className="flex items-center gap-2 px-6 py-3 bg-gold/10 text-gold rounded-full hover:bg-gold hover:text-charcoal transition-all text-[10px] font-body font-bold uppercase tracking-widest">
                        <Plus size={14} /> Add New Card
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Premium Card Mockup 1 */}
                      <div className="relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-charcoal/80 rounded-3xl transform transition-transform group-hover:scale-[1.02] duration-500" />
                        <div className="relative p-8 flex justify-between items-start text-white/90">
                          <div className="space-y-8">
                            <CreditCard size={32} className="text-gold/60" />
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-[0.3em] font-body opacity-60">Primary Ritual Card</p>
                              <p className="font-display text-xl tracking-widest">•••• •••• •••• 4242</p>
                            </div>
                            <div className="flex gap-12">
                              <div>
                                <p className="text-[8px] uppercase tracking-widest opacity-60">Expires</p>
                                <p className="text-xs font-body font-bold">12/26</p>
                              </div>
                              <div>
                                <p className="text-[8px] uppercase tracking-widest opacity-60">Aura Tier</p>
                                <p className="text-xs font-body font-bold text-gold">Platinum</p>
                              </div>
                            </div>
                          </div>
                          <div className="h-10 w-16 bg-white/10 rounded-lg backdrop-blur-md flex items-center justify-center font-display text-[10px] italic">VISA</div>
                        </div>
                      </div>

                      {/* Mockup 2 - UPI */}
                      <div className="p-8 rounded-3xl border border-gold/10 bg-gold/5 flex justify-between items-center group hover:border-gold/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-charcoal shadow-sm">
                            <ShieldCheck size={20} className="text-gold" />
                          </div>
                          <div>
                            <p className="text-xs font-body font-bold text-charcoal uppercase tracking-widest">Saved UPI Handle</p>
                            <p className="text-sm text-muted-foreground">{user.mobileNumber}@upi</p>
                          </div>
                        </div>
                        <button className="text-[10px] font-body font-bold text-rose-brand uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                      </div>
                    </div>
                    
                    <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                      <AlertCircle size={18} className="text-blue-500 mt-0.5" />
                      <p className="text-xs text-blue-700 font-body leading-relaxed">
                        Your payment details are encrypted using banking-grade security protocols. We never store your full card number or CVV on our servers.
                      </p>
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
