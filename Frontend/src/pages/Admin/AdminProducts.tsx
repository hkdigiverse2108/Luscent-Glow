import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
  Image as ImageIcon,
  Zap
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import ProductFormModal from "@/components/Admin/ProductFormModal.tsx";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminProducts = () => {
  const { isDark } = useAdminTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);

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

  const fetchPromotions = async () => {
    try {
      const response = await fetch(getApiUrl("/api/promotions/"));
      if (response.ok) {
        setPromotions(await response.json());
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this product?")) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/products/${id}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Product removed.");
        fetchProducts();
      } else {
        toast.error("Delete action failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const availableCategories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-2 pb-4">
      <AdminHeader 
        title="Products"
        highlightedWord="Management"
        subtitle="Manage or update information for each of your products"
        isDark={isDark}
        action={{
          label: "Add New Product",
          onClick: openAddModal,
          icon: Plus
        }}
      />

      <div className="flex flex-col md:flex-row gap-6 mb-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className={`transition-colors duration-500 ${
              isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/40 group-focus-within:text-gold"
            }`} size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search artisan catalog by name, category, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-[1.5rem] py-4 pl-16 pr-8 font-display text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-700 ${
              isDark 
              ? "bg-white/[0.02] border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/40 shadow-sm"
            }`}
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-4 px-8 py-4 border rounded-[1.5rem] transition-all duration-700 font-black uppercase tracking-[0.2em] text-[10px] ${
              isFilterOpen || selectedCategory !== "all"
              ? "bg-gold text-charcoal border-gold shadow-lg shadow-gold/20" 
              : isDark 
                ? "bg-white/[0.02] border-white/5 text-white/40 hover:text-white hover:border-white/10" 
                : "bg-white border-charcoal/5 text-charcoal/60 hover:text-charcoal shadow-sm"
            }`}
          >
            <Filter size={16} />
            <span>{selectedCategory === "all" ? "Curation Filter" : selectedCategory}</span>
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute right-0 mt-4 w-60 rounded-3xl border shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-3xl ${
                  isDark ? "bg-[#1a1a1a]/95 border-white/10" : "bg-white/95 border-charcoal/10"
                }`}
              >
                {availableCategories.map((category: any) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCategory === category
                      ? "bg-gold text-charcoal"
                      : isDark ? "hover:bg-white/5 text-white/60" : "hover:bg-charcoal/5 text-charcoal/60"
                    }`}
                  >
                    {category}
                    {selectedCategory === category && <div className="w-1.5 h-1.5 rounded-full bg-charcoal" />}
                  </button>
                ))}
                
                {selectedCategory !== "all" && (
                   <button
                     onClick={() => {
                       setSelectedCategory("all");
                       setIsFilterOpen(false);
                     }}
                     className="w-full mt-2 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500/5 transition-all"
                   >
                     Clear Filter
                   </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Products Table */}
      <div className={`border rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 min-h-[600px] ${
        isDark ? "bg-white/[0.01] border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b transition-colors duration-700 ${
               isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-charcoal/[0.02] border-charcoal/10 text-charcoal/50"
             }`}>
                <tr>
                   <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] italic">Artisan Ritual</th>
                   <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.4em]">Brand</th>
                   <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.4em]">Category</th>
                   <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.4em]">Reception</th>
                   <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.4em]">Essence</th>
                   <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.4em]">Interactions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/10" : "divide-charcoal/10"
             }`}>
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-1.5"><div className="h-14 w-48 bg-white/5 rounded-xl" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                      <td className="px-4 py-1.5"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <motion.tr 
                      key={p._id || p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group/row transition-all duration-500 ${
                        isDark ? "hover:bg-white/[0.02]" : "hover:bg-charcoal/[0.01]"
                      }`}
                    >
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-7">
                             <div className={`w-20 h-20 rounded-3xl overflow-hidden relative flex-shrink-0 border transition-all duration-700 group-hover/row:scale-105 group-hover/row:rotate-2 group-hover/row:shadow-2xl ${
                               isDark ? "bg-charcoal border-white/10" : "bg-white border-charcoal/5 shadow-lg"
                             }`}>
                                {p.image ? (
                                  <img src={getAssetUrl(p.image)} alt={p.name} className="w-full h-full object-cover transition-transform group-hover/row:scale-125 duration-1000" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={32} /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity" />
                             </div>
                             <div>
                                <h4 className={`text-[15px] font-black uppercase tracking-tight mb-2 transition-colors group-hover/row:text-gold ${
                                  isDark ? "text-white/90" : "text-charcoal"
                                }`}>{p.name}</h4>
                                <div className="flex items-center gap-3">
                                   <div className={`text-[9px] font-black uppercase tracking-[0.3em] font-display px-2 py-0.5 rounded border transition-colors ${
                                      isDark ? "border-white/10 text-white/20" : "border-charcoal/10 text-charcoal/40"
                                   }`}>Archival SKU</div>
                                   <p className={`text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px] transition-colors ${
                                     isDark ? "text-white/20" : "text-charcoal/30"
                                   }`}>{p._id || p.id}</p>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/80 font-medium" : "text-charcoal/80"}`}>
                             {p.brand || "Lucsent Glow"}
                          </span>
                       </td>
                       <td className="px-6 py-6">
                          <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border group-hover/row:shadow-lg ${
                            isDark ? "bg-white/[0.03] border-white/5 text-gold/80" : "bg-gold/5 border-gold/10 text-gold shadow-sm"
                          }`}>
                             {p.category}
                          </span>
                       </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-gold">
                                <span className="text-sm font-black tracking-widest">{p.rating}</span>
                                <div className="flex gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                     <div key={i} className={`w-1 h-1 rounded-full ${i < Math.floor(p.rating) ? "bg-gold" : "bg-gold/20"}`} />
                                   ))}
                                </div>
                             </div>
                             <div className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${isDark ? "text-white/20" : "text-charcoal/30"}`}>
                               {p.reviewCount?.toLocaleString()} Testimonials
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex flex-col gap-2">
                             {p.isNew && (
                               <div className="flex items-center gap-2 group/badge">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/badge:scale-150 transition-transform" />
                                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">New Arrival</span>
                               </div>
                             )}
                             {(p.isTrending || p.isBestSeller) && (
                               <div className="flex items-center gap-2 group/badge">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                                  <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">Curated Favorite</span>
                               </div>
                             )}
                          </div>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-5">
                             <button 
                                onClick={() => openEditModal(p)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group/edit relative ${
                                  isDark ? "bg-white/[0.03] text-white/30 hover:text-gold" : "bg-charcoal/5 text-charcoal/40 hover:text-gold shadow-sm"
                                }`}
                             >
                                <motion.div whileHover={{ rotate: 15 }}><Edit2 size={18} /></motion.div>
                                <div className="absolute inset-0 bg-gold/10 rounded-2xl scale-0 group-hover/edit:scale-100 transition-transform duration-500" />
                             </button>
                             <button 
                                onClick={() => handleDelete(p._id || p.id)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group/trash relative ${
                                  isDark ? "bg-white/[0.03] text-white/30 hover:text-rose-light" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-brand shadow-sm"
                                }`}
                             >
                                <motion.div whileHover={{ scale: 1.1 }}><Trash2 size={18} /></motion.div>
                                <div className="absolute inset-0 bg-rose-500/10 rounded-2xl scale-0 group-hover/trash:scale-100 transition-transform duration-500" />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={`px-8 py-24 text-center font-body text-base uppercase tracking-widest italic transition-colors ${
                      isDark ? "text-white/40" : "text-charcoal/70"
                    }`}>
                      No products found in the database.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 border-t flex items-center justify-between transition-colors duration-700 ${
          isDark ? "bg-white/[0.01] border-white/5" : "bg-charcoal/[0.01] border-charcoal/5"
        }`}>
           <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-700 ${
             isDark ? "text-white/20" : "text-charcoal/60"
           }`}>
              Showing {filteredProducts.length} of {products.length} live products
           </p>
           <div className="flex items-center gap-4">
              <button className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-not-allowed ${
                isDark ? "border-white/5 text-white/20" : "border-charcoal/10 text-charcoal/40"
              }`}>
                 <ChevronLeft size={18} />
              </button>
              <button className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-not-allowed ${
                isDark ? "border-white/5 text-white/20" : "border-charcoal/10 text-charcoal/40"
              }`}>
                 <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct} 
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default AdminProducts;
