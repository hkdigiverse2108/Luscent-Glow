import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  Upload,
  Zap,
  CheckCircle2,
  Trash2,
  X,
  Layout,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Instagram,
  ShoppingBag,
  ArrowRight,
  MousePointer2,
  Edit3,
  Loader2,
  Settings,
  Shield,
  Eye
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import AdminBrandingModal from "../../components/Header/AdminBrandingModal.tsx";
import InstagramManagement from "../../components/Admin/InstagramManagement.tsx";

const AdminHome = () => {
  const { isDark } = useAdminTheme();
  const [config, setConfig] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"carousel" | "editorial" | "promotions" | "social" | "taxonomy" | "identity">("carousel");
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  const fetchConfig = async () => {
    try {
      const [hResponse, cResponse, bResponse] = await Promise.all([
        fetch(getApiUrl("/api/home/settings")),
        fetch(getApiUrl("/api/categories/")),
        fetch(getApiUrl("/api/branding/"))
      ]);

      if (hResponse.ok) setConfig(await hResponse.json());
      if (cResponse.ok) setCategories(await cResponse.json());
      if (bResponse.ok) setBranding(await bResponse.json());
    } catch (error) {
      toast.error("Failed to fetch Home Page configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleImageUpload = async (field: string, file: File, index: number | null = null, isCategory: boolean = false) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await fetch(getApiUrl("/upload"), {
        method: "POST",
        body: uploadData,
      });
      if (response.ok) {
        const data = await response.json();
        
        if (isCategory && editingCategory) {
          setEditingCategory({ ...editingCategory, image: data.url });
        } else if (index !== null) {
          const newSlides = [...config.heroSlides];
          newSlides[index].image = data.url;
          setConfig({ ...config, heroSlides: newSlides });
        } else if (field.includes('.')) {
          const [parent, child] = field.split('.');
          setConfig({ 
            ...config, 
            [parent]: { ...config[parent], [child]: data.url } 
          });
        } else {
          setConfig({ ...config, [field]: data.url });
        }
        toast.success("Image uploaded.");
      }
    } catch (error) {
      toast.error("Image upload failed.");
    }
  };

  const handleCategorySave = async () => {
    const method = editingCategory?._id ? "PUT" : "POST";
    const url = editingCategory?._id 
      ? getApiUrl(`/api/categories/${editingCategory._id}`) 
      : getApiUrl("/api/categories/");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory)
      });
      if (response.ok) {
        toast.success("Category saved.");
        setIsCategoryModalOpen(false);
        fetchConfig();
      }
    } catch (error) {
      toast.error("Failed to save category.");
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await fetch(getApiUrl(`/api/categories/${id}`), {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Category removed.");
        fetchConfig();
      }
    } catch (error) {
      toast.error("Failed to remove category.");
    }
  };

  const handleSaveConfig = async () => {
    setIsConfigSaving(true);
    try {
      const response = await fetch(getApiUrl("/api/home/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        toast.success("Home page settings saved.");
      } else {
        toast.error("Failed to save changes.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsConfigSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-gold animate-pulse">Loading Page Settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: "carousel", label: "Hero Banner", icon: ImageIcon },
    { id: "identity", label: "Branding", icon: Sparkles },
    { id: "editorial", label: "Brand Story", icon: MessageSquare },
    { id: "taxonomy", label: "Categories", icon: Layout },
    { id: "social", label: "Social Media", icon: Instagram }
  ];

  return (
    <div className="space-y-6 pb-20">
      <AdminHeader 
        title="Home Page"
        highlightedWord="Settings"
        subtitle="Manage the home page content and display of your store."
        isDark={isDark}
        action={{
          label: isConfigSaving ? "Saving..." : "Save Changes",
          onClick: handleSaveConfig,
          icon: isConfigSaving ? Sparkles : CheckCircle2,
          disabled: isConfigSaving
        }}
      >
        <div className="flex items-center gap-6 mt-6 border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative text-muted-foreground hover:text-charcoal dark:hover:text-white"
            >
              <tab.icon size={12} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                />
              )}
            </button>
          ))}
        </div>
      </AdminHeader>

      <AnimatePresence mode="wait">
        {activeTab === "carousel" && (
          <motion.div
            key="carousel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {config.heroSlides.map((slide: any, index: number) => (
                <div 
                  key={index}
                  className={`group relative p-6 rounded-[2.5rem] border transition-all duration-500 ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gold/10 shadow-xl"
                  }`}
                >
                  <button 
                    onClick={() => setConfig({ ...config, heroSlides: config.heroSlides.filter((_: any, i: number) => i !== index) })}
                    className="absolute top-6 right-6 p-2 rounded-full bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <label className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-3 block">Slide Visual</label>
                      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden group/img border border-white/10">
                        <img src={getAssetUrl(slide.image)} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                          <Upload size={24} className="text-gold mb-2" />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-white text-center px-4">Replace Visual</span>
                          <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('heroSlides', e.target.files[0], index)} />
                        </label>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Primary Headline</label>
                        <input 
                          value={slide.title}
                          onChange={(e) => {
                            const newSlides = [...config.heroSlides];
                            newSlides[index].title = e.target.value;
                            setConfig({ ...config, heroSlides: newSlides });
                          }}
                          placeholder="e.g. Premium Glow Collection"
                          className="w-full bg-transparent border-none p-0 text-xl font-display font-bold focus:ring-0 placeholder:opacity-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Summary / Subtitle</label>
                        <textarea 
                          value={slide.subtitle}
                          onChange={(e) => {
                            const newSlides = [...config.heroSlides];
                            newSlides[index].subtitle = e.target.value;
                            setConfig({ ...config, heroSlides: newSlides });
                          }}
                          placeholder="Enter slide description..."
                          rows={2}
                          className="w-full bg-transparent border-none p-0 text-xs font-body font-medium leading-relaxed resize-none focus:ring-0 placeholder:opacity-20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Action Label</label>
                          <input 
                            value={slide.cta}
                            onChange={(e) => {
                              const newSlides = [...config.heroSlides];
                              newSlides[index].cta = e.target.value;
                              setConfig({ ...config, heroSlides: newSlides });
                            }}
                            className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Destination URL</label>
                          <input 
                            value={slide.link}
                            onChange={(e) => {
                              const newSlides = [...config.heroSlides];
                              newSlides[index].link = e.target.value;
                              setConfig({ ...config, heroSlides: newSlides });
                            }}
                            className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setConfig({ ...config, heroSlides: [...config.heroSlides, { image: "", title: "New Promotion", subtitle: "Enter promotion description...", cta: "Shop Now", link: "/products" }] })}
                className={`group min-h-[300px] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                  isDark ? "border-white/10 bg-white/5 hover:border-gold/30 hover:bg-gold/5" : "border-gold/20 bg-white hover:border-gold/40 shadow-xl"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">Add New Slide</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "editorial" && (
          <motion.div
            key="editorial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Philosophy Section */}
            <div className="xl:col-span-12 space-y-6">
              <div className={`p-8 rounded-[3rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gold/10 shadow-xl"}`}>
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight font-display">Brand Story Manager</h3>
                    <p className="text-xs text-muted-foreground font-body">Manage your store's about section and brand narrative.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-3 block">Story Image</label>
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden group border border-white/10 shadow-2xl">
                          <img src={getAssetUrl(config.brandStory.image)} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                            <Upload size={24} className="text-gold mb-2" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-white text-center px-4">Update Image</span>
                            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('brandStory.image', e.target.files[0])} />
                          </label>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Badge</label>
                          <input 
                            value={config.brandStory.badge}
                            onChange={(e) => setConfig({ ...config, brandStory: { ...config.brandStory, badge: e.target.value } })}
                            className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Headline</label>
                          <input 
                            value={config.brandStory.title}
                            onChange={(e) => setConfig({ ...config, brandStory: { ...config.brandStory, title: e.target.value } })}
                            className="w-full bg-transparent border-none p-0 text-2xl font-display font-bold focus:ring-0 placeholder:opacity-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Narrative Description</label>
                      <textarea 
                        value={config.brandStory.description}
                        onChange={(e) => setConfig({ ...config, brandStory: { ...config.brandStory, description: e.target.value } })}
                        rows={6}
                        className="w-full bg-white/5 rounded-2xl p-5 text-sm font-body font-medium leading-relaxed border-none focus:ring-1 focus:ring-gold/30 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Action Label</label>
                        <input 
                          value={config.brandStory.buttonText}
                          onChange={(e) => setConfig({ ...config, brandStory: { ...config.brandStory, buttonText: e.target.value } })}
                          className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Action Link</label>
                        <input 
                          value={config.brandStory.buttonLink}
                          onChange={(e) => setConfig({ ...config, brandStory: { ...config.brandStory, buttonLink: e.target.value } })}
                          className="w-full bg-white/5 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-gold/5 border border-gold/10 space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold text-center mb-4">Section Headers</h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Trending Section Title</label>
                          <input 
                            value={config.trendingTitle}
                            onChange={(e) => setConfig({ ...config, trendingTitle: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Trending Subtitle</label>
                          <input 
                            value={config.trendingSubtitle}
                            onChange={(e) => setConfig({ ...config, trendingSubtitle: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30 opacity-60"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Categories Title</label>
                          <input 
                            value={config.categoriesTitle}
                            onChange={(e) => setConfig({ ...config, categoriesTitle: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">New Arrivals Title</label>
                          <input 
                            value={config.newArrivalsTitle}
                            onChange={(e) => setConfig({ ...config, newArrivalsTitle: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest opacity-30">New Arrivals Subtitle</label>
                          <input 
                            value={config.newArrivalsSubtitle}
                            onChange={(e) => setConfig({ ...config, newArrivalsSubtitle: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest border-none focus:ring-1 focus:ring-gold/30 opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {activeTab === "identity" && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className={`p-8 rounded-[3rem] border shadow-2xl relative overflow-hidden ${isDark ? "bg-charcoal/40 border-gold/10" : "bg-white border-gold/20"}`}>
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight font-display">Header Branding</h3>
                      <p className="text-xs text-muted-foreground font-body">Manage the logo and global branding of your store.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-10 rounded-[2.5rem] bg-secondary/30 border border-gold/10 flex items-center justify-center relative group">
                        {branding?.useImage && branding?.logoImage ? (
                            <img 
                                src={getAssetUrl(branding.logoImage)} 
                                alt="Active Logo" 
                                className="h-20 w-auto object-contain transition-transform group-hover:scale-110 duration-500"
                            />
                        ) : (
                            <h1 className="font-display text-4xl font-semibold tracking-wide italic">
                                {branding?.logoText?.split(' ')[0]} <span className="text-gold">{branding?.logoText?.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        )}
                        <div className="absolute top-6 right-6 text-[8px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-4 py-1.5 rounded-full border border-gold/10">
                            Current Logo
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Identity State</p>
                        <p className="text-lg font-bold">{branding?.useImage ? "Visual Mark (Image)" : "Text Identity"}</p>
                      </div>
                      <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Last Updated</p>
                        <p className="text-lg font-bold">{new Date(branding?.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                          onClick={() => setIsBrandingModalOpen(true)}
                          className="flex-1 py-5 bg-gold text-charcoal rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold/10"
                      >
                          <Settings size={14} /> Edit Branding
                      </button>
                    </div>
                </div>
            </div>

            <div className={`p-6 rounded-[2.5rem] border ${isDark ? "border-gold/5 bg-gold/5" : "border-gold/10 bg-gold/5"} flex items-center gap-5`}>
              <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center shrink-0">
                  <Shield size={24} className="text-gold" />
              </div>
              <div>
                <p className="text-[11px] leading-relaxed opacity-80 uppercase tracking-[0.2em] font-bold text-gold">Branding Notice</p>
                <p className="text-[10px] opacity-60 font-medium">Changes to branding settings apply across your entire store in real-time.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "taxonomy" && (
          <motion.div
            key="taxonomy"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-gold/5 p-6 rounded-3xl border border-gold/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                  <Layout size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold italic">Home Page Category Bento Grid Management</p>
              </div>
              <button 
                onClick={() => {
                  setEditingCategory({ name: "", slug: "", image: "" });
                  setIsCategoryModalOpen(true);
                }}
                className="px-6 py-2 bg-gold text-charcoal rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-gold/20 flex items-center gap-2"
              >
                <Plus size={14} /> Add New Category
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((cat: any) => (
                <div 
                  key={cat._id}
                  className={`group relative p-4 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gold/10 shadow-xl"
                  }`}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-white/5 shadow-inner">
                    <img src={getAssetUrl(cat.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-center truncate px-2">{cat.name}</h4>
                  
                  <div className="absolute inset-0 bg-charcoal/80 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all rounded-[2rem]">
                    <button 
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="w-10 h-10 rounded-full bg-gold text-charcoal flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleCategoryDelete(cat._id)}
                      className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "social" && (
          <InstagramManagement />
        )}

        {/* Category Modal Ceremony */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
              onClick={() => setIsCategoryModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`relative w-full max-w-lg p-8 rounded-[3rem] border shadow-2xl ${
                isDark ? "bg-charcoal border-white/10" : "bg-white border-gold/10"
              }`}
            >
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-display font-bold mb-8 italic">Category <span className="text-gold">Management</span></h3>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-1/3">
                    <label className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-3 block">Category Image</label>
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10 shadow-lg">
                      <img src={getAssetUrl(editingCategory?.image)} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                        <Upload size={20} className="text-gold mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white text-center px-2">Update Visual</span>
                        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('', e.target.files[0], null, true)} />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Category Name</label>
                        <input 
                          value={editingCategory?.name}
                          onChange={(e) => setEditingCategory({ 
                            ...editingCategory, 
                            name: e.target.value,
                            slug: e.target.value.toLowerCase().replace(/ /g, '-')
                          })}
                          className="w-full bg-white/5 rounded-xl p-3 text-sm font-bold border-none focus:ring-1 focus:ring-gold/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest opacity-30">Identifer (Slug)</label>
                        <input 
                          value={editingCategory?.slug}
                          onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                          className="w-full bg-white/5 rounded-xl p-3 text-sm font-mono border-none focus:ring-1 focus:ring-gold/30 opacity-60"
                        />
                      </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={handleCategorySave}
                    className="w-full py-4 bg-gold text-charcoal rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold/10"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminBrandingModal 
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSuccess={fetchConfig}
      />
    </div>
  );
};

export default AdminHome;
