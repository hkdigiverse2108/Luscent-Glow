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
  Clock,
  Eye,
  XCircle
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

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
                  Ritual <span className="text-indigo-500 italic">Specification</span>
                </h3>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.3em] opacity-80 italic">Seeker Metadata Analysis</p>
              </div>
            </div>
            <button onClick={onClose} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-charcoal/5 text-charcoal/40"}`}><XCircle size={20} /></button>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"}`}>
                 <p className="text-[12px] font-extrabold uppercase text-gold tracking-widest mb-2 flex items-center gap-2"><User size={13} /> Seeker Identity</p>
                 <p className={`text-base font-bold ${isDark ? "text-white" : "text-charcoal"}`}>{inquiry.name}</p>
                 <p className="text-sm font-bold opacity-80 break-all transition-opacity hover:opacity-100">{inquiry.email}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"}`}>
                 <p className="text-[12px] font-extrabold uppercase text-indigo-500 tracking-widest mb-2 flex items-center gap-2"><Calendar size={13} /> Ritual Context</p>
                 <p className={`text-base font-extrabold ${isDark ? "text-white" : "text-charcoal"}`}>{new Date(inquiry.createdAt).toLocaleString()}</p>
                 <p className="text-sm font-bold opacity-80 italic transition-opacity">Broadcasted from sanctuary</p>
              </div>
            </div>
            {(inquiry.phoneNumber || inquiry.companyName) && (
              <div className="flex gap-4">
                {inquiry.phoneNumber && <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-widest border transition-all ${isDark ? "bg-rose-light/10 text-rose-light border-rose-light/20" : "bg-rose-600/10 text-rose-700 border-rose-600/20 shadow-sm"}`}><Phone size={14} /> {inquiry.phoneNumber}</div>}
                {inquiry.companyName && <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-widest border transition-all ${isDark ? "bg-sky-400/10 text-sky-400 border-sky-400/20" : "bg-indigo-600/10 text-indigo-700 border-indigo-600/20 shadow-sm"}`}><Building size={14} /> {inquiry.companyName}</div>}
              </div>
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

const AdminInquiries = () => {
  const { isDark } = useAdminTheme();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'standard' | 'bulk'>('standard');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      toast.error("Could not reach the seeker inquiries repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab]);

  const handleAcknowledge = async (id: string) => {
    const endpoint = activeTab === 'standard' ? `/api/contact/inquiry/${id}` : `/api/contact/bulk-inquiry/${id}`;
    try {
      const response = await fetch(getApiUrl(endpoint), { method: 'DELETE' });
      if (response.ok) {
        toast.success("Inquiry ritual acknowledged and archived.");
        setInquiries(prev => prev.filter(inq => inq._id !== id));
      } else {
        toast.error("Could not resolve this sanctuary message.");
      }
    } catch (error) {
      toast.error("System synchronization failed.");
    }
  };

  const openInquiryModal = (inq: any) => {
    setSelectedInquiry(inq);
    setIsModalOpen(true);
  };

  const filteredInquiries = inquiries.filter(inq => 
    (inq.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     inq.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     inq.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-2 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-indigo-600/10 pb-1.5">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${isDark ? "text-white" : "text-charcoal"}`}>
            Seeker <span className="text-indigo-500 italic">Inquiries</span>
          </h2>
          <p className={`font-body text-[13px] tracking-[0.4em] uppercase font-bold transition-colors duration-700 ${isDark ? "text-slate-400" : "text-charcoal/80"}`}>
            Real-time management of sanctuary outreach rituals
          </p>
        </div>
        <div className={`p-1.5 backdrop-blur-2xl rounded-2xl flex items-center gap-2 border ${isDark ? "bg-white/[0.05] border-white/5 shadow-2xl" : "bg-charcoal/[0.05] border-charcoal/5 shadow-lg"}`}>
          <button onClick={() => setActiveTab('standard')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${activeTab === 'standard' ? "bg-gold text-charcoal shadow-lg" : "text-inherit opacity-40 hover:opacity-100"}`}>General</button>
          <button onClick={() => setActiveTab('bulk')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${activeTab === 'bulk' ? "bg-gold text-charcoal shadow-lg" : "text-inherit opacity-40 hover:opacity-100"}`}>Corporate</button>
        </div>
      </div>

      <div className="relative max-w-xl group">
        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/40 group-focus-within:text-gold"}`} size={18} />
        <input 
          type="text" 
          placeholder="Search inquiries by seeker name, email, or subject..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full backdrop-blur-2xl border rounded-2xl py-3 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all font-bold text-xs ${isDark ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" : "bg-white border-charcoal/5 text-charcoal shadow-sm"}`}
        />
      </div>

      <div className={`backdrop-blur-3xl border rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${isDark ? "bg-charcoal/40 border-white/5 shadow-black/80" : "bg-white border-charcoal/5 shadow-charcoal/5"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-[12px] font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${isDark ? "bg-white/[0.04] border-white/10 text-white/60" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/80"}`}>
                <tr>
                   <th className="px-4 py-2">Seeker Information</th>
                   {activeTab === 'bulk' && <th className="px-6 py-6 font-bold uppercase tracking-widest">Entity</th>}
                   <th className="px-4 py-2">Inquiry Ritual</th>
                   <th className="px-4 py-2">Timeline</th>
                   <th className="px-6 py-6 text-right pr-12">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${isDark ? "divide-white/5" : "divide-charcoal/5"}`}>
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-5"><div className="h-6 w-48 bg-white/5 rounded-lg" /></td>
                      {activeTab === 'bulk' && <td className="px-6 py-5"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>}
                      <td className="px-6 py-5"><div className="h-6 w-40 bg-white/5 rounded-lg" /></td>
                      <td className="px-8 py-5"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                    </tr>
                  ))
                ) : filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inq) => (
                    <motion.tr key={inq._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group/row hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-1.5">
                        <div className="flex flex-col">
                           <span className={`text-[15px] font-extrabold tracking-wide transition-colors ${isDark ? "text-white group-hover/row:text-gold" : "text-charcoal group-hover/row:text-gold"}`}>{inq.name}</span>
                           <span className={`text-[13px] font-bold uppercase tracking-widest transition-opacity mt-1 ${isDark ? "opacity-60" : "opacity-80"}`}>{inq.email}</span>
                        </div>
                      </td>
                      {activeTab === 'bulk' && (
                        <td className="px-4 py-1.5">
                           <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-widest border transition-all ${
                               isDark ? "bg-sky-400/10 text-sky-400 border-sky-400/20" : "bg-indigo-600/10 text-indigo-700 border-indigo-600/20"
                             } w-fit`}>
                              <Building size={12} /> {inq.companyName || "N/A"}
                           </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                         <div className="flex flex-col max-w-xs">
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-white/60" : "text-charcoal/60"}`}>{inq.subject || "No Subject Specified"}</span>
                            <span className="text-[11px] italic opacity-70 mt-1 line-clamp-1">"{inq.message}"</span>
                         </div>
                      </td>
                      <td className={`px-6 py-5 text-[13px] font-extrabold uppercase tracking-[0.2em] font-body ${isDark ? "text-white/60" : "text-charcoal/80"}`}>
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right pr-8">
                         <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openInquiryModal(inq)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"}`}><Eye size={16} /></button>
                            <button onClick={() => handleAcknowledge(inq._id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isDark ? "bg-white/5 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10" : "bg-charcoal/5 text-charcoal/40 hover:text-emerald-400 hover:bg-emerald-400/10"}`}><CheckCircle size={16} /></button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'bulk' ? 5 : 4} className={`px-4 py-10 text-center text-[10px] font-bold uppercase tracking-[0.4em] italic opacity-20`}>No seeker rituals currently logged in the sanctuary repository.</td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
      <InquiryDetailModal isDark={isDark} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} inquiry={selectedInquiry} />
    </div>
  );
};

export default AdminInquiries;
