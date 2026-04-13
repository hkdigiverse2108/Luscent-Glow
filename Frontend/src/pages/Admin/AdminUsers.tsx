import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Plus,
  Edit2, 
  Trash2, 
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Heart,
  X,
  ChevronRight,
  Shield,
  Clock,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ArrowLeft,
  Gift
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminUsers = () => {
  const { isDark } = useAdminTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const { user: adminUser } = useAuth();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState("");
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState("");
  const [showAdminAuthPassword, setShowAdminAuthPassword] = useState(false);
  
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "cart" | "wishlist" | "giftcards" | "addresses">("profile");
  const [isQuickView, setIsQuickView] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    isAdmin: false,
    profilePicture: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/users/"));
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(getApiUrl(`/api/users/${userId}`));
      if (response.ok) {
        const data = await response.json();
        setUserDetails({
          ...data,
          user: {
            ...data.user,
            password: "" 
          }
        });
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("User details could not be loaded.");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (adminAuthPassword.length > 0 && !isAdminVerified && !verifyingAdmin) {
      const timer = setTimeout(() => {
        handleAutoVerifyAdminAction();
      }, 800);
      return () => clearTimeout(timer);
    } else if (adminAuthPassword.length === 0) {
      setAdminAuthError("");
    }
  }, [adminAuthPassword]);

  const handleAutoVerifyAdminAction = async () => {
    if (!adminUser || !adminAuthPassword) return;
    
    setVerifyingAdmin(true);
    setAdminAuthError("");
    try {
      const response = await fetch(getApiUrl("/api/auth/verify-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: adminUser.mobileNumber,
          password: adminAuthPassword
        }),
      });

      const data = await response.json();
      if (response.ok && data.isValid) {
        setIsAdminVerified(true);
        toast.success("Password verified. Password settings unlocked.");
      } else {
        setAdminAuthError(data.detail || "Incorrect admin password.");
      }
    } catch (error: any) {
      setAdminAuthError("Connection error.");
    } finally {
      setVerifyingAdmin(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also clear their cart and wishlist.`)) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/users/${id}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted successfully.");
        fetchUsers();
        if (selectedUser?.id === id) setSelectedUser(null);
      } else {
        toast.error("Failed to delete user.");
      }
    } catch (error) {
      toast.error("Connection error.");
    }
  };

  const openUserDetails = (user: any, initialTab: "profile" | "cart" | "wishlist" | "giftcards" = "profile", quick: boolean = false) => {
    setSelectedUser(user);
    setUserDetails(null);
    setActiveTab(initialTab);
    setIsQuickView(quick);
    fetchUserDetails(user.id);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl("/api/users/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast.success("User added successfully.");
        setIsAddModalOpen(false);
        setNewUser({ 
          fullName: "", 
          email: "", 
          mobileNumber: "", 
          password: "", 
          isAdmin: false, 
          profilePicture: "",
          shippingAddress: { street: "", city: "", state: "", zipCode: "" }
        });
        fetchUsers();
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to add user.");
      }
    } catch (error) {
      toast.error("Connection error.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails?.user?.password) return toast.error("Please enter a new password.");
    if (userDetails.user.password !== confirmPassword) return toast.error("Passwords do not match.");

    try {
      const response = await fetch(getApiUrl(`/api/users/${userDetails.user.id || userDetails.user._id}/password`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: userDetails.user.password })
      });
      if (response.ok) {
        toast.success("User password updated successfully.");
        setUserDetails({...userDetails, user: {...userDetails.user, password: ""}});
        setConfirmPassword("");
        setIsAdminVerified(false);
        setAdminAuthPassword("");
      } else {
        toast.error("Error updating user password.");
      }
    } catch {
      toast.error("System error.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails?.user) return;

    const { password, ...updateData } = userDetails.user;

    try {
      const response = await fetch(getApiUrl(`/api/users/${userDetails.user.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success("User profile updated successfully.");
        fetchUsers();
      } else {
        const err = await response.json();
        toast.error(err.detail || "Could not update profile.");
      }
    } catch (error) {
      toast.error("Connection error.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobileNumber?.includes(searchQuery)
  );

  return (
    <div className="space-y-4 pb-8">
      <AdminHeader 
        title="User"
        highlightedWord="Management"
        subtitle="Full administrative control for all registered users"
        isDark={isDark}
        action={{
          label: "Add New User",
          onClick: () => setIsAddModalOpen(true),
          icon: Plus
        }}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
          }`} size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-xl shadow-charcoal/5"
            }`}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className={`backdrop-blur-3xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 min-h-[600px] ${
        isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-[12px] font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.04] border-white/10 text-white/50" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/80"
             }`}>
                <tr>
                   <th className="px-6 py-4">Full Name</th>
                   <th className="px-6 py-4">Contact</th>
                   <th className="px-6 py-4">Role</th>
                   <th className="px-6 py-4 text-center">Status</th>
                   <th className="px-10 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/10" : "divide-charcoal/10"
             }`}>
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-6"><div className="h-12 w-48 bg-white/5 rounded-xl" /></td>
                      <td className="px-6 py-6"><div className="h-12 w-40 bg-white/5 rounded-xl" /></td>
                      <td className="px-6 py-6"><div className="h-8 w-24 bg-white/5 rounded-xl" /></td>
                      <td className="px-6 py-6"><div className="h-8 w-20 mx-auto bg-white/5 rounded-xl" /></td>
                      <td className="px-6 py-6"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                   filteredUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-white/[0.02] transition-colors"
                    >
                       <td className="px-6 py-6">
                          <div>
                             <h4 className={`text-[15px] font-extrabold mb-1 group-hover/row:text-gold transition-colors ${
                               isDark ? "text-white" : "text-charcoal"
                             }`}>{u.fullName}</h4>
                             <p className={`text-[11px] font-black uppercase tracking-[0.2em] opacity-40 transition-colors ${
                               isDark ? "text-white" : "text-charcoal"
                             }`}>Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-2.5">
                                <Mail size={13} className="text-gold" />
                                <span className={`text-[13px] font-bold ${isDark ? "text-white/80" : "text-charcoal/80"}`}>{u.email}</span>
                             </div>
                             <div className="flex items-center gap-2.5">
                                <Phone size={13} className="text-gold" />
                                <span className={`text-[13px] font-bold ${isDark ? "text-white/80" : "text-charcoal/80"}`}>{u.mobileNumber}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          {u.isAdmin ? (
                            <span className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/30 shadow-lg shadow-gold/5 flex items-center gap-2 w-fit">
                              <Shield size={10} /> Admin
                            </span>
                          ) : u.isGuest ? (
                            <span className="px-3 py-1.5 rounded-full bg-rose-light/10 text-rose-brand text-[10px] font-black uppercase tracking-widest border border-rose-light/20 shadow-lg shadow-rose-light/5 flex items-center gap-2 w-fit">
                               <User size={10} /> Guest Lead
                            </span>
                          ) : (
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                              isDark ? "bg-white/5 border-white/10 text-white/40" : "bg-charcoal/5 border-charcoal/10 text-charcoal/40"
                            }`}>Registered</span>
                          )}
                       </td>
                       <td className="px-6 py-6 text-center">
                          {u.isVerified ? (
                            <div className="flex flex-col items-center gap-1">
                               <CheckCircle2 size={12} className="text-emerald-500 shadow-emerald-500" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Verified</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                               <AlertCircle size={12} className="text-rose-500" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60">Pending</span>
                            </div>
                          )}
                       </td>
                       <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                                onClick={() => openUserDetails(u, "giftcards", false)}
                                title="View Gift Cards"
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                             >
                                <Gift size={18} />
                             </button>
                             <button 
                                onClick={() => openUserDetails(u, "cart", false)}
                                title="View Cart"
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                             >
                                <ShoppingBag size={18} />
                             </button>
                             <button 
                                onClick={() => openUserDetails(u, "wishlist", false)}
                                title="View Wishlist"
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-500 hover:bg-rose-500/10"
                                }`}
                             >
                                <Heart size={18} />
                             </button>
                              <button 
                                 onClick={() => openUserDetails(u, "addresses", false)}
                                 title="View Addresses"
                                 className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                                   isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                 }`}
                              >
                                 <MapPin size={18} />
                              </button>
                             <button 
                                onClick={() => openUserDetails(u, "profile", false)}
                                title="View Profile"
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                             >
                                <Eye size={18} />
                             </button>
                             <button 
                                onClick={() => handleDelete(u.id, u.fullName)}
                                title="Delete User"
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-brand hover:bg-rose-brand/10"
                                }`}
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={`px-8 py-24 text-center font-body text-base uppercase tracking-widest italic transition-colors ${
                      isDark ? "text-white/40" : "text-charcoal/70"
                    }`}>
                      No users found.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative mx-auto w-full max-w-4xl p-8 rounded-[40px] border shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar pointer-events-auto ${
                isDark ? "bg-charcoal border-white/10" : "bg-white border-gold/20"
              }`}
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDark ? "bg-white/5 border-white/10 text-white/40 hover:text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal/40 hover:text-charcoal"
                }`}
              >
                <X size={20} />
              </button>

              <h3 className={`text-2xl font-bold mb-8 uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">Personal Information</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                        className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Email</label>
                        <input 
                          required
                          type="email" 
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Mobile Number</label>
                        <input 
                          required
                          type="text" 
                          value={newUser.mobileNumber}
                          onChange={(e) => setNewUser({...newUser, mobileNumber: e.target.value})}
                          className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Set Password</label>
                      <div className="relative group">
                         <input 
                           required
                           type={showAddPassword ? "text" : "password"} 
                           value={newUser.password}
                           onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                           className={`w-full px-5 py-4 pr-14 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                             isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal shadow-sm"
                           }`}
                         />
                         <button 
                            type="button"
                            onClick={() => setShowAddPassword(!showAddPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold transition-colors focus:outline-none"
                         >
                            {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                         </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="addUserAdmin" 
                          checked={newUser.isAdmin}
                          onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-gold"
                        />
                        <label htmlFor="addUserAdmin" className="text-[10px] font-black uppercase tracking-widest opacity-60">Admin Role</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">Shipping Address</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Street Address</label>
                      <input 
                        type="text" 
                        value={newUser.shippingAddress.street}
                        onChange={(e) => setNewUser({...newUser, shippingAddress: {...newUser.shippingAddress, street: e.target.value}})}
                        className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">City</label>
                        <input 
                          type="text" 
                          value={newUser.shippingAddress.city}
                          onChange={(e) => setNewUser({...newUser, shippingAddress: {...newUser.shippingAddress, city: e.target.value}})}
                          className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">State</label>
                        <input 
                          type="text" 
                          value={newUser.shippingAddress.state}
                          onChange={(e) => setNewUser({...newUser, shippingAddress: {...newUser.shippingAddress, state: e.target.value}})}
                          className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Zip Code</label>
                      <input 
                        type="text" 
                        value={newUser.shippingAddress.zipCode}
                        onChange={(e) => setNewUser({...newUser, shippingAddress: {...newUser.shippingAddress, zipCode: e.target.value}})}
                        className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                  <button type="submit" className="w-full max-w-md py-5 bg-gold text-charcoal font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all shadow-xl shadow-gold/20">Create User Profile</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Details & Edit Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative mx-auto w-full overflow-visible rounded-[40px] border shadow-2xl flex flex-col md:flex-row transition-all duration-700 pointer-events-auto ${
                isQuickView ? "max-w-3xl min-h-[500px]" : "max-w-5xl max-h-[90vh]"
              } ${
                isDark ? "bg-charcoal border-white/10 shadow-black/80" : "bg-white border-gold/20 shadow-charcoal/20"
              }`}
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDark ? "bg-white/5 border-white/10 text-white/40 hover:text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal/40 hover:text-charcoal"
                }`}
              >
                <X size={20} />
              </button>

              {/* Sidebar Info - Hidden in QuickView */}
              {!isQuickView && (
                <div className={`w-full md:w-80 p-8 border-b md:border-b-0 md:border-r transition-colors ${
                  isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
                }`}>
                  <div className="space-y-8">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative w-32 h-32 rounded-[40px] bg-gradient-to-tr from-gold/20 to-rose-light/20 p-1">
                        <div className={`w-full h-full rounded-[38px] overflow-hidden bg-charcoal flex items-center justify-center relative ${
                          isDark ? "border-white/10" : "border-gold/10 shadow-inner"
                        }`}>
                           <div 
                            onClick={() => {
                              const menu = document.getElementById('sidebar-photo-menu');
                              if (menu) menu.classList.toggle('hidden');
                            }}
                            className="relative w-full h-full cursor-pointer group"
                          >
                            {selectedUser.profilePicture ? (
                              <img src={getAssetUrl(selectedUser.profilePicture)} alt={selectedUser.fullName} className="w-full h-full object-cover rounded-[38px]" />
                            ) : (
                              <User size={48} className="text-white/10" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[38px]">
                               <Edit2 size={24} className="text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Sidebar Photo Selection Menu - Outside the overflow-hidden div */}
                        <div id="sidebar-photo-menu" className="hidden absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 py-3 bg-charcoal border border-white/10 rounded-2xl shadow-2xl z-[100] backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                           <button 
                             type="button"
                             onClick={(e) => {
                               e.stopPropagation();
                               document.getElementById('sidebar-avatar-upload')?.click();
                               document.getElementById('sidebar-photo-menu')?.classList.add('hidden');
                             }}
                             className="w-full px-5 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-gold hover:bg-white/5 transition-all flex items-center gap-3"
                           >
                              <ImageIcon size={14} /> Upload Photo
                           </button>
                           {selectedUser.profilePicture && (
                             <button 
                               type="button"
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 try {
                                   const updatedUser = { ...selectedUser, profilePicture: "" };
                                   const response = await fetch(getApiUrl(`/api/users/${selectedUser.id}`), {
                                     method: "PUT",
                                     headers: { "Content-Type": "application/json" },
                                     body: JSON.stringify(updatedUser),
                                   });
                                   if (response.ok) {
                                     setSelectedUser(updatedUser);
                                     if (userDetails) setUserDetails({ ...userDetails, user: updatedUser });
                                     setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
                                     toast.success("Profile picture removed.");
                                   }
                                 } catch (err) {
                                    toast.error("Process interrupted.");
                                 }
                                 document.getElementById('sidebar-photo-menu')?.classList.add('hidden');
                               }}
                               className="w-full px-5 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all flex items-center gap-3 border-t border-white/5"
                             >
                                <Trash2 size={14} /> Remove Photo
                             </button>
                           )}
                        </div>

                        <input 
                          type="file" 
                          id="sidebar-avatar-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const uploadResponse = await fetch(getApiUrl("/api/upload"), {
                                method: "POST",
                                body: formData,
                              });
                              const uploadData = await uploadResponse.json();
                              if (uploadResponse.ok) {
                                const updatedUser = { ...selectedUser, profilePicture: uploadData.url };
                                const updateResponse = await fetch(getApiUrl(`/api/users/${selectedUser.id}`), {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(updatedUser),
                                });
                                if (updateResponse.ok) {
                                  setSelectedUser(updatedUser);
                                  if (userDetails) setUserDetails({ ...userDetails, user: updatedUser });
                                  setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
                                  toast.success("Profile visual updated.");
                                } else {
                                  toast.error("Database sync failed.");
                                }
                              } else {
                                toast.error(uploadData.detail || "Upload failed.");
                              }
                            } catch (err) {
                              toast.error("Photo processing error.");
                            }
                          }}
                        />
                      </div>
                      <div className="text-center space-y-2 pt-2">
                         <h3 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>{selectedUser.fullName}</h3>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                           {selectedUser.isGuest ? "Guest User" : `User ID: ${selectedUser.id}`}
                         </p>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">
                      <div className="grid grid-cols-1 gap-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Mail size={14} /></div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</p>
                               <p className="text-[13px] font-bold opacity-80">{selectedUser.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Phone size={14} /></div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Mobile</p>
                               <p className="text-[13px] font-bold opacity-80">{selectedUser.mobileNumber}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-rose-light/10 flex items-center justify-center text-rose-brand"><Clock size={14} /></div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Joined</p>
                               <p className="text-[13px] font-bold opacity-80">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {isQuickView ? (
                  <div className={`flex items-center justify-between px-8 py-6 border-b ${isDark ? "border-white/5" : "border-charcoal/5"}`}>
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsQuickView(false)}
                          className={`p-2 rounded-xl border transition-all ${isDark ? "bg-white/5 border-white/10 text-white/40 hover:text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal/40 hover:text-charcoal"}`}
                        >
                           <ArrowLeft size={16} />
                        </button>
                        <div>
                          <h4 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                            {selectedUser.fullName}'s {activeTab === "cart" ? "Shopping Cart" : activeTab === "giftcards" ? "Gift Cards" : "Wishlist"}
                          </h4>
                          <p className={`text-[10px] font-black uppercase tracking-widest opacity-40`}>
                            {activeTab === "cart" ? `Total items: ${userDetails?.cart?.length || 0}` : 
                             activeTab === "giftcards" ? `Total cards: ${userDetails?.giftCards?.length || 0}` : 
                             `Total saving: ${userDetails?.wishlist?.length || 0}`}
                          </p>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className={`flex items-center px-8 pr-24 border-b ${isDark ? "border-white/5" : "border-charcoal/5"}`}>
                    {[
                      { id: "profile", label: "Profile", icon: Edit2 },
                      { id: "cart", label: "Cart", icon: ShoppingBag },
                      { id: "wishlist", label: "Wishlist", icon: Heart },
                      { id: "giftcards", label: "Gift Cards", icon: Gift },
                      { id: "addresses", label: "Addresses", icon: MapPin }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-6 text-[10px] font-black uppercase tracking-[0.25em] relative transition-all duration-500 whitespace-nowrap ${
                          activeTab === tab.id 
                          ? "text-gold translate-y-[-1px]" 
                          : isDark ? "text-white/40 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
                        }`}
                      >
                        <tab.icon size={11} className={activeTab === tab.id ? "text-gold" : "opacity-40"} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div 
                            layoutId="tabUnderline" 
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-gold rounded-full shadow-[0_-4px_12px_rgba(212,175,55,0.4)]" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {loadingDetails ? (
                    <div className="h-full flex items-center justify-center flex-col gap-4 opacity-40">
                       <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Details...</p>
                    </div>
                  ) : userDetails ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                      {activeTab === "profile" && (
                        <div className="space-y-16">
                          <form onSubmit={handleUpdateUser} className="space-y-12">
                             <div className="space-y-6">
                                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">Identity & Authentication</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                                      <input 
                                         type="text" 
                                         value={userDetails.user.fullName}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, fullName: e.target.value}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Email Address</label>
                                      <input 
                                         type="email" 
                                         value={userDetails.user.email}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, email: e.target.value}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Mobile Number</label>
                                      <input 
                                         type="text" 
                                         value={userDetails.user.mobileNumber}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, mobileNumber: e.target.value}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                   <div className="flex items-center gap-6 pt-4">
                                      <div className="flex items-center gap-3">
                                         <input 
                                            type="checkbox" 
                                            id="editAdmin" 
                                            checked={userDetails.user.isAdmin}
                                            onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, isAdmin: e.target.checked}})}
                                            className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-gold"
                                         />
                                         <label htmlFor="editAdmin" className="text-[10px] font-black uppercase tracking-widest opacity-60">Admin Role</label>
                                      </div>
                                      <div className="flex items-center gap-3">
                                         <input 
                                            type="checkbox" 
                                            id="editVerified" 
                                            checked={userDetails.user.isVerified}
                                            onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, isVerified: e.target.checked}})}
                                            className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-emerald-500"
                                         />
                                         <label htmlFor="editVerified" className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified</label>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">Shipping Information</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-2 md:col-span-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Street Address</label>
                                      <input 
                                         type="text" 
                                         value={userDetails.user.shippingAddress?.street || ""}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, shippingAddress: {...(userDetails.user.shippingAddress || {}), street: e.target.value}}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">City</label>
                                      <input 
                                         type="text" 
                                         value={userDetails.user.shippingAddress?.city || ""}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, shippingAddress: {...(userDetails.user.shippingAddress || {}), city: e.target.value}}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">State / Region</label>
                                      <input 
                                         type="text" 
                                         value={userDetails.user.shippingAddress?.state || ""}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, shippingAddress: {...(userDetails.user.shippingAddress || {}), state: e.target.value}}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Zip Code</label>
                                      <input 
                                         type="text" 
                                         value={userDetails.user.shippingAddress?.zipCode || ""}
                                         onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, shippingAddress: {...(userDetails.user.shippingAddress || {}), zipCode: e.target.value}}})}
                                         className={`w-full px-5 py-4 rounded-2xl border font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                                         }`}
                                      />
                                   </div>
                                </div>
                             </div>

                             <button type="submit" className="w-full py-4 bg-gold text-charcoal font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all shadow-xl shadow-gold/20">Save Profile Details</button>
                          </form>

                          {/* Security Reset Section */}
                          <div className={`p-10 rounded-[4rem] border transition-all duration-700 ${
                             isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-gold/10 shadow-charcoal/5"
                          }`}>
                             <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 opacity-60">
                                   <Lock size={12} className="text-gold" />
                                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Vault Security</span>
                                </div>
                                <h3 className={`text-4xl font-serif tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                                   Credential <span className="text-gold italic font-normal">Management</span>
                                </h3>
                             </div>

                             <form onSubmit={handleUpdatePassword} className="space-y-8">
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-gold" /> Admin Identity Verification
                                   </label>
                                   <div className="flex flex-col gap-3">
                                      <div className="relative">
                                         <input 
                                            type={showAdminAuthPassword ? "text" : "password"} 
                                            placeholder="Enter your admin password to unlock"
                                            value={adminAuthPassword}
                                            disabled={isAdminVerified}
                                            onChange={(e) => {
                                               setAdminAuthPassword(e.target.value);
                                               setAdminAuthError("");
                                            }}
                                            className={`w-full px-8 py-4 pr-32 rounded-3xl border font-bold transition-all focus:outline-none ${
                                              isAdminVerified 
                                                ? "border-emerald-500/30 bg-emerald-500/[0.02] text-emerald-600" 
                                                : adminAuthError
                                                  ? "border-rose-500/30 bg-rose-500/[0.02]"
                                                  : isDark ? "bg-white/5 border-white/10 text-white focus:border-gold/30" : "bg-charcoal/5 border-charcoal/10 text-charcoal shadow-sm focus:border-gold/30"
                                            }`}
                                         />
                                         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                            {verifyingAdmin && (
                                              <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                            )}
                                            
                                            {isAdminVerified && (
                                              <div className="text-emerald-500 flex items-center gap-2">
                                                <ShieldCheck size={18} />
                                                <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">Authorized</span>
                                              </div>
                                            )}

                                            {!isAdminVerified && (
                                              <button 
                                                type="button"
                                                onClick={() => setShowAdminAuthPassword(!showAdminAuthPassword)}
                                                className="text-gold/40 hover:text-gold transition-colors focus:outline-none"
                                              >
                                                {showAdminAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                              </button>
                                            )}

                                            {isAdminVerified && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setIsAdminVerified(false);
                                                  setAdminAuthPassword("");
                                                  setAdminAuthError("");
                                                }}
                                                className="text-[9px] font-black uppercase tracking-widest text-gold hover:underline"
                                              >
                                                Switch
                                              </button>
                                            )}
                                         </div>
                                      </div>

                                      {adminAuthError && (
                                        <motion.div 
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="flex items-center gap-2 px-5 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                                        >
                                          <AlertCircle size={14} className="text-rose-500" />
                                          <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest">{adminAuthError}</span>
                                        </motion.div>
                                      )}
                                   </div>
                                </div>

                                <AnimatePresence>
                                   {isAdminVerified && (
                                      <motion.div
                                         initial={{ opacity: 0, height: 0 }}
                                         animate={{ opacity: 1, height: "auto" }}
                                         exit={{ opacity: 0, height: 0 }}
                                         className="overflow-hidden space-y-8 pt-4"
                                      >
                                         <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                                         
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                            <div className="space-y-3">
                                               <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                                  <div className="w-1 h-1 rounded-full bg-gold" /> Customer's New Password
                                               </label>
                                               <div className="relative group">
                                                  <input 
                                                     type={showNewPassword ? "text" : "password"} 
                                                     placeholder="••••••••"
                                                     value={userDetails.user.password || ""}
                                                     onChange={(e) => setUserDetails({...userDetails, user: {...userDetails.user, password: e.target.value}})}
                                                     className={`w-full px-8 py-4 pr-14 rounded-3xl border font-bold transition-all focus:outline-none focus:border-gold/40 ${
                                                       isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal shadow-sm"
                                                     }`}
                                                  />
                                                  <button 
                                                     type="button"
                                                     onClick={() => setShowNewPassword(!showNewPassword)}
                                                     className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold transition-colors focus:outline-none"
                                                  >
                                                     {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                  </button>
                                               </div>
                                            </div>
                                            <div className="space-y-3">
                                               <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                                  <div className="w-1 h-1 rounded-full bg-gold" /> Confirm User Credentials
                                               </label>
                                               <div className="relative group">
                                                  <input 
                                                     type={showConfirmPassword ? "text" : "password"} 
                                                     placeholder="••••••••"
                                                     value={confirmPassword}
                                                     onChange={(e) => setConfirmPassword(e.target.value)}
                                                     className={`w-full px-8 py-4 pr-14 rounded-3xl border font-bold transition-all focus:outline-none focus:border-gold/40 ${
                                                       isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal shadow-sm"
                                                     }`}
                                                  />
                                                  <button 
                                                     type="button"
                                                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                     className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold transition-colors focus:outline-none"
                                                  >
                                                     {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                  </button>
                                               </div>
                                            </div>
                                         </div>

                                         <div className="pt-4">
                                            <button 
                                               type="submit"
                                               className="w-full py-6 bg-charcoal text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[2.5rem] shadow-2xl hover:bg-gold transition-all duration-500 active:scale-95 group relative overflow-hidden"
                                            >
                                               <span className="relative z-10">Authorize Security Reset</span>
                                               <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            </button>
                                         </div>
                                      </motion.div>
                                   )}
                                </AnimatePresence>
                             </form>
                          </div>
                        </div>
                      )}

                      {activeTab === "cart" && (
                        <div className="space-y-6">
                           {!isQuickView && (
                             <div className="flex items-center justify-between">
                                <h5 className="text-[13px] font-black uppercase tracking-[0.3em] text-gold">Current Cart Artifacts</h5>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{userDetails.cart?.length || 0} Total Items</span>
                             </div>
                           )}
                           
                           {userDetails.cart && userDetails.cart.length > 0 ? (
                              <div className="grid grid-cols-1 gap-4">
                                 {userDetails.cart.map((item: any) => (
                                    <div key={item.id} className={`group flex items-center justify-between p-4 rounded-3xl border transition-all duration-500 hover:translate-x-2 ${
                                      isDark ? "bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-gold/[0.02]" : "bg-charcoal/[0.02] border-charcoal/5 hover:border-gold/30 hover:bg-gold/[0.02]"
                                    }`}>
                                       <div className="flex items-center gap-5">
                                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-charcoal border border-white/10 flex-shrink-0">
                                             <img src={getAssetUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                             <h6 className={`text-[15px] font-extrabold group-hover:text-gold transition-colors ${isDark ? "text-white" : "text-charcoal"}`}>{item.name}</h6>
                                             <div className="flex items-center gap-3 mt-1.5">
                                                <span className={`text-[12px] font-bold ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Qty: {item.quantity}</span>
                                                <div className="w-1 h-1 rounded-full bg-gold/30" />
                                                <span className="text-[14px] font-black text-gold">₹{item.price}</span>
                                             </div>
                                          </div>
                                       </div>
                                       <ShoppingBag size={18} className="text-gold/20 group-hover:text-gold transition-colors mr-4" />
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="py-24 text-center opacity-20"><ShoppingBag size={48} className="mx-auto mb-4" /><p className="text-base font-bold uppercase tracking-widest italic">Cart is empty.</p></div>
                           )}
                        </div>
                      )}

                      {activeTab === "wishlist" && (
                         <div className="space-y-6">
                            {!isQuickView && (
                              <div className="flex items-center justify-between">
                                 <h5 className="text-[13px] font-black uppercase tracking-[0.3em] text-gold">Manifested Aspirations</h5>
                                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{userDetails.wishlist?.length || 0} Saved Items</span>
                              </div>
                            )}

                            {userDetails.wishlist && userDetails.wishlist.length > 0 ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {userDetails.wishlist.map((item: any) => (
                                     <div key={item.id} className={`group flex items-center gap-5 p-4 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${
                                       isDark ? "bg-white/[0.02] border-white/5 hover:border-gold/30" : "bg-charcoal/[0.02] border-charcoal/5 hover:border-gold/30 shadow-sm"
                                      }`}>
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-charcoal border border-white/10 flex-shrink-0">
                                           <img src={getAssetUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                           <h6 className={`text-[14px] font-extrabold truncate group-hover:text-gold transition-colors ${isDark ? "text-white" : "text-charcoal"}`}>{item.name}</h6>
                                           <p className="text-[13px] font-black text-gold mt-1">₹{item.price}</p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            ) : (
                               <div className="py-24 text-center opacity-20"><Heart size={48} className="mx-auto mb-4" /><p className="text-base font-bold uppercase tracking-widest italic">Wishlist is empty.</p></div>
                            )}
                         </div>
                      )}

                      {activeTab === "giftcards" && (
                        <div className="space-y-6">
                            {!isQuickView && (
                              <div className="flex items-center justify-between">
                                 <h5 className="text-[13px] font-black uppercase tracking-[0.3em] text-gold">Sacred Tokens</h5>
                                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{userDetails.giftCards?.length || 0} Total Cards</span>
                              </div>
                            )}

                            {userDetails.giftCards && userDetails.giftCards.length > 0 ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {userDetails.giftCards.map((card: any) => (
                                     <motion.div
                                      key={card.id}
                                      whileHover={{ y: -5 }}
                                      className="relative aspect-[16/10] bg-charcoal rounded-[2.5rem] overflow-hidden shadow-2xl group border border-gold/10"
                                     >
                                      <img src={getAssetUrl(card.image)} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                      <div className="absolute inset-0 p-6 flex flex-col justify-between text-white bg-black/40 backdrop-blur-[1px]">
                                        <div className="flex justify-between items-start">
                                          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                            <span className="text-[10px] tracking-widest uppercase font-bold text-white">{card.code}</span>
                                          </div>
                                          <div className="flex flex-col items-end">
                                             <span className="text-[14px] font-black text-gold">₹{card.currentBalance}</span>
                                             {card.initialBalance > card.currentBalance && (
                                               <span className="text-[10px] opacity-40 line-through">₹{card.initialBalance}</span>
                                             )}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                           <div className="flex items-center justify-between">
                                              <div>
                                                 <p className="text-[8px] uppercase tracking-[0.4em] opacity-40">Recipient</p>
                                                 <p className="text-xs font-bold truncate max-w-[120px]">{card.recipientName}</p>
                                              </div>
                                              <div className="text-right">
                                                 <p className="text-[8px] uppercase tracking-[0.4em] opacity-40">Status</p>
                                                 <p className={`text-[9px] font-black uppercase ${card.isActive ? "text-gold" : "text-rose-400"}`}>
                                                   {card.isActive ? "Active" : "Redeemed"}
                                                 </p>
                                              </div>
                                           </div>
                                           <div className="h-[1px] bg-white/10 w-full" />
                                           <p className="text-[10px] font-body font-light italic line-clamp-2 opacity-80">
                                             {card.message || "A gift for you."}
                                           </p>
                                        </div>
                                      </div>
                                     </motion.div>
                                  ))}
                               </div>
                            ) : (
                               <div className="py-24 text-center opacity-20">
                                 <Gift size={48} className="mx-auto mb-4" />
                                 <p className="text-base font-bold uppercase tracking-widest italic">No gift cards found.</p>
                               </div>
                            )}
                        </div>
                      )}

                      {activeTab === "addresses" && (
                        <div className="space-y-8">
                             <div className="flex items-center justify-between pb-4 border-b border-gold/10">
                                 <div>
                                    <h5 className="text-[14px] font-black uppercase tracking-[0.3em] text-gold">Archived Locations</h5>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Shipping rituals & shipping destination history</p>
                                 </div>
                                 <span className="px-3 py-1 bg-gold/5 border border-gold/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gold/60">{userDetails.user.addresses?.length || 0} Saved Rituals</span>
                             </div>

                            {userDetails.user.addresses && userDetails.user.addresses.length > 0 ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {userDetails.user.addresses.map((addr: any, idx: number) => (
                                     <div 
                                      key={idx}
                                      className={`p-8 rounded-[2.5rem] border transition-all duration-700 relative flex flex-col justify-between group overflow-hidden ${
                                        isDark 
                                        ? "bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 hover:border-gold/30 hover:bg-gold/[0.03]" 
                                        : "bg-white border-gold/10 hover:border-gold/30 shadow-xl shadow-charcoal/5"
                                      }`}
                                     >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                      <p className={`font-body font-bold text-lg transition-colors ${isDark ? "text-white group-hover:text-gold" : "text-charcoal group-hover:text-gold"}`}>{addr.fullName}</p>
                                                      {addr.isDefault && (
                                                          <span className="text-[8px] font-black bg-gold text-charcoal px-2.5 py-1 rounded-full uppercase tracking-widest leading-none shadow-lg shadow-gold/20">Default</span>
                                                      )}
                                                    </div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold opacity-60">Verified Identity</p>
                                                </div>
                                                <div className={`p-3 rounded-2xl transition-all duration-500 ${isDark ? "bg-white/5 text-white/20 group-hover:text-gold group-hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/20 group-hover:text-gold group-hover:bg-gold/10"}`}>
                                                    {addr.label === "Home" ? <User size={16} /> : addr.label === "Work" ? <ShoppingBag size={16} /> : <MapPin size={16} />}
                                                </div>
                                            </div>

                                            <div className={`space-y-2 text-[13px] font-body leading-relaxed font-light ${isDark ? "text-white/60" : "text-charcoal/60"}`}>
                                                <p className="flex items-center gap-3"><MapPin size={12} className="text-gold/40 flex-shrink-0" /> {addr.street}</p>
                                                <p className="pl-6">{addr.city}, {addr.state} - <span className="font-bold text-gold">{addr.zipCode}</span></p>
                                                <div className="pt-4 flex items-center gap-3 border-t border-gold/5">
                                                   <Phone size={14} className="text-gold" />
                                                   <p className={`font-black tracking-widest ${isDark ? "text-white/90" : "text-charcoal/90"}`}>{addr.mobile}</p>
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            ) : (
                               <div className={`py-32 text-center rounded-[3rem] border border-dashed transition-colors ${isDark ? "bg-white/[0.02] border-white/10" : "bg-charcoal/[0.02] border-charcoal/10"}`}>
                                 <MapPin size={48} className="mx-auto mb-6 text-gold/20" />
                                 <h6 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? "text-white/40" : "text-charcoal/40"}`}>No Shipping Legacy Found</h6>
                                 <p className="text-[11px] font-black uppercase tracking-widest text-gold opacity-40">This user has not established any delivery portals yet</p>
                               </div>
                            )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
