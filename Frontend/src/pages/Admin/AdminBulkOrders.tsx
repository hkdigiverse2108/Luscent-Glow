import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Package, 
  Truck, 
  ShieldCheck, 
  Building2, 
  Users, 
  Layers,
  Sparkles,
  X,
  Send,
  CheckCircle2,
  Upload,
  Zap,
  ChevronRight,
  ClipboardList,
  Mail,
  Phone
} from "lucide-react";
import DynamicIcon from "../../components/DynamicIcon.tsx";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminBulkOrders = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"inquiries" | "config">("inquiries");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Page Configuration State
  const [config, setConfig] = useState<any>(null);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/contact/bulk-inquiries"));
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      }
    } catch (error) {
      toast.error("Could not retrieve corporate inquiries.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/bulk-orders/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      toast.error("Failed to fetch page configuration.");
    }
  };

  useEffect(() => {
    fetchInquiries();
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
        setConfig({ ...config, heroImage: data.url });
        toast.success("Hero visual updated.");
      }
    } catch (error) {
      toast.error("Image upload failed.");
    }
  };

  const handleSaveConfig = async () => {
    setIsConfigSaving(true);
    try {
      const response = await fetch(getApiUrl("/api/bulk-orders/settings"), {
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

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Archive this inquiry?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/contact/bulk-inquiry/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Inquiry archived.");
        fetchInquiries();
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredInquiries = inquiries.filter(i => 
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // resolveIcon removed in favor of DynamicIcon component

  return (
    <div className="space-y-2 pb-4">
      <AdminHeader 
        title="Bulk Order"
        highlightedWord="Concierge"
        subtitle="Managing the corporate gifting ledger and portal presence"
        isDark={isDark}
        action={activeTab === "config" ? {
          label: isConfigSaving ? "Synchronizing..." : "Commit Settings",
          onClick: handleSaveConfig,
          icon: isConfigSaving ? Sparkles : CheckCircle2,
          disabled: isConfigSaving
        } : undefined}
      >
        <div className="flex p-1 rounded-full border mt-2 w-fit bg-white/5 border-white/10">
          <button 
            onClick={() => setActiveTab("inquiries")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "inquiries" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inquiry Ledger
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
      </AdminHeader>

      <AnimatePresence mode="wait">
        {activeTab === "inquiries" ? (
          <motion.div key="inquiries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-bold">
              {[
                { label: "Active Inquiries", value: inquiries.length, icon: ClipboardList, tint: "text-gold" },
                { label: "Partner Companies", value: new Set(inquiries.map(i => i.companyName)).size, icon: Building2, tint: "text-gold" },
                { label: "Conversion Rate", value: "84%", icon: Sparkles, tint: "text-gold/60" }
              ].map((stat, i) => (
                <div key={i} className={`p-3 rounded-3xl border transition-all hover:scale-105 duration-500 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/5 shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{stat.label}</p>
                    <stat.icon size={16} className={stat.tint} />
                  </div>
                  <h4 className="text-3xl font-display font-bold">{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className={`relative flex items-center p-2 rounded-2xl border transition-all duration-500 ${isDark ? "bg-white/5 border-white/10 focus-within:border-gold/50" : "bg-charcoal/5 border-charcoal/10 focus-within:border-gold/50"}`}>
              <Search className="ml-4 text-muted-foreground" size={18} />
              <input 
                placeholder="Locate inquiry by name, company, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-4 text-sm focus:ring-0 placeholder:text-muted-foreground/50 font-bold"
              />
            </div>

            <div className={`rounded-2xl border overflow-hidden transition-all duration-700 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl shadow-charcoal/5"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={isDark ? "bg-white/5" : "bg-charcoal/5"}>
                    <tr>
                      <th className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-60">Company & Contact</th>
                      <th className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-60">Requirement</th>
                      <th className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-60">Date</th>
                      <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest opacity-60 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInquiries.length > 0 ? filteredInquiries.map((inquiry, idx) => (
                      <tr key={inquiry._id || idx} className="hover:bg-gold/5 transition-colors group">
                        <td className="px-4 py-1.5">
                           <div className="flex flex-col gap-1.5">
                              <p className="text-sm font-bold tracking-tight uppercase">{inquiry.companyName}</p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                 <span className="flex items-center gap-1"><Users size={10} /> {inquiry.name}</span>
                                 <span className="flex items-center gap-1"><Mail size={10} /> {inquiry.email}</span>
                                 <span className="flex items-center gap-1"><Phone size={10} /> {inquiry.phoneNumber}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-1.5">
                           <div className="space-y-1">
                              <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-widest rounded-full">{inquiry.estimatedQuantity} Units</span>
                              <p className="text-xs text-muted-foreground line-clamp-1 italic mt-1 font-bold">"{inquiry.message}"</p>
                           </div>
                        </td>
                        <td className="px-6 py-3 font-body text-xs opacity-60 font-bold whitespace-nowrap">
                          {new Date(inquiry.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => handleDeleteInquiry(inquiry._id)} className="p-2.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs">No corporate briefs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {config ? (
              <>
                {/* Hero Section Configuration */}
                <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl shadow-charcoal/5"}`}>
                  <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                    <Sparkles size={20} className="text-gold" /> Hero Sanctuary Settings
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Badge</label>
                          <input 
                            placeholder="Hero Badge"
                            value={config.heroBadge}
                            onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                            className="w-full p-4 rounded-xl border bg-transparent text-sm active:border-gold transition-colors font-bold"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Title (use ' Corporate ' for split color)</label>
                          <input 
                            placeholder="Hero Title"
                            value={config.heroTitle}
                            onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                            className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Description</label>
                          <textarea 
                            placeholder="Hero Description"
                            value={config.heroDescription}
                            onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                            className="w-full p-4 rounded-xl border bg-transparent text-sm min-h-[120px] resize-none font-bold"
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Visual (Corporate Gifting)</label>
                       <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl">
                          <img src={getAssetUrl(config.heroImage)} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500">
                             <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                                <Upload size={32} className="text-gold" />
                             </div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white">Replace Master Visual</span>
                             <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleHeroImageUpload(e.target.files[0])} />
                          </label>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Brand Pillars & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                      <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                        <Layers size={20} className="text-gold" /> Trust Features
                      </h3>
                      <div className="space-y-4 font-bold">
                        {config.features.map((feat: any, i: number) => (
                          <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/5 space-y-3 relative group font-bold">
                             <button onClick={() => setConfig({ ...config, features: config.features.filter((_: any, idx: number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"><Trash2 size={16} /></button>
                             <div className="flex gap-4 font-bold">
                                <div className="flex items-center gap-3">

                                   <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold">

                                      <DynamicIcon name={feat.icon} size={18} />

                                   </div>

                                   <input 

                                     placeholder="Icon (e.g. Layers)"

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
                                  placeholder="Feature Title"
                                  value={feat.title}
                                  onChange={(e) => {
                                    const newFeats = [...config.features];
                                    newFeats[i].title = e.target.value;
                                    setConfig({ ...config, features: newFeats });
                                  }}
                                  className="flex-1 bg-transparent border-none p-0 text-sm font-bold focus:ring-0 font-bold"
                                />
                             </div>
                             <textarea 
                                placeholder="Feature Description"
                                value={feat.desc}
                                onChange={(e) => {
                                  const newFeats = [...config.features];
                                  newFeats[i].desc = e.target.value;
                                  setConfig({ ...config, features: newFeats });
                                }}
                                className="w-full bg-transparent border-none p-0 text-[10px] focus:ring-0 opacity-60 resize-none font-bold"
                                rows={2}
                             />
                          </div>
                        ))}
                        <button onClick={() => setConfig({ ...config, features: [...config.features, { icon: "Zap", title: "New Feature", desc: "Description here" }] })} className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all font-bold">+ Expand Features</button>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                         <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                           <Users size={20} className="text-gold" /> Trust Indicators (Stats)
                         </h3>
                         <div className="space-y-4">
                            {config.stats.map((stat: any, i: number) => (
                              <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold">
                                       <DynamicIcon name={stat.icon} size={18} />
                                    </div>
                                    <input 
                                      placeholder="Icon (e.g. Users)"
                                      value={stat.icon}
                                      onChange={(e) => {
                                        const newStats = [...config.stats];
                                        newStats[i].icon = e.target.value;
                                        setConfig({ ...config, stats: newStats });
                                      }}
                                      className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold w-24"
                                    />
                                 </div>
                                 <input 
                                    value={stat.label}
                                    onChange={(e) => {
                                      const newStats = [...config.stats];
                                      newStats[i].label = e.target.value;
                                      setConfig({ ...config, stats: newStats });
                                    }}
                                    className="flex-1 bg-transparent border-none text-xs font-extrabold uppercase tracking-widest font-bold"
                                 />
                                 <button onClick={() => setConfig({ ...config, stats: config.stats.filter((_:any, idx:number) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity"><X size={14} /></button>
                              </div>
                            ))}
                            <button onClick={() => setConfig({ ...config, stats: [...config.stats, { icon: "Users", label: "New Stat" }] })} className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest font-bold">+ New Metric</button>
                         </div>
                      </div>

                      <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                         <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                           <Zap size={20} className="text-gold" /> Form Quantities
                         </h3>
                         <div className="flex flex-wrap gap-2">
                           {config.quantities.map((q: string, i: number) => (
                             <div key={i} className="px-4 py-2 bg-gold/10 text-gold rounded-full text-[10px] font-bold flex items-center gap-3 border border-gold/20">
                                {q}
                                <X size={12} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setConfig({ ...config, quantities: config.quantities.filter((_:any, idx:number) => idx !== i) })} />
                             </div>
                           ))}
                           <button 
                             onClick={() => {
                               const val = prompt("New quantity range?");
                               if (val) setConfig({ ...config, quantities: [...config.quantities, val] });
                             }}
                             className="px-4 py-2 border-2 border-dashed border-gold/30 text-gold rounded-full text-[10px] font-bold hover:bg-gold/5 transition-all"
                           >
                             + Add
                           </button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Portal Metadata */}
                <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10"}`}>
                   <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                     <Mail size={20} className="text-gold" /> Portal Narrative
                   </h3>
                   <div className="grid gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Portal Title (use ' Portal ' for split color)</label>
                         <input 
                           value={config.inquiryTitle}
                           onChange={(e) => setConfig({ ...config, inquiryTitle: e.target.value })}
                           className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Portal Description</label>
                         <textarea 
                           value={config.inquiryDescription}
                           onChange={(e) => setConfig({ ...config, inquiryDescription: e.target.value })}
                           className="w-full p-4 rounded-xl border bg-transparent text-sm min-h-[100px] resize-none font-bold"
                         />
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center font-bold font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Establishing Ritual Connection...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBulkOrders;
