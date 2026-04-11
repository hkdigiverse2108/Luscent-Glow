import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Image as ImageIcon, Link as LinkIcon, Type, Hash } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

interface InstagramPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  onSuccess: () => void;
}

const InstagramPostModal = ({ isOpen, onClose, post, onSuccess }: InstagramPostModalProps) => {
  const { isDark } = useAdminTheme();
  const [formData, setFormData] = useState<any>({
    type: "post",
    imageUrl: "",
    postUrl: "",
    caption: "",
    order: 0,
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({ ...post });
    } else {
      setFormData({
        type: "post",
        imageUrl: "",
        postUrl: "",
        caption: "",
        order: 0,
        isActive: true
      });
    }
  }, [post, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, imageUrl: base64String }));
      setIsUploading(false);
      toast.success("Image added to gallery.");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to process image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = post 
        ? getApiUrl(`/api/instagram/${post._id}/`) 
        : getApiUrl("/api/instagram/");
      
      const method = post ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(post ? "Entry updated successfully" : "Entry added to gallery");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to save entry");
      }
    } catch (err) {
      toast.error("Operational failure in social grid.");
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
          className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-2xl ${isDark ? 'bg-charcoal border-white/10' : 'bg-white border-charcoal/5'} border rounded-[2.5rem] shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                <ImageIcon className="text-gold" size={24} />
              </div>
              <div>
                <h2 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>
                  {post ? 'EDIT ENTRY' : 'ADD SOCIAL ENTRY'}
                </h2>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-body">Social Database</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-charcoal/5 text-charcoal/40'}`}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              {['post', 'reel'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`py-4 rounded-2xl border-2 transition-all font-body font-bold capitalize tracking-wider ${
                    formData.type === type 
                      ? 'border-gold bg-gold/5 text-gold' 
                      : `border-transparent ${isDark ? 'bg-white/5' : 'bg-charcoal/5'} ${isDark ? 'text-white/40' : 'text-charcoal/40'}`
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="text-xs font-body font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                <ImageIcon size={14} /> COVER IMAGE
              </label>
              <div className="flex items-center gap-6">
                <div className="relative group w-40 h-40 rounded-3xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Social Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <ImageIcon className="text-white/20" size={32} />
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground font-body">Upload the thumbnail or post image. Recommended size: 1080x1080px (Post) or 1080x1920px (Reel).</p>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Or paste external URL"
                    className={`w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-charcoal/5 border-charcoal/10'} rounded-xl px-4 py-2 text-sm ${isDark ? 'text-white' : 'text-charcoal'} focus:border-gold/50 outline-none transition-all font-body`}
                  />
                </div>
              </div>
            </div>

            {/* URLs & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-body font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                  <LinkIcon size={14} /> INSTAGRAM LINK
                </label>
                <input
                  type="text"
                  value={formData.postUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, postUrl: e.target.value }))}
                  placeholder="https://instagram.com/p/..."
                  className={`w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-charcoal/5 border-charcoal/10'} rounded-2xl px-6 py-4 ${isDark ? 'text-white' : 'text-charcoal'} focus:border-gold/50 outline-none transition-all font-body`}
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-body font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Hash size={14} /> DISPLAY ORDER
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className={`w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-charcoal/5 border-charcoal/10'} rounded-2xl px-6 py-4 ${isDark ? 'text-white' : 'text-charcoal'} focus:border-gold/50 outline-none transition-all font-body`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-body font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                <Type size={14} /> CAPTION (OPTIONAL)
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Brief internal note or actual caption..."
                rows={3}
                className={`w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-charcoal/5 border-charcoal/10'} rounded-2xl px-6 py-4 ${isDark ? 'text-white' : 'text-charcoal'} focus:border-gold/50 outline-none transition-all font-body`}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 accent-gold cursor-pointer"
              />
              <span className={`text-sm font-body ${isDark ? 'text-white' : 'text-charcoal'}`}>Active in Gallery</span>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/10 bg-white/5 flex gap-4">
            <button
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-body font-bold tracking-widest transition-all ${
                isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-charcoal/5 text-charcoal'
              }`}
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.imageUrl || !formData.postUrl}
              className={`flex-[2] py-4 bg-gold rounded-2xl text-white font-body font-bold tracking-widest flex items-center justify-center gap-3 hover:bg-gold/90 transition-all shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  {post ? 'SAVE CHANGES' : 'CREATE ENTRY'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstagramPostModal;
