import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, Send, Camera, Image as ImageIcon, Loader2, Plus, Info } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image: string;
  };
  user: {
    mobileNumber: string;
    fullName: string;
  };
  orderNumber?: string;
  existingReview?: any;
  onSuccess?: () => void;
}

const ReviewModal = ({ isOpen, onClose, product, user, orderNumber, existingReview, onSuccess }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with existingReview when modal opens or review changes
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating || 5);
        setTitle(existingReview.title || "");
        setComment(existingReview.comment || "");
      } else {
        setRating(5);
        setTitle("");
        setComment("");
      }
      setSelectedFiles([]);
      setError(null);
    }
  }, [isOpen, existingReview]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 4) {
        setError("You can share up to 4 moments of your look.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);
      setError(null);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(getApiUrl("/api/upload"), {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }
      return uploadedUrls;
    } catch (err) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please share your thoughts with us.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const uploadedImageUrls = await uploadImages();
      
      const reviewId = existingReview?.id || existingReview?._id;
      const url = reviewId ? getApiUrl(`/api/reviews/${reviewId}`) : getApiUrl("/api/reviews/");
      const method = reviewId ? "PUT" : "POST";

      const payload: any = {
        productId: product.id.toString().trim(),
        productName: product.name,
        userMobile: user.mobileNumber,
        userName: user.fullName,
        rating,
        title,
        comment,
        orderNumber,
        selectedVariant: product.name.includes("-") ? product.name.split("-")[1].trim() : "Original",
        createdAt: existingReview?.createdAt || new Date().toISOString()
      };

      // Only add new images if they were uploaded
      if (uploadedImageUrls.length > 0) {
        payload.images = [...(existingReview?.images || []), ...uploadedImageUrls];
      } else {
        payload.images = existingReview?.images || [];
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        if (!reviewId) {
          setTitle("");
          setComment("");
          setRating(5);
          setSelectedFiles([]);
        }
      } else {
        throw new Error(`Failed to ${reviewId ? "update" : "submit"} review`);
      }
    } catch (err: any) {
      setError(err.message || "We couldn't process your review right now. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!(existingReview?.id || existingReview?._id);

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
          className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Close Action */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-charcoal hover:bg-muted rounded-full transition-all z-20"
          >
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Professional Header */}
            <div className="px-8 pt-12 pb-8 text-center space-y-2">
              <h2 className="text-3xl font-display font-bold text-charcoal">
                {isEditing ? "Edit Your Review" : "Write a Review"}
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">
                {isEditing ? "Refine your ritual story" : "Share your ritual experience"}
              </p>
            </div>

            {/* Product Archival Tag */}
            <div className="px-8 pb-10">
              <div className="p-4 rounded-2xl border border-gold/10 bg-gold/[0.02] flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-white border border-border p-1 flex-shrink-0">
                  <img src={getAssetUrl(product.image)} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <p className="text-[9px] text-gold font-bold uppercase tracking-widest">Selected Item</p>
                  <h4 className="text-sm font-bold text-charcoal leading-tight truncate">{product.name}</h4>
                </div>
              </div>
            </div>

            {/* Content Form */}
            <div className="px-8 pb-32 space-y-10">
              
              {/* Rating Control */}
              <div className="space-y-4 text-center">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star 
                        size={36} 
                        className={`transition-all duration-300 ${
                          (hoveredRating || rating) >= star 
                            ? "fill-gold text-gold scale-110" 
                            : "text-gray-200"
                        }`} 
                        strokeWidth={(hoveredRating || rating) >= star ? 0 : 1.5}
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                   <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-1">
                      Ritual Rating: {rating} / 5
                   </p>
                )}
              </div>

              {/* Input Tier */}
              <div className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 group-focus-within:text-gold transition-colors">Heading</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g. Ethereal texture..."
                      className="w-full px-5 py-4 bg-white border border-border rounded-xl text-sm outline-none focus:border-gold/50 focus:ring-1 ring-gold/10 transition-all font-medium placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 group-focus-within:text-gold transition-colors">Detail</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the radiance of this selection..."
                    className="w-full min-h-[120px] px-5 py-4 bg-white border border-border rounded-xl text-sm outline-none focus:border-gold/50 focus:ring-1 ring-gold/10 transition-all font-medium resize-none placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">Add Moments</h4>
                    <p className="text-[10px] text-muted-foreground font-medium italic">Share your look with the collective</p>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-md">
                    {selectedFiles.length + (existingReview?.images?.length || 0)} / 4
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Existing Review Images */}
                  {existingReview?.images?.slice(0, 4).map((imgUrl: string, idx: number) => (
                    <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gold/10 shadow-sm bg-gold/[0.02]">
                      <img src={getAssetUrl(imgUrl)} alt="Existing" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="px-1.5 py-0.5 bg-gold/80 text-[6px] text-white font-bold uppercase rounded-sm">Shared</div>
                      </div>
                    </div>
                  ))}

                  <AnimatePresence>
                    {selectedFiles.map((file, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-border shadow-sm group"
                      >
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(selectedFiles.length + (existingReview?.images?.length || 0)) < 4 && (
                    <motion.button 
                      whileHover={{ backgroundColor: "rgba(182, 143, 76, 0.05)", borderColor: "rgba(182, 143, 76, 0.4)" }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 transition-all group"
                    >
                      <Plus size={20} className="text-muted-foreground group-hover:text-gold transition-colors" />
                    </motion.button>
                  )}
                  <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                </div>
                
                {error && <p className="text-[9px] font-bold text-destructive uppercase tracking-widest">{error}</p>}
              </div>

              {/* Professional Disclosure */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                <div className="p-1.5 bg-white rounded-lg border border-border text-gold">
                  <Info size={12} />
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                  Note: Your ritual story will be curated by our experts before joining the gallery. Thank you for contributing to our collective radiance.
                </p>
              </div>
            </div>
          </div>

          {/* Proper Submission Footer */}
          <div className="px-8 py-6 bg-white border-t flex items-center justify-between gap-6 z-30">
            <button
               onClick={handleSubmit}
               disabled={isSubmitting || isUploading}
               className={`flex-1 py-4 bg-charcoal text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn ${
                 isSubmitting || isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gold hover:text-charcoal shadow-xl shadow-charcoal/5"
               }`}
            >
              <div className="flex items-center justify-center gap-3">
                {(isSubmitting || isUploading) ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-gold" />
                    <span className="animate-pulse">{isUploading ? "Uploading..." : "Updating..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isEditing ? "Update Review" : "Submit Review"}</span>
                    <Send size={14} className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </>
                )}
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
