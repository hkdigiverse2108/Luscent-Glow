import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, Image as ImageIcon, Info, Plus, Trash2 } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { categories } from "@/data/products";
import SEOForm from "./SEOForm";


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
    howToUse: "",
    variants: [],
    seo: { title: "", description: "", keywords: "" }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(categories);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Transition to Direct-to-DB Base64 Pattern
    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, image: base64String }));
      setIsUploading(false);
      toast.success("Image added to database.");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to process product image.");
    };
    reader.readAsDataURL(file);
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

    const fetchPromotions = async () => {
      try {
        const response = await fetch(getApiUrl("/api/promotions/"));
        if (response.ok) {
          const data = await response.json();
          setAvailablePromotions(data);
        }
      } catch (err) {
        console.error("Error fetching promotions:", err);
      }
    };
    fetchPromotions();
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
        howToUse: "",
        variants: [],
        seo: { title: "", description: "", keywords: "" }
      });
    }
  }, [product, isOpen]);

  const addVariant = () => {
    setFormData((prev: any) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { 
          id: Math.random().toString(36).substr(2, 9), 
          color: "", 
          size: "", 
          price: prev.price > 0 ? prev.price : 0, 
          originalPrice: prev.originalPrice > 0 ? prev.originalPrice : 0, 
          stock: 10 
        }
      ]
    }));
  };

  const removeVariant = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.filter((v: any) => v.id !== id)
    }));
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.map((v: any) => {
        if (v.id === id) {
          return { ...v, [field]: value };
        }
        return v;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Auto-sync main price if variations exist
    let syncData = { ...formData };
    if (syncData.variants && syncData.variants.length > 0) {
      // Use the first variant as the "Starting From" price
      syncData.price = syncData.variants[0].price;
      syncData.originalPrice = syncData.variants[0].originalPrice;
      
      // Calculate display discount for the catalog
      if (syncData.originalPrice && syncData.originalPrice > syncData.price) {
        syncData.discount = Math.round(((syncData.originalPrice - syncData.price) / syncData.originalPrice) * 100);
      } else {
        syncData.discount = 0;
      }
    }

    const method = product ? "PUT" : "POST";
    const url = product 
      ? getApiUrl(`/api/products/${product._id || product.id}`) 
      : getApiUrl("/api/products/");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
      });

      if (response.ok) {
        toast.success(product ? "Product updated successfully." : "New product added successfully.");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Product submission failed.");
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
    } else if (name === "tags" || name === "shades" || name === "sizes" || name === "images") {
      setFormData(prev => ({ ...prev, [name]: value.split(",").map(t => t.trim()).filter(t => t !== "") }));
    } else if (type === "number") {
      const numValue = parseFloat(value);
      setFormData(prev => {
        const newData = { ...prev, [name]: numValue };
        
        // Automatic Discount Calculation
        if (name === "price" || name === "originalPrice") {
          const currentPrice = name === "price" ? numValue : prev.price;
          const originalPrice = name === "originalPrice" ? numValue : prev.originalPrice;
          
          if (originalPrice > 0 && currentPrice > 0 && originalPrice > currentPrice) {
            newData.discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
          } else {
            newData.discount = 0;
          }
        }
        
        return newData;
      });
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
                    {product ? "Edit" : "Add New"} <span className="text-indigo-500 italic">Product</span>
                  </h3>
                  <p className={`text-xs font-bold uppercase tracking-widest font-body transition-colors duration-700 ${
                    isDark ? "text-white/30" : "text-charcoal/70"
                  }`}>Product Database</p>
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
                     <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Product Name</label>
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
                      <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Product Image</label>
                      <div className="flex items-center gap-6">
                        <div className={`w-28 h-28 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-500 ${
                          isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"
                        }`}>
                          {formData.image ? (
                            <img 
                              src={getAssetUrl(formData.image)} 
                              alt="Product Preview" 
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
                                id="product-image"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*"
                              />
                              <label 
                                htmlFor="product-image"
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

                  <div className="grid grid-cols-4 gap-4">
                     <div className="space-y-4 col-span-1">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Price (₹)</label>
                        <input 
                          name="price" 
                          type="number" 
                          value={formData.price} 
                          onChange={handleInputChange} 
                          step="0.01" 
                          readOnly={!!formData.appliedPromotionId}
                          className={`w-full border rounded-2xl py-4 px-6 text-sm transition-all ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          } ${formData.appliedPromotionId ? "opacity-60 cursor-not-allowed border-gold/30" : ""}`} 
                        />
                     </div>
                     <div className="space-y-4 col-span-1">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Original (₹)</label>
                        <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} step="0.01" className={`w-full border rounded-2xl py-4 px-6 text-sm ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`} />
                     </div>
                     <div className="space-y-4 col-span-1">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Discount (%)</label>
                        <input 
                          name="discount" 
                          type="number" 
                          readOnly 
                          value={formData.discount} 
                          className={`w-full border rounded-2xl py-4 px-6 text-sm opacity-60 cursor-not-allowed ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          } ${formData.appliedPromotionId ? "border-gold/30" : ""}`} 
                        />
                     </div>
                     <div className="space-y-4 col-span-1">
                        <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 text-gold`}>Apply Offer</label>
                        <div className="relative">
                          <select 
                            name="appliedPromotionId" 
                            value={formData.appliedPromotionId || ""} 
                            onChange={handleInputChange} 
                            className={`w-full border rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-1 focus:ring-gold/30 ${
                              isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                            }`}
                          >
                              <option value="">No Active Offer</option>
                              {availablePromotions.map(promo => (
                                <option key={promo._id} value={promo._id}>
                                  {promo.discountText || "PROMO"} - {promo.title}
                                </option>
                              ))}
                          </select>
                          <Zap size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tags & Badges Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Gallery Images (URLs, comma separated)</label>
                      <input 
                        name="images"
                        value={Array.isArray(formData.images) ? formData.images.join(", ") : ""}
                        onChange={handleInputChange}
                        placeholder="image-url-1, image-url-2, ..."
                        className={`w-full border rounded-2xl py-4 px-6 font-body text-sm ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Available Shades (#Hex/Name)</label>
                        <input 
                          name="shades"
                          value={Array.isArray(formData.shades) ? formData.shades.join(", ") : ""}
                          onChange={handleInputChange}
                          placeholder="#FF0000, #00FF00, ..."
                          className={`w-full border rounded-2xl py-4 px-6 font-body text-sm ${
                            isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                          }`}
                        />
                      </div>
                      <div className="space-y-4">
                         <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Available Sizes</label>
                         <input 
                           name="sizes"
                           value={Array.isArray(formData.sizes) ? formData.sizes.join(", ") : ""}
                           onChange={handleInputChange}
                           placeholder="50ml, 100ml, ..."
                           className={`w-full border rounded-2xl py-4 px-6 font-body text-sm ${
                             isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                           }`}
                         />
                      </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-xs font-bold text-gold uppercase tracking-[0.3em] ml-2">Product Tags (comma separated)</label>
                       <input 
                         name="tags"
                         value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
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
                       <input name="rating" type="number" step="0.1" max="5" readOnly value={formData.rating} className={`w-full border rounded-2xl py-4 px-6 text-sm opacity-60 cursor-not-allowed ${
                         isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                       }`} />
                    </div>
                    <div className="space-y-4">
                       <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Review Count</label>
                       <input name="reviewCount" type="number" readOnly value={formData.reviewCount} className={`w-full border rounded-2xl py-4 px-6 text-sm opacity-60 cursor-not-allowed ${
                         isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                       }`} />
                    </div>
                 </div>
            </div>

            {/* Product Variants Section */}
            <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                         <Plus size={20} />
                      </div>
                      <div>
                         <h4 className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-white" : "text-charcoal"}`}>Product Variations</h4>
                         <p className={`text-[9px] font-bold uppercase tracking-widest opacity-40`}>Manage Color, Size and specific Pricing</p>
                      </div>
                   </div>
                   <button 
                     type="button"
                     onClick={addVariant}
                     className="px-6 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                   >
                     Add Variation
                   </button>
                </div>

                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-4">
                     {formData.variants.map((variant: any, idx: number) => (
                       <motion.div 
                         key={variant.id}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         className={`p-6 rounded-[2rem] border grid grid-cols-1 md:grid-cols-5 gap-6 items-end group transition-all ${
                           isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/40 border-charcoal/10"
                         }`}
                       >
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">Color / Shade</label>
                             <input 
                               value={variant.color}
                               onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                               placeholder="e.g. Crimson Red"
                               className={`w-full border rounded-xl py-3 px-4 text-xs ${
                                 isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-charcoal/5 text-charcoal"
                               }`}
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">Size / Volume</label>
                             <input 
                               value={variant.size}
                               onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                               placeholder="e.g. 50ml"
                               className={`w-full border rounded-xl py-3 px-4 text-xs ${
                                 isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-charcoal/5 text-charcoal"
                               }`}
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">Price (₹)</label>
                             <input 
                               type="number"
                               value={variant.price}
                               onChange={(e) => updateVariant(variant.id, "price", parseFloat(e.target.value))}
                               className={`w-full border rounded-xl py-3 px-4 text-xs ${
                                 isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-charcoal/5 text-charcoal"
                               }`}
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-gold uppercase tracking-widest ml-1">Stock</label>
                             <input 
                               type="number"
                               value={variant.stock}
                               onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value))}
                               className={`w-full border rounded-xl py-3 px-4 text-xs ${
                                 isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-charcoal/5 text-charcoal"
                               }`}
                             />
                          </div>
                          <div className="flex items-center justify-end h-full pb-1">
                             <button 
                               type="button"
                               onClick={() => removeVariant(variant.id)}
                               className="w-10 h-10 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                ) : (
                  <div className={`py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-colors ${
                    isDark ? "border-white/5 text-white/20" : "border-charcoal/5 text-charcoal/20"
                  }`}>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Variations Defined</p>
                     <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Add variations for multiple SKUs (Size/Color)</p>
                  </div>
                )}
            </div>

            {/* Narrative Sections */}
            <div className="space-y-12 pt-8 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-gold/60" />
                    <label className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Product Description</label>
                  </div>
                   <textarea 
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     placeholder="Describe the product experience..."
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
                       <label className={`text-xs font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Usage Instructions</label>
                       <textarea 
                         name="howToUse"
                         value={formData.howToUse}
                         onChange={handleInputChange}
                         placeholder="Describe how to use the product..."
                         rows={6}
                         className={`w-full border rounded-3xl py-6 px-8 font-body text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                           isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                         }`}
                       />
                    </div>
                 </div>
            </div>

            {/* SEO Section */}
            <SEOForm 
              seo={formData.seo || { title: "", description: "", keywords: "" }} 
              onChange={(seo) => setFormData(prev => ({ ...prev, seo }))}
              isDark={isDark}
            />
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
                Cancel
              </button>
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="flex items-center gap-3 px-10 py-5 bg-gold text-charcoal font-bold rounded-2xl shadow-xl shadow-gold/5 hover:bg-white disabled:opacity-50 transition-all duration-500 uppercase tracking-widest text-xs"
             >
               {isSubmitting ? (
                 <span className="flex items-center gap-3">Saving...</span>
               ) : (
                 <>
                   <Save size={18} />
                   <span>{product ? "Update" : "Save"} Product</span>
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
