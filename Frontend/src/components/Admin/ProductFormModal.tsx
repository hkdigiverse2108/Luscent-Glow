import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, Image as ImageIcon, Info, Plus } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { categories } from "@/data/products";


interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

const ProductFormModal = ({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) => {
  const { isDark } = useAdminTheme();
  const [formData, setFormData] = useState<any>({
    name: "",
    brand: "Lucsent Glow",
    price: 0,
    originalPrice: 0,
    discount: 0,
    rating: 5.0,
    reviewCount: 0,
    image: "",
    category: "skincare",
    tags: [],
    isNew: false,
    isTrending: false,
    isBestSeller: false,
    description: "",
    ingredients: "",
    howToUse: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(categories);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Visual asset localized successfully.");
      } else {
        toast.error(data.detail || "Upload failed.");
      }
    } catch (error) {
      toast.error("System connection error during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(getApiUrl("/api/categories/"));
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) setDynamicCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        tags: Array.isArray(product.tags) ? product.tags : [],
      });
    } else {
// ... existing code ...
      setFormData({
        name: "",
        brand: "Lucsent Glow",
        price: 0,
        originalPrice: 0,
        discount: 0,
        rating: 5.0,
        reviewCount: 0,
        image: "",
        category: "skincare",
        tags: [],
        isNew: true,
        isTrending: false,
        isBestSeller: false,
        description: "",
        ingredients: "",
        howToUse: ""
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = product ? "PUT" : "POST";
    const url = product 
      ? getApiUrl(`/api/products/${product._id || product.id}`) 
      : getApiUrl("/api/products/");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(product ? "Ritual updated in repository." : "New ritual added to sanctuary.");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Ritual submission failed.");
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
    } else if (name === "tags") {
      setFormData(prev => ({ ...prev, tags: value.split(",").map(t => t.trim()) }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className={`relative w-full max-w-5xl max-h-[90vh] border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ${
            isDark ? "bg-charcoal/95 border-white/10 shadow-black/80" : "bg-white/95 border-charcoal/10 shadow-charcoal/30"
          }`}
        >
          {/* Header */}
          <div className={`p-8 border-b flex items-center justify-between transition-colors duration-700 ${
            isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
          }`}>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg">
                  <Sparkles size={24} />
               </div>
               <div>
                  <h3 className={`font-body text-2xl font-bold uppercase tracking-tight transition-colors duration-700 ${
                    isDark ? "text-white" : "text-charcoal"
                  }`}>
                    {product ? "Edit" : "Add New"} <span className="text-indigo-500 italic">Ritual</span>
                  </h3>
                  <p className={`text-xs font-bold uppercase tracking-widest font-body transition-colors duration-700 ${
                    isDark ? "text-white/30" : "text-charcoal/70"
                  }`}>Metadata Repository</p>
               </div>
            </div>
            <button 
              onClick={onClose}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isDark ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-charcoal/5 text-charcoal/40 hover:text-charcoal"
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
            
            {/* Essential Metadata Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Ritual Name</label>
                     <input 
                       name="name"
                       value={formData.name}
                       onChange={handleInputChange}
                       required
                       placeholder="e.g. 24K Gold Hydra-Glow Serum"
                       className={`w-full border rounded-2xl py-4 px-6 font-body focus:ring-1 focus:ring-gold/30 outline-none transition-all ${
                         isDark 
                         ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" 
                         : "bg-charcoal/5 border-charcoal/10 text-charcoal placeholder:text-charcoal/40"
                       }`}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Brand</label>
                        <input 
                          name="brand" 
                          value={formData.brand} 
                          onChange={handleInputChange} 
                          className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Category</label>
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={handleInputChange} 
                          className={`w-full border rounded-2xl py-4 px-6 text-sm appearance-none outline-none focus:ring-1 focus:ring-gold/30 capitalize ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        >
                            {dynamicCategories.map(cat => (
                              <option key={cat.slug} value={cat.slug} className={isDark ? "bg-charcoal text-white" : "bg-white text-charcoal"}>
                                {cat.name}
                              </option>
                            ))}
                        </select>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Ritual Visual</label>
                      <div className="flex items-center gap-6">
                        <div className={`w-28 h-28 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-500 ${
                          isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"
                        }`}>
                          {formData.image ? (
                            <img 
                              src={getAssetUrl(formData.image)} 
                              alt="Ritual Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className={isDark ? "text-white/10" : "text-charcoal/20"} size={32} />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4">
                           <div className="relative">
                              <input 
                                type="file"
                                id="ritual-image"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*"
                              />
                              <label 
                                htmlFor="ritual-image"
                                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border cursor-pointer font-bold uppercase tracking-widest text-[10px] transition-all duration-500 ${
                                  isDark 
                                  ? "bg-white/5 border-white/10 text-white/60 hover:bg-gold/10 hover:border-gold/30 hover:text-gold" 
                                  : "bg-charcoal/5 border-charcoal/10 text-charcoal/70 hover:bg-gold/10 hover:border-gold/30 hover:text-gold"
                                }`}
                              >
                                {isUploading ? (
                                   <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                ) : (
                                  <Plus size={16} />
                                )}
                                {formData.image ? "Change Visual" : "Add Image"}
                              </label>
                           </div>
                           <p className={`text-[9px] uppercase tracking-widest font-medium ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
                             Recommended: High-resolution PNG or WEBP (1000x1000)
                           </p>
                        </div>
                      </div>
                   </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-4">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Price (₹)</label>
                        <input name="price" type="number" value={formData.price} onChange={handleInputChange} step="0.01" className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`} />
                     </div>
                     <div className="space-y-4">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Original (₹)</label>
                        <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} step="0.01" className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`} />
                     </div>
                     <div className="space-y-4">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Discount (%)</label>
                        <input name="discount" type="number" value={formData.discount} onChange={handleInputChange} className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`} />
                     </div>
                  </div>
               </div>
            </div>

            {/* Tags & Badges Ritual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Ritual Tags (comma separated)</label>
                      <input 
                        name="tags"
                        value={formData.tags.join(", ")}
                        onChange={handleInputChange}
                        placeholder="serum, glow, anti-aging"
                        className={`w-full border rounded-2xl py-4 px-6 font-body text-sm ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`}
                      />
                   </div>
                   
                   <div className="flex flex-wrap gap-8 pt-4">
                      {[
                        { id: "isNew", label: "New Arrival" },
                        { id: "isTrending", label: "Trending" },
                        { id: "isBestSeller", label: "Best Seller" }
                      ].map(badge => (
                        <label key={badge.id} className="flex items-center gap-3 cursor-pointer group">
                           <div className="relative">
                              <input 
                                type="checkbox"
                                name={badge.id}
                                checked={formData[badge.id]}
                                onChange={handleInputChange}
                                className="peer sr-only"
                              />
                               <div className={`w-6 h-6 rounded-md border peer-checked:bg-gold peer-checked:border-gold transition-all duration-300 ${
                                 isDark ? "bg-white/5 border-white/10 text-charcoal" : "bg-charcoal/5 border-charcoal/10 text-white"
                               }`} />
                               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                                  <Plus size={14} className="rotate-45" />
                               </div>
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-gold transition-colors ${
                              isDark ? "text-white/40" : "text-charcoal/70"
                            }`}>{badge.label}</span>
                         </label>
                      ))}
                   </div>
                </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Rating (0-5)</label>
                       <input name="rating" type="number" step="0.1" max="5" value={formData.rating} onChange={handleInputChange} className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                         isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                       }`} />
                    </div>
                    <div className="space-y-4">
                       <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Review Count</label>
                       <input name="reviewCount" type="number" value={formData.reviewCount} onChange={handleInputChange} className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                         isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                       }`} />
                    </div>
                 </div>
            </div>

            {/* Narrative Sections */}
            <div className="space-y-12 pt-8 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-gold/60" />
                    <label className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Ritual Narrative</label>
                  </div>
                   <textarea 
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     placeholder="Describe the transformative experience of this ritual..."
                     rows={4}
                     className={`w-full border rounded-3xl py-6 px-8 font-body text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                       isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                     }`}
                   />
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Pure Ingredients</label>
                       <textarea 
                         name="ingredients"
                         value={formData.ingredients}
                         onChange={handleInputChange}
                         placeholder="List the high-potency ingredients..."
                         rows={6}
                         className={`w-full border rounded-3xl py-6 px-8 font-body text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                         }`}
                       />
                    </div>
                    <div className="space-y-4">
                       <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>How To Invoke (Usage)</label>
                       <textarea 
                         name="howToUse"
                         value={formData.howToUse}
                         onChange={handleInputChange}
                         placeholder="Define the application ritual..."
                         rows={6}
                         className={`w-full border rounded-3xl py-6 px-8 font-body text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                         }`}
                       />
                    </div>
                 </div>
            </div>
          </form>

           {/* Footer Action Bar */}
           <div className={`p-8 border-t flex items-center justify-end gap-6 transition-colors duration-700 ${
             isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
           }`}>
              <button 
                onClick={onClose}
                className={`text-xs font-bold uppercase tracking-[0.3em] transition-colors ${
                  isDark ? "text-white/30 hover:text-white" : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                Cancel Ritual
              </button>
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="flex items-center gap-3 px-10 py-5 bg-gold text-charcoal font-bold rounded-2xl shadow-xl shadow-gold/5 hover:bg-white disabled:opacity-50 transition-all duration-500 uppercase tracking-widest text-xs"
             >
               {isSubmitting ? (
                 <span className="flex items-center gap-3">Finalizing...</span>
               ) : (
                 <>
                   <Save size={18} />
                   <span>{product ? "Update" : "Consign"} Ritual</span>
                 </>
               )}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductFormModal;
