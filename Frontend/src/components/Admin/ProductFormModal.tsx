import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, Image as ImageIcon, Info, Plus, Trash2, Zap, Camera } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { categories } from "@/data/products";
import SEOForm from "./SEOForm";


const shadeColors: Record<string, string> = {
  "Rose Petal": "#d4818a", "Berry Crush": "#8b2252", "Nude Bliss": "#c9a68e", "Crimson Red": "#b22222",
  "Ivory": "#faf0e6", "Sand": "#deb887", "Honey": "#d4a017", "Caramel": "#a0522d", "Mocha": "#6b4226", "Espresso": "#3c1414",
  "Cherry": "#de3163", "Blush": "#f5c6cb", "Nude": "#d2b48c", "Plum": "#8e4585", "Coral": "#ff7f50",
  "Blonde": "#f0d5a0", "Brunette": "#7b5b3a", "Dark Brown": "#4a3728", "Black": "#1a1a1a",
};


interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

const ProductFormModal = ({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) => {
  const { isDark } = useAdminTheme();

  const getColor = (colorName: string) => {
    if (!colorName) return null;
    return shadeColors[colorName] || 
           shadeColors[colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase()] || 
           null;
  };

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
  const [activeTab, setActiveTab] = useState("master");
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(categories);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Scroll to top on tab change
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  const tabs = [
    { id: "master", label: "Product Info", icon: Sparkles },
    { id: "variants", label: "Variants", icon: Plus },
    { id: "narrative", label: "Description", icon: ImageIcon },
    { id: "seo", label: "SEO & Tags", icon: Zap }
  ];

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

  const handleVariantFileUpload = (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      
      setFormData((prev: any) => ({
        ...prev,
        variants: prev.variants.map((v: any) => {
          if (v.id === variantId) {
            const currentImages = v.images || [];
            // Keep 'image' as the first image for backward compatibility if needed
            return { 
              ...v, 
              images: [...currentImages, base64String],
              image: currentImages.length === 0 ? base64String : v.image 
            };
          }
          return v;
        })
      }));

      setIsUploading(false);
      toast.success("Variant image added.");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to process variant image.");
    };
    reader.readAsDataURL(file);
  };

  const removeVariantImage = (variantId: string, imageIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.map((v: any) => {
        if (v.id === variantId) {
          const newImages = (v.images || []).filter((_: any, iValue: number) => iValue !== imageIndex);
          return { 
            ...v, 
            images: newImages,
            image: newImages.length > 0 ? newImages[0] : "" 
          };
        }
        return v;
      })
    }));
    toast.info("Variant image removed.");
  };

  // ─── Utility Functions ──────────────────────────────────────────────────

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

  // ─── Effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchCategories();
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        tags: Array.isArray(product.tags) ? product.tags : [],
      });
    } else {
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
          stock: 10,
          images: [] 
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
          const updatedVariant = { ...v, [field]: value };
          
          // Automatic Price Calculation for Variants
          if (field === "appliedPromotionId" || field === "price") {
            const promoId = field === "appliedPromotionId" ? value : v.appliedPromotionId;
            const originalPrice = prev.originalPrice || v.price;
            
            if (promoId) {
              const promo = availablePromotions.find(p => p._id === promoId);
              if (promo) {
                const match = promo.discountText?.match(/(\d+)%/);
                const discountPercent = match ? parseInt(match[1]) : 0;
                if (discountPercent > 0) {
                  updatedVariant.price = Math.round(originalPrice * (1 - discountPercent / 100));
                  updatedVariant.originalPrice = originalPrice;
                }
              }
            } else if (field === "appliedPromotionId" && !value) {
              // Restoring price when promotion is cleared
              updatedVariant.price = updatedVariant.originalPrice || updatedVariant.price;
            }
          }
          
          return updatedVariant;
        }
        return v;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Auto-sync main price and legacy attributes if variations exist
    let syncData = { ...formData };
    if (syncData.variants && syncData.variants.length > 0) {
      // Use the first variant as the "Starting From" price and baseline promotion
      syncData.price = syncData.variants[0].price;
      syncData.originalPrice = syncData.variants[0].originalPrice;
      syncData.appliedPromotionId = syncData.variants[0].appliedPromotionId;
      
      // Sync legacy attributes to match variants exactly
      syncData.shades = [...new Set(syncData.variants.map((v: any) => v.color).filter(Boolean).filter((s: string) => s !== ""))];
      syncData.sizes = [...new Set(syncData.variants.map((v: any) => v.size).filter(Boolean).filter((s: string) => s !== ""))];

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
    } else if (name === "tags") {
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

          // SYNC: If global originalPrice changes, update all variants that have an active offer
          if (name === "originalPrice" && newData.variants) {
            newData.variants = newData.variants.map((v: any) => {
              if (v.appliedPromotionId) {
                const promo = availablePromotions.find(p => p._id === v.appliedPromotionId);
                if (promo) {
                  const match = promo.discountText?.match(/(\d+)%/);
                  const discountPercent = match ? parseInt(match[1]) : 0;
                  if (discountPercent > 0) {
                    return { 
                      ...v, 
                      price: Math.round(originalPrice * (1 - discountPercent / 100)),
                      originalPrice: originalPrice 
                    };
                  }
                }
              }
              return v;
            });
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
          <div className={`p-8 border-b transition-colors duration-700 ${
            isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"
          }`}>
            <div className="flex items-center justify-between mb-8">
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

            {/* Premium Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap border ${
                    activeTab === tab.id
                      ? "bg-gold border-gold text-charcoal shadow-lg shadow-gold/20"
                      : isDark 
                        ? "bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10" 
                        : "bg-charcoal/5 border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:bg-charcoal/10"
                  }`}
                >
                  <tab.icon size={14} className={activeTab === tab.id ? "text-charcoal" : "text-gold/60"} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar relative"
          >
            <AnimatePresence mode="wait">
              {activeTab === "master" && (
                <motion.div
                  key="master"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-12"
                >
                  {/* Essential Metadata Section */}
                  <div className={`p-10 rounded-[3.5rem] border backdrop-blur-3xl transition-all duration-700 ${
                    isDark ? "bg-white/[0.01] border-white/5 shadow-2xl" : "bg-charcoal/[0.01] border-charcoal/5 shadow-sm"
                  }`}>
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-12 space-y-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-2 italic">Product Name</label>
                              <input 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. 24K Gold Hydra-Glow Serum"
                                className={`w-full border rounded-[2rem] py-6 px-8 font-display text-xl font-bold focus:ring-1 focus:ring-gold/30 outline-none transition-all ${
                                  isDark 
                                  ? "bg-white/5 border-white/10 text-white placeholder:text-white/10" 
                                  : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/40 shadow-sm"
                                }`}
                              />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              <div className="space-y-4">
                                 <label className={`text-[9px] font-black uppercase tracking-[0.4em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Brand Name</label>
                                 <input 
                                   name="brand" 
                                   value={formData.brand} 
                                   onChange={handleInputChange} 
                                   className={`w-full border rounded-2xl py-4 px-6 text-xs font-bold ${
                                     isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-charcoal/5 text-charcoal shadow-sm"
                                   }`}
                                 />
                              </div>
                              <div className="space-y-4">
                                 <label className={`text-[9px] font-black uppercase tracking-[0.4em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Category</label>
                                 <select 
                                   name="category" 
                                   value={formData.category} 
                                   onChange={handleInputChange} 
                                   className={`w-full border rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest appearance-none outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
                                     isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-charcoal/10 text-charcoal shadow-sm"
                                   }`}
                                 >
                                     {dynamicCategories.map(cat => (
                                       <option key={cat.slug} value={cat.slug} className={isDark ? "bg-charcoal text-white" : "bg-white text-charcoal"}>
                                         {cat.name}
                                       </option>
                                     ))}
                                 </select>
                              </div>
                              <div className="space-y-4">
                                 <label className={`text-[9px] font-black uppercase tracking-[0.4em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Archival Price</label>
                                 <div className="relative group/price">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within/price:text-gold transition-colors">
                                       <span className="text-[11px] font-black">₹</span>
                                    </div>
                                    <input 
                                      name="originalPrice" 
                                      type="number"
                                      value={formData.originalPrice} 
                                      onChange={handleInputChange} 
                                      className={`w-full border rounded-2xl py-4 pl-12 pr-6 text-xs font-black transition-all focus:ring-1 focus:ring-gold/30 outline-none ${
                                        isDark 
                                        ? "bg-white/5 border-white/10 text-white" 
                                        : "bg-white border-charcoal/5 text-charcoal shadow-sm"
                                      }`}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     {/* Master Visual Section */}
                     <div className={`p-10 rounded-[3rem] border transition-all duration-700 ${
                        isDark ? "bg-white/[0.01] border-white/10 shadow-xl" : "bg-charcoal/[0.01] border-charcoal/5 shadow-sm"
                     }`}>
                        <label className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-2 italic mb-6 block">Product Image</label>
                        <div className="flex flex-col items-center gap-8">
                           <div className={`w-48 h-48 rounded-[3rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-700 relative group/pimg ${
                             isDark ? "bg-white/[0.02] border-white/10 hover:border-gold/40" : "bg-charcoal/[0.02] border-charcoal/10 hover:border-gold/30 shadow-sm"
                           }`}>
                             {formData.image ? (
                               <>
                                 <img 
                                   src={getAssetUrl(formData.image)} 
                                   alt="" 
                                   className="w-full h-full object-cover transition-transform duration-700 group-hover/pimg:scale-110"
                                 />
                                 <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover/pimg:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <Camera className="text-white" size={32} />
                                 </div>
                               </>
                             ) : (
                               <ImageIcon className={isDark ? "text-white/10" : "text-charcoal/10"} size={48} />
                             )}
                             
                             <input 
                               type="file"
                               id="product-image"
                               className="absolute inset-0 opacity-0 cursor-pointer"
                               onChange={handleFileUpload}
                               accept="image/*"
                             />
                           </div>
                           <p className={`text-[9px] uppercase tracking-[0.2em] font-bold text-center leading-relaxed ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
                             Upload the main product photo.<br />Recommended 1:1 Aspect Ratio.
                           </p>
                        </div>
                     </div>

                     {/* Badges Section */}
                     <div className={`p-10 rounded-[3rem] border transition-all duration-700 ${
                        isDark ? "bg-white/[0.01] border-white/10 shadow-xl" : "bg-charcoal/[0.01] border-charcoal/5 shadow-sm"
                     }`}>
                        <label className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-2 italic mb-6 block">Product Status</label>
                        <div className="flex flex-col gap-4">
                           {[
                             { id: "isNew", label: "New Arrival", icon: Sparkles },
                             { id: "isTrending", label: "Trending", icon: Zap },
                             { id: "isBestSeller", label: "Best Seller", icon: Info }
                           ].map(badge => (
                             <label key={badge.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-500 ${
                               isDark ? "bg-white/3 border-white/5" : "bg-white border-charcoal/5 shadow-sm"
                             }`}>
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                     formData[badge.id] ? "bg-gold text-charcoal shadow-lg" : isDark ? "bg-white/5 text-white/20" : "bg-charcoal/5 text-charcoal/20"
                                   }`}>
                                      <badge.icon size={14} />
                                   </div>
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${
                                     formData[badge.id] ? "text-gold" : isDark ? "text-white/40" : "text-charcoal/70"
                                   }`}>{badge.label}</span>
                                </div>
                                <input type="checkbox" name={badge.id} checked={formData[badge.id]} onChange={handleInputChange} className="hidden" />
                                <div className={`w-10 h-5 rounded-full transition-all relative ${isDark ? "bg-white/5 border border-white/10" : "bg-charcoal/5 border border-charcoal/10 shadow-inner"} ${formData[badge.id] ? "bg-gold" : ""}`}>
                                   <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${formData[badge.id] ? "translate-x-5" : ""}`} />
                                </div>
                             </label>
                           ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "variants" && (
                <motion.div
                  key="variants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-12"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-lg`}>
                          <Plus size={28} />
                        </div>
                        <div>
                          <h4 className={`text-xl font-display font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                            Product <span className="text-gold italic">Variations</span>
                          </h4>
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/30" : "text-charcoal/40"}`}>
                            Manage colors, sizes, and specific pricing models
                          </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={addVariant}
                        className="px-10 py-4 bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 font-display"
                    >
                        <Plus size={16} />
                        <span>Add New Variation</span>
                    </button>
                  </div>

                  {formData.variants && formData.variants.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8">
                      {formData.variants.map((variant: any, idx: number) => (
                        <motion.div 
                          key={variant.id}
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`p-10 rounded-[3rem] border backdrop-blur-3xl transition-all duration-500 relative group/vcard ${
                            isDark 
                            ? "bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-white/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
                            : "bg-white border-charcoal/5 shadow-[0_15px_40px_rgba(182,143,76,0.06)] hover:border-gold/20"
                          }`}
                        >
                            <div className={`absolute -top-3 -left-3 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                              isDark ? "bg-charcoal border border-white/10 text-gold" : "bg-white border border-gold/20 text-gold"
                            }`}>
                                Variant #{idx + 1}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                <div className="xl:col-span-4 space-y-6">
                                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.3em] leading-none ml-1 block mb-4">Variation Gallery</label>
                                  <div className="grid grid-cols-3 gap-3">
                                      {variant.images && variant.images.map((img: string, i: number) => (
                                        <div key={i} className={`relative aspect-square rounded-[1.5rem] border overflow-hidden group/vimg transition-all duration-500 hover:shadow-xl ${
                                          isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"
                                        }`}>
                                          <img src={getAssetUrl(img)} className="w-full h-full object-cover transition-transform duration-700 group-hover/vimg:scale-125" />
                                          <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center opacity-0 group-hover/vimg:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                              <button type="button" onClick={() => removeVariantImage(variant.id, i)} className="p-3 bg-rose-500 text-white rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-lg"><Trash2 size={16} /></button>
                                          </div>
                                        </div>
                                      ))}
                                      <div onClick={() => document.getElementById(`variant-image-${variant.id}`)?.click()} className={`aspect-square rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-gold/5 ${isDark ? "bg-white/3 border-white/10" : "bg-charcoal/2 border-gold/10"}`}>
                                        <Plus size={24} className="text-gold/40" />
                                        <input id={`variant-image-${variant.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleVariantFileUpload(variant.id, e)} />
                                      </div>
                                  </div>
                                </div>

                                <div className="xl:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gold uppercase tracking-[0.3em] ml-1">Color / Shade</label>
                                        <input value={variant.color} onChange={(e) => updateVariant(variant.id, "color", e.target.value)} placeholder="e.g. Crimson Red" className={`w-full border rounded-2xl py-4 px-6 text-xs font-bold transition-all focus:ring-1 focus:ring-gold/30 outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gold uppercase tracking-[0.3em] ml-1">Size / Volume</label>
                                        <input value={variant.size} onChange={(e) => updateVariant(variant.id, "size", e.target.value)} placeholder="e.g. 50ml" className={`w-full border rounded-2xl py-4 px-6 text-xs font-bold transition-all focus:ring-1 focus:ring-gold/30 outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gold uppercase tracking-[0.3em] ml-1">Stock</label>
                                        <input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value))} className={`w-full border rounded-2xl py-4 px-6 text-xs font-bold transition-all focus:ring-1 focus:ring-gold/30 outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gold uppercase tracking-[0.3em] ml-1">Price (₹)</label>
                                        <input type="number" value={variant.price} onChange={(e) => updateVariant(variant.id, "price", parseFloat(e.target.value))} className={`w-full border rounded-2xl py-4 px-6 text-xs font-bold transition-all focus:ring-1 focus:ring-gold/30 outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`} />
                                    </div>
                                    <div className="col-span-2 flex items-end">
                                        <button type="button" onClick={() => removeVariant(variant.id)} className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/del ${isDark ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white" : "bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white"}`}><Trash2 size={14} className="group-hover/del:scale-110 transition-transform" /><span>Remove Variant</span></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className={`py-20 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 transition-colors ${isDark ? "border-white/5 text-white/20" : "border-charcoal/5 text-charcoal/20"}`}><p className="text-[10px] font-black uppercase tracking-[0.3em]">No Variants Added Yet</p></div>
                  )}
                </motion.div>
              )}

              {activeTab === "narrative" && (
                <motion.div
                  key="narrative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-12"
                >
                  <div className={`p-10 rounded-[3.5rem] border backdrop-blur-3xl transition-all duration-700 ${
                    isDark ? "bg-white/[0.01] border-white/5 shadow-2xl" : "bg-charcoal/[0.01] border-charcoal/5 shadow-sm"
                  }`}>
                     <div className="space-y-10">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-2 italic leading-none">Product Description</label>
                           <textarea 
                             name="description"
                             value={formData.description}
                             onChange={handleInputChange}
                             placeholder="Enter product description and sensory details..."
                             rows={6}
                             className={`w-full border rounded-[2rem] py-6 px-8 font-body text-sm focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                               isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/10" : "bg-white border-charcoal/5 text-charcoal shadow-sm"
                             }`}
                           />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                           <div className="space-y-4">
                              <label className={`text-[9px] font-black uppercase tracking-[0.4em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Ingredients</label>
                              <textarea 
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleInputChange}
                                placeholder="List main ingredients..."
                                rows={8}
                                className={`w-full border rounded-[2rem] py-6 px-8 font-body text-[11px] leading-relaxed focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                                  isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/10" : "bg-white border-charcoal/5 text-charcoal shadow-sm"
                                }`}
                              />
                           </div>
                           <div className="space-y-4">
                              <label className={`text-[9px] font-black uppercase tracking-[0.4em] ml-2 ${isDark ? "text-white/30" : "text-charcoal/70"}`}>How to Use</label>
                              <textarea 
                                name="howToUse"
                                value={formData.howToUse}
                                onChange={handleInputChange}
                                placeholder="Steps to apply the product..."
                                rows={8}
                                className={`w-full border rounded-[2rem] py-6 px-8 font-body text-[11px] leading-relaxed focus:ring-1 focus:ring-gold/30 outline-none resize-none transition-all ${
                                  isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/10" : "bg-white border-charcoal/5 text-charcoal shadow-sm"
                                }`}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "seo" && (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className={`p-8 rounded-[3.5rem] border backdrop-blur-3xl transition-all duration-700 ${
                    isDark ? "bg-white/[0.01] border-white/5 shadow-2xl" : "bg-charcoal/[0.01] border-charcoal/5 shadow-sm"
                  }`}>
                     <div className="space-y-6">
                        {/* Tags Section */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gold uppercase tracking-[0.4em] ml-2 italic">Search Tags</label>
                           <div className={`w-full border rounded-[2rem] p-3 flex flex-wrap gap-2 min-h-[56px] transition-all focus-within:ring-1 focus-within:ring-gold/30 ${
                             isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-sm"
                           }`}>
                             <AnimatePresence>
                               {Array.isArray(formData.tags) && formData.tags.map((tag: string) => (
                                 <motion.span
                                   key={tag}
                                   initial={{ opacity: 0, scale: 0.8 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.8 }}
                                   className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-xl border border-gold/20 group"
                                 >
                                   {tag}
                                   <button 
                                     type="button"
                                     onClick={() => setFormData((prev: any) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }))}
                                     className="hover:text-rose-500 transition-colors"
                                   >
                                     <X size={10} />
                                   </button>
                                 </motion.span>
                               ))}
                             </AnimatePresence>
                             <input 
                               placeholder={formData.tags?.length === 0 ? "serum, glow, anti-aging..." : "Add tag..."}
                               onKeyDown={(e) => {
                                 if (e.key === "Enter" || e.key === ",") {
                                   e.preventDefault();
                                   const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, "");
                                   if (val && !formData.tags?.includes(val)) {
                                     setFormData((prev: any) => ({ ...prev, tags: [...(prev.tags || []), val] }));
                                     (e.target as HTMLInputElement).value = "";
                                   }
                                 }
                               }}
                               className={`flex-1 min-w-[120px] bg-transparent outline-none text-sm font-body px-4 ${
                                 isDark ? "text-white" : "text-charcoal"
                               }`}
                             />
                           </div>
                           <p className="text-[9px] font-bold text-gold/60 uppercase tracking-widest ml-4">Press Enter or use commas to Manifest tags</p>
                        </div>

                        {/* SEO Form Component */}
                        <div className="pt-4">
                           <SEOForm 
                             seo={formData.seo || { title: "", description: "", keywords: "" }} 
                             onChange={(seo) => setFormData(prev => ({ ...prev, seo }))}
                             isDark={isDark}
                           />
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

           {/* Footer Action Bar */}
           <div className={`p-10 border-t flex items-center justify-between transition-colors duration-700 ${
             isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"
           }`}>
              <button 
                onClick={onClose}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:tracking-[0.4em] flex items-center gap-2 ${
                  isDark ? "text-white/20 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
                }`}
              >
                <Plus size={14} className="rotate-45" />
                Discard Changes
              </button>
              
              <div className="flex items-center gap-6">
                 {isSubmitting && (
                   <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                      <span className="text-[9px] font-black text-gold uppercase tracking-widest">Saving changes...</span>
                   </div>
                 )}
                 <button 
                   onClick={handleSubmit}
                   disabled={isSubmitting}
                   className={`relative group/submit flex items-center gap-4 px-12 py-5 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 overflow-hidden shadow-2xl ${
                     isDark 
                     ? "bg-gold text-charcoal shadow-gold/10 hover:shadow-gold/20" 
                     : "bg-charcoal text-white shadow-charcoal/10 hover:shadow-charcoal/20"
                   } disabled:opacity-50`}
                 >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-1000 skew-x-[45deg]" />
                    {isSubmitting ? (
                      <span className="animate-pulse">Saving...</span>
                    ) : (
                      <>
                        <Save size={16} className="group-hover:scale-110 transition-transform" />
                        <span>{product ? "Update Product" : "Create Product"}</span>
                      </>
                    )}
                 </button>
              </div>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductFormModal;
