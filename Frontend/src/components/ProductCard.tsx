import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getAssetUrl } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  promotion?: any;
}

const parseDiscount = (text: string): number => {
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
};

const ProductCard = ({ product, promotion }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  
  const isAllOutOfStock = (product.variants && product.variants.length > 0)
    ? product.variants.every(v => (v.stock ?? 0) === 0)
    : false;
  const { productId, currentPrice, originalPrice, discountPercent, selectedShade, selectedSize } = (() => {
    const id = product._id || product.id;
    
    // 1. Identify "Base Price" - Prefer variant that matches the passed promotion
    const baseVariant = promotion && product.variants
      ? (product.variants.find((v: any) => v.appliedPromotionId === promotion._id) || product.variants[0])
      : (product.variants && product.variants.length > 0 ? product.variants[0] : null);

    const initialBasePrice = baseVariant ? baseVariant.price : product.price;
    const initialOriginalPrice = baseVariant
      ? (baseVariant.originalPrice || initialBasePrice)
      : (product.originalPrice || product.price);

    // 2. Apply Promotion overrides if present
    if (promotion) {
      const discount = parseDiscount(promotion.discountText || "");
      const price = Math.round(initialOriginalPrice * (1 - discount / 100));
      return { 
        productId: id, 
        currentPrice: price, 
        originalPrice: initialOriginalPrice, 
        discountPercent: discount || Math.round(((initialOriginalPrice - initialBasePrice) / initialOriginalPrice) * 100),
        selectedShade: baseVariant?.color,
        selectedSize: baseVariant?.size
      };
    }

    // 3. Fallback to Variant/Product defaults
    const discount = Math.round(((initialOriginalPrice - initialBasePrice) / initialOriginalPrice) * 100);
    return { 
      productId: id, 
      currentPrice: initialBasePrice, 
      originalPrice: initialOriginalPrice, 
      discountPercent: discount || product.discount,
      selectedShade: baseVariant?.color,
      selectedSize: baseVariant?.size
    };
  })();

  const isWishlisted = isInWishlist(productId);
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: productId,
      name: product.name,
      price: currentPrice,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedShade,
      selectedSize,
    });
    
    // Remove from wishlist if it is wishlisted
    if (isWishlisted) {
      toggleWishlist(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card rounded-lg overflow-hidden border border-border/50 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {isAllOutOfStock && (
          <span className="px-2.5 py-0.5 bg-rose text-white text-[10px] font-body font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose/20 animate-pulse-slow border border-white/20">
            Sold Out
          </span>
        )}
        {product.isNew && !isAllOutOfStock && (
          <span className="px-2.5 py-0.5 bg-gold text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
            New
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
            Best Seller
          </span>
        )}
        {product.isTrending && !product.isBestSeller && (
          <span className="px-2.5 py-0.5 bg-rose text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
            Trending
          </span>
        )}
        {!!discountPercent && (
          <span className="px-2.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button 
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
      >
        <Heart 
          size={16} 
          className={`transition-colors ${isWishlisted ? "fill-rose text-rose" : "text-foreground/60 hover:text-rose"}`} 
        />
      </button>

      {/* Image */}
      <Link to={`/product/${productId}${promotion ? '?offer=true' : ''}`}>
        <div className="aspect-square overflow-hidden bg-secondary relative">
          <img
            src={getAssetUrl(product.image)}
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.onerror = null; // Prevent infinite loop if placeholder also fails
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Quick Add Overlay */}
          {!isAllOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button 
                onClick={handleQuickAdd}
                className="w-full py-2 bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-body font-bold uppercase tracking-widest rounded-xl hover:bg-gold transition-colors shadow-2xl"
              >
                Quick Add to Cart
              </button>
            </div>
          )}
          {isAllOutOfStock && (
            <div className="absolute inset-0 bg-secondary/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="px-4 py-2 bg-rose text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl">
                 Currently Unavailable
               </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-[11px] font-body font-bold text-gold tracking-widest leading-none mb-1">
          {product.brand}
        </p>
        <Link to={`/product/${productId}${promotion ? '?offer=true' : ''}`}>
          <h3 className="font-display text-base font-semibold text-foreground leading-tight hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating ?? 0) ? "fill-gold text-gold" : "text-border"}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground font-body">
            ({(product.reviewCount ?? 0).toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
           <div className="flex flex-col">
              {product.variants && product.variants.length > 1 && (
                <span className="text-[9px] font-body font-bold text-gold/60 uppercase tracking-widest leading-none mb-1">Starting from</span>
              )}
              <span className="font-body text-lg font-bold text-charcoal tracking-tight">
                ₹{(currentPrice ?? 0).toLocaleString()}
              </span>
           </div>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through font-body">
              ₹{(originalPrice ?? 0).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
