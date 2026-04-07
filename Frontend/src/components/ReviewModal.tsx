import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, Send, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
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
  onSuccess?: () => void;
}

const ReviewModal = ({ isOpen, onClose, product, user, orderNumber, onSuccess }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 4) {
        setError("You can share up to 4 moments of your ritual.");
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

        const response = await fetch(getApiUrl("/api/upload/"), {
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
      throw new Error("Failed to preserve images.");
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
      // 1. Upload images first
      const uploadedImageUrls = await uploadImages();

      // 2. Submit review
      const response = await fetch(getApiUrl("/api/reviews/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id.toString().trim(),
          userMobile: user.mobileNumber,
          userName: user.fullName,
          rating,
          comment,
          orderNumber,
          images: uploadedImageUrls,
          // Extract variant info if present in common naming patterns
          selectedVariant: product.name.includes("-") ? product.name.split("-")[1].trim() : "Original",
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        // Reset form
        setComment("");
        setRating(5);
        setSelectedFiles([]);
        setImages([]);
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (err: any) {
      setError(err.message || "We couldn't preserve your radiance right now. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-gold/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gold">
              <Sparkles size={16} />
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em]">Share Your Ritual</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-charcoal hover:bg-gold/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-8 space-y-8">
            {/* Product Meta */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-secondary/30 border border-gold/5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gold/5">
                <img src={getAssetUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest mb-1">Product</p>
                <h4 className="font-display text-lg font-bold text-charcoal leading-tight">{product.name}</h4>
              </div>
            </div>

            {/* Rating Selector */}
            <div className="space-y-4">
              <p className="text-center text-[10px] font-body font-bold text-charcoal uppercase tracking-[0.2em]">Select Your Rating</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="relative p-2"
                  >
                    <Star 
                      size={32} 
                      className={`transition-colors duration-300 ${
                        (hoveredRating || rating) >= star ? "fill-gold text-gold" : "text-border"
                      }`} 
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment Field */}
            <div className="space-y-3">
              <label className="text-[10px] font-body font-bold text-charcoal uppercase tracking-[0.2em] ml-1">Your Experience</label>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the texture, quality, and how it made you feel..."
                  className="w-full min-h-[140px] p-6 bg-[#faf9f6] border border-gold/10 rounded-3xl font-body text-sm outline-none focus:border-gold/30 transition-all resize-none"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-body font-bold text-charcoal uppercase tracking-[0.2em]">Add Photos</label>
                  <span className="text-[10px] font-body text-muted-foreground">{selectedFiles.length}/4</span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {/* Previews */}
                  {selectedFiles.map((file, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gold/10 group"
                    >
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-charcoal/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}

                  {/* Upload Button */}
                  {selectedFiles.length < 4 && (
                    <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gold/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gold/5 hover:border-gold/30 transition-all">
                      <Camera size={20} className="text-gold/60" />
                      <span className="text-[8px] font-bold text-gold/60 uppercase">Add</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageSelect} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>

              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-body font-bold text-rose-500 italic ml-1">{error}</motion.p>}
            </div>

            {/* Action */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className={`w-full py-5 bg-charcoal text-white rounded-full flex items-center justify-center gap-3 font-body font-bold text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl hover:bg-gold hover:text-charcoal ${
                isSubmitting || isUploading ? "opacity-50 cursor-not-allowed" : "active:scale-95 shadow-charcoal/20 shadow-xl"
              }`}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isUploading ? "Uploading Moments..." : "Preserving Ritual..."}
                </>
              ) : (
                <>
                  Preserve Feedback
                  <Send size={14} className="opacity-50" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
