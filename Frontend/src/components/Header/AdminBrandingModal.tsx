import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Shield, Image as ImageIcon, Plus, Sparkles, Trash2 } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";

interface Branding {
  logoText: string;
  logoImage?: string | null;
  useImage: boolean;
}

interface AdminBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: Branding;
  onSuccess: () => void;
}

const AdminBrandingModal = ({ isOpen, onClose, branding, onSuccess }: AdminBrandingModalProps) => {
  const [formData, setFormData] = useState<Branding>(branding);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData(branding);
  }, [branding, isOpen]);

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
        setFormData(prev => ({ ...prev, logoImage: data.url, useImage: true }));
        toast.success("Logo asset localized.");
      } else {
        toast.error(data.detail || "Upload failed.");
      }
    } catch (error) {
      toast.error("Logo upload connection error.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl("/api/branding/"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Sanctuary branding updated.");
        onSuccess();
        onClose();
      } else {
        toast.error("Branding update failed.");
      }
    } catch (error) {
      toast.error("Backend connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white border border-gold/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-gold/5 flex items-center justify-between bg-gold/5">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-gold" />
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">Identity Management</h3>
            </div>
            <button onClick={onClose} className="hover:bg-gold/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Logo Text Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] ml-2">Brand Identity (Text)</label>
              <input 
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                placeholder="Luscent Glow"
                className="w-full bg-secondary/50 border border-border/50 rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-gold outline-none"
                required
              />
            </div>

            {/* Logo Image Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] ml-2">Visual Hallmark (Logo)</label>
              <div className="flex items-center gap-6 p-4 bg-gold/5 border border-gold/10 rounded-2xl">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-border/50 relative group">
                  {formData.logoImage ? (
                    <>
                      <img src={getAssetUrl(formData.logoImage)} className="w-full h-full object-contain p-2" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, logoImage: null, useImage: false })}
                        className="absolute inset-0 bg-rose-brand/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
                        title="Remove Asset"
                      >
                        <Trash2 className="text-white" size={16} />
                      </button>
                    </>
                  ) : <ImageIcon className="opacity-20" size={20} />}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" id="logo-img" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  <label htmlFor="logo-img" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gold/20 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-gold/5 transition-all">
                    {isUploading ? "Uploading..." : <><Plus size={14} /> {formData.logoImage ? "Change Image" : "Upload Image"}</>}
                  </label>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest">SVG or PNG (Transparent)</p>
                </div>
              </div>
            </div>

            {/* Toggle Section */}
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] ml-2">Preferred Representation</label>
               <div className="flex gap-4 p-2 bg-secondary/50 border border-border/50 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, useImage: false })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!formData.useImage ? "bg-gold text-charcoal shadow-lg" : "text-muted-foreground hover:bg-gold/10"}`}
                  >
                    Text Identity
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, useImage: true })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.useImage ? "bg-gold text-charcoal shadow-lg" : "text-muted-foreground hover:bg-gold/10"}`}
                    disabled={!formData.logoImage}
                  >
                    Visual Logo
                  </button>
               </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-gold text-charcoal text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-gold/20 hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Save size={16} /> {isSubmitting ? "Finalizing..." : "Update Brand Identity"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminBrandingModal;
