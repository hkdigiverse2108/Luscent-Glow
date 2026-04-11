import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Save, 
  Image as ImageIcon,
  Calendar,
  User as UserIcon,
  Layout,
  Star,
  Plus,
  Sparkles
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const BlogPostModal = ({ isOpen, onClose, post, onSuccess, voices = [] }: any) => {
  const { isDark } = useAdminTheme();
  const [formData, setFormData] = useState<any>({
    title: "",
    excerpt: "",
    content: "",
    author: "Elena Vance",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    category: "Rituals",
    image: "",
    featured: false,
    relatedProducts: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (post) {
      setFormData({
        ...post,
        relatedProducts: (post as any).relatedProducts || []
      });
    } else {
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "Elena Vance",
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: "Rituals",
        image: "",
        featured: false,
        relatedProducts: []
      });
    }
  }, [post, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch(getApiUrl("upload"), {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, image: data.url });
        setImgError(false);
        toast.success("Story visual archived in the project.");
      } else {
        toast.error("Failed to archive visual.");
      }
    } catch (error) {
      toast.error("Network synchronization failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error("Please illuminate all textual fields.");
      return;
    }

    if (!formData.image) {
      toast.error("A story requires a visual anchor (image).");
      return;
    }

    setIsSaving(true);
    try {
      const url = post ? getApiUrl(`blogs/${post._id || post.id}/`) : getApiUrl("blogs/");
      const method = post ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(post ? "Story updated in chronicles." : "New story published.");
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || "Validation ritual failed on the server.";
        toast.error(`Failed to save story: ${message}`);
        console.error("Save Error:", errorData);
      }
    } catch (error) {
      toast.error("Network ritual failed. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ["Rituals", "Ingredients", "Lifestyle", "Sustainability"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-5xl h-[90vh] overflow-hidden rounded-[3rem] border shadow-2xl flex flex-col ${isDark ? "bg-charcoal border-white/10" : "bg-white border-gold/20"}`}
          >
            <div className="p-8 border-b border-gold/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-gold/10 via-transparent to-transparent">
               <div className="space-y-1">
                  <h3 className="font-display text-3xl font-bold uppercase tracking-tight">
                    {post ? "Refine The" : "Compose A New"} <span className="text-gold italic text-4xl">Story</span>
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60">Markdown & Ritual Settings</p>
               </div>
               <button 
                onClick={onClose} 
                className="group p-3 bg-secondary shadow-lg rounded-full hover:bg-rose-500 transition-all duration-500 flex items-center gap-3 pr-6"
               >
                 <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                    <X size={20} className={isDark ? "text-white" : "text-charcoal group-hover:text-white"} />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-white">Close</span>
               </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-12">
               {/* Identity & Discovery */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                      <div className="space-y-4">
                         <label className="text-xs font-bold uppercase tracking-widest text-gold italic">Story Identity</label>
                         <input 
                           required 
                           value={formData.title}
                           onChange={(e) => setFormData({...formData, title: e.target.value})}
                           placeholder="Story Title (e.g. The Alchemy of Radiance)"
                           className="w-full bg-transparent border-b border-gold/20 py-4 text-2xl font-display font-bold outline-none focus:border-gold transition-all"
                         />
                      </div>

                      <div className="space-y-4">
                         <label className="text-xs font-bold uppercase tracking-widest text-gold italic">The Hook (Excerpt)</label>
                         <textarea 
                           required 
                           value={formData.excerpt}
                           onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                           placeholder="Brief summary to entice the reader..."
                           className="w-full bg-transparent border-b border-gold/20 py-4 text-sm font-body italic outline-none focus:border-gold transition-all resize-none h-20"
                         />
                      </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                      <div className="aspect-video rounded-3xl bg-secondary/30 border-2 border-dashed border-gold/20 flex flex-col items-center justify-center relative group overflow-hidden">
                         {isUploading ? (
                           <div className="flex flex-col items-center animate-pulse">
                              <Sparkles size={32} className="text-gold/40 mb-2" />
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Archiving Visual...</p>
                           </div>
                         ) : formData.image && !imgError ? (
                           <>
                             <img 
                                src={getAssetUrl(formData.image)} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                                onError={() => setImgError(true)}
                             />
                             <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 type="button" 
                                 onClick={() => { setFormData({...formData, image: ""}); setImgError(false); }} 
                                 className="p-3 bg-rose-500 text-white rounded-xl shadow-xl hover:scale-110 transition-transform"
                               >
                                 <X size={16} />
                               </button>
                             </div>
                           </>
                         ) : (
                           <div className="flex flex-col items-center w-full h-full justify-center bg-secondary/20">
                              <ImageIcon size={32} className="text-gold/20 mb-2" />
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{imgError ? "File Not Found" : "Archive Visual"}</p>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                           </div>
                         )}
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-gold/10">
                         <span className="text-[10px] font-bold uppercase tracking-widest">Featured Story</span>
                         <button 
                           type="button"
                           onClick={() => setFormData({...formData, featured: !formData.featured})}
                           className={`w-12 h-6 rounded-full relative transition-all ${formData.featured ? "bg-gold" : "bg-white/10"}`}
                         >
                            <motion.div 
                              animate={{ x: formData.featured ? 24 : 4 }}
                              className={`absolute top-1 w-4 h-4 rounded-full ${formData.featured ? "bg-primary" : "bg-gold/40"}`}
                            />
                         </button>
                      </div>
                  </div>
               </div>

               {/* Meta Details */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><UserIcon size={12} /> Author</label>
                     {voices && voices.length > 0 ? (
                       <select 
                         value={formData.author} 
                         onChange={(e) => setFormData({...formData, author: e.target.value})} 
                         className={`w-full p-4 rounded-xl border bg-secondary/30 text-sm font-bold appearance-none outline-none focus:border-gold transition-all ${isDark ? "border-white/10" : "border-gold/20"}`}
                       >
                         <option value="">Select Authority</option>
                         {voices.map((v: any) => (
                           <option key={v._id || v.id} value={v.name}>{v.name}</option>
                         ))}
                       </select>
                     ) : (
                       <input value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold" />
                     )}
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Calendar size={12} /> Published Date</label>
                     <input value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Layout size={12} /> Category</label>
                     <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-4 rounded-xl border bg-secondary/30 text-sm font-bold appearance-none">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                  </div>
               </div>

               {/* Rich Content Editor (Simple Textarea for now but supports HTML) */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-gold italic">Chronicle Content (HTML Supported)</label>
                    <p className="text-[10px] font-bold text-gold/40 uppercase tracking-widest">Supports &lt;p&gt;, &lt;h3&gt;, &lt;blockquote&gt;, &lt;img&gt;</p>
                  </div>
                  <textarea 
                    required 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Once upon a radiance..."
                    className={`w-full p-8 rounded-[2rem] border min-h-[400px] font-body text-base leading-relaxed outline-none focus:border-gold/50 transition-all ${isDark ? "bg-white/5 border-white/5" : "bg-secondary/10 border-charcoal/5"}`}
                  />
               </div>
            </form>

            <div className="p-8 border-t border-gold/10 flex items-center justify-end gap-6 shrink-0 bg-secondary/10">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity px-8"
                >
                  <X size={14} className="group-hover:rotate-90 transition-transform" />
                  Dismiss
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-4 bg-gold hover:bg-gold/80 hover:scale-105 active:scale-95 text-charcoal px-16 py-5 rounded-full font-body font-bold text-xs uppercase tracking-[0.25em] transition-all disabled:opacity-50 shadow-[0_15px_35px_rgba(212,175,55,0.2)] hover:shadow-gold/40 border-[1px] border-gold/40"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} className="animate-spin" />
                      <span>Synchronizing...</span>
                    </div>
                  ) : (
                    <>
                      <Save size={18} className="drop-shadow-sm" /> 
                      <span>{post ? "Synchronize Story" : "Illuminate Story"}</span>
                    </>
                  )}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BlogPostModal;
