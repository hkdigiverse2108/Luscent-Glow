import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Calendar } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
  onSuccess: () => void;
}

const CouponFormModal = ({ isOpen, onClose, coupon, onSuccess }: CouponFormModalProps) => {
  const { isDark } = useAdminTheme();
  const [formData, setFormData] = useState<any>({
    code: "",
    discountType: "percentage",
    value: 0,
    minPurchase: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: "",
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        expiryDate: coupon.expiryDate.includes('T') ? coupon.expiryDate.split('T')[0] : coupon.expiryDate
      });
    } else {
      setFormData({
        code: "",
        discountType: "percentage",
        value: 0,
        minPurchase: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "",
        isActive: true
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = coupon ? "PUT" : "POST";
    const url = coupon 
      ? getApiUrl(`/api/coupons/${coupon._id || coupon.id}`) 
      : getApiUrl("/api/coupons/");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(coupon ? "Coupon updated successfully." : "New coupon ritual initiated.");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Submission failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className={`relative w-full max-w-2xl border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ${
            isDark ? "bg-charcoal/95 border-white/10 shadow-black/80" : "bg-white/95 border-charcoal/10 shadow-charcoal/30"
          }`}
        >
          <div className={`p-8 border-b flex items-center justify-between transition-colors duration-700 ${
            isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
          }`}>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg"><Tag size={24} /></div>
               <div>
                  <h3 className={`font-body text-2xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                    {coupon ? "Refine" : "Create"} <span className="text-gold italic">Coupon</span>
                  </h3>
               </div>
            </div>
            <button onClick={onClose} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-charcoal/5 text-charcoal/40"}`}><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 overflow-y-auto custom-scrollbar lg:max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold ml-2">Coupon Code</label>
                <input name="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required placeholder="E.G. GLOW20" className={`w-full border rounded-2xl py-4 px-6 font-mono text-sm uppercase tracking-widest outline-none focus:ring-1 focus:ring-gold/30 ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold ml-2">Discount Type</label>
                <select name="discountType" value={formData.discountType} onChange={handleInputChange} className={`w-full border rounded-2xl py-4 px-6 text-sm outline-none focus:ring-1 focus:ring-gold/30 ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold ml-2">Value</label>
                <input name="value" type="number" value={formData.value} onChange={handleInputChange} className={`w-full border rounded-2xl py-4 px-6 text-sm ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold ml-2">Min Purchase (₹)</label>
                <input name="minPurchase" type="number" value={formData.minPurchase} onChange={handleInputChange} className={`w-full border rounded-2xl py-4 px-6 text-sm ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold ml-2">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/60" size={18} />
                  <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} required className={`w-full border rounded-2xl py-4 pl-16 pr-6 text-sm ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="peer sr-only" />
                  <div className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${formData.isActive ? "bg-gold" : "bg-charcoal/20"} relative`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-500 ${formData.isActive ? "translate-x-6" : "translate-x-0"}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/70"}`}>Is Active</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold ml-2">Public Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="E.G. 20% Radiance on all collections" className={`w-full border rounded-3xl py-6 px-8 text-sm outline-none focus:ring-1 focus:ring-gold/30 resize-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-6 pb-4">
              <button type="button" onClick={onClose} className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/30 hover:text-white" : "text-charcoal/70 hover:text-charcoal"}`}>Cancel</button>
              <button disabled={isSubmitting} className="flex items-center gap-3 px-10 py-5 bg-gold text-charcoal font-black rounded-2xl shadow-xl hover:bg-white transition-all duration-500 uppercase tracking-widest text-[10px]">
                {isSubmitting ? "Processing..." : (coupon ? "Update Coupon" : "Initiate Ritual")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CouponFormModal;
