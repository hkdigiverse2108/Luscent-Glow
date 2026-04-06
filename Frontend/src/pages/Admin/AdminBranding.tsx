import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Layout, 
  Sparkles, 
  Edit2, 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon,
  ChevronRight,
  Shield,
  Eye,
  Settings
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import AdminCategoryModal from "../../components/Header/AdminCategoryModal.tsx";
import AdminBrandingModal from "../../components/Header/AdminBrandingModal.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminBranding = () => {
  const { isDark } = useAdminTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const fetchBrandingData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch(getApiUrl("/api/categories/")),
        fetch(getApiUrl("/api/branding/"))
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBranding(await brandRes.json());
    } catch (err) {
      toast.error("Resource fetch ritual failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandingData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-16 w-1/3 bg-secondary rounded-2xl" />
    <div className="grid grid-cols-2 gap-8">
        <div className="h-64 bg-secondary rounded-3xl" />
        <div className="h-64 bg-secondary rounded-3xl" />
    </div>
  </div>;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-4"
    >
      <AdminHeader 
        title="Branding"
        highlightedWord="Concierge"
        subtitle="Manage the visual hallmarks and taxonomy of your Sanctuary"
        isDark={isDark}
        action={{
          label: "Update Header",
          onClick: () => setIsBrandingModalOpen(true),
          icon: Layout
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Branding Presence Card */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-4">
            <div className={`p-4 rounded-3xl border shadow-2xl relative overflow-hidden ${isDark ? "bg-charcoal/40 border-gold/10" : "bg-white border-gold/20"}`}>
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles size={18} className="text-gold" />
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight">Active Header Identity</h3>
                </div>

                <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-secondary/30 border border-gold/10 flex items-center justify-center relative group">
                        {branding?.useImage && branding?.logoImage ? (
                            <img 
                                src={getAssetUrl(branding.logoImage)} 
                                alt="Active Logo" 
                                className="h-16 w-auto object-contain transition-transform group-hover:scale-110 duration-500"
                            />
                        ) : (
                            <h1 className="font-display text-3xl font-semibold tracking-wide italic">
                                {branding?.logoText?.split(' ')[0]} <span className="text-gold">{branding?.logoText?.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        )}
                        <div className="absolute top-4 right-4 text-[8px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-3 py-1 rounded-full border border-gold/10">
                            Live Frontend
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Identity State</p>
                            <p className="text-sm font-bold">{branding?.useImage ? "Visual Mark" : "Text Identity"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Last Update</p>
                            <p className="text-sm font-bold">{new Date(branding?.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <button 
                         onClick={() => setIsBrandingModalOpen(true)}
                        className={`w-full py-5 rounded-2xl border flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-all ${isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-charcoal/5 border-charcoal/10 text-charcoal hover:bg-charcoal/10"}`}
                    >
                        <Settings size={14} /> Refine Brand Rituals
                    </button>
                </div>
            </div>

            {/* Quick Context Tip */}
            <div className={`p-4 rounded-3xl border ${isDark ? "border-gold/5 bg-gold/5" : "border-gold/10 bg-gold/5"}`}>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                        <Shield size={18} className="text-gold" />
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80 uppercase tracking-wider font-medium">
                        Changes here apply globally across both the dynamic and sticky headers in real-time.
                    </p>
                </div>
            </div>
        </motion.div>

        {/* Category Taxonomy Section */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-4">
            <div className={`p-4 rounded-3xl border shadow-2xl ${isDark ? "bg-charcoal/40 border-gold/10" : "bg-white border-gold/20"}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <Layout size={18} className="text-gold" />
                        <h3 className="font-display text-xl font-bold uppercase tracking-tight">Taxonomy (Categories)</h3>
                    </div>
                    <button 
                         onClick={() => { setSelectedCategory(null); setIsCategoryModalOpen(true); }}
                        className="px-5 py-2.5 bg-secondary hover:bg-gold/10 border border-gold/10 text-gold rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                    >
                        <Plus size={12} /> Add Ritual
                    </button>
                </div>

                <div className="space-y-4">
                    {categories.map((cat, idx) => (
                        <div 
                            key={cat._id}
                            onClick={() => navigate(`/products?category=${cat.slug}`)}
                            className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${isDark ? "bg-white/5 border-white/5 hover:border-gold/30" : "bg-charcoal/5 border-charcoal/5 hover:border-gold/30 "}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center border border-gold/10 group-hover:bg-gold/10 transition-colors">
                                    <Eye className="text-gold opacity-40 group-hover:opacity-100 transition-opacity" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase tracking-widest group-hover:text-gold transition-colors">{cat.name}</h4>
                                    <p className="text-[10px] font-medium text-gold/60 uppercase tracking-widest">slug: {cat.slug}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                     onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setSelectedCategory(cat); 
                                        setIsCategoryModalOpen(true); 
                                     }}
                                    className="p-3 rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-20 opacity-30">
                            <Layout size={40} className="mx-auto mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No Rituals Defined</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
      </div>

      <AdminCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSuccess={fetchBrandingData}
      />

      <AdminBrandingModal 
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSuccess={fetchBrandingData}
      />
    </motion.div>
  );
};

export default AdminBranding;
