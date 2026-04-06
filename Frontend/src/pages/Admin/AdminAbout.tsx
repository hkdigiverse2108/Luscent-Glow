import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  Upload,
  Zap,
  CheckCircle2,
  Trash2,
  X,
  Leaf,
  Heart,
  Globe,
  Shield,
  MessageSquare,
  Image as ImageIcon
} from "lucide-react";
import DynamicIcon from "../../components/DynamicIcon.tsx";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminAbout = () => {
  const { isDark } = useAdminTheme();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/about/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      toast.error("Failed to fetch About Us configuration.");
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
      const response = await fetch(getApiUrl("/api/about/settings"), {
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

  // Removed hardcoded resolveIcon in favor of DynamicIcon component

  if (loading || !config) {
    return <div className="py-20 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Establishing Ritual Connection...</div>;
  }

  return (
    <div className="space-y-2 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gold/10 pb-1.5">
        <div className="space-y-1">
          <h2 className={`font-display text-4xl font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-charcoal"}`}>
            About Us <span className="text-gold italic text-8xl">Sanctuary</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Narrative & Philosophy Management</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hero & Narrative Settings */}
        <div className="space-y-6">
          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <Sparkles size={20} className="text-gold" /> Hero Sanctuary
            </h3>
            <div className="grid gap-6">
              <div className="space-y-4">
                 <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Master Visual</label>
                 <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/10 group shadow-2xl">
                    <img src={getAssetUrl(config.heroImage)} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500">
                       <Upload size={32} className="text-gold mb-2" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white">Upload Hero Image</span>
                       <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('heroImage', e.target.files[0])} />
                    </label>
                 </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Badge</label>
                    <input 
                      value={config.heroBadge}
                      onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                      className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Title (use ' Convention. ' for split color)</label>
                    <input 
                      value={config.heroTitle}
                      onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                      className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                    />
                 </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <MessageSquare size={20} className="text-gold" /> Editorial Narrative
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Narrative Title (use ' Revolution. ' for split color)</label>
                  <input 
                    value={config.narrativeTitle}
                    onChange={(e) => setConfig({ ...config, narrativeTitle: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Narrative Paragraphs</label>
                  {config.narrativeParagraphs.map((para: string, i: number) => (
                    <div key={i} className="relative group">
                       <textarea 
                         value={para}
                         onChange={(e) => {
                           const newParas = [...config.narrativeParagraphs];
                           newParas[i] = e.target.value;
                           setConfig({ ...config, narrativeParagraphs: newParas });
                         }}
                         className="w-full p-5 bg-white/5 border rounded-2xl text-xs font-bold leading-relaxed resize-none h-24"
                       />
                       <button onClick={() => setConfig({ ...config, narrativeParagraphs: config.narrativeParagraphs.filter((_:any, idx:number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => setConfig({ ...config, narrativeParagraphs: [...config.narrativeParagraphs, "New narrative paragraph..."] })} className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all">+ Add Editorial Paragraph</button>
               </div>
            </div>
          </div>
        </div>

        {/* Values & Founder */}
        <div className="space-y-6">
          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
              <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                <Leaf size={20} className="text-gold" /> Philosophy Values
              </h3>
              <div className="space-y-4">
                {config.values.map((val: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/5 space-y-3 relative group">
                     <button onClick={() => setConfig({ ...config, values: config.values.filter((_:any, idx:number) => idx !== i) })} className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                     <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold">
                           <DynamicIcon name={val.icon} size={18} />
                        </div>
                        <input 
                          placeholder="Icon (e.g. Leaf)"
                          value={val.icon}
                          onChange={(e) => {
                            const newVals = [...config.values];
                            newVals[i].icon = e.target.value;
                            setConfig({ ...config, values: newVals });
                          }}
                          className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold w-24"
                        />
                        <input 
                          placeholder="Value Title"
                          value={val.title}
                          onChange={(e) => {
                            const newVals = [...config.values];
                            newVals[i].title = e.target.value;
                            setConfig({ ...config, values: newVals });
                          }}
                          className="flex-1 bg-transparent border-none p-0 text-sm font-bold uppercase tracking-widest focus:ring-0"
                        />
                     </div>
                     <textarea 
                        placeholder="Description"
                        value={val.desc}
                        onChange={(e) => {
                          const newVals = [...config.values];
                          newVals[i].desc = e.target.value;
                          setConfig({ ...config, values: newVals });
                        }}
                        className="w-full bg-transparent border-none p-0 text-[10px] uppercase font-bold opacity-60 resize-none focus:ring-0"
                        rows={2}
                     />
                  </div>
                ))}
                <button onClick={() => setConfig({ ...config, values: [...config.values, { icon: "Leaf", title: "New Philosophy", desc: "Description..." }] })} className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all">+ Add Brand Philosophy</button>
              </div>
           </div>

          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
              <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
                <Leaf size={20} className="text-gold" /> Visual Interlude
              </h3>
              <div className="grid gap-6">
                 <div className="relative aspect-[2/1] rounded-[2rem] overflow-hidden group shadow-2xl">
                    <img src={getAssetUrl(config.interludeImage)} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500">
                       <Upload size={32} className="text-gold mb-2" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white">Upload Interlude Image</span>
                       <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('interludeImage', e.target.files[0])} />
                    </label>
                 </div>
                 <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Interlude Title</label>
                       <input 
                         value={config.interludeTitle}
                         onChange={(e) => setConfig({ ...config, interludeTitle: e.target.value })}
                         className="w-full p-4 rounded-xl border bg-transparent text-[10px] font-bold uppercase tracking-widest"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Interlude Subtitle</label>
                       <input 
                         value={config.interludeSubtitle}
                         onChange={(e) => setConfig({ ...config, interludeSubtitle: e.target.value })}
                         className="w-full p-4 rounded-xl border bg-transparent text-[10px] font-bold uppercase tracking-widest"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {/* Curator Settings */}
         <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <ImageIcon size={20} className="text-gold" /> Founder Vision
            </h3>
            <div className="flex flex-col md:flex-row gap-10">
               <div className="w-full md:w-1/3 space-y-4">
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group">
                     <img src={getAssetUrl(config.curatorImage)} className="w-full h-full object-cover" />
                     <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500">
                        <Upload size={24} className="text-gold mb-2" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white">Replace Portrait</span>
                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('curatorImage', e.target.files[0])} />
                     </label>
                  </div>
               </div>
               <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Badge</label>
                        <input value={config.curatorBadge} onChange={(e) => setConfig({ ...config, curatorBadge: e.target.value })} className="w-full p-4 rounded-xl border bg-transparent text-[10px] font-bold uppercase tracking-widest" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Founder Name (use ' Luxury. ' for split color)</label>
                        <input value={config.curatorTitle} onChange={(e) => setConfig({ ...config, curatorTitle: e.target.value })} className="w-full p-4 rounded-xl border bg-transparent text-[10px] font-bold uppercase tracking-widest"/>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Signature Quote</label>
                     <textarea value={config.curatorQuote} onChange={(e) => setConfig({ ...config, curatorQuote: e.target.value })} className="w-full p-5 border rounded-2xl bg-white/5 text-xs italic font-bold leading-relaxed h-32 resize-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Signature Label</label>
                     <input value={config.curatorName} onChange={(e) => setConfig({ ...config, curatorName: e.target.value })} className="w-full p-4 rounded-xl border bg-transparent text-[10px] font-bold uppercase tracking-widest"/>
                  </div>
               </div>
            </div>
         </div>

         {/* Commitments Section */}
         <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-gold" /> Site Commitments
            </h3>
            <div className="space-y-4">
               {config.commitments.map((commit: string, i: number) => (
                 <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                    <input 
                       value={commit}
                       onChange={(e) => {
                         const newCommitments = [...config.commitments];
                         newCommitments[i] = e.target.value;
                         setConfig({ ...config, commitments: newCommitments });
                       }}
                       className="flex-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-[0.3em] font-bold focus:ring-0"
                    />
                    <button onClick={() => setConfig({ ...config, commitments: config.commitments.filter((_:any, idx:number) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity"><Trash2 size={16} /></button>
                 </div>
               ))}
               <button onClick={() => setConfig({ ...config, commitments: [...config.commitments, "New Promise"] })} className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all">+ Add Commitment Badge</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminAbout;
