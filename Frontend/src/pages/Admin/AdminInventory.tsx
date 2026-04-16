import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Save, 
  ArrowRight,
  RefreshCw,
  Box,
  LayoutGrid,
  HandCoins,
  Layers
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminInventory = () => {
  const { isDark, themeConfig } = useAdminTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/products/"));
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error("Could not reach the product database.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl("/api/categories/"));
      if (response.ok) {
        const data = await response.json();
        // Master list of {name, slug} objects
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const toggleProduct = (id: string) => {
    setExpandedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleStockChange = (productId: string, variantIndex: number, newValue: string) => {
    const val = parseInt(newValue) || 0;
    setProducts(prev => prev.map(p => {
      if (p._id === productId) {
        const newVariants = [...(p.variants || [])];
        newVariants[variantIndex] = { ...newVariants[variantIndex], stock: val };
        return { ...p, variants: newVariants };
      }
      return p;
    }));
  };

  const syncStock = async (product: any) => {
    setIsUpdating(product._id);
    try {
      const response = await fetch(getApiUrl(`/api/products/${product._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants: product.variants }),
      });
      
      if (response.ok) {
        toast.success(`Ritual synced: ${product.name} stock updated.`);
      } else {
        toast.error("Failed to sync stock levels.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setIsUpdating(null);
    }
  };

  // Intelligent Category Normalization Ritual
  const finalCategories = React.useMemo(() => {
    const categoryMap = new Map<string, { label: string, slug: string }>(); 

    // 1. Seed with Master Categories from Database
    categories.forEach(cat => {
      if (cat && cat.slug) {
        const slug = cat.slug.toLowerCase();
        if (!categoryMap.has(slug)) {
          categoryMap.set(slug, { label: cat.name || cat.slug, slug: cat.slug });
        }
      }
    });

    // 2. Identify "Phantom" Categories (strings in products not in Master List)
    products.forEach(p => {
      if (p.category) {
        const pCat = p.category.toLowerCase();
        if (!categoryMap.has(pCat)) {
          // If it doesn't exist even as a name, we add it as its own label
          categoryMap.set(pCat, { label: p.category, slug: p.category });
        }
      }
    });

    const result = Array.from(categoryMap.values());
    return [{ label: "All Rituals", slug: "all" }, ...result];
  }, [categories, products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const pCat = (p.category || "").toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    const matchesCategory = selectedCategory === "all" || pCat === selCat;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  const outOfStock = products.reduce((acc, p) => 
    acc + (p.variants?.filter((v: any) => v.stock === 0).length || 0), 0
  );
  const lowStock = products.reduce((acc, p) => 
    acc + (p.variants?.filter((v: any) => v.stock > 0 && v.stock < 5).length || 0), 0
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 relative z-10 h-screen overflow-hidden">
      <AdminHeader title="Inventory Control" subtitle="Managing Variant Stock Rituals" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pt-2">
        
        {/* Statistics Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Variants", value: totalVariants, icon: Layers, color: themeConfig.vars['--adm-accent'], glow: "rgba(212,175,55,0.3)" },
            { label: "Out of Stock", value: outOfStock, icon: AlertCircle, color: "#f43f5e", glow: "rgba(244,63,94,0.3)" },
            { label: "Low Stock Rituals", value: lowStock, icon: Package, color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] border backdrop-blur-3xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl"
              style={{ 
                borderColor: themeConfig.vars['--adm-border'],
                backgroundColor: isDark ? 'rgba(30,30,30,0.4)' : 'rgba(255,255,255,0.6)',
                boxShadow: `0 10px 40px -10px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)'}`
              }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 transition-colors" style={{ color: themeConfig.vars['--adm-text-dim'] }}>{stat.label}</p>
                  <h3 className="text-4xl font-display font-bold tracking-tight" style={{ color: themeConfig.vars['--adm-text'] }}>{stat.value}</h3>
                </div>
                <div 
                  className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/5" 
                  style={{ 
                    backgroundColor: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`
                  }}
                >
                  <stat.icon style={{ color: stat.color }} size={28} />
                </div>
              </div>
              
              {/* Animated Glow Background */}
              <div 
                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all duration-700 group-hover:scale-150 group-hover:opacity-40"
                style={{ backgroundColor: stat.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-20 py-4 bg-transparent backdrop-blur-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" style={{ color: themeConfig.vars['--adm-text'] }} size={18} />
            <input 
              type="text"
              placeholder="Search rituals by name..."
              className="w-full pl-14 pr-6 py-4 rounded-[2rem] border outline-none focus:ring-2 transition-all duration-500 backdrop-blur-xl shadow-inner font-medium text-sm"
              style={{ 
                backgroundColor: isDark ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.7)',
                borderColor: themeConfig.vars['--adm-border'],
                color: themeConfig.vars['--adm-text'],
                '--tw-ring-color': `${themeConfig.vars['--adm-accent']}30`
              } as any}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide items-center px-1">
            <div className="p-1 rounded-2xl border flex gap-1 backdrop-blur-xl" style={{ borderColor: themeConfig.vars['--adm-border'], backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)' }}>
              {finalCategories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all duration-500 ${
                    selectedCategory === cat.slug 
                      ? "shadow-xl scale-[1.02]" 
                      : "opacity-40 hover:opacity-100"
                  }`}
                  style={{ 
                    backgroundColor: selectedCategory === cat.slug ? themeConfig.vars['--adm-accent'] : 'transparent',
                    color: selectedCategory === cat.slug ? '#fff' : themeConfig.vars['--adm-text']
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <RefreshCw className="animate-spin mb-4" size={32} style={{ color: themeConfig.vars['--adm-accent'] }} />
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Summoning Stock Data...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-30" style={{ borderColor: themeConfig.vars['--adm-border'] }}>
              <LayoutGrid size={48} className="mx-auto mb-4" />
              <p className="uppercase tracking-[0.2em] font-bold text-xs">No rituals matched your search</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isExpanded = expandedProducts.includes(product._id);
              const totalStock = product.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
              const hasOutOfStock = product.variants?.some((v: any) => v.stock === 0);

              return (
                <div 
                  key={product._id}
                  className="rounded-[2.5rem] border overflow-hidden transition-all duration-700 backdrop-blur-3xl relative"
                  style={{ 
                    borderColor: themeConfig.vars['--adm-border'],
                    backgroundColor: isDark ? 'rgba(30,30,30,0.3)' : 'rgba(255,255,255,0.5)',
                    boxShadow: isExpanded ? `0 20px 50px -12px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'}` : 'none'
                  }}
                >
                  {/* Product Summary Row */}
                  <div 
                    className={`p-6 flex flex-wrap items-center justify-between gap-6 relative z-10 cursor-pointer transition-colors duration-500 ${isExpanded ? '' : 'hover:bg-accent/5'}`}
                    onClick={() => toggleProduct(product._id)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border shadow-lg relative group/img" style={{ borderColor: themeConfig.vars['--adm-border'] }}>
                        <img src={product.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xl tracking-tight mb-2" style={{ color: themeConfig.vars['--adm-text'] }}>{product.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 leading-none">
                            {product.category}
                          </span>
                          <span className="text-[10px] font-bold tracking-[0.1em] transition-colors" style={{ color: themeConfig.vars['--adm-text-dim'] }}>
                            {product.variants?.length || 0} Variations
                          </span>
                        </div>
                      </div>
                    </div>
 
                    <div className="flex items-center gap-10">
                      <div className="text-right space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] transition-colors" style={{ color: themeConfig.vars['--adm-text-dim'] }}>Master Stock</p>
                        <p className={`text-2xl font-display font-bold ${totalStock === 0 ? 'text-rose-500' : 'text-emerald-500'}`} style={{ textShadow: totalStock === 0 ? '0 0 20px rgba(244,63,94,0.2)' : 'none' }}>
                          {totalStock.toLocaleString()} <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Units</span>
                        </p>
                      </div>
 
                      <div className="flex items-center gap-4 border-l pl-10" style={{ borderColor: themeConfig.vars['--adm-border'] }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); syncStock(product); }}
                          disabled={isUpdating === product._id}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-90"
                          title="Sync Stock"
                        >
                          {isUpdating === product._id ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        </button>
                        <button 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-white/5 active:scale-90" 
                          style={{ color: themeConfig.vars['--adm-text'] }}
                        >
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                            <ChevronDown size={24} />
                          </motion.div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Variant Details Expansion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-background/20"
                      >
                        <div className="p-6 border-t" style={{ borderColor: themeConfig.vars['--adm-border'] }}>
                          <div className="grid grid-cols-1 gap-4">
                            {product.variants?.map((variant: any, idx: number) => (
                              <div 
                                key={idx}
                                className="flex items-center justify-between p-5 rounded-2xl border border-dashed transition-all duration-500 hover:bg-white/5 relative group/variant"
                                style={{ 
                                  borderColor: themeConfig.vars['--adm-border'],
                                  backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
                                }}
                              >
                                <div className="flex items-center gap-5">
                                  {/* Smart Swatch Visualization */}
                                  <div 
                                    className="w-12 h-12 rounded-2xl border shadow-2xl relative overflow-hidden flex-shrink-0 group-hover/variant:scale-110 transition-transform duration-500" 
                                    style={{ 
                                      backgroundColor: variant.color?.startsWith('#') ? variant.color : 'transparent',
                                      borderColor: 'rgba(255,255,255,0.1)'
                                    }}
                                  >
                                    {(!variant.color?.startsWith('#') || variant.image) && (
                                      <img 
                                        src={variant.image || product.image} 
                                        className="w-full h-full object-cover" 
                                        alt="" 
                                      />
                                    )}
                                    <div className="absolute inset-0 shadow-inner pointer-events-none" />
                                  </div>
                                  
                                  <div>
                                    <p className="text-[11px] font-black tracking-[0.15em] uppercase mb-1" style={{ color: themeConfig.vars['--adm-text'] }}>
                                      {variant.color || "Standard"} {variant.size ? `/ ${variant.size}` : ""}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]" style={{ color: themeConfig.vars['--adm-text'] }}>{variant.sku || "NO SKU"}</span>
                                      {variant.stock <= 2 && (
                                        <span className="flex items-center gap-1 text-[8px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">
                                          <AlertCircle size={10} /> Critical Level
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-10">
                                  <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] transition-colors mb-2" style={{ color: themeConfig.vars['--adm-text-dim'] }}>Physical Count</p>
                                    <div className="flex items-center gap-3">
                                      <div className="relative group/input">
                                        <input 
                                          type="number" 
                                          min="0"
                                          className={`w-24 px-4 py-2 text-center text-sm font-black bg-black/20 border rounded-xl outline-none transition-all duration-500 focus:ring-2 ${
                                            variant.stock === 0 ? 'border-rose-500/50 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 
                                            variant.stock < 5 ? 'border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 
                                            'border-emerald-500/20 text-emerald-500 border-dashed hover:border-solid hover:border-emerald-500/40'
                                          }`}
                                          style={{ 
                                            '--tw-ring-color': variant.stock === 0 ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'
                                          } as any}
                                          value={variant.stock}
                                          onChange={(e) => handleStockChange(product._id, idx, e.target.value)}
                                        />
                                      </div>
                                      
                                      <div className="w-16">
                                        {variant.stock === 0 && (
                                          <span className="text-[8px] font-black text-white bg-rose-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/30">
                                            Empty
                                          </span>
                                        )}
                                        {variant.stock > 0 && variant.stock < 5 && (
                                          <span className="text-[8px] font-black text-white bg-amber-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/30">
                                            Low
                                          </span>
                                        )}
                                        {variant.stock >= 5 && (
                                          <div className="flex gap-0.5 items-center opacity-20">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-20 text-right">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-20" style={{ color: themeConfig.vars['--adm-text'] }}>Ritual Price</p>
                                    <p className="text-sm font-display font-bold tracking-tight" style={{ color: themeConfig.vars['--adm-text'] }}>
                                      ₹{variant.price.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                                                    <div className="mt-8 flex justify-end">
                            <button 
                              onClick={() => syncStock(product)}
                              disabled={isUpdating === product._id}
                              className="group flex items-center gap-4 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 hover:shadow-2xl shadow-lg border border-white/10 relative overflow-hidden active:scale-95 disabled:opacity-50"
                              style={{ 
                                backgroundColor: isDark ? '#fff' : '#000',
                                color: isDark ? '#000' : '#fff'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              <div className="relative z-10 flex items-center gap-3">
                                {isUpdating === product._id ? (
                                  <>Syncing Stock <RefreshCw size={14} className="animate-spin" /></>
                                ) : (
                                  <>Verify & Sync Ritual <Save size={14} className="transition-transform group-hover:scale-125" /></>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminInventory;
