import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2,
  Star,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import AdminAddReviewModal from "../../components/Admin/AdminAddReviewModal.tsx";

const AdminReviews = () => {
  const { isDark } = useAdminTheme();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/reviews/"));
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      toast.error("Could not reach the review database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently remove this feedback? This will also update the product's average rating.")) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/reviews/${id}`), {
        method: "DELETE",
      });
      if (response.status === 204) {
        toast.success("Feedback successfully deleted.");
        fetchReviews();
      } else {
        toast.error("Deletion failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardStyle = `backdrop-blur-3xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 min-h-[600px] ${
    isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
  }`;

  return (
    <div className="space-y-6 pb-8">
      <AdminHeader 
        title="Customer"
        highlightedWord="Reviews"
        subtitle="Manage and moderate product feedback and testimonials"
        isDark={isDark}
        action={{
          label: "Add Review",
          onClick: () => setIsAddModalOpen(true),
          icon: Plus
        }}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
          }`} size={18} />
          <input 
            type="text" 
            placeholder="Search reviews by user, product, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-2xl border rounded-2xl py-3 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
            }`}
          />
        </div>
        <button className={`flex items-center gap-3 px-6 py-3 backdrop-blur-2xl border rounded-2xl transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
          isDark 
          ? "bg-charcoal/40 border-white/5 text-white/40 hover:text-white hover:border-white/10" 
          : "bg-white border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:border-charcoal/10 shadow-sm"
        }`}>
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-[11px] font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.04] border-white/10 text-white/50" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/80"
             }`}>
                <tr>
                   <th className="px-6 py-4 font-black uppercase tracking-[0.3em]">Review Detail</th>
                   <th className="px-4 py-4 font-black uppercase tracking-[0.3em]">Customer</th>
                   <th className="px-4 py-4 font-black uppercase tracking-[0.3em]">Rating</th>
                   <th className="px-4 py-4 font-black uppercase tracking-[0.3em]">Testimonial</th>
                   <th className="px-4 py-4 font-black uppercase tracking-[0.3em]">Date</th>
                   <th className="px-6 py-4 text-right font-black uppercase tracking-[0.3em]">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/10" : "divide-charcoal/10"
             }`}>
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-48 bg-white/5 rounded-xl" /></td>
                      <td className="px-4 py-4"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-4"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-4"><div className="h-12 w-64 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-4"><div className="h-6 w-20 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-4"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((r) => (
                    <motion.tr 
                      key={r.id || r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-white/[0.02] transition-colors"
                    >
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                                <Package size={18} />
                             </div>
                             <div>
                                <h4 className={`text-[14px] font-bold mb-0.5 ${isDark ? "text-white" : "text-charcoal"}`}>{r.productName}</h4>
                                <p className={`text-[10px] uppercase font-black tracking-widest ${isDark ? "text-white/40" : "text-charcoal/50"}`}>
                                  Ref: {r.productId?.length === 24 ? r.productId.slice(-8) : r.productId}
                                </p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-charcoal-light flex items-center justify-center text-gold font-display text-[10px] border border-white/5">
                                {r.userName?.charAt(0) || <User size={12} />}
                             </div>
                             <div>
                                <p className={`text-[13px] font-bold ${isDark ? "text-white/90" : "text-charcoal/90"}`}>{r.userName}</p>
                                <p className={`text-[10px] font-medium ${isDark ? "text-white/30" : "text-charcoal/40"}`}>{r.userMobile}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={11} className={i < r.rating ? "fill-gold text-gold" : "text-white/10"} />
                             ))}
                             <span className="ml-1 text-[11px] font-bold text-gold">{r.rating}/5</span>
                          </div>
                       </td>
                       <td className="px-4 py-4 max-w-[300px]">
                          <p className={`text-[13px] leading-relaxed line-clamp-2 ${isDark ? "text-white/70 italic" : "text-charcoal/80"}`}>
                             "{r.comment}"
                           </p>
                           {/* Review Images */}
                           {r.images && r.images.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                 {r.images.map((img: string, idx: number) => (
                                    <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 bg-charcoal/20">
                                       <img src={getAssetUrl(img)} alt="Review Image" className="w-full h-full object-cover" />
                                    </div>
                                 ))}
                              </div>
                           )}
                       </td>
                       <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className={`text-[12px] font-bold ${isDark ? "text-white/60" : "text-charcoal/60"}`}>
                               {new Date(r.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className={`text-[9px] uppercase font-black tracking-widest ${isDark ? "text-white/20" : "text-charcoal/30"}`}>
                               {new Date(r.createdAt).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                                onClick={() => {
                                  setEditingReview(r);
                                  setIsAddModalOpen(true);
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDark ? "bg-white/5 text-white/20 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                                title="Refine Feedback"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={() => handleDelete(r.id || r._id)}
                             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                               isDark ? "bg-white/5 text-white/20 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-600 hover:bg-rose-50"
                             }`}
                             title="Delete Feedback"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <AlertCircle size={40} className="text-gold/20" />
                          <p className={`font-body text-base uppercase tracking-widest italic ${isDark ? "text-white/30" : "text-charcoal/50"}`}>
                             No reviews found in the database.
                          </p>
                       </div>
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>

        <div className={`px-8 py-4 border-t flex items-center justify-between ${
          isDark ? "bg-white/[0.01] border-white/5" : "bg-charcoal/[0.01] border-charcoal/5"
        }`}>
           <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
              Displaying {filteredReviews.length} reviews found in database
           </p>
           <div className="flex items-center gap-4">
              <button disabled className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-white/10 cursor-not-allowed">
                 <ChevronLeft size={16} />
              </button>
              <button disabled className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-white/10 cursor-not-allowed">
                 <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>
      
      <AdminAddReviewModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingReview(null);
        }}
        onSuccess={fetchReviews}
        isDark={isDark}
        review={editingReview}
      />
    </div>
  );
};

export default AdminReviews;
