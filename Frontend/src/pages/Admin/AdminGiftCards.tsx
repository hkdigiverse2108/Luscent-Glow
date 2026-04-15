import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Ticket, 
  CheckCircle2, 
  Calendar,
  Wallet,
  User,
  MessageSquare,
  Sparkles,
  X,
  Palette,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Upload, 
  Zap,
  Phone,
  Gift,
  BadgeCheck,
  Image as ImageIcon
} from "lucide-react";
import DynamicIcon from "../../components/DynamicIcon.tsx";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminGiftCards = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"list" | "config">("list");
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]); // kept for stats
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Page Configuration State
  const [config, setConfig] = useState<any>(null);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    initialBalance: 1000,
    recipientName: "",
    recipientMobile: "",
    message: "",
    theme: "",
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    isActive: true
  });

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
    let code = "LG-GIFT-";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += "-";
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, code }));
  };

  const fetchGiftCards = async () => {
    setLoading(true);
    try {
      const [groupsRes, flatRes] = await Promise.all([
        fetch(getApiUrl("/api/gift-cards/by-user")),
        fetch(getApiUrl("/api/gift-cards/"))
      ]);
      if (groupsRes.ok) setUserGroups(await groupsRes.json());
      if (flatRes.ok) setGiftCards(await flatRes.json());
    } catch (error) {
      toast.error("Could not retrieve the gift card list.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/gift-cards/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        if (data.themes?.length > 0 && !formData.theme) {
          setFormData(prev => ({ ...prev, theme: data.themes[0].name }));
        }
      }
    } catch (error) {
      toast.error("Failed to fetch page configuration.");
    }
  };

  useEffect(() => {
    fetchGiftCards();
    fetchConfig();
  }, []);

  const handleHeroImageUpload = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: uploadData,
      });
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...config, heroImage: data.filePath });
        toast.success("Header image updated.");
      }
    } catch (error) {
      toast.error("Image upload failed.");
    }
  };

  const handleSaveConfig = async () => {
    setIsConfigSaving(true);
    try {
      const response = await fetch(getApiUrl("/api/gift-cards/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        toast.success("Page configuration saved.");
      } else {
        toast.error("Failed to commit settings.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setIsConfigSaving(false);
    }
  };

  const handleThemeImageUpload = async (index: number, file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: uploadData,
      });
      if (response.ok) {
        const data = await response.json();
        const newThemes = [...config.themes];
        newThemes[index].image = data.filePath;
        setConfig({ ...config, themes: newThemes });
        toast.success("Theme visual updated.");
      }
    } catch (error) {
      toast.error("Image upload failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCard 
      ? getApiUrl(`/api/gift-cards/${editingCard._id || editingCard.id}`)
      : getApiUrl("/api/gift-cards/");
    
    const method = editingCard ? "PUT" : "POST";
    const payload = editingCard 
      ? { ...formData } 
      : { 
          ...formData, 
          currentBalance: formData.initialBalance,
          createdAt: new Date().toISOString(),
          senderMobile: "ADMIN"
        };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingCard ? "Card entry updated." : "New gift card created.");
        setIsModalOpen(false);
        fetchGiftCards();
      } else {
        toast.error("Operation failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/gift-cards/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Card removed.");
        fetchGiftCards();
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setFormData({
      code: "",
      initialBalance: 1000,
      recipientName: "",
      recipientMobile: "",
      message: "",
      theme: config?.themes?.[0]?.name || "Gold Radiance",
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      isActive: true
    });
    generateCode();
    setIsModalOpen(true);
  };

  const filteredGroups = userGroups.filter(g =>
    !searchQuery ||
    (g.senderName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.senderMobile || "").includes(searchQuery) ||
    g.cards.some((c: any) =>
      c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.recipientName || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-2 pb-4">
      <AdminHeader 
        title="Gift Card"
        highlightedWord="Management"
        subtitle="View gift cards by user, manage issuance and storefront settings"
        isDark={isDark}
        action={activeTab === "list" ? {
          label: "Create Card",
          onClick: openCreateModal,
          icon: Plus
        } : {
          label: isConfigSaving ? "Saving..." : "Save Settings",
          onClick: handleSaveConfig,
          icon: isConfigSaving ? Sparkles : CheckCircle2,
          disabled: isConfigSaving
        }}
      >
        <div className="flex p-1 rounded-full border mt-2 w-fit bg-white/5 border-white/10">
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "list" 
                ? "bg-gold text-charcoal" 
                : isDark ? "text-white/40 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
            }`}
          >
            User View
          </button>
          <button 
            onClick={() => setActiveTab("config")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "config" 
                ? "bg-gold text-charcoal" 
                : isDark ? "text-white/40 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
            }`}
          >
            Page Settings
          </button>
        </div>
      </AdminHeader>

      <AnimatePresence mode="wait">
        {activeTab === "list" ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {[
                { label: "Total Users", value: userGroups.length, icon: User },
                { label: "Active Cards", value: giftCards.filter(c => c.isActive).length, icon: Ticket },
                { label: "Total Balance", value: `₹${giftCards.reduce((acc, c) => acc + (c.currentBalance || 0), 0).toLocaleString()}`, icon: Wallet },
                { label: "Total Issued", value: giftCards.length, icon: Gift }
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/5"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{stat.label}</p>
                  <h4 className="text-2xl font-display font-bold mt-1">{stat.value}</h4>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className={`relative flex items-center p-2 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"}`}>
              <Search className="ml-4 text-muted-foreground" size={18} />
              <input 
                placeholder="Search by user name, mobile, card code, or recipient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-4 text-sm focus:ring-0"
              />
            </div>

            {/* User-wise grouped cards */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`h-20 rounded-3xl animate-pulse ${isDark ? "bg-white/5" : "bg-charcoal/5"}`} />
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className={`py-24 text-center rounded-3xl border border-dashed ${isDark ? "border-white/10" : "border-charcoal/10"}`}>
                <Gift size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm opacity-40 font-bold uppercase tracking-widest">No gift cards found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => {
                  const isExpanded = expandedUser === group.normalizedMobile;
                  const isAdmin = group.normalizedMobile === "ADMIN";
                  const filteredCards = searchQuery
                    ? group.cards.filter((c: any) =>
                        c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (c.recipientName || "").toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : group.cards;

                  return (
                    <div key={group.normalizedMobile} className={`rounded-3xl border overflow-hidden transition-all ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/8"}`}>
                      {/* User Row Header */}
                      <button
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gold/5 transition-colors group"
                        onClick={() => setExpandedUser(isExpanded ? null : group.normalizedMobile)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                            isAdmin ? "bg-gold/10 text-gold" : "bg-charcoal/10 text-charcoal"
                          } ${isDark ? "!bg-white/10 !text-white" : ""}`}>
                            {isAdmin ? <Sparkles size={18} /> : <User size={18} />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">
                              {group.senderName || <span className="opacity-40 italic">Unknown</span>}
                              {isAdmin && <span className="ml-2 text-[9px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>}
                            </p>
                            <p className="text-[10px] opacity-50 flex items-center gap-1 mt-0.5">
                              <Phone size={10} />{group.senderMobile}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="hidden md:flex items-center gap-6 text-right">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Cards</p>
                              <p className="text-base font-bold">{group.totalCards}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Active</p>
                              <p className="text-base font-bold text-gold">{group.activeCards}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Balance</p>
                              <p className="text-base font-bold">₹{group.totalBalance.toLocaleString()}</p>
                            </div>
                          </div>
                          <ChevronDown size={16} className={`opacity-40 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Expanded Cards */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className={`border-t ${isDark ? "border-white/10" : "border-charcoal/5"}`}>
                              <div className="p-4 space-y-2">
                                {filteredCards.map((card: any, idx: number) => (
                                  <div key={idx} className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-colors ${
                                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-charcoal/3 hover:bg-gold/5"
                                  }`}>
                                    <div className="flex items-center gap-4">
                                      {/* Status dot */}
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${card.isActive ? "bg-emerald-400" : "bg-charcoal/20"}`} />
                                      <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-gold">{card.code}</p>
                                        <p className="text-[10px] opacity-50 mt-0.5">
                                          To: <span className="font-semibold">{card.recipientName || "—"}</span>
                                          {card.recipientMobile && <span className="ml-2 opacity-70">{card.recipientMobile}</span>}
                                        </p>
                                        {card.message && (
                                          <p className="text-[10px] italic opacity-40 mt-0.5 max-w-[260px] truncate">"{card.message}"</p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                      <div className="text-right hidden sm:block">
                                        <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Balance</p>
                                        <p className={`text-sm font-bold ${card.currentBalance > 0 ? "text-gold" : "opacity-30"}`}>
                                          ₹{(card.currentBalance || 0).toLocaleString()}
                                          {card.initialBalance !== card.currentBalance && (
                                            <span className="text-[9px] opacity-40 ml-1">/ ₹{card.initialBalance?.toLocaleString()}</span>
                                          )}
                                        </p>
                                      </div>
                                      <div className="text-right hidden md:block">
                                        <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Theme</p>
                                        <p className="text-[10px] font-bold">{card.theme}</p>
                                      </div>
                                      <div className="text-right hidden md:block">
                                        <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Status</p>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                          card.isActive ? "bg-emerald-400/10 text-emerald-500" : "bg-charcoal/10 opacity-40"
                                        }`}>
                                          {card.isActive ? "Active" : "Spent"}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteToken(card.id)}
                                        className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {config ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                    <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                      <Sparkles size={20} className="text-gold" /> Hero Settings
                    </h3>
                    <div className="space-y-4">
                       <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 group mb-2">
                          <img src={getAssetUrl(config.heroImage)} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                             <Upload size={24} />
                             <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleHeroImageUpload(e.target.files[0])} />
                          </label>
                       </div>
                       <input 
                         placeholder="Hero Title"
                         value={config.heroTitle}
                         onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                         className="w-full p-3 rounded-xl border bg-transparent text-sm"
                       />
                       <textarea 
                         placeholder="Hero Description"
                         value={config.heroDescription}
                         onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                         className="w-full p-3 rounded-xl border bg-transparent text-sm min-h-[100px]"
                       />
                    </div>
                  </div>

                  <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                    <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                      <Wallet size={20} className="text-gold" /> Pricing Chips
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {config.amounts.map((amt: number, i: number) => (
                         <div key={i} className="px-4 py-2 bg-gold/10 text-gold rounded-full text-xs font-bold flex items-center gap-2">
                            ₹{amt.toLocaleString()}
                            <X size={12} className="cursor-pointer" onClick={() => {
                               const newAmts = config.amounts.filter((_: any, idx: number) => idx !== i);
                               setConfig({ ...config, amounts: newAmts });
                            }} />
                         </div>
                       ))}
                       <button 
                         onClick={() => {
                           const val = prompt("New amount?");
                           if (val && !isNaN(parseInt(val))) setConfig({ ...config, amounts: [...config.amounts, parseInt(val)] });
                         }}
                         className="px-4 py-2 border-2 border-dashed border-gold/30 text-gold rounded-full text-xs"
                       >
                         + Add
                       </button>
                    </div>
                  </div>
                </div>

                {/* Benefits Settings */}
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-3">
                    <Sparkles size={20} className="text-gold" /> Benefits Section
                  </h3>
                  <div className="space-y-4">
                     <input 
                       placeholder="Benefits Title (use ' is a ' to split style)"
                       value={config.benefitsTitle}
                       onChange={(e) => setConfig({ ...config, benefitsTitle: e.target.value })}
                       className="w-full p-4 rounded-xl border bg-transparent text-sm"
                     />
                     <textarea 
                       placeholder="Benefits Description"
                       value={config.benefitsDescription}
                       onChange={(e) => setConfig({ ...config, benefitsDescription: e.target.value })}
                       className="w-full p-4 rounded-xl border bg-transparent text-sm min-h-[80px]"
                     />
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Bullet Points</label>
                        <div className="grid gap-2">
                           {(config.benefitsList || []).map((point: string, i: number) => (
                             <div key={i} className="flex gap-2">
                                <input 
                                  value={point}
                                  onChange={(e) => {
                                    const newList = [...config.benefitsList];
                                    newList[i] = e.target.value;
                                    setConfig({ ...config, benefitsList: newList });
                                  }}
                                  className="flex-1 p-3 rounded-xl border bg-transparent text-xs"
                                />
                                <button onClick={() => setConfig({ ...config, benefitsList: config.benefitsList.filter((_: any, idx: number) => idx !== i) })} className="p-3 text-rose-500"><X size={14} /></button>
                             </div>
                           ))}
                           <button onClick={() => setConfig({ ...config, benefitsList: [...(config.benefitsList || []), "New Benefit"] })} className="text-[10px] text-gold uppercase font-bold tracking-widest text-left">+ Add Point</button>
                        </div>
                     </div>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3 font-bold">
                    <Palette size={20} className="text-gold" /> Card Themes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
                     {config.themes.map((theme: any, idx: number) => (
                       <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-4 relative group font-bold">
                          <button 
                            onClick={() => {
                              const newThemes = config.themes.filter((_: any, i: number) => i !== idx);
                              setConfig({ ...config, themes: newThemes });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                          >
                             <X size={12} />
                          </button>
                          <div className="aspect-[16/10] rounded-xl overflow-hidden relative group font-bold">
                             <img src={getAssetUrl(theme.image)} className="w-full h-full object-cover" />
                             <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity font-bold">
                                <Upload size={20} />
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleThemeImageUpload(idx, e.target.files[0])} />
                             </label>
                          </div>
                          <input 
                            value={theme.name}
                            onChange={(e) => {
                              const newThemes = [...config.themes];
                              newThemes[idx].name = e.target.value;
                              setConfig({ ...config, themes: newThemes });
                            }}
                            className="w-full bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-center focus:ring-0 font-bold"
                          />
                       </div>
                     ))}
                     <button 
                       onClick={() => {
                         const newThemes = [...config.themes, { id: Date.now().toString(), name: "New Theme", image: "", color: "#D4AF37" }];
                         setConfig({ ...config, themes: newThemes });
                       }}
                       className="aspect-[16/10] rounded-2xl border-2 border-dashed border-gold/30 flex flex-col items-center justify-center text-gold hover:bg-gold/5 transition-all font-bold"
                     >
                        <Plus size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2 font-bold">Add Theme</span>
                     </button>
                  </div>
                </div>

                {/* Features Settings */}
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-3">
                    <Zap size={20} className="text-gold" /> Trust Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(config.features || []).map((feat: any, i: number) => (
                       <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/5 space-y-3 relative group">
                          <button onClick={() => setConfig({ ...config, features: config.features.filter((_: any, idx: number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                          <div className="flex gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                   <DynamicIcon name={feat.icon} size={18} />
                                </div>
                                <input 
                                  placeholder="Icon (e.g. Zap)"
                                  value={feat.icon}
                                  onChange={(e) => {
                                    const newFeats = [...config.features];
                                    newFeats[i].icon = e.target.value;
                                    setConfig({ ...config, features: newFeats });
                                  }}
                                  className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold w-24"
                                />
                              </div>
                             <input 
                               placeholder="Title"
                               value={feat.title}
                               onChange={(e) => {
                                 const newFeats = [...config.features];
                                 newFeats[i].title = e.target.value;
                                 setConfig({ ...config, features: newFeats });
                               }}
                               className="flex-1 bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                             />
                          </div>
                          <textarea 
                             placeholder="Description"
                             value={feat.desc}
                             onChange={(e) => {
                               const newFeats = [...config.features];
                               newFeats[i].desc = e.target.value;
                               setConfig({ ...config, features: newFeats });
                             }}
                             className="w-full bg-transparent border-none p-0 text-[10px] focus:ring-0 opacity-60 resize-none"
                             rows={2}
                          />
                       </div>
                     ))}
                     <button onClick={() => setConfig({ ...config, features: [...(config.features || []), { icon: "Zap", title: "New Feature", desc: "Short description" }] })} className="p-5 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-xs uppercase tracking-widest">+ Add Feature</button>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                   <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
                     <MessageSquare size={20} className="text-gold" /> FAQ Management
                   </h3>
                   <div className="space-y-4">
                      {config.faqs.map((faq: any, idx: number) => (
                        <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/5 space-y-4 relative group">
                           <button onClick={() => {
                              const newFaqs = config.faqs.filter((_: any, i: number) => i !== idx);
                              setConfig({ ...config, faqs: newFaqs });
                           }} className="absolute top-6 right-6 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                           </button>
                           <input 
                             value={faq.q}
                             onChange={(e) => {
                               const newFaqs = [...config.faqs];
                               newFaqs[idx].q = e.target.value;
                               setConfig({ ...config, faqs: newFaqs });
                             }}
                             className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                             placeholder="Question"
                           />
                           <textarea 
                             value={faq.a}
                             onChange={(e) => {
                               const newFaqs = [...config.faqs];
                               newFaqs[idx].a = e.target.value;
                               setConfig({ ...config, faqs: newFaqs });
                             }}
                             className="w-full bg-transparent border-none p-0 text-xs focus:ring-0 opacity-60 resize-none font-bold"
                             placeholder="Answer"
                             rows={2}
                           />
                        </div>
                      ))}
                      <button 
                        onClick={() => setConfig({ ...config, faqs: [...config.faqs, { q: "New Question?", a: "New Answer" }] })}
                        className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-xs uppercase tracking-widest font-bold"
                      >
                         + Add FAQ Case
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center font-bold">Synchronizing Configuration...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`relative w-full max-w-2xl rounded-3xl p-6 overflow-hidden border ${isDark ? "bg-charcoal border-white/10" : "bg-white border-charcoal/10"}`}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display text-2xl font-bold uppercase flex items-center gap-3"><Sparkles size={24} className="text-gold" /> Create Gift Card</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gold font-bold">Code</label>
                        <input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-4 rounded-xl border bg-transparent font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gold font-bold">Initial Balance (₹)</label>
                        <input type="number" value={formData.initialBalance} onChange={(e) => setFormData({...formData, initialBalance: parseFloat(e.target.value)})} className="w-full p-4 rounded-xl border bg-transparent font-bold" />
                     </div>
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] uppercase font-bold tracking-widest text-gold font-bold font-bold">Recipient Name</label>
                     <input value={formData.recipientName} onChange={(e) => setFormData({...formData, recipientName: e.target.value})} className="w-full p-4 rounded-xl border bg-transparent font-bold" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] uppercase font-bold tracking-widest text-gold font-bold font-bold">Theme</label>
                     <select value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} className="w-full p-4 rounded-xl border bg-transparent font-bold">
                        {config?.themes.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
                     </select>
                  </div>
                  <button type="submit" className="w-full py-5 bg-gold text-charcoal rounded-3xl font-bold uppercase tracking-widest font-bold">Finalize & Create</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGiftCards;
