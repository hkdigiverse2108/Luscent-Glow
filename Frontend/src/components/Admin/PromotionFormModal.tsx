import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Sparkles, TicketPercent, Clock, ImageIcon, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: any | null;
  onSuccess: () => void;
}

const PromotionFormModal: React.FC<PromotionFormModalProps> = ({ isOpen, onClose, promotion, onSuccess }) => {
  const { isDark } = useAdminTheme();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: "",
    subtitle: "EXCLUSIVE INVITATION",
    discountText: "",
    buttonText: "Retrieve Offer",
    buttonLink: "/products",
    image: "",
    endDate: "",
    isActive: false
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        ...promotion,
        endDate: promotion.endDate ? promotion.endDate.slice(0, 16) : ""
      });
    } else {
      setFormData({
        title: "",
        subtitle: "EXCLUSIVE INVITATION",
        discountText: "",
        buttonText: "Retrieve Offer",
        buttonLink: "/products",
        image: "",
        endDate: "",
        isActive: false
      });
    }
  }, [promotion, isOpen]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await fetch(getApiUrl("/api/upload/"), { method: "POST", body: uploadData });
      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, image: data.filepath });
        toast.success("Banner visual uploaded.");
      }
    } catch (error) {
      toast.error("Upload ritual failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = promotion ? getApiUrl(`/api/promotions/${promotion._id}`) : getApiUrl("/api/promotions/");
      const response = await fetch(url, {
        method: promotion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : ""
        }),
      });
      if (response.ok) {
        toast.success(promotion ? "Banner refined." : "New banner manifested.");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to materialize banner.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] border shadow-2xl flex flex-col ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gold/10"}`}>
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold"><Zap size={24} /></div>
            <div>
              <h3 className="text-xl font-display font-bold uppercase tracking-tight italic">{promotion ? "Edit Promotion" : "Create Promotion"}</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Design a high-impact homepage ritual</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} className="opacity-40" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Banner Visual</label>
              <div className="relative aspect-[16/6] rounded-[2.5rem] overflow-hidden group bg-white/5 border border-dashed border-white/10 hover:border-gold/30 transition-all">
                {formData.image ? <img src={getAssetUrl(formData.image)} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20"><ImageIcon size={48} /></div>}
                <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                  {uploading ? <Loader2 className="animate-spin text-gold" size={32} /> : <Upload className="text-white" size={32} />}
                  <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-white">Upload Selection</span>
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
              <div className="space-y-2 pt-4">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Headline (Title)</label>
                 <textarea value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 rounded-2xl p-4 text-sm font-bold border-none focus:ring-1 focus:ring-gold/30 h-32" placeholder="e.g. Save 40% on All Essential Radiance." />
              </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Badge (Subtitle)</label>
                    <input value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold border-none focus:ring-1 focus:ring-gold/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Discount Highlight</label>
                    <input value={formData.discountText} onChange={(e) => setFormData({...formData, discountText: e.target.value})} className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold border-none focus:ring-1 focus:ring-gold/30" placeholder="e.g. 40% OFF" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Countdown End Time</label>
                  <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-white/5 rounded-xl p-3 text-xs font-bold border-none focus:ring-1 focus:ring-gold/30" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">CTA Button Text</label>
                    <input value={formData.buttonText} onChange={(e) => setFormData({...formData, buttonText: e.target.value})} className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold border-none focus:ring-1 focus:ring-gold/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Destination URL</label>
                    <input value={formData.buttonLink} onChange={(e) => setFormData({...formData, buttonLink: e.target.value})} className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold border-none focus:ring-1 focus:ring-gold/30" />
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-gold/5 border border-gold/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Active Status</h4>
                    <p className="text-[8px] opacity-60">Manifest this banner on the homepage</p>
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? "bg-gold" : "bg-white/10"}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-4 pb-4">
             <button type="button" onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Discard</button>
             <button type="submit" disabled={loading} className="px-12 py-4 bg-gold text-charcoal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center gap-2">
               {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
               {promotion ? "Seal Changes" : "Manifest Promotion"}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PromotionFormModal;
