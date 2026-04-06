import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Save, 
  Loader2, 
  AlertCircle,
  Tag,
  Clock,
  Gift,
  ShoppingBag,
  Plus,
  Trash2
} from "lucide-react";
import { getApiUrl } from "../../lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: any;
  onSuccess: () => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, offer, onSuccess }) => {
  const { isDark } = useAdminTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    type: "flash",
    title: "",
    discount: "",
    category: "",
    image: "",
    endTime: "",
    price: "",
    originalPrice: "",
    items: [],
    tag: "",
    threshold: "",
    reward: "",
    isActive: true
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        ...offer,
        items: offer.items || []
      });
    } else {
      setFormData({
        type: "flash",
        title: "",
        discount: "",
        category: "",
        image: "",
        endTime: "",
        price: "",
        originalPrice: "",
        items: [],
        tag: "",
        threshold: "",
        reward: "",
        isActive: true
      });
    }
  }, [offer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = offer ? "PUT" : "POST";
      const id = offer?._id || offer?.id;
      const url = offer ? getApiUrl(`/offers/${id}`) : getApiUrl("/offers/");

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(offer ? "Offer updated." : "New treasure archived.");
        onSuccess();
      }
    } catch (error) {
      toast.error("Process failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, ""] });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-charcoal/80 backdrop-blur-xl" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3rem] border transition-all duration-700 shadow-2xl flex flex-col ${
            isDark ? "bg-charcoal border-white/10" : "bg-white border-gold/10"
          }`}
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                {formData.type === "flash" ? <Clock size={24} /> : formData.type === "bundle" ? <ShoppingBag size={24} /> : <Gift size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  {offer ? "Augment" : "Manifest"} <span className="text-gold">Offer</span>
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Artifact ID: {offer?._id || "New Record"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/5 transition-all opacity-40 hover:opacity-100">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Offer Type Selection */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "flash", label: "Flash Sale", icon: Clock },
                { id: "bundle", label: "Bundle", icon: ShoppingBag },
                { id: "tier", label: "Tiered Reward", icon: Gift }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-500 ${
                    formData.type === t.id 
                      ? "bg-gold/10 border-gold/50 text-gold shadow-lg shadow-gold/5" 
                      : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <t.icon size={20} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Display Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Midnight Radiance"
                  className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                    isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Cinematic Image (URL)</label>
                <input 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full p-4 rounded-2xl border-none font-mono text-[10px] focus:ring-2 focus:ring-gold/30 transition-all ${
                    isDark ? "bg-white/5 text-gold" : "bg-charcoal/5 text-gold"
                  }`}
                />
              </div>
            </div>

            {/* Conditional Fields based on type */}
            {formData.type === "flash" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Discount Text</label>
                  <input 
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="e.g. FLAT 40% OFF"
                    className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                      isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Category</label>
                  <input 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Skincare"
                    className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                      isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Expiration Date</label>
                  <input 
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                      isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                    }`}
                  />
                </div>
              </div>
            )}

            {formData.type === "bundle" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Sale Price (₹)</label>
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                        isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">MRP (₹)</label>
                    <input 
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                        isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Tag</label>
                    <input 
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Best Seller"
                      className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                        isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Inclusions</label>
                    <button type="button" onClick={addItem} className="text-gold text-[10px] font-black uppercase tracking-widest hover:underline">+ Add Item</button>
                  </div>
                  <div className="space-y-3">
                    {formData.items.map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          value={item}
                          onChange={(e) => updateItem(idx, e.target.value)}
                          placeholder={`Inclusion #${idx + 1}`}
                          className={`flex-1 p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                            isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                          }`}
                        />
                        <button type="button" onClick={() => removeItem(idx)} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.type === "tier" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Spend Threshold (₹)</label>
                  <input 
                    type="number"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                      isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Reward Description</label>
                  <input 
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                    placeholder="e.g. Free Mini Serum"
                    className={`w-full p-4 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                      isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Visibility Toggle */}
            <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${
              isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5 shadow-inner"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.isActive ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                }`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Visibility State</p>
                  <p className="text-xs font-bold">{formData.isActive ? "Archived in the Sanctuary" : "Hidden from Seekers"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-14 h-8 rounded-full transition-all duration-500 relative ${
                  formData.isActive ? "bg-gold" : "bg-white/20"
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-500 shadow-md ${
                  formData.isActive ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="p-8 border-t border-white/5">
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-3 py-5 bg-gold text-charcoal rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-gold/20 hover:bg-white transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {offer ? "Commit Artifact" : "Manifest Treasure"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OfferModal;
