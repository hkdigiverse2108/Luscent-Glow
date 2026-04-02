import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Product, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getApiUrl } from "@/lib/api";

const ProductDetail = () => {
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`/products/${id}`));
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product, checking local data:", err);
        // Fallback: search local products array
        const localProduct = products.find(p => p.id === id || p._id === id);
        if (localProduct) {
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
  useEffect(() => {
    const fetchRelatedAndAlsoViewed = async () => {
      if (!product) return;
        let data;
        try {
          const response = await fetch(getApiUrl("/products/"));
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

  const related = relatedProducts;

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
        <p className="text-[10px] md:text-sm font-body text-muted-foreground mb-4 md:mb-6 uppercase tracking-widest opacity-70">
          Home / {product.category || "Collection"} / {product.name || "Treasure Detail"}
        </p>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary cursor-zoom-in group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-150 transition-transform duration-500 origin-center"
              />
            </div>
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
                  {product.shades.map((shade, i) => (
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
                  {product.sizes.map((size, i) => (
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
              <div className="space-y-6">
                {[5, 4, 5, 3].map((stars, i) => (
                  <div key={i} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{[...Array(5)].map((_, j) => <Star key={j} size={12} className={j < stars ? "fill-gold text-gold" : "text-border"} />)}</div>
                      <span className="text-xs text-muted-foreground font-body">Verified Purchase</span>
                    </div>
                    <p className="text-sm font-body text-foreground font-medium mb-1">
                      {["Absolutely love this!", "Great quality product", "My new favorite!", "Good but could be better"][i]}
                    </p>
                    <p className="text-sm font-body text-muted-foreground">
                      {["The texture is amazing and it lasts all day long.", "Premium feel, worth every penny.", "I've repurchased this three times already!", "Nice product but the shade didn't match perfectly."][i]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProductDetail;
