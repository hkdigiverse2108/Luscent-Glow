import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  ChevronRight,
  Shield,
  Eye,
  Lock,
  Globe,
  FileText,
  UserCheck,
  ShieldAlert,
  Award,
  RefreshCcw,
  Zap,
  PackageCheck,
  Truck,
  Globe2,
  Clock,
  XCircle,
  CreditCard,
  X,
  Type
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const POLICY_TYPES = [
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "terms-and-conditions", label: "Terms & Conditions" },
  { id: "return-policy", label: "Return & Refund" },
  { id: "shipping-policy", label: "Shipping Policy" },
  { id: "cancellation-policy", label: "Cancellation Policy" }
];

const ICON_OPTIONS = [
  "Shield", "Eye", "Lock", "Globe", "FileText", "UserCheck", 
  "ShieldAlert", "Award", "RefreshCcw", "Zap", "PackageCheck", 
  "Truck", "Globe2", "Clock", "XCircle", "CreditCard", "HelpCircle"
];

const PoliciesAdmin = () => {
  const { isDark } = useAdminTheme();
  const [selectedType, setSelectedType] = useState(POLICY_TYPES[0].id);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const fetchPolicy = async (type: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/policies/${type}`));
      if (response.ok) {
        const data = await response.json();
        setPolicy(data);
      }
    } catch (error) {
      toast.error("Failed to fetch policy data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy(selectedType);
  }, [selectedType]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(getApiUrl(`/api/policies/${selectedType}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy)
      });
      if (response.ok) {
        toast.success(`${policy.title} synchronized.`);
      } else {
        toast.error("Failed to commit settings.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  const resolveIcon = (iconName: string) => {
    const props = { size: 18 };
    switch (iconName) {
      case 'Shield': return <Shield {...props} />;
      case 'Eye': return <Eye {...props} />;
      case 'Lock': return <Lock {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'UserCheck': return <UserCheck {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Award': return <Award {...props} />;
      case 'RefreshCcw': return <RefreshCcw {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'PackageCheck': return <PackageCheck {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'Globe2': return <Globe2 {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'XCircle': return <XCircle {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  if (loading || !policy) {
    return <div className="py-20 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Illuminating Policy Registry...</div>;
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gold/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-display text-4xl font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-charcoal"}`}>
            Policy <span className="text-gold italic text-8xl">Editor</span>
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`bg-transparent border border-gold/30 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none transition-all ${isDark ? "text-white" : "text-charcoal"}`}
            >
              {POLICY_TYPES.map(type => (
                <option key={type.id} value={type.id} className={isDark ? "bg-charcoal" : "bg-white"}>{type.label}</option>
              ))}
            </select>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Manage legal frameworks</p>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 bg-gold hover:bg-gold/80 text-charcoal px-8 py-4 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-gold/20"
        >
          {isSaving ? <Sparkles className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          <span>{isSaving ? "Synchronizing..." : "Commit Policy"}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Header Metadata */}
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
              <Type size={20} className="text-gold" /> Header Sanctuary
            </h3>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Policy Title</label>
                  <input 
                    value={policy.title}
                    onChange={(e) => setPolicy({ ...policy, title: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Subtitle</label>
                  <textarea 
                    value={policy.subtitle}
                    onChange={(e) => setPolicy({ ...policy, subtitle: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold min-h-[80px] resize-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Last Updated Date</label>
                  <input 
                    value={policy.lastUpdated}
                    onChange={(e) => setPolicy({ ...policy, lastUpdated: e.target.value })}
                    className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                  />
               </div>
            </div>
          </div>

          {/* Insights Sanctuary */}
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl font-bold flex items-center gap-3">
                <Sparkles size={20} className="text-gold" /> Critical Insights
              </h3>
              <button 
                onClick={() => {
                  setPolicy({ 
                    ...policy, 
                    insights: [...policy.insights, { icon: "Shield", title: "New Insight", description: "Description goes here..." }] 
                  });
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-gold hover:opacity-70 transition-opacity"
              >
                + Add Insight
              </button>
            </div>
            
            <div className="space-y-6">
              {policy.insights.map((insight: any, idx: number) => (
                <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4 relative group">
                  <button 
                    onClick={() => {
                      const newInsights = policy.insights.filter((_: any, i: number) => i !== idx);
                      setPolicy({ ...policy, insights: newInsights });
                    }}
                    className="absolute top-4 right-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex gap-4">
                    <div className="space-y-2 w-1/3">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Icon</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                          {resolveIcon(insight.icon)}
                        </div>
                        <select 
                          value={insight.icon}
                          onChange={(e) => {
                            const newInsights = [...policy.insights];
                            newInsights[idx].icon = e.target.value;
                            setPolicy({ ...policy, insights: newInsights });
                          }}
                          className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 p-0"
                        >
                          {ICON_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-charcoal">{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Title</label>
                      <input 
                        value={insight.title}
                        onChange={(e) => {
                          const newInsights = [...policy.insights];
                          newInsights[idx].title = e.target.value;
                          setPolicy({ ...policy, insights: newInsights });
                        }}
                        className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Description</label>
                    <textarea 
                      value={insight.description}
                      onChange={(e) => {
                        const newInsights = [...policy.insights];
                        newInsights[idx].description = e.target.value;
                        setPolicy({ ...policy, insights: newInsights });
                      }}
                      className="w-full bg-transparent border-none p-0 text-xs italic font-bold focus:ring-0 resize-none h-16"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className={`p-8 rounded-[2.5rem] border h-fit ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-xl font-bold flex items-center gap-3">
              <FileText size={20} className="text-gold" /> Policy Framework
            </h3>
            <button 
              onClick={() => {
                const newId = `section_${Date.now()}`;
                const newSections = [...policy.sections, { id: newId, title: "New Section", content: "Content goes here..." }];
                setPolicy({ ...policy, sections: newSections });
                setExpandedSection(newId);
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-gold hover:opacity-70 transition-opacity"
            >
              + Create Section
            </button>
          </div>

          <div className="space-y-4">
            {policy.sections.map((section: any) => (
              <div key={section.id} className={`rounded-3xl border transition-all ${expandedSection === section.id ? "border-gold/30" : "border-white/5"}`}>
                <div 
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="p-5 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-primary transition-all">
                      <ChevronRight size={18} className={`transition-transform ${expandedSection === section.id ? "rotate-90" : ""}`} />
                    </div>
                    <input 
                      value={section.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newSections = [...policy.sections];
                        const idx = newSections.findIndex(s => s.id === section.id);
                        newSections[idx].title = e.target.value;
                        setPolicy({ ...policy, sections: newSections });
                      }}
                      className="bg-transparent border-none p-0 text-sm font-bold uppercase tracking-widest focus:ring-0 flex-1"
                    />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSections = policy.sections.filter((s: any) => s.id !== section.id);
                      setPolicy({ ...policy, sections: newSections });
                    }}
                    className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-white/5 space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Anchor ID (lowercase, no spaces)</label>
                           <input 
                              value={section.id}
                              onChange={(e) => {
                                const newSections = [...policy.sections];
                                const idx = newSections.findIndex(s => s.id === section.id);
                                newSections[idx].id = e.target.value;
                                setPolicy({ ...policy, sections: newSections });
                                setExpandedSection(e.target.value);
                              }}
                              className="w-full bg-transparent border-none p-0 text-xs font-mono focus:ring-0 text-gold"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest opacity-30">Content (HTML Supported)</label>
                           <textarea 
                              value={section.content}
                              onChange={(e) => {
                                const newSections = [...policy.sections];
                                const idx = newSections.findIndex(s => s.id === section.id);
                                newSections[idx].content = e.target.value;
                                setPolicy({ ...policy, sections: newSections });
                              }}
                              className={`w-full bg-transparent border rounded-xl p-4 text-xs font-medium focus:ring-1 focus:ring-gold outline-none resize-y min-h-[200px] ${isDark ? "border-white/10" : "border-charcoal/10"}`}
                              placeholder="<p>Write your policy content here...</p>"
                           />
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

export default PoliciesAdmin;
