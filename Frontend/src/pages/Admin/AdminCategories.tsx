import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag,
  AlertTriangle,
  RefreshCcw,
  Image as ImageIcon
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import CategoryFormModal from "../../components/Admin/CategoryFormModal.tsx";

const AdminCategories = () => {
  const { isDark } = useAdminTheme();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/categories/"));
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error("Could not reach the classification sanctuary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (category: any) => {
    const confirmMessage = `WARNING: Dissolving the "${category.name}" category will also permanently remove ALL products associated with it. Proceed with this destructive ritual?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/categories/${category._id || category.id}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Category and its children dissolved.");
        fetchCategories();
      } else {
        toast.error("Deletion failure.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      <AdminHeader 
        title="Category"
        highlightedWord="Architect"
        subtitle="Define the structural pillars and content taxonomy of your brand."
        isDark={isDark}
        action={{
          label: "New Category",
          onClick: () => { setEditingCategory(null); setIsModalOpen(true); },
          icon: Plus
        }}
      />

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-white/60 group-focus-within:text-gold" : "text-charcoal/90 group-focus-within:text-gold"}`} size={18} />
        <input 
          type="text" 
          placeholder="Search by name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${isDark ? "bg-charcoal/40 border-white/5 text-white" : "bg-white border-charcoal/5 shadow-sm text-charcoal"}`}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-[2.5rem] bg-white/5 animate-pulse" />
          ))
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <motion.div 
              key={category._id || category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative h-56 overflow-hidden group rounded-[2rem] border transition-all duration-700 ${isDark ? "bg-charcoal/40 border-white/5 hover:border-gold/30 shadow-2xl shadow-black/40" : "bg-white border-charcoal/5 shadow-ethereal hover:shadow-2xl hover:border-gold/20"}`}
            >
              {/* Category Background Visual - Full clarity */}
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                {category.image ? (
                  <img src={getAssetUrl(category.image)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gold/10" />
                )}
              </div>
              
              {/* Refined Glassmorphism Overlays */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${
                isDark 
                  ? "bg-black/20 group-hover:bg-black/40" 
                  : "bg-white/10 group-hover:bg-black/20"
              }`} />
              
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gold mb-0.5">
                      {category.slug}
                    </p>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight leading-none drop-shadow-xl">
                      {category.name}
                    </h3>
                  </div>
                  
                  {/* Elegant Action Group - Revealed on Hover */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <button 
                      onClick={() => { setEditingCategory(category); setIsModalOpen(true); }}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-gold hover:border-gold transition-all shadow-xl"
                      title="Refine Category"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category)}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 transition-all shadow-xl"
                      title="Dissolve Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {category.seo && category.seo.title && (
                   <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-white/40">
                      <RefreshCcw size={10} className="text-gold" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none">Archived & SEO Optimized</span>
                   </div>
                )}
              </div>

              {/* Identity Badge */}
              <div className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl group-hover:bg-gold/20 transition-all duration-700">
                <Tag size={18} strokeWidth={1.5} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
             <AlertTriangle className="mx-auto text-gold/20 mb-4" size={48} />
             <p className={`text-xs font-black uppercase tracking-[0.5em] italic ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
               No categories manifest in this domain.
             </p>
          </div>
        )}
      </div>

      <CategoryFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        category={editingCategory} 
        onSuccess={fetchCategories}
      />
    </div>
  );
};

export default AdminCategories;
