import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Trash2, 
  User, 
  Calendar, 
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Droplets,
  Zap,
  Shield,
  RefreshCw
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminConsultations = () => {
  const { isDark } = useAdminTheme();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/quiz/submissions"));
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      }
    } catch (error) {
      toast.error("Could not reach the consultation database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this consultation record?")) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/quiz/submissions/${id}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Consultation record deleted.");
        fetchConsultations();
      } else {
        toast.error("Deletion failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredConsultations = consultations.filter(c => 
    c.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skinType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.concern?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardStyle = `backdrop-blur-3xl border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 min-h-[600px] ${
    isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-gold/5 shadow-charcoal/5"
  }`;

  const getIcon = (type: string) => {
    switch (type) {
      case 'dry': return <Droplets size={14} className="text-blue-400" />;
      case 'oily': return <Zap size={14} className="text-amber-400" />;
      case 'combination': return <RefreshCw size={14} className="text-emerald-400" />;
      case 'sensitive': return <Shield size={14} className="text-rose-400" />;
      default: return <Sparkles size={14} className="text-gold" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader 
        title="Skin"
        highlightedWord="Consultations"
        subtitle="Manage and analyze personalized radiance ritual profiles"
        isDark={isDark}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/40 group-focus-within:text-gold"
          }`} size={18} />
          <input 
            type="text" 
            placeholder="Search by customer name, email, skin type or concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/40 shadow-sm"
            }`}
          />
        </div>
        <button className={`flex items-center gap-3 px-8 py-4 backdrop-blur-2xl border rounded-2xl transition-all duration-500 font-black uppercase tracking-widest text-[10px] ${
          isDark 
          ? "bg-charcoal/40 border-white/5 text-white/40 hover:text-white hover:border-white/10" 
          : "bg-white border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:border-charcoal/10 shadow-sm"
        }`}>
          <Filter size={16} />
          <span>Filters</span>
        </button>
      </div>

      <div className={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.04] border-white/10 text-white/40" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/60"
             }`}>
                <tr>
                   <th className="px-8 py-6">Customer Profile</th>
                   <th className="px-4 py-6">Skin State</th>
                   <th className="px-4 py-6">Primary Focus</th>
                   <th className="px-4 py-6">Ritual Style</th>
                   <th className="px-4 py-6">Date</th>
                   <th className="px-8 py-6 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/5" : "divide-charcoal/5"
             }`}>
                {loading ? (
                   Array(6).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6"><div className="h-10 w-48 bg-white/5 rounded-xl" /></td>
                      <td className="px-4 py-6"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-6"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-6"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-6"><div className="h-6 w-20 bg-white/5 rounded-lg" /></td>
                      <td className="px-8 py-6"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredConsultations.length > 0 ? (
                  filteredConsultations.map((c) => (
                    <motion.tr 
                      key={c.id || c._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-gold/[0.02] transition-colors"
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg shadow-inner ${
                               isDark ? "bg-charcoal text-gold border border-white/5" : "bg-gold text-white"
                             }`}>
                                {c.userName?.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <h4 className={`text-sm font-bold mb-0.5 ${isDark ? "text-white" : "text-charcoal"}`}>{c.userName}</h4>
                                <p className={`text-[10px] font-medium ${isDark ? "text-white/30" : "text-charcoal/40"}`}>{c.userEmail || "Anonymous Visitor"}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-6">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border border-white/5 bg-white/5">
                             {getIcon(c.skinType)}
                             <span className="text-[11px] font-black uppercase tracking-widest opacity-80">{c.skinType}</span>
                          </div>
                       </td>
                       <td className="px-4 py-6">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-lg border ${
                            isDark ? "border-gold/20 text-gold bg-gold/5" : "border-gold/40 text-gold bg-gold/5"
                          }`}>
                            {c.concern.toUpperCase()}
                          </span>
                       </td>
                       <td className="px-4 py-6">
                          <div className={`flex items-center gap-2 text-[11px] font-bold ${isDark ? "text-white/60" : "text-charcoal/60"}`}>
                             <CheckCircle2 size={14} className="text-emerald-500" />
                             <span>{c.routine}</span>
                          </div>
                       </td>
                       <td className="px-4 py-6">
                          <div className="flex flex-col">
                            <span className={`text-[12px] font-bold ${isDark ? "text-white/60" : "text-charcoal/60"}`}>
                               {new Date(c.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className={`text-[9px] uppercase font-black tracking-widest opacity-30`}>
                               {new Date(c.createdAt).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                             <button 
                                onClick={() => setSelectedConsultation(c)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDark ? "bg-white/5 text-white/20 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                                title="View Details"
                             >
                                <Eye size={18} />
                             </button>
                             <button 
                                onClick={() => handleDelete(c.id || c._id)}
                             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                               isDark ? "bg-white/5 text-white/20 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-600 hover:bg-rose-50"
                             }`}
                             title="Delete Record"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <AlertCircle size={48} className="text-gold/10" />
                          <p className={`font-body text-base uppercase tracking-widest italic font-light ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
                             No skin consultations found yet.
                          </p>
                       </div>
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>

        <div className={`px-8 py-6 border-t flex items-center justify-between ${
          isDark ? "bg-white/[0.01] border-white/5" : "bg-charcoal/[0.01] border-charcoal/5"
        }`}>
           <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
              Showing {filteredConsultations.length} profiles from database
           </p>
           <div className="flex items-center gap-4">
              <button disabled className={`w-10 h-10 rounded-full border flex items-center justify-center transition-opacity cursor-not-allowed ${isDark ? "border-white/5 text-white/10" : "border-charcoal/5 text-charcoal/20"}`}>
                 <ChevronLeft size={18} />
              </button>
              <button disabled className={`w-10 h-10 rounded-full border flex items-center justify-center transition-opacity cursor-not-allowed ${isDark ? "border-white/5 text-white/10" : "border-charcoal/5 text-charcoal/20"}`}>
                 <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedConsultation(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`relative w-full max-w-2xl overflow-hidden rounded-[3rem] border transition-all duration-700 ${
              isDark ? "bg-charcoal border-white/10" : "bg-white border-gold/10"
            }`}
          >
             <div className="p-10 md:p-14 space-y-10">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold">Consultation Detail</p>
                      <h3 className="text-3xl font-display font-bold italic">Ritual Profile</h3>
                   </div>
                   <button 
                    onClick={() => setSelectedConsultation(null)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isDark ? "border-white/10 hover:bg-white/5" : "border-charcoal/10 hover:bg-charcoal/5"}`}
                   >
                     ✕
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Customer</label>
                      <div className="flex items-center gap-3">
                         <User size={16} className="text-gold" />
                         <span className="text-sm font-bold">{selectedConsultation.userName}</span>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Date Captured</label>
                      <div className="flex items-center gap-3">
                         <Calendar size={16} className="text-gold" />
                         <span className="text-sm font-bold">{new Date(selectedConsultation.createdAt).toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className={`p-8 rounded-[2rem] border ${isDark ? "bg-white/5 border-white/5" : "bg-gold/5 border-gold/10"}`}>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Personalized Insights</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Skin Type</p>
                         <p className="text-xs font-bold flex items-center gap-2">
                            {getIcon(selectedConsultation.skinType)}
                            {selectedConsultation.skinType.toUpperCase()}
                         </p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Concern</p>
                         <p className="text-xs font-bold">{selectedConsultation.concern.toUpperCase()}</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Routine</p>
                         <p className="text-xs font-bold">{selectedConsultation.routine.toUpperCase()}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Recommended Ritual Items</label>
                   <div className="flex flex-wrap gap-3">
                      {selectedConsultation.recommendedProductIds?.map((id: string, i: number) => (
                        <div key={i} className={`px-4 py-2 rounded-xl border text-[10px] font-bold ${isDark ? "bg-white/5 border-white/5" : "bg-white border-charcoal/10"}`}>
                           REF: {id.slice(-8).toUpperCase()}
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="pt-6 flex justify-end">
                   <button 
                    onClick={() => setSelectedConsultation(null)}
                    className="px-10 py-4 bg-gold text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20"
                   >
                     Close Overview
                   </button>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminConsultations;
