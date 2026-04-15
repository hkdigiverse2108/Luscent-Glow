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
              className={`relative overflow-hidden group rounded-[2.5rem] border transition-all duration-700 ${isDark ? "bg-charcoal/40 border-white/5 hover:border-gold/30 shadow-2xl shadow-black/40" : "bg-white border-charcoal/5 shadow-ethereal hover:shadow-2xl hover:border-gold/20"}`}
            >
              {/* Category Background Visual */}
              <div className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity duration-700">
                {category.image ? (
                  <img src={getAssetUrl(category.image)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gold/5" />
                )}
              </div>
              {/* Gradient overlay for text legibility - Softened for clarity */}
              <div className={`absolute inset-0 ${
                isDark
                  ? "bg-gradient-to-br from-charcoal/60 via-charcoal/30 to-transparent"
                  : "bg-gradient-to-br from-white/60 via-white/30 to-transparent"
              }`} />

              <div className="relative z-10 p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <Tag size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingCategory(category); setIsModalOpen(true); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/12 text-white/80 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/70 hover:text-gold shadow-sm"}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "bg-white/12 text-white/80 hover:text-rose-500 hover:bg-rose-500/10" : "bg-charcoal/5 text-charcoal/70 hover:text-rose-500 shadow-sm"}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                    {category.name}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 font-mono">
                    /{category.slug}
                  </p>
                </div>

                {category.seo && category.seo.title && (
                   <div className={`mt-6 pt-6 border-t border-gold/10 flex items-center gap-2 ${isDark ? "text-white/20" : "text-charcoal/30"}`}>
                      <RefreshCcw size={12} className="text-gold" />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none">SEO Active</span>
                   </div>
                )}
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
