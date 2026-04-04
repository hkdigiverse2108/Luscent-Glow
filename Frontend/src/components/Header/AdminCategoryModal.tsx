import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, Plus, Trash2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

interface Category {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
}

interface AdminCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
}

const AdminCategoryModal = ({ isOpen, onClose, category, onSuccess }: AdminCategoryModalProps) => {
  const [formData, setFormData] = useState<Category>({
    name: "",
    slug: "",
    image: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ name: "", slug: "", image: "" });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = category?._id ? "PUT" : "POST";
    const url = category?._id 
      ? getApiUrl(`/api/categories/${category._id}`) 
      : getApiUrl("/api/categories/");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(category ? "Category updated." : "Category created.");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Submission failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!category?._id) return;
    if (!confirm("CRITICAL: Deleting this category will also permanently delete ALL products assigned to it. Proceed?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl(`/api/categories/${category._id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category and associated products deleted.");
        onSuccess();
        onClose();
      } else {
        toast.error("Deletion failed.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white border border-gold/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-gold/5 flex items-center justify-between bg-gold/5">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-gold" />
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                {category ? "Edit" : "New"} Category
              </h3>
            </div>
            <button onClick={onClose} className="hover:bg-gold/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] ml-2">Name</label>
              <input 
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setFormData({ ...formData, name, slug });
                }}
                placeholder="e.g. Rare Elixirs"
                className="w-full bg-secondary/50 border border-border/50 rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-gold outline-none"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] ml-2">Slug (URL Name)</label>
              <input 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. rare-elixirs"
                className="w-full bg-secondary/50 border border-border/50 rounded-2xl py-4 px-6 text-sm focus:ring-1 focus:ring-gold outline-none"
                required
              />
            </div>

            <div className="pt-4 flex gap-4">
              {category?._id && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-4 border border-rose-brand/20 text-rose-brand text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-rose-brand/5 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-gold text-charcoal text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-gold/10 hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={14} /> {isSubmitting ? "Saving..." : "Save Category"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminCategoryModal;
