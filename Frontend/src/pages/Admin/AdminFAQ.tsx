import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
  X,
  HelpCircle,
  Truck,
  Package,
  RefreshCcw,
  Plus,
  ChevronRight,
  ChevronDown,
  Layout
} from "lucide-react";
import DynamicIcon from "../../components/DynamicIcon.tsx";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminFAQ = () => {
  const { isDark } = useAdminTheme();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/faq/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        if (data.categories?.length > 0) {
          setExpandedCategory(data.categories[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch FAQ configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setIsConfigSaving(true);
    try {
      const response = await fetch(getApiUrl("/api/faq/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        toast.success("FAQ settings synchronized.");
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
        title="FAQ"
        highlightedWord="Concierge"
        subtitle="Categories, Questions & Assistant Management"
        isDark={isDark}
        action={{
          label: isConfigSaving ? "Synchronizing..." : "Commit Settings",
          onClick: handleSaveConfig,
          icon: isConfigSaving ? Sparkles : CheckCircle2,
          disabled: isConfigSaving
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Hero & Support sections */}
        <div className="space-y-4">
          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3">
              <Sparkles size={20} className="text-gold" /> Hero Sanctuary
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Badge</label>
                  <input 
                    value={config.heroBadge}
                    onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Title (use ' assist you? ' for split color)</label>
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
              <Plus size={20} className="text-gold" /> Support Registry (Bottom Card)
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Card Title</label>
                  <input 
                    value={config.supportTitle}
                    onChange={(e) => setConfig({ ...config, supportTitle: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Card Description</label>
                  <textarea 
                    value={config.supportDescription}
                    onChange={(e) => setConfig({ ...config, supportDescription: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold min-h-[80px] resize-none"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Button Text</label>
                     <input value={config.supportButtonText} onChange={(e) => setConfig({ ...config, supportButtonText: e.target.value })} className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Button Link</label>
                     <input value={config.supportButtonLink} onChange={(e) => setConfig({ ...config, supportButtonLink: e.target.value })} className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Categories & Questions Management */}
        <div className={`p-4 rounded-3xl border min-h-[600px] ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-xl font-bold flex items-center gap-3">
              <Layout size={20} className="text-gold" /> Registry Repository
            </h3>
            <button 
              onClick={() => {
                const newId = `cat_${Date.now()}`;
                setConfig({ ...config, categories: [...config.categories, { id: newId, category: "New Category", icon: "HelpCircle", questions: [] }] });
                setExpandedCategory(newId);
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-gold hover:opacity-70 transition-opacity"
            >
              + Create Category
            </button>
          </div>

          <div className="space-y-4">
            {config.categories.map((cat: any) => (
              <div key={cat.id} className={`rounded-3xl border transition-all ${expandedCategory === cat.id ? "border-gold/30" : "border-white/5"}`}>
                  <div 
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                  className="p-3 flex items-center justify-between cursor-pointer group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal transition-all">
                        <DynamicIcon name={cat.icon} size={18} />
                      </div>
                      <div className="space-y-1 text-left">
                        <input 
                           value={cat.category}
                           onClick={(e) => e.stopPropagation()}
                           onChange={(e) => {
                             const newCats = [...config.categories];
                             const idx = newCats.findIndex(c => c.id === cat.id);
                             newCats[idx].category = e.target.value;
                             setConfig({ ...config, categories: newCats });
                           }}
                           className="bg-transparent border-none p-0 text-sm font-bold uppercase tracking-widest focus:ring-0"
                        />
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">

                         <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">

                            <DynamicIcon name={cat.icon} size={14} />

                         </div>

                         <input 

                            placeholder="Icon Name"

                            value={cat.icon}

                            onClick={(e) => e.stopPropagation()}

                            onChange={(e) => {

                              const newCats = [...config.categories];

                              const idx = newCats.findIndex(c => c.id === cat.id);

                              newCats[idx].icon = e.target.value;

                              setConfig({ ...config, categories: newCats });

                            }}

                            className="bg-transparent border rounded-lg p-1 text-[9px] uppercase font-bold w-20"

                         />

                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfig({ ...config, categories: config.categories.filter((c:any) => c.id !== cat.id) });
                          if (expandedCategory === cat.id) setExpandedCategory(null);
                        }}
                        className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={18} className={`transition-transform opacity-30 ${expandedCategory === cat.id ? "rotate-90" : ""}`} />
                   </div>
                </div>

                <AnimatePresence>
                  {expandedCategory === cat.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-white/5 space-y-4">
                         <div className="space-y-4">
                            {cat.questions.map((q: any, qIdx: number) => (
                              <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 relative group/q">
                                 <button 
                                   onClick={() => {
                                      const newCats = [...config.categories];
                                      const catIdx = newCats.findIndex(c => c.id === cat.id);
                                      newCats[catIdx].questions = newCats[catIdx].questions.filter((_:any, i:number) => i !== qIdx);
                                      setConfig({ ...config, categories: newCats });
                                   }}
                                   className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover/q:opacity-100 transition-opacity"
                                 >
                                   <X size={14} />
                                 </button>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Question</label>
                                    <input 
                                      value={q.question}
                                      onChange={(e) => {
                                        const newCats = [...config.categories];
                                        const catIdx = newCats.findIndex(c => c.id === cat.id);
                                        newCats[catIdx].questions[qIdx].question = e.target.value;
                                        setConfig({ ...config, categories: newCats });
                                      }}
                                      className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Answer</label>
                                    <textarea 
                                      value={q.answer}
                                      onChange={(e) => {
                                        const newCats = [...config.categories];
                                        const catIdx = newCats.findIndex(c => c.id === cat.id);
                                        newCats[catIdx].questions[qIdx].answer = e.target.value;
                                        setConfig({ ...config, categories: newCats });
                                      }}
                                      className="w-full bg-transparent border-none p-0 text-xs italic font-bold focus:ring-0 resize-none h-20"
                                    />
                                 </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newCats = [...config.categories];
                                const idx = newCats.findIndex(c => c.id === cat.id);
                                newCats[idx].questions.push({ id: `q_${Date.now()}`, question: "New Question?", answer: "Answer description..." });
                                setConfig({ ...config, categories: newCats });
                              }}
                              className="w-full py-4 border-2 border-dashed border-gold/30 rounded-2xl text-gold font-bold text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-all"
                            >
                              + Add Question
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFAQ;
