import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, Image as ImageIcon, Plus } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import SEOForm from "./SEOForm";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
  onSuccess: () => void;
}

const CategoryFormModal = ({ isOpen, onClose, category, onSuccess }: CategoryFormModalProps) => {
  const { isDark } = useAdminTheme();
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    image: "",
    seo: { title: "", description: "", keywords: "" }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        image: category.image || "",
        seo: category.seo || { title: "", description: "", keywords: "" }
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        image: "",
        seo: { title: "", description: "", keywords: "" }
      });
    }
  }, [category, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, image: base64String }));
      setIsUploading(false);
      toast.success("Image added to sanctuary.");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to process image.");
    };
    reader.readAsDataURL(file);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: category ? prev.slug : generateSlug(name) // Only auto-gen for new categories
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = category ? "PUT" : "POST";
    const url = category 
      ? getApiUrl(`/api/categories/${category._id || category.id}`) 
      : getApiUrl("/api/categories/");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(category ? "Category refined." : "New category manifested.");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Transformation failure.");
      }
    } catch (error) {
      toast.error("Sanctuary connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = `w-full border rounded-2xl py-4 px-6 font-body focus:ring-1 focus:ring-gold/30 outline-none transition-all ${
    isDark 
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" 
    : "bg-charcoal/5 border-charcoal/10 text-charcoal placeholder:text-charcoal/40"
  }`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className={`relative w-full max-w-4xl max-h-[90vh] border rounded-[3rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ${
            isDark ? "bg-charcoal/95 border-white/10 shadow-black/80" : "bg-white/95 border-charcoal/10 shadow-charcoal/30"
          }`}
        >
          {/* Header */}
          <div className="p-8 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg">
                  <Sparkles size={24} />
               </div>
               <div>
                  <h3 className={`font-body text-2xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                    {category ? "Refine" : "Create"} <span className="text-gold italic">Category</span>
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-charcoal/70"}`}>Structural Element</p>
               </div>
            </div>
            <button 
              onClick={onClose} 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isDark 
                  ? "text-white/40 hover:text-white hover:bg-white/5" 
                  : "text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5"
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.3em] ml-2">Category Name</label>
                  <input 
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    placeholder="e.g. Ritual Skincare"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-2 opacity-40">Slug (URL Path)</label>
                  <input 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="ritual-skincare"
                    className={`${inputClass} font-mono text-sm`}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gold uppercase tracking-[0.3em] ml-2">Visual Representation</label>
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden ${isDark ? "bg-white/5 border-white/10" : "bg-charcoal/5 border-charcoal/10"}`}>
                      {formData.image ? (
                        <img src={getAssetUrl(formData.image)} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="opacity-20" size={28} />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <input type="file" id="category-image" className="hidden" onChange={handleFileUpload} accept="image/*" />
                      <label htmlFor="category-image" className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-gold/20 bg-gold/5 text-gold font-bold uppercase tracking-widest text-[9px] cursor-pointer hover:bg-gold/10 transition-all">
                        {isUploading ? <div className="w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> : <Plus size={14} />}
                        {formData.image ? "Replace Imagery" : "Upload Visual"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SEOForm 
              seo={formData.seo} 
              onChange={(seo) => setFormData({ ...formData, seo })}
              isDark={isDark}
            />
          </form>

          {/* Footer */}
          <div className="p-8 border-t flex items-center justify-end gap-6 bg-white/[0.02]">
            <button 
              onClick={onClose} 
              type="button" 
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                isDark ? "text-white/30 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-10 py-5 bg-gold text-charcoal font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[11px] disabled:opacity-50"
            >
              {isSubmitting ? "Manifesting..." : category ? "Refine Category" : "Manifest Category"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CategoryFormModal;
