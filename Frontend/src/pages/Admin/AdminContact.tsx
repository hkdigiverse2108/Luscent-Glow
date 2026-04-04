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
  ChevronRight
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminContact = () => {
  const { isDark } = useAdminTheme();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

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

  useEffect(() => {
    fetchConfig();
  }, []);

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

  const resolveIcon = (iconName: string) => {
    switch (iconName) {
      case 'Phone': return <Phone size={18} />;
      case 'Mail': return <Mail size={18} />;
      case 'MapPin': return <MapPin size={18} />;
      default: return <MessageSquare size={18} />;
    }
  };

  if (loading || !config) {
    return <div className="py-20 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Establishing Concierge Connection...</div>;
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gold/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-display text-4xl font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-charcoal"}`}>
            Concierge <span className="text-gold italic text-8xl">Registry</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Contact Channels & Messaging Management</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveConfig}
          disabled={isConfigSaving}
          className="flex items-center gap-3 bg-gold hover:bg-gold/80 text-charcoal px-8 py-4 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-gold/20"
        >
          {isConfigSaving ? <Sparkles className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          <span>{isConfigSaving ? "Synchronizing..." : "Commit Settings"}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Hero & Messaging Settings */}
        <div className="space-y-8">
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
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

          <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
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
        <div className="space-y-8">
           <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
              <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
                <Phone size={20} className="text-gold" /> Artisan Channels
              </h3>
              <div className="space-y-4">
                {config.channels.map((chan: any, i: number) => (
                  <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/5 space-y-4 relative group">
                     <button onClick={() => setConfig({ ...config, channels: config.channels.filter((_:any, idx:number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                     <div className="flex gap-4 items-center">
                        <select 
                          value={chan.icon}
                          onChange={(e) => {
                            const newChans = [...config.channels];
                            newChans[i].icon = e.target.value;
                            setConfig({ ...config, channels: newChans });
                          }}
                          className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold"
                        >
                           <option value="Phone">Phone / WhatsApp</option>
                           <option value="Mail">Email / Outreach</option>
                           <option value="MapPin">Location / Studio</option>
                        </select>
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

           <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
              <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
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
      <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
        <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
          <ExternalLink size={20} className="text-gold" /> Quick FAQ Strip
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
    </div>
  );
};

export default AdminContact;
