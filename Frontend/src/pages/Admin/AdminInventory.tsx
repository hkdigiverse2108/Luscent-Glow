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
  LayoutGrid
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

  useEffect(() => {
    fetchProducts();
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Variants", value: totalVariants, icon: Box, color: themeConfig.vars['--adm-accent'] },
            { label: "Out of Stock", value: outOfStock, icon: AlertCircle, color: "#f43f5e" }, // Rose
            { label: "Low Stock Rituals", value: lowStock, icon: Package, color: "#f59e0b" }, // Amber
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden group shadow-sm bg-background/40"
              style={{ borderColor: themeConfig.vars['--adm-border'] }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-60" style={{ color: themeConfig.vars['--adm-text'] }}>{stat.label}</p>
                  <h3 className="text-3xl font-display font-bold" style={{ color: themeConfig.vars['--adm-text'] }}>{stat.value}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon style={{ color: stat.color }} size={24} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 opacity-20" style={{ backgroundColor: stat.color }} />
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 z-20 pb-4 bg-transparent backdrop-blur-sm">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" style={{ color: themeConfig.vars['--adm-text'] }} size={18} />
            <input 
              type="text"
              placeholder="Search rituals by name..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-background/50 outline-none focus:ring-2 transition-all duration-300 backdrop-blur-md"
              style={{ 
                borderColor: themeConfig.vars['--adm-border'],
                color: themeConfig.vars['--adm-text'],
                '--tw-ring-color': `${themeConfig.vars['--adm-accent']}50`
              } as any}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 border ${
                  selectedCategory === cat 
                    ? "shadow-lg scale-105" 
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{ 
                  backgroundColor: selectedCategory === cat ? themeConfig.vars['--adm-accent'] : 'transparent',
                  borderColor: selectedCategory === cat ? themeConfig.vars['--adm-accent'] : themeConfig.vars['--adm-border'],
                  color: selectedCategory === cat ? '#fff' : themeConfig.vars['--adm-text']
                }}
              >
                {cat}
              </button>
            ))}
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
                  className="rounded-2xl border overflow-hidden transition-all duration-500 backdrop-blur-md bg-background/40"
                  style={{ borderColor: themeConfig.vars['--adm-border'] }}
                >
                  {/* Product Summary Row */}
                  <div 
                    className="p-5 flex flex-wrap items-center justify-between gap-4 relative z-10 cursor-pointer"
                    onClick={() => toggleProduct(product._id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: themeConfig.vars['--adm-border'] }}>
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-lg leading-tight" style={{ color: themeConfig.vars['--adm-text'] }}>{product.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                            {product.category}
                          </span>
                          <span className="text-[10px] font-medium opacity-50" style={{ color: themeConfig.vars['--adm-text'] }}>
                            {product.variants?.length || 0} Variations
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: themeConfig.vars['--adm-text'] }}>Master Stock</p>
                        <p className={`text-xl font-display font-bold ${totalStock === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {totalStock} <span className="text-[10px] uppercase font-body opacity-60">units</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 border-l pl-8" style={{ borderColor: themeConfig.vars['--adm-border'] }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); syncStock(product); }}
                          disabled={isUpdating === product._id}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                          title="Sync Stock"
                        >
                          {isUpdating === product._id ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        </button>
                        <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all opacity-40 hover:opacity-100" style={{ color: themeConfig.vars['--adm-text'] }}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                          <div className="grid grid-cols-1 gap-3">
                            {product.variants?.map((variant: any, idx: number) => (
                              <div 
                                key={idx}
                                className="flex items-center justify-between p-4 rounded-xl border border-dashed transition-colors"
                                style={{ borderColor: themeConfig.vars['--adm-border'] }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full border shadow-inner" style={{ backgroundColor: variant.color || '#ddd', borderColor: 'rgba(255,255,255,0.2)' }} title={variant.color} />
                                  <div>
                                    <p className="text-[11px] font-bold tracking-wide uppercase" style={{ color: themeConfig.vars['--adm-text'] }}>
                                      {variant.color || "Standard"} {variant.size ? `/ ${variant.size}` : ""}
                                    </p>
                                    <p className="text-[9px] font-medium opacity-40 uppercase tracking-[0.2em]" style={{ color: themeConfig.vars['--adm-text'] }}>{variant.sku || "NO SKU"}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] opacity-40 mb-1" style={{ color: themeConfig.vars['--adm-text'] }}>Physical Count</p>
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        min="0"
                                        className={`w-20 px-3 py-1.5 text-center text-sm font-bold bg-background/50 border rounded-lg outline-none transition-all ${
                                          variant.stock === 0 ? 'border-rose-500/50 text-rose-500' : 
                                          variant.stock < 5 ? 'border-amber-500/50 text-amber-500' : 
                                          'border-emerald-500/20 text-emerald-500'
                                        }`}
                                        value={variant.stock}
                                        onChange={(e) => handleStockChange(product._id, idx, e.target.value)}
                                      />
                                      {variant.stock === 0 && <span className="text-[8px] font-black text-rose-500 uppercase px-1.5 py-0.5 bg-rose-500/10 rounded">Empty</span>}
                                      {variant.stock > 0 && variant.stock < 5 && <span className="text-[8px] font-black text-amber-500 uppercase px-1.5 py-0.5 bg-amber-500/10 rounded">Low</span>}
                                    </div>
                                  </div>
                                  <div className="w-16 text-right">
                                    <p className="text-[10px] font-display font-medium opacity-50" style={{ color: themeConfig.vars['--adm-text'] }}>
                                      ₹{variant.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6 flex justify-end">
                            <button 
                              onClick={() => syncStock(product)}
                              disabled={isUpdating === product._id}
                              className="flex items-center gap-3 px-8 py-3 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] transition-all hover:shadow-lg disabled:opacity-50"
                              style={{ 
                                backgroundColor: isDark ? '#fff' : '#000',
                                color: isDark ? '#000' : '#fff'
                              }}
                            >
                              {isUpdating === product._id ? (
                                <>Syncing Stock <RefreshCw size={14} className="animate-spin" /></>
                              ) : (
                                <>Verify & Sync Ritual <Save size={14} /></>
                              )}
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
