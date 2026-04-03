import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Building,
  Phone,
  Trash2,
  CheckCircle,
  Clock
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminInquiries = () => {
  const { isDark } = useAdminTheme();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'standard' | 'bulk'>('standard');
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInquiries = async () => {
    setLoading(true);
    const endpoint = activeTab === 'standard' ? '/api/contact/inquiries' : '/api/contact/bulk-inquiries';
    try {
      const response = await fetch(getApiUrl(endpoint));
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      }
    } catch (error) {
      toast.error("Could not reach the seeker inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab]);

  const handleAcknowledge = async (id: string) => {
    const endpoint = activeTab === 'standard' 
      ? `/api/contact/inquiry/${id}` 
      : `/api/contact/bulk-inquiry/${id}`;
    
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Ritual acknowledged and archived.");
        setInquiries(prev => prev.filter(inq => inq._id !== id));
      } else {
        toast.error("Could not resolve this inquiry.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    (inq.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     inq.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     inq.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-600/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Seeker <span className="text-indigo-500">Inquiries</span>
          </h2>
          <p className={`font-body text-xs tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-500" : "text-charcoal/70"
          }`}>
            Live repository of sanctuary outreach and corporate rituals
          </p>
        </div>
      </div>

      {/* Tab Ritual */}
      <div className={`flex items-center gap-2 p-1.5 backdrop-blur-2xl rounded-2xl w-fit transition-colors duration-700 ${
        isDark ? "bg-white/5" : "bg-charcoal/5"
      }`}>
        <button 
          onClick={() => setActiveTab('standard')}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-500 ${
            activeTab === 'standard' 
            ? "bg-gold text-charcoal shadow-lg shadow-gold/10" 
            : isDark ? "text-white/40 hover:text-white" : "text-charcoal/70 hover:text-charcoal"
          }`}
        >
          General Inquiries
        </button>
        <button 
          onClick={() => setActiveTab('bulk')}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-500 ${
            activeTab === 'bulk' 
            ? "bg-gold text-charcoal shadow-lg shadow-gold/10" 
            : isDark ? "text-white/40 hover:text-white" : "text-charcoal/70 hover:text-charcoal"
          }`}
        >
          Bulk & Corporate
        </button>
      </div>

      <div className="relative max-w-xl group">
        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
          isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
        }`} size={18} />
        <input 
          type="text" 
          placeholder="Search inquiries by seeker name, email, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all font-bold ${
            isDark 
            ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
            : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
          }`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
           Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5" />
          ))
         ) : filteredInquiries.length > 0 ? (
           filteredInquiries.map((i) => (
             <motion.div
               key={i._id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`group relative backdrop-blur-3xl border rounded-[2.5rem] p-8 transition-all duration-700 h-full flex flex-col shadow-2xl ${
                 isDark 
                 ? "bg-charcoal/40 border-white/5 hover:border-gold/20 shadow-black/50" 
                 : "bg-white border-charcoal/5 hover:border-gold/30 shadow-charcoal/5"
               }`}
             >
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <MessageSquare size={22} />
                   </div>
                   <div className={`text-\[11px\] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors ${
                     isDark ? "text-white/20" : "text-charcoal/60"
                   }`}>
                      <Clock size={12} /> {new Date(i.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div>
                      <h4 className={`text-xl font-bold transition-colors ${
                        isDark ? "text-white" : "text-charcoal"
                      }`}>{i.name}</h4>
                      <p className="text-xs font-bold text-gold/60 uppercase tracking-widest flex items-center gap-2">
                         <Mail size={12} /> {i.email}
                      </p>
                   </div>
                   {i.companyName && (
                     <div className="flex items-center gap-2 text-xs font-bold text-sky-400/60 uppercase tracking-widest">
                        <Building size={12} /> {i.companyName}
                     </div>
                   )}
                   {i.phoneNumber && (
                     <div className="flex items-center gap-2 text-xs font-bold text-rose-light/60 uppercase tracking-widest">
                        <Phone size={12} /> {i.phoneNumber}
                     </div>
                   )}
                </div>

                <div className="space-y-4 flex-1">
                   <p className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                     isDark ? "text-white/30" : "text-charcoal/70"
                   }`}>{i.subject || "No Subject"}</p>
                   <p className={`font-body text-sm leading-relaxed italic border-l-2 border-gold/20 pl-4 py-2 transition-colors ${
                     isDark ? "text-white/60" : "text-charcoal/70"
                   }`}>
                     "{i.message}"
                   </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                   <span className="px-3 py-1 bg-gold/10 rounded-lg text-\[11px\] font-bold text-gold uppercase tracking-widest border border-gold/10">
                      {activeTab === 'bulk' ? 'Corporate' : 'Seeker Output'}
                   </span>
                   <button 
                     onClick={() => handleAcknowledge(i._id)}
                     className={`flex items-center gap-2 text-xs font-bold hover:text-gold uppercase tracking-widest transition-all ${
                       isDark ? "text-white/20" : "text-charcoal/60"
                     }`}
                   >
                      Acknowledge Ritual <CheckCircle size={14} />
                   </button>
                </div>
             </motion.div>
           ))
         ) : (
            <div className="col-span-full py-20 text-center text-white/20 font-body text-sm uppercase tracking-widest italic">
               No seekers have reached out to the sanctuary lately.
            </div>
         )}
      </div>
    </div>
  );
};

export default AdminInquiries;
