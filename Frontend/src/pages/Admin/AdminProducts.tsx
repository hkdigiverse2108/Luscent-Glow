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
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import ProductFormModal from "@/components/Admin/ProductFormModal.tsx";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";

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
      toast.error("Could not reach the product sanctuary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this ritual from the sanctuary?")) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/products/${id}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Ritual removed from repository.");
        fetchProducts();
      } else {
        toast.error("Removal ritual failed.");
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
    <div className="space-y-8 pb-20">
      {/* Header Ritual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-indigo-600/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-body text-4xl font-bold tracking-tight uppercase transition-colors duration-700 ${
            isDark ? "text-white" : "text-charcoal"
          }`}>
            Product <span className="text-indigo-500">Inventory</span>
          </h2>
          <p className={`font-body text-sm tracking-widest uppercase font-bold transition-colors duration-700 ${
            isDark ? "text-slate-500" : "text-charcoal/70"
          }`}>
            Live database management for industrial product rituals
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="flex items-center gap-3 px-8 py-4 bg-gold text-charcoal font-bold rounded-2xl shadow-lg shadow-gold/10 hover:bg-white transition-all duration-500 uppercase tracking-widest text-xs"
        >
          <Plus size={18} />
          <span>Add New Ritual</span>
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
            isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
          }`} size={18} />
          <input 
            type="text" 
            placeholder="Search rituals by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
              isDark 
              ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
              : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
            }`}
          />
        </div>
        <button className={`flex items-center gap-3 px-6 py-4 backdrop-blur-2xl border rounded-2xl transition-all duration-500 font-bold uppercase tracking-widest text-xs ${
          isDark 
          ? "bg-charcoal/40 border-white/5 text-white/40 hover:text-white hover:border-white/10" 
          : "bg-white border-charcoal/5 text-charcoal/40 hover:text-charcoal hover:border-charcoal/10 shadow-sm"
        }`}>
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Database Table Ritual */}
      <div className={`backdrop-blur-3xl border rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 ${
        isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className={`border-b font-body text-xs font-bold uppercase tracking-[0.3em] transition-colors duration-700 ${
               isDark ? "bg-white/[0.02] border-white/5 text-white/30" : "bg-charcoal/[0.02] border-charcoal/5 text-charcoal/70"
             }`}>
                <tr>
                   <th className="px-8 py-6">Product Ritual</th>
                   <th className="px-6 py-6">Category</th>
                   <th className="px-6 py-6">Price</th>
                   <th className="px-6 py-6 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y transition-colors duration-700 ${
               isDark ? "divide-white/5" : "divide-charcoal/5"
             }`}>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6"><div className="h-12 w-48 bg-white/5 rounded-xl" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                      <td className="px-6 py-6"><div className="h-8 w-8 ml-auto bg-white/5 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <motion.tr 
                      key={p._id || p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-white/[0.02] transition-colors"
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-2xl overflow-hidden bg-charcoal relative flex-shrink-0 border border-white/5 shadow-lg">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover/row:scale-110 duration-700" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={20} /></div>
                                )}
                             </div>
                             <div>
                                <h4 className={`text-base font-bold mb-1 transition-colors group-hover/row:text-gold ${
                                  isDark ? "text-white" : "text-charcoal"
                                }`}>{p.name}</h4>
                                <p className={`text-xs font-bold uppercase tracking-widest truncate max-w-[200px] transition-colors ${
                                  isDark ? "text-white/20" : "text-charcoal/60"
                                }`}>ID: {p._id || p.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <span className="px-3 py-1 bg-white/5 rounded-lg text-\[11px\] font-bold text-gold/60 uppercase tracking-widest border border-gold/10">
                             {p.category}
                          </span>
                       </td>
                       <td className={`px-6 py-6 font-display text-lg font-medium italic transition-colors ${
                         isDark ? "text-white" : "text-charcoal"
                       }`}>
                          ₹{p.price}
                       </td>
                       <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
                             <button 
                                onClick={() => openEditModal(p)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"
                                }`}
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={() => handleDelete(p._id || p.id)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDark ? "bg-white/5 text-white/40 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-brand hover:bg-rose-brand/10"
                                }`}
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={`px-8 py-20 text-center font-body text-sm uppercase tracking-widest italic transition-colors ${
                      isDark ? "text-white/20" : "text-charcoal/60"
                    }`}>
                      No rituals found in the sanctuary repository.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>

        {/* Footer Ritual */}
        <div className={`px-8 py-6 border-t flex items-center justify-between transition-colors duration-700 ${
          isDark ? "bg-white/[0.01] border-white/5" : "bg-charcoal/[0.01] border-charcoal/5"
        }`}>
           <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-700 ${
             isDark ? "text-white/20" : "text-charcoal/60"
           }`}>
              Showing {filteredProducts.length} of {products.length} live rituals
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
