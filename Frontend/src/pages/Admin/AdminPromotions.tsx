import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Zap, Clock, Eye, EyeOff, Sparkles, Image as ImageIcon } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import PromotionFormModal from "../../components/Admin/PromotionFormModal.tsx";

const AdminPromotions = () => {
  const { isDark } = useAdminTheme();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(getApiUrl("/api/promotions/"));
      if (response.ok) {
        setPromotions(await response.json());
      }
    } catch (error) {
      toast.error("Could not reach the promotion archives.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Dissolve this banner design permanently?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/promotions/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Banner ritual dissolved.");
        fetchPromotions();
      }
    } catch (error) { toast.error("Ritual failed."); }
  };

  const handleActivate = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/promotions/${id}/activate`), { method: "POST" });
      if (response.ok) {
        toast.success("Banner manifested on homepage!");
        fetchPromotions();
      }
    } catch (error) { toast.error("Could not activate banner."); }
  };

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader 
        title="Homepage"
        highlightedWord="Promotions"
        subtitle="Manage the high-impact banners that welcome your participants"
        isDark={isDark}
        action={{
          label: "New Design",
          onClick: () => { setEditingPromotion(null); setIsModalOpen(true); },
          icon: Plus
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-64 rounded-[3rem] bg-white/5 animate-pulse" />)
        ) : promotions.length > 0 ? (
          promotions.map((p) => (
            <motion.div 
              key={p._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group rounded-[3rem] border overflow-hidden transition-all duration-700 ${p.isActive ? "ring-2 ring-gold ring-offset-4 ring-offset-charcoal border-gold" : isDark ? "bg-white/5 border-white/5" : "bg-white border-gold/10 shadow-xl"}`}
            >
              <div className="aspect-[16/9] relative">
                <img src={getAssetUrl(p.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent opacity-60" />
                {p.isActive && (
                  <div className="absolute top-4 right-4 bg-gold text-charcoal px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Sparkles size={10} /> Live on Home
                  </div>
                )}
              </div>

              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold/60">{p.subtitle}</span>
                  <h4 className="text-xl font-display font-bold leading-tight line-clamp-2 italic">{p.title}</h4>
                </div>

                <div className="flex items-center justify-between py-4 border-y border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest italic">Discount Text</span>
                      <span className="text-lg font-black text-gold">{p.discountText || "N/A"}</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest italic">Expires</span>
                      <span className="text-xs font-bold">{p.endDate ? new Date(p.endDate).toLocaleDateString() : "Never"}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                   {!p.isActive ? (
                     <button onClick={() => handleActivate(p._id)} className="flex-1 bg-gold text-charcoal py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Manifest</button>
                   ) : (
                     <button className="flex-1 bg-white/5 text-white/40 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-default">Active Ritual</button>
                   )}
                   <button onClick={() => { setEditingPromotion(p); setIsModalOpen(true); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? "bg-white/5 text-white/40 hover:text-gold" : "bg-charcoal/5 text-charcoal/40"}`}><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(p._id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? "bg-white/5 text-white/40 hover:text-rose-500" : "bg-charcoal/5 text-charcoal/40"}`}><Trash2 size={16} /></button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center opacity-30 italic uppercase tracking-[0.5em] text-xs">No banner designs in the library.</div>
        )}
      </div>

      <PromotionFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        promotion={editingPromotion} 
        onSuccess={fetchPromotions}
      />
    </div>
  );
};

export default AdminPromotions;
