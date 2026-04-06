import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Mail, 
  Trash2, 
  Search, 
  Calendar,
  CheckCircle,
  Download
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const AdminNewsletter = () => {
  const { isDark } = useAdminTheme();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/newsletter/"));
      if (response.ok) {
        const data = await response.json();
        setSubs(data);
      }
    } catch (error) {
      toast.error("Could not reach the subscriber repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the inner circle?`)) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/newsletter/${email}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Subscriber removed from repository.");
        fetchSubs();
      } else {
        toast.error("Removal ritual failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredSubs = subs.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2 pb-4">
      {/* Header Ritual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-indigo-600/10 pb-1.5">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Inner <span className="text-indigo-500">Circle</span>
          </h2>
          <p className={`font-body text-xs tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-500" : "text-charcoal/70"
          }`}>
            Managing the newsletter subscriber repository
          </p>
        </div>
        
        <button className={`flex items-center gap-3 px-8 py-4 border font-bold rounded-2xl transition-all duration-500 uppercase tracking-widest text-xs ${
          isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-charcoal/5 border-charcoal/10 text-charcoal hover:bg-charcoal/10"
        }`}>
          <Download size={18} />
          <span>Export List</span>
        </button>
      </div>

      <div className="relative max-w-xl group">
        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
          isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
        }`} size={18} />
        <input 
          type="text" 
          placeholder="Search by email address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full backdrop-blur-2xl border rounded-2xl py-3 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
            isDark 
            ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
            : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
          }`}
        />
      </div>

      <div className={`backdrop-blur-3xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${
        isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className={`border-b font-body text-[12px] font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.04] border-white/10 text-white/50" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/80"
             }`}>
                <tr>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-[0.3em]">Subscriber</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-widest">Status</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-widest">Joined Ritual</th>
                   <th className="px-6 py-6 text-right pr-12 font-extrabold uppercase tracking-widest">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/10" : "divide-charcoal/10"
             }`}>
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-1.5"><div className="h-6 w-48 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredSubs.length > 0 ? (
                  filteredSubs.map((s) => (
                    <tr key={s.email} className="group/row hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-1.5">
                           <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-gold transition-colors ${
                                isDark ? "bg-gold/10" : "bg-gold/5 shadow-inner"
                              }`}>
                                 <Mail size={18} />
                              </div>
                              <span className={`text-[15px] font-extrabold tracking-wide transition-colors ${
                                isDark ? "text-white" : "text-charcoal"
                              }`}>{s.email}</span>
                           </div>
                        </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-emerald-500">
                             <CheckCircle size={18} />
                             <span className="text-[13px] font-extrabold uppercase tracking-widest">Acknowledged</span>
                          </div>
                       </td>
                        <td className="px-4 py-1.5">
                           <div className={`flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-widest transition-colors ${
                             isDark ? "text-white/60" : "text-charcoal/80"
                           }`}>
                              <Calendar size={18} />
                              {new Date(s.subscribedAt).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right pr-8">
                           <button 
                             onClick={() => handleDelete(s.email)}
                             className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                               isDark ? "bg-white/5 text-white/40 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-brand hover:bg-rose-brand/10"
                             }`}
                           >
                              <Trash2 size={18} />
                           </button>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={`px-8 py-24 text-center font-body text-base font-extrabold uppercase tracking-widest italic transition-colors ${
                      isDark ? "text-white/40" : "text-charcoal/70"
                    }`}>
                       No subscribers found in the inner circle.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
