import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Truck, RotateCcw, Shield, Minus, Plus, ShoppingBag, Heart, Star, Sparkles, Check, ChevronRight, Share2, Camera, MessageSquare, ChevronDown, ChevronUp, ThumbsUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product, products } from "@/data/products";
import SEO from "@/components/SEO";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import ReviewModal from "@/components/ReviewModal";
import CustomerGalleryModal from "@/components/CustomerGalleryModal";
import { useAuth } from "@/context/AuthContext";

const ProductDetail = () => {
  const { user, isAdminAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedPromotion, setAppliedPromotion] = useState<any | null>(null);
  
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

  // Gallery Sanctuary States
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [variantImageOverride, setVariantImageOverride] = useState<string | null>(null);

  // Aggregate all customer images for the sanctuary
  const allCustomerImages = reviews.flatMap(r => r.images || []);

  const parseDiscount = (text: string): number => {
    if (!text) return 0;
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  // Dynamic Option Extraction - Priority to Variations
  const variantShades = [...new Set((product?.variants || []).map(v => v.color).filter(Boolean).filter(s => s !== null && s !== ""))];
  const variantSizes = [...new Set((product?.variants || []).map(v => v.size).filter(Boolean).filter(s => s !== null && s !== ""))];

  const displayShades = variantShades.length > 0 
    ? variantShades 
    : (product?.shades && product.shades.length > 0 ? product.shades : []);
    
  const displaySizes = variantSizes.length > 0
    ? variantSizes
    : (product?.sizes && product.sizes.length > 0 ? product.sizes : []);

  // Variant Resolution Logic
  const getActiveVariant = () => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    
    // Safety check for indices
    const safeShadeIndex = selectedShade >= displayShades.length ? 0 : selectedShade;
    const safeSizeIndex = selectedSize >= displaySizes.length ? 0 : selectedSize;

    const selectedShadeLabel = displayShades.length > 0 ? displayShades[safeShadeIndex] : null;
    const selectedSizeLabel = displaySizes.length > 0 ? displaySizes[safeSizeIndex] : null;

    return product.variants.find((v: any) => {
      // If a label exists in our display list, it MUST match the variation field
      const matchShade = !selectedShadeLabel || v.color === selectedShadeLabel;
      const matchSize = !selectedSizeLabel || v.size === selectedSizeLabel;
      return matchShade && matchSize;
    }) || null;
  };

  const activeVariant = getActiveVariant();

  const openGallery = (index: number = 0) => {
    setCurrentGalleryIndex(index);
    setIsGalleryModalOpen(true);
  };

  // ─── Effects ─────────────────────────────────────────────────────────────

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
          setError("We couldn't find this product. It may have been moved or removed.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const fetchReviews = async (force: boolean = false) => {
    if (!product) return;
    const productId = (product._id || product.id)?.toString();
    if (!productId) return;
    
    // Allow force refresh for live updates after submission
    if (!force && lastFetchedProductId.current === productId && reviews.length > 0) {
      return; 
    }

    try {
      setReviewsLoading(true);
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

  useEffect(() => {
    const fetchAppliedPromotion = async () => {
      if (!product) return;
      const promoId = activeVariant?.appliedPromotionId || product?.appliedPromotionId;
      if (promoId) {
        try {
          const response = await fetch(getApiUrl(`/api/promotions/`));
          if (response.ok) {
            const allPromos = await response.json();
            const found = allPromos.find((p: any) => p._id === promoId);
            if (found) setAppliedPromotion(found);
            else setAppliedPromotion(null);
          }
        } catch (err) {
          console.error("Error fetching applied promotion:", err);
        }
      } else {
        setAppliedPromotion(null);
      }
    };
    fetchAppliedPromotion();
  }, [product, activeVariant]);

  // Variant Image Logic: Update gallery source when variant changes
  const [variantImages, setVariantImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (activeVariant?.images && activeVariant.images.length > 0) {
      setVariantImages(activeVariant.images);
      setSelectedImage(0); // Reset focal point to first variant image
      setVariantImageOverride(null); // Clear single override logic
    } else if (activeVariant?.image) {
      setVariantImageOverride(activeVariant.image);
      setVariantImages(null);
    } else {
      setVariantImageOverride(null);
      setVariantImages(null);
    }
  }, [activeVariant?.id, activeVariant?.images, activeVariant?.image]);

  // Guards for initial loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-6" />
          <p className="font-display text-xl text-muted-foreground italic">Loading product details...</p>
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
          <h2 className="font-display text-3xl text-foreground mb-4">Product Not Found</h2>
          <p className="font-body text-muted-foreground mb-8">
            {isLegacyId 
              ? "This product has been updated. Please search for it again."
              : error || "Product not found"}
          </p>
          <button onClick={() => navigate("/products")} className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all">
            Browse Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // After this point, 'product' is guaranteed to be non-null
  const isWishlisted = isInWishlist(product._id || product.id);

  const displayImages = variantImages || (product.images && product.images.length > 0 ? product.images : [product.image]);

  // Prices are calculated here once product is guaranteed, but the logic is now moved higher to avoid scoping issues.
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayOriginalPrice = product.originalPrice;
  const displayDiscount = (activeVariant && activeVariant.originalPrice && activeVariant.originalPrice > 0)
    ? Math.round(((activeVariant.originalPrice - activeVariant.price) / activeVariant.originalPrice) * 100)
    : product.discount;

  const promoPrice = appliedPromotion 
    ? Math.round((activeVariant?.price || product.price) * (1 - parseDiscount(appliedPromotion.discountText) / 100))
    : null;

  // Stock status logic
  const stockCount = activeVariant ? (activeVariant.stock ?? 0) : 10; // Default to 10 if no variant (unmanaged)
  const isOutOfStock = activeVariant ? stockCount === 0 : false;
  const isLowStock = !isOutOfStock && stockCount > 0 && stockCount <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product) return;
    addItem({
      id: product._id || product.id,
      name: product.name,
      price: promoPrice || displayPrice || 0,
      image: product.image,
      category: product.category,
      quantity: quantity,
      selectedShade: activeVariant?.color || (product.shades ? product.shades[selectedShade] : undefined),
      selectedSize: activeVariant?.size || (product.sizes ? product.sizes[selectedSize] : undefined),
    });
    
    if (isWishlisted) {
      toggleWishlist(product);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    const directBuyItem = {
      id: product._id || product.id,
      name: product.name,
      price: promoPrice || displayPrice || product.price,
      image: product.image,
      category: product.category,
      quantity: quantity,
      selectedShade: activeVariant?.color || (product.shades ? product.shades[selectedShade] : undefined),
      selectedSize: activeVariant?.size || (product.sizes ? product.sizes[selectedSize] : undefined),
    };
    navigate("/checkout", { state: { directBuyItem } });
  };


  const productSEO = (product as any)?.seo?.title?.trim() ? (product as any).seo : {
    title: product ? `${product.name} | ${product.brand} | Luscent Glow` : "Product Details | Luscent Glow",
    description: product ? product.description?.substring(0, 160) : "Discover our premium botanical skincare ritual.",
    ogImage: product?.image,
    keywords: product?.tags?.join(", ") || "skincare, beauty, botanical"
  };

  const shadeColors: Record<string, string> = {
    "Rose Petal": "#d4818a", "Berry Crush": "#8b2252", "Nude Bliss": "#c9a68e", "Crimson Red": "#b22222",
    "Ivory": "#faf0e6", "Sand": "#deb887", "Honey": "#d4a017", "Caramel": "#a0522d", "Mocha": "#6b4226", "Espresso": "#3c1414",
    "Cherry": "#de3163", "Blush": "#f5c6cb", "Nude": "#d2b48c", "Plum": "#8e4585", "Coral": "#ff7f50",
    "Blonde": "#f0d5a0", "Brunette": "#7b5b3a", "Dark Brown": "#4a3728", "Black": "#1a1a1a",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO seo={productSEO} />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <nav className="text-[10px] md:text-sm font-body font-bold text-muted-foreground mb-4 md:md-6 tracking-widest flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-gold transition-colors opacity-70 hover:opacity-100">Home</Link>
          <span className="opacity-30">/</span>
          <Link 
            to={`/products?category=${(product.category || "Collection").toLowerCase()}`} 
            className="hover:text-gold transition-colors opacity-70 hover:opacity-100"
          >
            {product.category || "Collection"}
          </Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground opacity-90">{product.name || "Product Details"}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row gap-5 xl:gap-8 items-start w-full"
          >
            {/* Desktop Vertical Thumbnails */}
            {displayImages && displayImages.length > 1 && (
              <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-16 xl:w-20">
                <div 
                  id="thumbnail-list" 
                  className="flex flex-col gap-3 overflow-y-auto max-h-[500px] scrollbar-hide scroll-smooth py-1 px-1 w-full"
                >
                  {displayImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(idx);
                        setVariantImageOverride(null);
                      }}
                      className={`relative w-full aspect-square rounded-xl overflow-hidden border transition-all duration-300 ${
                        selectedImage === idx && !variantImageOverride ? "border-charcoal shadow-md scale-105" : "border-transparent opacity-50 hover:opacity-100"
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
                src={getAssetUrl(variantImageOverride || displayImages?.[selectedImage] || product.image)}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-[1.35] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center bg-white"
              />
            </div>
            
            {/* Mobile Horizontal Thumbnails */}
            {displayImages && displayImages.length > 1 && (
              <div className="flex sm:hidden gap-3 overflow-x-auto w-full pb-2 pt-4 scrollbar-hide">
                {displayImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(idx);
                    setVariantImageOverride(null);
                  }}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border transition-all duration-300 flex-shrink-0 ${
                    selectedImage === idx && !variantImageOverride ? "border-charcoal shadow-sm" : "border-transparent opacity-50 hover:opacity-100"
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

            {/* Price section with Stock Badge */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-baseline gap-3 flex-wrap">
                {promoPrice ? (
                  <>
                    <span className="font-body text-2xl md:text-3xl font-bold text-foreground">₹{(promoPrice ?? 0).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base md:text-lg text-muted-foreground line-through font-body opacity-50">₹{(displayOriginalPrice || displayPrice || 0).toLocaleString()}</span>
                      <span className="text-xs font-body font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{parseDiscount(appliedPromotion?.discountText ?? "0")}% OFF</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-body text-2xl md:text-3xl font-bold text-foreground">₹{(displayPrice ?? 0).toLocaleString()}</span>
                    {displayOriginalPrice && displayOriginalPrice > (displayPrice ?? 0) && (
                      <div className="flex items-center gap-2">
                        <span className="text-base md:text-lg text-muted-foreground line-through font-body">₹{displayOriginalPrice.toLocaleString()}</span>
                        {displayDiscount && displayDiscount > 0 && (
                          <span className="text-xs font-body font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{displayDiscount}% OFF</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Status Badge */}
              {isOutOfStock && (
                <div className="px-4 py-1.5 rounded-full bg-rose/10 border border-rose/20 backdrop-blur-md flex items-center gap-2 animate-pulse-slow">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose" />
                  <span className="text-[10px] font-bold text-rose uppercase tracking-[0.1em]">OUT OF STOCK</span>
                </div>
              )}
            </div>

            <p className="text-xs font-body text-muted-foreground">Inclusive of all taxes</p>

            {/* Offer */}
            {appliedPromotion ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold/10 border border-gold/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl -mr-8 -mt-8" />
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold shadow-lg flex-shrink-0">
                  <Zap size={20} className="fill-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{appliedPromotion.subtitle || "EXCLUSIVE OFFER"}</span>
                    <span className="w-1 h-1 rounded-full bg-gold/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{appliedPromotion.discountText}</span>
                  </div>
                  <h4 className="text-sm font-display font-bold text-charcoal leading-tight mt-1">{appliedPromotion.title}</h4>
                </div>
              </motion.div>
            ) : (product.discount && product.discount >= 25) ? (
              <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
                <p className="text-sm font-body text-gold font-medium">
                  🎉 Use code <span className="font-bold">EXTRA10</span> for additional 10% off
                </p>
              </div>
            ) : null}

            {/* Shades */}
            {displayShades.length > 0 && (
              <div>
                <p className="text-sm font-body font-medium text-foreground mb-3">
                  Shade: <span className="text-muted-foreground">{displayShades[selectedShade]}</span>
                </p>
                <div className="flex items-center gap-2">
                  {displayShades.map((shade: any, i: number) => (
                    <button
                      key={shade}
                      onClick={() => setSelectedShade(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        i === selectedShade ? "border-gold scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: (shadeColors as any)[shade] || "#ccc" }}
                      title={shade}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {displaySizes.length > 0 && (
              <div>
                <p className="text-sm font-body font-medium text-foreground mb-3">Size</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {displaySizes.map((size: any, i: number) => (
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

            {/* Low Stock Indicator */}
            {isLowStock && (
              <div className="bg-gold/5 border border-gold/10 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-gold/10">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs font-body font-bold text-gold uppercase tracking-[0.1em]">Limited Supply</p>
                  <p className="text-sm font-body text-muted-foreground">Only {stockCount} items left in the sanctuary. Complete your ritual before they vanish.</p>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className={`flex items-center justify-between border border-border rounded-xl bg-secondary/30 ${isOutOfStock ? 'opacity-30 pointer-events-none' : ''}`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  disabled={isOutOfStock}
                  className="p-4 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                <span className="px-6 text-base font-body font-bold">{isOutOfStock ? 0 : quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  disabled={isOutOfStock}
                  className="p-4 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <button 
                  onClick={(e) => handleAddToCart(e)}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-body font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl active:scale-95 ${
                    isOutOfStock 
                      ? "bg-secondary text-muted-foreground cursor-not-allowed shadow-none" 
                      : "bg-primary text-primary-foreground hover:bg-gold shadow-primary/10"
                  }`}
                >
                  <ShoppingBag size={18} /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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

            {!isOutOfStock && (
              <button 
                onClick={handleBuyNow}
                className="w-full py-4 bg-gold text-primary font-body font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 active:scale-95"
              >
                Buy Now
              </button>
            )}

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
              <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description || "No description available for this ritual."}
              </p>
            )}
            {activeTab === "ingredients" && (
              <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.ingredients || "Ingredients are listed on the physical packaging. For sensitive skin, we recommend a patch test."}
              </p>
            )}
            {activeTab === "how to use" && (
              <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.howToUse || "Follow the application ritual specified on the product vessel for optimal radiance."}
              </p>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-12">
                {/* 1. Enhanced Summary & CTA Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-secondary/15 p-8 rounded-[2rem] border border-gold/5">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      {/* Calculate live stats from the fetched reviews array instead of potentially stale product field */}
                      <div className="text-4xl font-display font-black text-charcoal">
                        {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) : (product?.rating?.toFixed(1) || "5.0")}
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => {
                          const avg = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) : (product?.rating || 5);
                          return (
                            <Star key={i} size={12} className={i < Math.floor(avg) ? "fill-gold text-gold" : "text-border"} />
                          );
                        })}
                      </div>
                      <div className="text-[9px] font-body text-muted-foreground uppercase tracking-widest mt-2">{reviews.length > 0 ? reviews.length : (product?.reviewCount || 0)} Ratings</div>
                    </div>
                    
                    <div className="h-16 w-px bg-gold/10 hidden sm:block" />

                    {/* Star Bars - Nykaa Style */}
                    <div className="flex flex-col gap-1.5 w-40 sm:w-60">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.length > 0 ? reviews.filter(r => r.rating === star).length : 0;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-8">
                              <span className="text-[10px] font-body font-bold text-charcoal">{star}</span>
                              <Star size={8} className="fill-charcoal/30 text-charcoal/30" />
                            </div>
                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-gold/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className={`h-full ${star >= 4 ? "bg-[#0E9F6E]" : star === 3 ? "bg-gold" : "bg-destructive"}`} 
                              />
                            </div>
                            <span className="text-[9px] font-body text-muted-foreground w-6">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div />
                </div>

                {/* 2. Enhanced Customer Gallery Strip */}
                {reviews.some(r => r.images && r.images.length > 0) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-display font-bold text-charcoal tracking-tight">Photos From Customers</h3>
                      <button 
                        onClick={() => openGallery(0)}
                        className="text-[10px] font-body font-bold text-gold uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        Explore Gallery <ChevronRight size={12} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                      {allCustomerImages.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => openGallery(idx)}
                          className="relative flex-none w-24 h-24 rounded-xl overflow-hidden border border-gold/10 shadow-sm cursor-pointer"
                        >
                          <img src={getAssetUrl(img)} alt="Customer Photo" className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Nykaa-Style Reviews List */}
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="flex flex-col items-center py-12 gap-3 bg-secondary/10 rounded-2xl">
                      <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                      <p className="text-[9px] font-body text-muted-foreground uppercase tracking-widest font-bold">Loading Reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, i) => (
                        <motion.div 
                          key={review.id || review._id || i}
                          initial={{ opacity: 0, y: 5 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(i * 0.05, 0.2) }}
                          className="bg-white rounded-xl border border-charcoal/5 p-4 md:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                        >
                          <div className="flex flex-col gap-4">
                            {/* Evaluation Header - Proper Nykaa Style */}
                            <div className="flex items-center justify-between border-b border-charcoal/[0.03] pb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={12} 
                                      className={star <= (review.rating || 5) ? "fill-gold text-gold" : "fill-charcoal/10 text-charcoal/10"} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-body font-black text-charcoal/20 uppercase tracking-tighter">Verified Review</span>
                              </div>
                              <span className="text-[10px] font-body text-charcoal/40 font-bold uppercase tracking-tighter">
                                {new Date(review.createdAt || Date.now()).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            <div className="flex gap-5">
                              {/* Left: Metadata Anchor */}
                              <div className="w-10 sm:w-12 flex-none">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-display text-base sm:text-lg font-black shadow-inner border border-white ${
                                  ['bg-[#FDF2F2] text-[#F05252]', 'bg-[#F2F8FB] text-[#2D89EF]', 'bg-[#F3FAF7] text-[#0E9F6E]', 'bg-[#FFFAF0] text-[#D03801]'][i % 4]
                                }`}>
                                  {review.userName?.charAt(0).toUpperCase() || "S"}
                                </div>
                              </div>

                              {/* Right: Testimonial & Identity */}
                              <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-display font-bold text-charcoal text-sm leading-tight">{review.userName || "Radiant Customer"}</h4>
                                    <div className="flex items-center gap-1 text-[#0E9F6E] bg-[#DEF7EC] px-1.5 py-0.5 rounded-sm">
                                      <Check size={8} className="stroke-[4px]" />
                                      <span className="text-[7px] font-black uppercase tracking-tighter">Verified Buyer</span>
                                    </div>
                                  </div>
                                  
                                  {review.title && <h5 className="font-display font-bold text-charcoal/90 text-[13px] leading-tight line-clamp-1 italic">"{review.title}"</h5>}
                                  
                                  <p className="text-[13px] font-body text-charcoal/70 leading-[1.6] text-justify md:text-left">
                                    {review.comment}
                                  </p>
                                </div>

                                {review.images && review.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1 border-t border-charcoal/[0.02]">
                                    {review.images.map((img, imgIdx) => {
                                      // Find the index in the total aggregate for the lightbox
                                      const globalIndex = allCustomerImages.indexOf(img);
                                      return (
                                        <motion.div 
                                          key={imgIdx} 
                                          whileHover={{ scale: 1.05 }}
                                          onClick={() => openGallery(globalIndex !== -1 ? globalIndex : 0)}
                                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-charcoal/5 shadow-sm cursor-pointer hover:border-gold/30 transition-all"
                                        >
                                          <img src={getAssetUrl(img)} alt="Chronicle" className="w-full h-full object-cover" />
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Social Connectivity Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-charcoal/[0.02]">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-charcoal/40 group cursor-pointer hover:text-gold transition-colors">
                                      <ThumbsUp size={12} className="group-hover:fill-gold/10" />
                                      <span className="text-[10px] font-body font-black uppercase tracking-widest">Helpful?</span>
                                    </div>
                                    <p className="text-[10px] font-body text-charcoal/30 font-bold uppercase tracking-widest border-l border-charcoal/10 pl-4">
                                      <span className="text-charcoal pr-0.5">{review.helpfulCount || 0}</span> Found this helpful
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : null}
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

      {/* Customer Photo Gallery */}
      <CustomerGalleryModal 
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        images={allCustomerImages}
        initialIndex={currentGalleryIndex}
      />
    </div>
  );
};

export default ProductDetail;
