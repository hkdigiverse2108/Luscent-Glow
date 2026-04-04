import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Ticket, 
  Copy, 
  CheckCircle2, 
  Calendar,
  Wallet,
  User,
  MessageSquare,
  Sparkles,
  X,
  Palette,
  Send,
  CreditCard,
  ChevronRight,
  Upload, Zap
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminGiftCards = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"ledger" | "config">("ledger");
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  
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
      const response = await fetch(getApiUrl("/api/gift-cards/"));
      if (response.ok) {
        const data = await response.json();
        setGiftCards(data);
      }
    } catch (error) {
      toast.error("Could not retrieve the gift card ledger.");
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
        toast.success("Hero vision updated.");
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
        toast.success("Page configuration synchronized.");
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
        toast.success(editingCard ? "Ledger entry refined." : "New gift card minted.");
        setIsModalOpen(false);
        fetchGiftCards();
      } else {
        toast.error("Transaction failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!window.confirm("Are you sure you want to invalidate this token?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/gift-cards/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Token removed.");
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

  const filteredCards = giftCards.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gold/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-display text-4xl font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-charcoal"}`}>
            Gift Card <span className="text-gold italic">Sanctuary</span>
          </h2>
          <div className="flex p-1 rounded-full border mt-4 w-fit bg-white/5 border-white/10">
            <button 
              onClick={() => setActiveTab("ledger")}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "ledger" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ledger
            </button>
            <button 
              onClick={() => setActiveTab("config")}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "config" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Page Settings
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {activeTab === "ledger" ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="flex items-center gap-3 bg-gold hover:bg-gold/90 text-charcoal px-8 py-4 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all shadow-lg"
            >
              <Plus size={18} />
              <span>Mint Token</span>
            </motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveConfig}
              disabled={isConfigSaving}
              className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isConfigSaving ? <Sparkles className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              <span>{isConfigSaving ? "Synchronizing..." : "Commit Settings"}</span>
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "ledger" ? (
          <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Active Tokens", value: giftCards.filter(c => c.isActive).length, icon: Ticket, tint: "text-gold" },
                { label: "Circulating Value", value: `₹${giftCards.reduce((acc, c) => acc + (c.currentBalance || 0), 0).toLocaleString()}`, icon: Wallet, tint: "text-emerald-500" },
                { label: "Total Issued", value: giftCards.length, icon: CheckCircle2, tint: "text-blue-500" }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/5"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{stat.label}</p>
                  <h4 className="text-2xl font-display font-bold mt-1">{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className={`relative flex items-center p-2 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"}`}>
              <Search className="ml-4 text-muted-foreground" size={18} />
              <input 
                placeholder="Locate token by code or recipient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-4 text-sm focus:ring-0"
              />
            </div>

            <div className={`rounded-3xl border overflow-hidden ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
              <table className="w-full text-left border-collapse">
                <thead className={isDark ? "bg-white/5" : "bg-charcoal/5"}>
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest">Token</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest">Recipient</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest">Balance</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-right">Rituals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCards.map(card => (
                    <tr key={card._id} className="hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-5 font-bold tracking-widest text-xs uppercase">{card.code}</td>
                      <td className="px-6 py-5">
                         <p className="text-sm font-semibold">{card.recipientName}</p>
                         <p className="text-[10px] text-muted-foreground">{card.recipientMobile}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-emerald-500">₹{(card.currentBalance || 0).toLocaleString()}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 text-muted-foreground">
                          <button onClick={() => handleDeleteToken(card._id)} className="p-2 hover:text-rose-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
            {config ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                    <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
                      <Sparkles size={20} className="text-gold" /> Hero Settings
                    </h3>
                    <div className="space-y-4">
                       <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 group mb-4">
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
                         className="w-full p-4 rounded-xl border bg-transparent text-sm"
                       />
                       <textarea 
                         placeholder="Hero Description"
                         value={config.heroDescription}
                         onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                         className="w-full p-4 rounded-xl border bg-transparent text-sm min-h-[100px]"
                       />
                    </div>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                    <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
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
                <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
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

                <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                  <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3 font-bold">
                    <Palette size={20} className="text-gold" /> Card Themes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
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
                       className="aspect-[16/10] rounded-[2rem] border-2 border-dashed border-gold/30 flex flex-col items-center justify-center text-gold hover:bg-gold/5 transition-all font-bold"
                     >
                        <Plus size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2 font-bold">Add Theme</span>
                     </button>
                  </div>
                </div>

                {/* Features Settings */}
                <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-3">
                    <Zap size={20} className="text-gold" /> Trust Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(config.features || []).map((feat: any, i: number) => (
                       <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/5 space-y-3 relative group">
                          <button onClick={() => setConfig({ ...config, features: config.features.filter((_: any, idx: number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                          <div className="flex gap-4">
                             <select 
                               value={feat.icon}
                               onChange={(e) => {
                                 const newFeats = [...config.features];
                                 newFeats[i].icon = e.target.value;
                                 setConfig({ ...config, features: newFeats });
                               }}
                               className="bg-transparent border rounded-lg p-2 text-xs"
                             >
                                <option value="Send">Send</option>
                                <option value="CreditCard">Payment</option>
                                <option value="Sparkles">Sparkle</option>
                                <option value="ShieldCheck">Secure</option>
                                <option value="Zap">Instant</option>
                                <option value="Mail">Mail</option>
                             </select>
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

                <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                   <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
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
              <div className="py-20 text-center font-bold">Synchronizing Sanctuary Settings...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`relative w-full max-w-2xl rounded-[2.5rem] p-8 overflow-hidden border ${isDark ? "bg-charcoal border-white/10" : "bg-white border-charcoal/10"}`}>
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-display text-2xl font-bold uppercase flex items-center gap-3"><Sparkles size={24} className="text-gold" /> Mint Gift Card</h3>
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
                  <button type="submit" className="w-full py-5 bg-gold text-charcoal rounded-3xl font-bold uppercase tracking-widest font-bold">Finalize & Mint</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGiftCards;
