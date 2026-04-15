import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Camera, Image as ImageIcon, Loader2, Plus, Info, Search, Package, Trash2 } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  image: string;
}

interface AdminAddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isDark: boolean;
  review?: any; // Add review prop for editing
}

const AdminAddReviewModal: React.FC<AdminAddReviewModalProps> = ({ isOpen, onClose, onSuccess, isDark, review }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [helpfulCount, setHelpfulCount] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (products.length === 0) {
        fetchProducts();
      }
      
      if (review) {
        // Find the product in our fetched list to get its actual catalog image
        const actualProduct = products.find(p => (p._id || p.id) === review.productId);
        
        // Populate for editing
        setSelectedProduct({
          id: review.productId,
          _id: review.productId,
          name: review.productName,
          image: actualProduct?.image || review.productImage || review.images?.[0] || "" 
        });
        setRating(review.rating || 5);
        setUserName(review.userName || "");
        setUserMobile(review.userMobile || "");
        setComment(review.comment || "");
        setTitle(review.title || "");
        setSelectedFiles([]);
        setExistingImages(review.images || []);
        setHelpfulCount(review.helpfulCount || 0);
      } else {
        // Reset for new creation
        setSelectedProduct(null);
        setRating(5);
        setUserName("");
        setUserMobile("");
        setComment("");
        setTitle("");
        setSelectedFiles([]);
        setExistingImages([]);
        setHelpfulCount(0);
      }
      setError(null);
    }
  }, [isOpen, review, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(getApiUrl("/api/products/"));
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products for review creation.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (existingImages.length + selectedFiles.length + files.length > 4) {
        setError(`Maximum capacity reached (${existingImages.length + selectedFiles.length}/4)`);
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    setIsUploading(true);
    const urls: string[] = [];
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(getApiUrl("/api/upload"), {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          urls.push(data.url);
        }
      }
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      setError("Please select a product chronicle to contribute to.");
      return;
    }
    if (!userName || !userMobile || !comment) {
      setError("Please provide complete ritual details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageUrls = await uploadImages();
      
      const payload: any = {
        productId: (selectedProduct._id || selectedProduct.id),
        productName: selectedProduct.name,
        userName,
        userMobile,
        rating,
        title: title || `${rating} Star Experience`,
        comment,
        helpfulCount,
        images: [...existingImages, ...imageUrls],
        createdAt: review?.createdAt || new Date().toISOString()
      };

      const reviewId = review?.id || review?._id;
      const url = reviewId ? getApiUrl(`/api/reviews/${reviewId}`) : getApiUrl("/api/reviews/");
      const method = reviewId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(reviewId ? "Chronicle successfully refined." : "Chronicle added to the repository.");
        onSuccess?.();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to process chronicle.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!(review?.id || review?._id);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className={`relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
            isDark ? "bg-charcoal border-white/10" : "bg-white border-charcoal/5"
          }`}
        >
          {/* Header */}
          <div className="px-10 pt-10 pb-6 flex items-center justify-between">
            <div>
               <h2 className={`text-3xl font-display font-medium ${isDark ? "text-white" : "text-charcoal"}`}>
                 {isEditing ? "Refine Chronicle" : "Create Chronicle"}
               </h2>
               <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1 ${isDark ? "text-white/40" : "text-charcoal/40"}`}>
                 {isEditing ? "Updating existing product testimonial" : "Manually add product testimonials"}
               </p>
            </div>
            <button onClick={onClose} className={`p-3 rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-charcoal/5 text-charcoal/40"}`}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar">
            
            {/* 1. Product Selection */}
            <div className="space-y-4">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Select Product</label>
              
              {!selectedProduct ? (
                <div className="relative group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" />
                  <input 
                    type="text" 
                    placeholder="Search by ritual name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className={`w-full py-4 pl-14 pr-6 rounded-2xl border transition-all focus:outline-none focus:ring-1 focus:ring-gold/30 ${
                      isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"
                    }`}
                  />
                  {(searchQuery || isSearchFocused) && (
                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-[110] overflow-hidden max-h-60 overflow-y-auto ${
                      isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-charcoal/10"
                    }`}>
                      {filteredProducts.map(p => (
                        <button 
                          key={p._id || p.id}
                          onClick={() => setSelectedProduct(p)}
                          className={`w-full p-4 flex items-center gap-4 text-left transition-colors ${
                            isDark ? "hover:bg-white/5" : "hover:bg-charcoal/5"
                          }`}
                        >
                          <img src={getAssetUrl(p.image)} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-charcoal"}`}>{p.name}</span>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className={`p-6 text-center text-xs italic ${isDark ? "text-white/20" : "text-charcoal/40"}`}>
                           No rituals match your query...
                        </div>
                      )}
                    </div>
                  )}
                  {/* Click outside to close dropdown if needed - using a simple overlay */}
                  {isSearchFocused && <div className="fixed inset-0 z-[105]" onClick={() => setIsSearchFocused(false)} />}
                </div>
              ) : (
                <div className={`p-5 rounded-3xl border flex items-center justify-between shadow-lg ${
                  isDark ? "bg-gold/5 border-gold/20" : "bg-gold/5 border-gold/10 shadow-gold/5"
                }`}>
                  <div className="flex items-center gap-5">
                     <div className="relative group">
                        <img src={getAssetUrl(selectedProduct.image)} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-2xl border-2 border-white/10" />
                        <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gold" : "text-gold"}`}>Selected Ritual</p>
                        <p className={`text-lg font-display font-bold mt-1 ${isDark ? "text-white" : "text-charcoal"}`}>{selectedProduct.name}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="px-4 py-2 bg-charcoal/5 hover:bg-gold/10 rounded-full transition-colors text-[10px] font-black uppercase tracking-widest text-gold"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* 2. Reviewer Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Customer Name</label>
                <input 
                  type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Mobile Number</label>
                <input 
                  type="text" value={userMobile} onChange={(e) => setUserMobile(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`}
                />
              </div>
            </div>

            {/* 3. Rating & Comment */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-95">
                          <Star size={24} className={s <= rating ? "fill-gold text-gold" : "text-white/10"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Helpful Count (Community)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={helpfulCount}
                    onChange={(e) => setHelpfulCount(parseInt(e.target.value) || 0)}
                    className={`w-full px-5 py-2.5 rounded-xl border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Chronicle Insight (Comment)</label>
                <textarea 
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  className={`w-full h-32 px-5 py-4 rounded-2xl border resize-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-charcoal/5 border-charcoal/10 text-charcoal"}`}
                />
              </div>
            </div>

            {/* 4. Images */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-charcoal/40"}`}>Visual Proof (Review Photos)</label>
                  <span className="text-[10px] font-bold text-gold">{existingImages.length + selectedFiles.length} / 4</span>
               </div>
               <div className="flex flex-wrap gap-4">
                  {/* Stored Database Images */}
                  {existingImages.map((img, i) => (
                    <div key={`stored-${i}`} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-gold/20 shadow-xl group">
                       <img src={getAssetUrl(img)} alt="" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-gold text-charcoal text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Stored</div>
                       <button 
                        onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-rose-500/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                       >
                         <Trash2 size={24} className="text-white" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-white mt-1">Remove Asset</span>
                       </button>
                    </div>
                  ))}

                  {/* Newly Selected Local Files */}
                  {selectedFiles.map((f, i) => (
                    <div key={`new-${i}`} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-xl group">
                       <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">New</div>
                       <button 
                        onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                       >
                         <X size={24} className="text-white" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-white mt-1">Discard</span>
                       </button>
                    </div>
                  ))}

                  {(existingImages.length + selectedFiles.length) < 4 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-28 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 ${
                        isDark ? "border-white/10 hover:border-gold/30 hover:bg-gold/5" : "border-charcoal/10 hover:border-gold/30 hover:bg-gold/5 shadow-inner"
                      }`}
                    >
                      <Plus size={24} className="text-gold" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-gold/40 mt-1">Add Visual</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageSelect} />
               </div>
            </div>

            {error && <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{error}</p>}
          </div>

          {/* Footer Actions */}
          <div className={`p-8 border-t flex items-center gap-4 ${isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"}`}>
            <button 
              onClick={onClose}
              className={`flex-1 py-4 font-black uppercase tracking-[0.2em] text-xs rounded-2xl border transition-all ${
                isDark ? "border-white/10 text-white/40 hover:text-white" : "border-charcoal/10 text-charcoal/40 hover:text-charcoal"
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="flex-[2] py-4 bg-gold text-charcoal rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-gold/20 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {(isSubmitting || isUploading) ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  {isEditing ? "Save Refinements" : "Authorize Chronicle"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminAddReviewModal;
