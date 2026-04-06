import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  Upload,
  Zap,
  CheckCircle2,
  Trash2,
  X,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  ExternalLink,
  ChevronRight,
  Search,
  Eye,
  CheckCircle,
  Building,
  Calendar,
  XCircle
} from "lucide-react";
import DynamicIcon from "../../components/DynamicIcon.tsx";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const InquiryDetailModal = ({ isOpen, onClose, inquiry, isDark }: { isOpen: boolean, onClose: () => void, inquiry: any, isDark: boolean }) => {
  if (!isOpen || !inquiry) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className={`relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden ${
            isDark ? "bg-charcoal/95 border-white/10" : "bg-white/95 border-charcoal/10"
          }`}
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                  Ritual <span className="text-gold italic text-2xl">Specification</span>
                </h3>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.3em] opacity-80 italic">Seeker Metadata Analysis</p>
              </div>
            </div>
            <button onClick={onClose} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-charcoal/5 text-charcoal/40"}`}><XCircle size={20} /></button>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"}`}>
                 <p className="text-[12px] font-extrabold uppercase text-gold tracking-widest mb-2 flex items-center gap-2"><Sparkles size={13} /> Seeker Identity</p>
                 <p className={`text-base font-bold ${isDark ? "text-white" : "text-charcoal"}`}>{inquiry.name}</p>
                 <p className="text-sm font-bold opacity-80 break-all transition-opacity hover:opacity-100">{inquiry.email}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"}`}>
                 <p className="text-[12px] font-extrabold uppercase text-gold tracking-widest mb-2 flex items-center gap-2"><Calendar size={13} /> Ritual Context</p>
                 <p className={`text-base font-extrabold ${isDark ? "text-white" : "text-charcoal"}`}>{new Date(inquiry.createdAt).toLocaleString()}</p>
                 <p className="text-sm font-bold opacity-80 italic transition-opacity">Broadcasted from sanctuary</p>
              </div>
            </div>
            {inquiry.phoneNumber && (
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-widest border transition-all ${isDark ? "bg-gold/10 text-gold border-gold/20" : "bg-gold/5 text-charcoal border-gold/20 shadow-sm"} w-fit`}><Phone size={14} /> {inquiry.phoneNumber}</div>
            )}
            <div className="space-y-4">
              <h4 className="text-[12px] font-extrabold uppercase text-gold tracking-[0.3em]">The Message Ritual</h4>
              <div className={`p-6 rounded-3xl border italic font-body text-base leading-relaxed ${isDark ? "bg-gold/5 border-gold/10 text-white/80" : "bg-gold/5 border-gold/10 text-charcoal/80"}`}>
                 "{inquiry.message}"
              </div>
            </div>
          </div>
          <div className={`p-6 border-t flex justify-end bg-white/[0.02] ${isDark ? "border-white/5" : "border-charcoal/5"}`}>
             <button onClick={onClose} className="px-10 py-4 bg-charcoal text-white font-extrabold rounded-2xl shadow-2xl hover:bg-gold hover:text-charcoal transition-all duration-500 uppercase tracking-[0.2em] text-[12px] border border-white/10">Archive Review</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const AdminContact = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"inquiries" | "settings">("inquiries");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  
  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/contact-settings/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      toast.error("Failed to fetch Contact settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiryLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/contact/inquiries"));
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      }
    } catch (error) {
      toast.error("Could not retrieve seeker inquiries.");
    } finally {
      setInquiryLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchInquiries();
  }, []);

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Archive this seeker inquiry?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/contact/inquiry/${id}`), { method: "DELETE" });
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
    i.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = async (field: string, file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: uploadData,
      });
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...config, [field]: data.url });
        toast.success("Visual updated.");
      }
    } catch (error) {
      toast.error("Image upload failed.");
    }
  };

  const handleSaveConfig = async () => {
    setIsConfigSaving(true);
    try {
      const response = await fetch(getApiUrl("/api/contact-settings/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        toast.success("Concierge configuration synchronized.");
      } else {
        toast.error("Failed to commit settings.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setIsConfigSaving(false);
    }
  };

  // resolveIcon removed in favor of DynamicIcon component

  if (loading || !config) {
    return <div className="py-10 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Establishing Concierge Connection...</div>;
  }

  return (
    <div className="space-y-2 pb-4">
      <AdminHeader 
        title="Contact"
        highlightedWord="Concierge"
        subtitle="Managing the seeker inquiries and storefront presence"
        isDark={isDark}
        action={activeTab === "settings" ? {
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
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "settings" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
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
                { label: "Active Inquiries", value: inquiries.length, icon: MessageSquare, tint: "text-gold" },
                { label: "Unique Seekers", value: new Set(inquiries.map(i => i.email)).size, icon: Sparkles, tint: "text-emerald-500" },
                { label: "Ritual Status", value: "Operational", icon: CheckCircle, tint: "text-blue-500" }
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
                placeholder="Locate seeker inquiry by name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-3 px-4 text-sm focus:ring-0 placeholder:text-muted-foreground/50 font-bold"
              />
            </div>

            <div className={`rounded-2xl border overflow-hidden transition-all duration-700 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl shadow-white/5"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={isDark ? "bg-white/5" : "bg-charcoal/5"}>
                    <tr>
                      <th className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-60">Seeker Information</th>
                      <th className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-60">Inquiry Ritual</th>
                      <th className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-60">Date</th>
                      <th className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest opacity-60 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inquiryLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-6 w-48 bg-white/5 rounded-lg" /></td>
                          <td className="px-4 py-3"><div className="h-6 w-64 bg-white/5 rounded-lg" /></td>
                          <td className="px-4 py-3"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                          <td className="px-6 py-3"><div className="h-6 w-20 ml-auto bg-white/5 rounded-lg" /></td>
                        </tr>
                      ))
                    ) : filteredInquiries.length > 0 ? (
                      filteredInquiries.map((inquiry, idx) => (
                        <tr key={inquiry._id || idx} className="hover:bg-gold/5 transition-colors group">
                          <td className="px-4 py-1.5">
                             <div className="flex flex-col">
                                <p className="text-sm font-bold tracking-tight">{inquiry.name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{inquiry.email}</p>
                             </div>
                          </td>
                          <td className="px-4 py-1.5">
                             <div className="space-y-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/60" : "text-charcoal/60"}`}>{inquiry.subject || "General Inquiry"}</span>
                                <p className="text-xs text-muted-foreground line-clamp-1 italic font-bold">"{inquiry.message}"</p>
                             </div>
                          </td>
                          <td className="px-4 py-1.5 font-body text-xs opacity-60 font-bold whitespace-nowrap">
                            {new Date(inquiry.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-3 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={() => { setSelectedInquiry(inquiry); setIsModalOpen(true); }} className="p-2 text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-xl transition-all"><Eye size={16} /></button>
                                <button onClick={() => handleDeleteInquiry(inquiry._id)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs">No seeker rituals currently logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hero & Messaging Settings */}
        <div className="space-y-6">
          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <Sparkles size={20} className="text-gold" /> Hero Concierge
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Badge</label>
                  <input 
                    value={config.heroBadge}
                    onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold placeholder:opacity-30"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Title (use ' Priority. ' for split color)</label>
                  <input 
                    value={config.heroTitle}
                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Description</label>
                  <textarea 
                    value={config.heroDescription}
                    onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold min-h-[100px] resize-none"
                  />
               </div>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <MessageSquare size={20} className="text-gold" /> Inquiry Portal Configuration
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Form Title</label>
                  <input 
                    value={config.formTitle}
                    onChange={(e) => setConfig({ ...config, formTitle: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Subject Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {config.formSubjects.map((sub: string, i: number) => (
                      <div key={i} className="px-4 py-2 bg-gold/10 text-gold rounded-full text-[10px] font-bold border border-gold/20 flex items-center gap-3">
                        {sub}
                        <X size={12} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setConfig({ ...config, formSubjects: config.formSubjects.filter((_:any, idx:number) => idx !== i) })} />
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const val = prompt("New inquiry subject?");
                        if (val) setConfig({ ...config, formSubjects: [...config.formSubjects, val] });
                      }}
                      className="px-4 py-2 border-2 border-dashed border-gold/30 text-gold rounded-full text-[10px] font-bold hover:bg-gold/5 transition-all"
                    >
                      + Add Subject
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Artisan Channels & Visuals */}
        <div className="space-y-6">
           <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
              <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                <Phone size={20} className="text-gold" /> Artisan Channels
              </h3>
              <div className="space-y-4">
                {config.channels.map((chan: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5 space-y-4 relative group">
                     <button onClick={() => setConfig({ ...config, channels: config.channels.filter((_:any, idx:number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                     <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold">
                              <DynamicIcon name={chan.icon} size={18} />
                           </div>
                           <input 
                             placeholder="Icon (e.g. Phone)"
                             value={chan.icon}
                             onChange={(e) => {
                               const newChans = [...config.channels];
                               newChans[i].icon = e.target.value;
                               setConfig({ ...config, channels: newChans });
                             }}
                             className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold w-24"
                           />
                        </div>
                        <input 
                          placeholder="Channel Badge"
                          value={chan.badge}
                          onChange={(e) => {
                            const newChans = [...config.channels];
                            newChans[i].badge = e.target.value;
                            setConfig({ ...config, channels: newChans });
                          }}
                          className="flex-1 bg-transparent border-none p-0 text-[10px] font-bold uppercase tracking-widest focus:ring-0 text-gold"
                        />
                     </div>
                     <div className="space-y-2">
                        <input 
                          placeholder="Contact Value"
                          value={chan.value}
                          onChange={(e) => {
                            const newChans = [...config.channels];
                            newChans[i].value = e.target.value;
                            setConfig({ ...config, channels: newChans });
                          }}
                          className="w-full bg-transparent border-none p-0 text-lg font-bold focus:ring-0 placeholder:opacity-20"
                        />
                        <textarea 
                          placeholder="Availability Description"
                          value={chan.desc}
                          onChange={(e) => {
                            const newChans = [...config.channels];
                            newChans[i].desc = e.target.value;
                            setConfig({ ...config, channels: newChans });
                          }}
                          className="w-full bg-transparent border-none p-0 text-[10px] font-bold opacity-60 resize-none focus:ring-0"
                          rows={2}
                        />
                     </div>
                  </div>
                ))}
                <button onClick={() => setConfig({ ...config, channels: [...config.channels, { icon: "Phone", badge: "New Channel", value: "+91 ...", desc: "Available 24/7" }] })} className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all">+ Add Contact Channel</button>
              </div>
           </div>

           <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
              <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                <MapPin size={20} className="text-gold" /> Boutique Visual
              </h3>
              <div className="space-y-4">
                 <div className="relative aspect-video rounded-[2rem] overflow-hidden group shadow-2xl">
                    <img src={getAssetUrl(config.boutiqueImage)} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500">
                       <Upload size={32} className="text-gold mb-2" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white">Replace Boutique visual</span>
                       <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('boutiqueImage', e.target.files[0])} />
                    </label>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Quick FAQ Strip Management */}
      <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
        <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
          <ExternalLink size={20} className="text-gold" /> Quick FAQ Strip
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">FAQ Title</label>
                 <input 
                   value={config.faqTitle}
                   onChange={(e) => setConfig({ ...config, faqTitle: e.target.value })}
                   className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold uppercase tracking-widest"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">FAQ Subtitle</label>
                 <input 
                   value={config.faqSubtitle}
                   onChange={(e) => setConfig({ ...config, faqSubtitle: e.target.value })}
                   className="w-full p-4 rounded-xl border bg-transparent text-xs font-bold italic"
                 />
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Linked Registries</label>
              <div className="flex flex-wrap gap-3">
                 {config.faqLinks.map((link: string, i: number) => (
                   <div key={i} className="px-5 py-3 border rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 group">
                      {link}
                      <X size={12} className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setConfig({ ...config, faqLinks: config.faqLinks.filter((_:any, idx:number) => idx !== i) })} />
                   </div>
                 ))}
                 <button 
                    onClick={() => {
                      const val = prompt("Registry label?");
                      if (val) setConfig({ ...config, faqLinks: [...config.faqLinks, val] });
                    }}
                    className="px-5 py-3 border-2 border-dashed border-gold/30 text-gold rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold/5 transition-all"
                  >
                    + New Link
                  </button>
              </div>
           </div>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
      <InquiryDetailModal isDark={isDark} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} inquiry={selectedInquiry} />
    </div>
  );
};

export default AdminContact;
