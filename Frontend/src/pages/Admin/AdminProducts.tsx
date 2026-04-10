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
  Image as ImageIcon
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
          }`} size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-2xl border rounded-2xl py-3 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
            }`}
          />
        </div>
        <button className={`flex items-center gap-3 px-6 py-3 backdrop-blur-2xl border rounded-2xl transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
          isDark 
          ? "bg-charcoal/40 border-white/5 text-white/40 hover:text-white hover:border-white/10" 
          : "bg-white border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:border-charcoal/10 shadow-sm"
        }`}>
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Products Table */}
      <div className={`backdrop-blur-3xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 min-h-[600px] ${
        isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
             <thead className={`border-b font-body text-[12px] font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.04] border-white/10 text-white/50" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/80"
             }`}>
                <tr>
                   <th className="px-4 py-2 min-w-[300px] font-extrabold uppercase tracking-[0.3em]">Product</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-[0.3em]">Brand</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-[0.3em]">Category</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-[0.3em]">Pricing</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-[0.3em]">Performance</th>
                   <th className="px-4 py-2 font-extrabold uppercase tracking-[0.3em]">Status</th>
                   <th className="px-6 py-6 text-right pr-12 font-extrabold uppercase tracking-[0.3em]">Actions</th>
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
                      className="group/row hover:bg-white/[0.03] transition-colors"
                    >
                       <td className="px-4 py-1.5">
                          <div className="flex items-center gap-5">
                             <div className="w-16 h-16 rounded-2xl overflow-hidden bg-charcoal relative flex-shrink-0 border border-white/10 shadow-xl">
                                {p.image ? (
                                  <img src={getAssetUrl(p.image)} alt={p.name} className="w-full h-full object-cover transition-transform group-hover/row:scale-110 duration-700" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={24} /></div>
                                )}
                             </div>
                             <div>
                                <h4 className={`text-[15px] font-extrabold mb-1.5 transition-colors group-hover/row:text-gold ${
                                  isDark ? "text-white" : "text-charcoal"
                                }`}>{p.name}</h4>
                                <p className={`text-[13px] font-extrabold uppercase tracking-widest truncate max-w-[200px] transition-colors ${
                                  isDark ? "text-white/60" : "text-charcoal/80"
                                }`}>ID: {p._id || p.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-1.5">
                          <span className={`text-[14px] font-extrabold tracking-wider ${isDark ? "text-white/90" : "text-charcoal/90"}`}>
                             {p.brand || "Luscent Glow"}
                          </span>
                       </td>
                       <td className="px-4 py-1.5">
                          <span className="px-5 py-2 bg-gold/10 rounded-xl text-[13px] font-extrabold text-gold uppercase tracking-widest border border-gold/20 shadow-sm">
                             {p.category}
                          </span>
                       </td>
                       <td className="px-4 py-1.5">
                          <div className="space-y-2">
                             <div className={`font-display text-2xl font-bold italic ${isDark ? "text-white" : "text-charcoal"}`}>
                                ₹{p.price}
                             </div>
                             {p.originalPrice && (
                               <div className="flex items-center gap-3">
                                 <span className="text-[14px] font-bold line-through opacity-60">₹{p.originalPrice}</span>
                                 <span className="text-[14px] font-extrabold text-rose-500">-{p.discount}%</span>
                               </div>
                             )}
                          </div>
                       </td>
                       <td className="px-4 py-1.5">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-gold">
                                <span className="text-lg font-bold">{p.rating}</span>
                                <span className="text-[14px] opacity-100">★</span>
                             </div>
                             <div className={`text-[13px] font-extrabold uppercase tracking-widest ${isDark ? "text-white/60" : "text-charcoal/80"}`}>
                               {p.reviewCount?.toLocaleString()} Reviews
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-1.5">
                          <div className="flex flex-wrap gap-2.5">
                             {p.isNew && (
                               <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[12px] font-extrabold uppercase tracking-widest border border-emerald-500/30 shadow-sm">New</span>
                             )}
                             {p.isTrending && (
                               <span className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-[12px] font-extrabold uppercase tracking-widest border border-gold/30 shadow-sm">Trending</span>
                             )}
                             {p.isBestSeller && (
                               <span className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-[12px] font-extrabold uppercase tracking-widest border border-gold/30 shadow-sm">Best Seller</span>
                             )}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                                onClick={() => openEditModal(p)}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                             >
                                <Edit2 size={18} />
                             </button>
                             <button 
                                onClick={() => handleDelete(p._id || p.id)}
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-brand hover:bg-rose-brand/10"
                                }`}
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={`px-8 py-24 text-center font-body text-base uppercase tracking-widest italic transition-colors ${
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
