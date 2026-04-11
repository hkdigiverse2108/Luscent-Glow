import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Save, 
  Image as ImageIcon,
  User as UserIcon,
  Quote,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

const EditorialVoiceModal = ({ isOpen, onClose, voice, onSuccess }: any) => {
  const { isDark } = useAdminTheme();
  const [formData, setFormData] = useState<any>({
    name: "",
    badge: "EDITORIAL VOICE",
    insights: "",
    image: "",
    isActive: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (voice) {
      const mappedVoice = { ...voice };
      if (!mappedVoice.insights && mappedVoice.quote) {
        mappedVoice.insights = mappedVoice.quote;
      }
      setFormData(mappedVoice);
    } else {
      setFormData({
        name: "",
        badge: "EDITORIAL VOICE",
        insights: "",
        image: "",
        isActive: false
      });
    }
  }, [voice, isOpen]);

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
        toast.success("Portrait archived in the project.");
      } else {
        toast.error("Failed to archive portrait.");
      }
    } catch (error) {
      toast.error("Network synchronization failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.insights || !formData.image) {
      toast.error("Please illuminate all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const url = voice ? getApiUrl(`blogs/editorial-voices/${voice._id || voice.id}`) : getApiUrl("blogs/editorial-voices");
      const method = voice ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(voice ? "Editorial voice refined." : "New editorial voice archived.");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to commit voice settings.");
      }
    } catch (error) {
      toast.error("Network synchronization failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[3.5rem] border shadow-2xl flex flex-col ${isDark ? "bg-[#121212] border-white/10" : "bg-white border-gold/20"}`}
          >
            <div className="p-10 border-b border-gold/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-gold/10 via-transparent to-transparent">
               <div className="space-y-1">
                  <h3 className="font-display text-4xl font-bold uppercase tracking-tight">
                    {voice ? "Refine The" : "Archive A New"} <span className="text-gold italic text-5xl">Voice</span>
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60">Editorial Authority & Philosophy</p>
               </div>
               <button 
                onClick={onClose} 
                className="group p-4 bg-secondary shadow-lg rounded-full hover:bg-rose-500 transition-all duration-500 flex items-center gap-3 pr-8"
               >
                 <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                    <X size={24} className={isDark ? "text-white" : "text-charcoal group-hover:text-white"} />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white">Close Window</span>
               </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-4 flex flex-col items-center gap-6">
                      <div className="w-48 h-48 rounded-full bg-secondary/30 border-2 border-dashed border-gold/20 flex flex-col items-center justify-center relative group overflow-hidden shadow-inner cursor-pointer">
                         {isUploading ? (
                           <div className="flex flex-col items-center animate-pulse">
                              <Sparkles size={40} className="text-gold/40 mb-3" />
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Illuminating...</p>
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
                                 className="p-3 bg-rose-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                               >
                                 <X size={20} />
                               </button>
                             </div>
                           </>
                         ) : (
                           <div className="flex flex-col items-center w-full h-full justify-center bg-secondary/20">
                              {formData.name ? (
                                <span className="font-display text-6xl font-bold text-gold/20 uppercase tracking-widest">
                                   {formData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </span>
                              ) : (
                                <ImageIcon size={40} className="text-gold/20 mb-3" />
                              )}
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-3">{imgError ? "File Not Found" : "Portrait Reveal"}</p>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                           </div>
                         )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/40 text-center">Editorial Portrait</p>
                  </div>

                  <div className="md:col-span-8 space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><UserIcon size={12} /> Authority Guest</label>
                         <input 
                           required 
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder="Full Name (e.g. Dr. Marcus Chen)"
                           className="w-full bg-transparent border-b border-gold/20 py-4 text-xl font-display font-bold outline-none focus:border-gold transition-all"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Sparkles size={12} /> Editorial Badge</label>
                         <input 
                           value={formData.badge}
                           onChange={(e) => setFormData({...formData, badge: e.target.value})}
                           placeholder="Badge (default: EDITORIAL VOICE)"
                           className="w-full bg-transparent border-b border-gold/20 py-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-gold transition-all"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><ImageIcon size={12} /> Portrait Asset</label>
                         <div className="relative group">
                            <input 
                              readOnly
                              value={formData.image || "No image selected"}
                              placeholder="Portrait Path"
                              className="w-full bg-transparent border-b border-gold/20 py-4 text-sm font-body italic outline-none opacity-40 transition-all"
                            />
                            <div className="absolute right-0 bottom-2">
                               <button 
                                 type="button"
                                 className="bg-gold/10 hover:bg-gold text-gold hover:text-charcoal px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                 onClick={() => document.getElementById('portraitInput')?.click()}
                               >
                                 Choose Photo
                               </button>
                               <input 
                                 id="portraitInput"
                                 type="file" 
                                 accept="image/*"
                                 onChange={handleFileChange}
                                 className="hidden"
                               />
                            </div>
                         </div>
                      </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Quote size={12} /> Editorial Bio / Insights</label>
                  <textarea 
                    required 
                    value={formData.insights}
                    onChange={(e) => setFormData({...formData, insights: e.target.value})}
                    placeholder="The core belief, insights, or bio that defines this authority voice..."
                    className={`w-full p-8 rounded-[2.5rem] border min-h-[150px] font-body text-base italic leading-relaxed outline-none focus:border-gold/50 transition-all ${isDark ? "bg-white/5 border-white/5" : "bg-secondary/10 border-charcoal/5"}`}
                  />
               </div>

               <div className="flex items-center justify-between p-6 bg-gold/5 rounded-3xl border border-gold/10">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isActive ? "bg-gold text-charcoal" : "bg-secondary/50 text-gold/20"}`}>
                        <CheckCircle2 size={20} />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest">Active Authority</p>
                        <p className="text-[10px] opacity-40">Only one voice can illuminate the Journal at a time.</p>
                     </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={`w-14 h-7 rounded-full relative transition-all ${formData.isActive ? "bg-gold" : "bg-white/10"}`}
                  >
                     <motion.div 
                       animate={{ x: formData.isActive ? 30 : 4 }}
                       className={`absolute top-1.5 w-4 h-4 rounded-full ${formData.isActive ? "bg-primary" : "bg-gold/40"}`}
                     />
                  </button>
               </div>
            </form>

            <div className="p-10 border-t border-gold/10 flex items-center justify-end gap-10 shrink-0 bg-secondary/5">
               <button 
                type="button"
                onClick={onClose} 
                className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
               >
                 <X size={14} className="group-hover:rotate-90 transition-transform" />
                 Dismiss Window
               </button>
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center gap-4 bg-gold hover:bg-gold/80 hover:scale-105 active:scale-95 text-charcoal px-20 py-6 rounded-full font-body font-bold text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:shadow-gold/40 border-2 border-gold/50"
               >
                 {isSaving ? (
                   <div className="flex items-center gap-3">
                     <Sparkles size={18} className="animate-spin" />
                     <span>Archiving...</span>
                   </div>
                 ) : (
                   <>
                     <Save size={20} className="drop-shadow-sm" /> 
                     <span>{voice ? "Synchronize Voice" : "Communicate Voice"}</span>
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

export default EditorialVoiceModal;
