import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card rounded-lg overflow-hidden border border-border/50 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isNew && (
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
        {product.discount && (
          <span className="px-2.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded-full">
            {product.discount}% Off
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
      <Link to={`/product/${productId}`}>
        <div className="aspect-square overflow-hidden bg-secondary relative">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.onerror = null; // Prevent infinite loop if placeholder also fails
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button 
              onClick={handleQuickAdd}
              className="w-full py-2 bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-body font-bold uppercase tracking-widest rounded-xl hover:bg-gold transition-colors shadow-2xl"
            >
              Quick Add to Bag
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-[11px] font-body font-medium text-muted-foreground uppercase tracking-wider">
          {product.brand}
        </p>
        <Link to={`/product/${productId}`}>
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
                className={i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground font-body">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-body font-semibold text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through font-body">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
