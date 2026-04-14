import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Clock
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import CouponFormModal from "@/components/Admin/CouponFormModal.tsx";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminCoupons = () => {
  const { isDark } = useAdminTheme();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/coupons/admin"));
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      toast.error("Could not reach the discount sanctuary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently dissolve this coupon ritual?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/coupons/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Coupon dissolved.");
        fetchCoupons();
      }
    } catch (error) {
      toast.error("Failed to dissolve coupon.");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <AdminHeader 
        title="Coupons"
        highlightedWord="Sanctuary"
        subtitle="Manage promotional codes and high-potency discounts"
        isDark={isDark}
        action={{
          label: "New Coupon",
          onClick: () => { setEditingCoupon(null); setIsModalOpen(true); },
          icon: Plus
        }}
      />

      <div className="relative group max-w-2xl">
        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"}`} size={18} />
        <input 
          type="text" 
          placeholder="Find a code or ritual..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${isDark ? "bg-charcoal/40 border-white/5 text-white" : "bg-white border-charcoal/5 shadow-sm text-charcoal"}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-[3rem] bg-white/5 animate-pulse" />
          ))
        ) : filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => (
            <motion.div 
              key={coupon._id || coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative overflow-hidden group rounded-[3rem] border transition-all duration-700 p-8 ${isDark ? "bg-charcoal/40 border-white/5 hover:border-gold/30" : "bg-white border-charcoal/5 shadow-ethereal hover:shadow-2xl hover:border-gold/20"}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${coupon.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"}`}>
                  {coupon.isActive ? "Active Ritual" : "Deactivated"}
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setEditingCoupon(coupon); setIsModalOpen(true); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/5 text-white/40 hover:text-gold" : "bg-charcoal/5 text-charcoal/40 hover:text-gold shadow-sm"}`}><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(coupon._id || coupon.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/5 text-white/40 hover:text-rose-500" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-500 shadow-sm"}`}><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Coupon Code</h4>
                <p className={`text-2xl font-mono font-black tracking-[0.2em] ${isDark ? "text-white" : "text-charcoal"}`}>{coupon.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 pt-6 border-t border-gold/10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Discount</p>
                  <p className="text-lg font-display font-bold text-gold">
                    {coupon.discountType === "percentage" ? `${coupon.value}%` : coupon.discountType === "fixed" ? `₹${coupon.value}` : (coupon.value > 0 ? `₹${coupon.value} Fee` : "Free Ship")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Min Order</p>
                  <p className={`text-lg font-display font-bold ${isDark ? "text-white" : "text-charcoal"}`}>₹{coupon.minPurchase || 0}</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 py-4 px-6 rounded-2xl ${isDark ? "bg-white/5" : "bg-charcoal/5"}`}>
                 <Clock size={16} className="text-gold" />
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-40 uppercase tracking-[0.5em] text-xs italic">No coupons found in this sanctuary.</div>
        )}
      </div>

      <CouponFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        coupon={editingCoupon} 
        onSuccess={fetchCoupons}
      />
    </div>
  );
};

export default AdminCoupons;
