import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Truck, RotateCcw, Shield, Minus, Plus, ShoppingBag, Heart, Star, Sparkles, Check, ChevronRight, Share2, Camera, MessageSquare, ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Product, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import ReviewModal from "@/components/ReviewModal";
import { useAuth } from "@/context/AuthContext";

const ProductDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const lastFetchedProductId = useRef<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setSelectedImage(0); // Reset image gallery on new product
      try {
        setLoading(true);
        // Cache busting: add timestamp to avoid stale API responses
        const url = getApiUrl(`/api/products/${id}?t=${Date.now()}`);
        console.log(`[DEBUG] Fetching product from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        console.log(`[DEBUG] Product data loaded:`, data);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("[DEBUG] Error fetching product, checking local data:", err);
        // Fallback: search local products array
        const localProduct = products.find(p => p.id === id || p._id === id);
        if (localProduct) {
          console.log(`[DEBUG] Found local fallback product:`, localProduct);
          setProduct(localProduct);
          setError(null);
        } else {
          setError("We couldn't find this specific treasure. It might have been curated by someone else.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const fetchReviews = async () => {
    if (!product) return;
    const productId = (product._id || product.id)?.toString();
    if (!productId) return;
    
    // Prevent redundant fetches if we already have reviews for this product
    if (lastFetchedProductId.current === productId && reviews.length > 0) {
      return; 
    }

    try {
      setReviewsLoading(true);
      // Cache busting: add timestamp to avoid stale API responses
      const url = getApiUrl(`/api/reviews/product/${productId}?t=${Date.now()}`);
      console.log(`[DEBUG] Fetching reviews from: ${url}`);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(`[DEBUG] Received ${data.length} reviews for ${productId}`);
        const validatedReviews = Array.isArray(data) ? data : [];
        setReviews(validatedReviews);
        lastFetchedProductId.current = productId;

        // NEW: Live Syncing - update product stats in local state based on actual reviews
        if (validatedReviews.length > 0 && product) {
          const totalRating = validatedReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          const avgRating = totalRating / validatedReviews.length;
          setProduct(prev => prev ? {
            ...prev,
            rating: avgRating,
            reviewCount: validatedReviews.length
          } : null);
        }
      } else {
        console.error(`[DEBUG] Reviews API failed: ${response.status}`);
      }
    } catch (err) {
      console.error("[DEBUG] Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product?.id, product?._id, activeTab]);
  useEffect(() => {
    const fetchRelatedAndAlsoViewed = async () => {
      if (!product) return;
        let data;
        try {
          const response = await fetch(getApiUrl("/api/products/"));
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error("API failed");
          }
        } catch (err) {
          console.error("Error fetching related items from API, using local data:", err);
          data = products;
        }

        const currentId = product?._id || product?.id;
        
        // Related: Same category, excluding current product (4 items)
        const related = data.filter((p: Product) => 
          p.category === product?.category && 
          (p._id || p.id) !== currentId
        ).slice(0, 4);
        setRelatedProducts(related);
    };

    fetchRelatedAndAlsoViewed();
  }, [product]);

  const isWishlisted = product ? isInWishlist(product._id || product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: quantity,
      selectedShade: product.shades ? product.shades[selectedShade] : undefined,
      selectedSize: product.sizes ? product.sizes[selectedSize] : undefined,
    });
    
    if (isWishlisted) {
      toggleWishlist(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-6" />
          <p className="font-display text-xl text-muted-foreground italic">Revealing product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    const isLegacyId = id && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].includes(id);
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <h2 className="font-display text-3xl text-foreground mb-4">Discovery Failed</h2>
          <p className="font-body text-muted-foreground mb-8">
            {isLegacyId 
              ? "This treasure has been moved to our live collection with a new identity. Your wishlist may need a small update."
              : error || "Product not found"}
          </p>
          <button onClick={() => navigate("/products")} className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all">
            Explore Live Collection
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const shadeColors: Record<string, string> = {
    "Rose Petal": "#d4818a", "Berry Crush": "#8b2252", "Nude Bliss": "#c9a68e", "Crimson Red": "#b22222",
    "Ivory": "#faf0e6", "Sand": "#deb887", "Honey": "#d4a017", "Caramel": "#a0522d", "Mocha": "#6b4226", "Espresso": "#3c1414",
    "Cherry": "#de3163", "Blush": "#f5c6cb", "Nude": "#d2b48c", "Plum": "#8e4585", "Coral": "#ff7f50",
    "Blonde": "#f0d5a0", "Brunette": "#7b5b3a", "Dark Brown": "#4a3728", "Black": "#1a1a1a",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <nav className="text-[10px] md:text-sm font-body text-muted-foreground mb-4 md:mb-6 uppercase tracking-widest flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-gold transition-colors opacity-70 hover:opacity-100">Home</Link>
          <span className="opacity-30">/</span>
          <Link 
            to={`/products?category=${product.category?.toLowerCase()}`} 
            className="hover:text-gold transition-colors opacity-70 hover:opacity-100"
          >
            {product.category || "Collection"}
          </Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground opacity-90">{product.name || "Treasure Detail"}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row gap-5 xl:gap-8 items-start w-full"
          >
            {/* Desktop Vertical Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-16 xl:w-20">
                <div 
                  id="thumbnail-list" 
                  className="flex flex-col gap-3 overflow-y-auto max-h-[500px] scrollbar-hide scroll-smooth py-1 px-1 w-full"
                >
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-full aspect-square rounded-xl overflow-hidden border transition-all duration-300 ${
                        selectedImage === idx ? "border-charcoal shadow-md scale-105" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={getAssetUrl(img)} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {/* Scroll Controls */}
                <div className="flex flex-col gap-1 mt-3">
                  <button 
                    onClick={() => document.getElementById('thumbnail-list')?.scrollBy({ top: -100, behavior: 'smooth' })}
                    className="p-1 rounded-full text-muted-foreground/60 hover:text-charcoal transition-colors hover:bg-gold/5"
                  >
                    <ChevronUp size={20} className="mx-auto" strokeWidth={1.5} />
                  </button>
                  <button 
                    onClick={() => document.getElementById('thumbnail-list')?.scrollBy({ top: 100, behavior: 'smooth' })}
                    className="p-1 rounded-full text-muted-foreground/60 hover:text-charcoal transition-colors hover:bg-gold/5"
                  >
                    <ChevronDown size={20} className="mx-auto" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Main Image */}
            <div className="w-full flex-1 aspect-square rounded-[2rem] overflow-hidden bg-[#faf9f6] cursor-zoom-in group relative shadow-lg border border-gold/5">
              <img
                src={getAssetUrl(product.images?.[selectedImage] || product.image)}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-[1.35] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center bg-white"
              />
            </div>
            
            {/* Mobile Horizontal Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex sm:hidden gap-3 overflow-x-auto w-full pb-2 pt-4 scrollbar-hide">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border transition-all duration-300 flex-shrink-0 ${
                      selectedImage === idx ? "border-charcoal shadow-sm" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={getAssetUrl(img)} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-body font-bold text-gold uppercase tracking-[0.2em] mb-1">{product.brand}</p>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product?.rating || 0) ? "fill-gold text-gold" : "text-border"} />
                ))}
              </div>
              <span className="text-sm font-body text-muted-foreground">
                {product?.rating || "New"} ({product?.reviewCount?.toLocaleString() || "0"} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-body text-2xl md:text-3xl font-bold text-foreground">₹{product?.price?.toLocaleString() || "TBD"}</span>
              {product?.originalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-lg text-muted-foreground line-through font-body">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-xs font-body font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{product.discount || "10"}% OFF</span>
                </div>
              )}
            </div>

            <p className="text-xs font-body text-muted-foreground">Inclusive of all taxes</p>

            {/* Offer */}
            {product.discount && product.discount >= 25 && (
              <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
                <p className="text-sm font-body text-gold font-medium">
                  🎉 Use code <span className="font-bold">EXTRA10</span> for additional 10% off
                </p>
              </div>
            )}

            {/* Shades */}
            {product.shades && (
              <div>
                <p className="text-sm font-body font-medium text-foreground mb-3">
                  Shade: <span className="text-muted-foreground">{product.shades[selectedShade]}</span>
                </p>
                <div className="flex items-center gap-2">
                  {product.shades.map((shade: string, i: number) => (
                    <button
                      key={shade}
                      onClick={() => setSelectedShade(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        i === selectedShade ? "border-gold scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: shadeColors[shade] || "#ccc" }}
                      title={shade}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && (
              <div>
                <p className="text-sm font-body font-medium text-foreground mb-3">Size</p>
                <div className="flex items-center gap-2">
                  {product.sizes.map((size: string, i: number) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(i)}
                      className={`px-4 py-2 text-sm font-body rounded-md border transition-colors ${
                        i === selectedSize ? "border-gold bg-gold/10 text-gold font-medium" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between border border-border rounded-xl bg-secondary/30">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 text-muted-foreground hover:text-foreground transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-6 text-base font-body font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-4 text-muted-foreground hover:text-foreground transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-body font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-gold transition-all shadow-xl shadow-primary/10 active:scale-95"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
                <button 
                  onClick={() => product && toggleWishlist(product)}
                  className={`p-4 border rounded-xl transition-all active:scale-95 ${
                    isWishlisted ? "bg-rose/10 border-rose text-rose" : "border-border text-muted-foreground hover:text-rose hover:border-rose bg-secondary/30"
                  }`}
                >
                  <Heart size={20} className={isWishlisted ? "fill-rose" : ""} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleBuyNow}
              className="w-full py-4 bg-gold text-primary font-body font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 active:scale-95"
            >
              Buy Now
            </button>

            {/* Policies */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center space-y-1">
                <Truck size={20} className="mx-auto text-gold" />
                <p className="text-xs font-body text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center space-y-1">
                <RotateCcw size={20} className="mx-auto text-gold" />
                <p className="text-xs font-body text-muted-foreground">7-Day Returns</p>
              </div>
              <div className="text-center space-y-1">
                <Shield size={20} className="mx-auto text-gold" />
                <p className="text-xs font-body text-muted-foreground">100% Authentic</p>
              </div>
            </div>

            <p className="text-sm font-body text-muted-foreground">
              📦 Expected delivery: <span className="text-foreground font-medium">3–5 business days</span>
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-12 md:mt-20">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-border -mx-4 px-4 md:mx-0 md:px-0">
            {["description", "ingredients", "how to use", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-4 text-[10px] md:text-xs font-body font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="py-8 max-w-3xl">
            {activeTab === "description" && (
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {product.description || "A premium product from Luscent Glow, crafted with the finest ingredients for a luxurious experience. Our commitment to quality ensures that every product meets the highest standards of excellence."}
              </p>
            )}
            {activeTab === "ingredients" && (
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {product.ingredients || "Please refer to the product packaging for the complete list of ingredients. All Luscent Glow products are cruelty-free and dermatologically tested."}
              </p>
            )}
            {activeTab === "how to use" && (
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {product.howToUse || "Follow the instructions on the product packaging for best results. For detailed application tips, visit our blog."}
              </p>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-12">
                {/* 1. Header/Summary Row */}
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 border-b border-border pb-6">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold text-charcoal tracking-tight uppercase">Rating & Reviews</h2>
                    <p className="text-[10px] font-body text-muted-foreground uppercase tracking-widest font-bold">
                      {product?.reviewCount || 0} Chronicles of Radiance
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-8 py-3 bg-charcoal text-white rounded-full font-body font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gold hover:text-charcoal transition-all shadow-xl shadow-charcoal/10"
                  >
                    Initiate Review
                  </button>
                </div>

                {/* 2. Enhanced Customer Gallery Strip */}
                {reviews.some(r => r.images && r.images.length > 0) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-display font-bold text-charcoal tracking-tight">Photos From Customers</h3>
                      <button className="text-[10px] font-body font-bold text-gold uppercase tracking-widest flex items-center gap-1 hover:underline">
                        Explore Gallery <ChevronRight size={12} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                      {reviews.flatMap(r => r.images || []).map((img, idx) => (
                        <motion.div 
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="relative flex-none w-24 h-24 rounded-xl overflow-hidden border border-gold/10 shadow-sm cursor-pointer"
                        >
                          <img src={getAssetUrl(img)} alt="Customer Ritual" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gold/5 hover:bg-transparent transition-colors" />
                        </motion.div>
                      ))}
                      {/* Overflow marker to simulate scale */}
                      <div className="relative flex-none w-24 h-24 rounded-xl overflow-hidden bg-charcoal flex flex-col items-center justify-center text-center p-2 cursor-pointer group">
                        <span className="text-white text-xs font-bold font-display">+875</span>
                        <span className="text-white/60 text-[8px] font-body font-bold uppercase tracking-widest leading-tight">more</span>
                        <div className="absolute inset-0 border border-white/20 group-hover:border-gold/50 transition-colors rounded-xl" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Proper Unified Reviews List */}
                <div className="space-y-8">
                  {reviewsLoading ? (
                    <div className="flex flex-col items-center py-24 gap-4 bg-secondary/10 rounded-[3rem]">
                      <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                      <p className="text-[10px] font-body text-muted-foreground uppercase tracking-widest font-bold">Consulting the Chronicles...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-10">
                      {reviews.map((review, i) => (
                        <motion.div 
                          key={review.id || review._id || i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(i * 0.1, 0.5) }}
                          className="bg-white rounded-[2rem] border border-gold/5 p-8 md:p-10 shadow-sm hover:shadow-xl hover:shadow-charcoal/[0.02] transition-all"
                        >
                          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                            {/* User Column */}
                            <div className="md:w-56 flex flex-row md:flex-col items-center md:items-start gap-5 flex-none">
                              <div className={`w-20 h-20 rounded-full flex items-center justify-center font-display text-2xl font-black shadow-inner border-2 border-white ${
                                ['bg-[#FDF2F2] text-[#F05252]', 'bg-[#F2F8FB] text-[#2D89EF]', 'bg-[#F3FAF7] text-[#0E9F6E]', 'bg-[#FFFAF0] text-[#D03801]'][i % 4]
                              }`}>
                                {review.userName?.charAt(0).toUpperCase() || "S"}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-display font-bold text-charcoal leading-none mb-1">{review.userName || "Radiant Customer"}</h4>
                                <div className="flex items-center gap-1.5 text-[#0E9F6E] bg-[#DEF7EC] px-3 py-1 rounded-full w-fit">
                                  <Check size={10} className="stroke-[3px]" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.05em]">Verified Buyers</span>
                                </div>
                              </div>
                            </div>

                            {/* Chronicle Content Column */}
                            <div className="flex-1 space-y-6">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-[#0E9F6E] text-white px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-black">
                                      {review.rating || 5} <Star size={10} className="fill-white" />
                                    </div>
                                    <span className="text-[10px] font-body text-charcoal/40 font-bold uppercase tracking-widest">
                                      {new Date(review.createdAt || Date.now()).toLocaleDateString("en-GB")}
                                    </span>
                                  </div>
                                </div>
                                
                                {review.selectedVariant && (
                                  <p className="text-[12px] font-body text-charcoal/60">
                                    Shade: <span className="w-2.5 h-2.5 rounded-full bg-gold/40 inline-block align-middle mr-1.5" /> 
                                    <span className="font-bold text-charcoal">{review.selectedVariant}</span>
                                  </p>
                                )}
                              </div>

                              <div className="space-y-3">
                                <h5 className="font-display font-bold text-charcoal italic text-base">"{review.comment.split('.')[0]}..."</h5>
                                <p className="text-[15px] font-body text-charcoal/80 leading-relaxed text-justify pr-4">
                                  {review.comment}
                                  {review.comment.length > 200 && <button className="text-charcoal font-black ml-2 hover:text-gold transition-colors">Read More</button>}
                                </p>
                              </div>

                              {/* Individual Review Images */}
                              {review.images && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-3 pt-2">
                                  {review.images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="w-24 h-24 rounded-xl overflow-hidden border border-gold/10 hover:border-gold/40 transition-all cursor-zoom-in">
                                      <img src={getAssetUrl(img)} alt="Chronicle" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Engagement Loop */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-gold/5">
                                <button className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-charcoal/5 rounded-lg hover:border-gold/30 hover:bg-gold/5 transition-all group w-fit">
                                  <ThumbsUp size={16} className="text-charcoal/40 group-hover:text-gold" />
                                  <span className="font-body font-bold text-xs text-charcoal group-hover:text-gold">Helpful</span>
                                </button>
                                <p className="text-[11px] font-body text-charcoal/40 font-bold">
                                  <span className="text-charcoal pr-1">{review.helpfulCount || 58} people</span> found this helpful
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 px-8 bg-secondary/15 rounded-[4rem] border-2 border-dashed border-gold/10">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gold/30 shadow-inner">
                        <MessageSquare size={32} />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-charcoal mb-3 italic">Be the First Chronicler</h3>
                      <p className="text-sm font-body text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
                        Share your unique ritual and guide others on their journey to radiance.
                      </p>
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-12 py-5 bg-charcoal text-white rounded-full font-body font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-gold hover:text-charcoal transition-all shadow-2xl shadow-charcoal/10"
                      >
                        Initiate First Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((p) => <ProductCard key={p._id || p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />

      {/* Review Modal */}
      {product && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={{
            id: (product._id || product.id).toString(),
            name: product.name,
            image: product.image
          }}
          user={{
            fullName: user?.fullName || user?.email?.split('@')[0] || "A Radiant Customer",
            mobileNumber: user?.mobileNumber || "9100000000"
          }}
          onSuccess={() => {
            fetchReviews();
            // Also refresh product to update rating count
            window.location.reload(); 
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;
