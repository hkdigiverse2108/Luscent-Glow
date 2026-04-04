import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Sparkle } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiUrl, getAssetUrl } from "@/lib/api";

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const response = await fetch(getApiUrl("/api/products/"));
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter((p: Product) => p.isNew);
          
          if (filtered.length > 0) {
            setNewProducts(filtered);
          } else {
            const { products } = await import("@/data/products");
            setNewProducts(products.filter(p => p.isNew));
          }
        } else {
          const { products } = await import("@/data/products");
          setNewProducts(products.filter(p => p.isNew));
        }
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        const { products } = await import("@/data/products");
        setNewProducts(products.filter(p => p.isNew));
      } finally {
        setLoading(false);
      }
    };
    fetchNew();
  }, []);

  const featured = newProducts.slice(0, 2);
  const remaining = newProducts.slice(2);

  return (
    <section className="py-16 md:py-24 lg:py-32 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 mb-6 bg-gold/5"
          >
            <Sparkle size={14} className="text-gold animate-pulse" />
            <span className="text-[10px] font-body font-bold text-gold uppercase tracking-[0.2em]">The New Era</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6"
          >
            Spring <span className="text-gradient-gold italic font-light">Newcomers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-body text-sm md:text-base lg:text-lg max-w-2xl mx-auto"
          >
            Introducing the latest breakthrough formulas, curated specifically for the modern aesthetic and timed for the season of rebirth.
          </motion.p>
        </div>

        {/* Featured Spotlight */}
        <div className="space-y-24 mb-32 max-w-6xl mx-auto">
          {featured.map((product, i) => (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 md:gap-12 lg:gap-20`}
            >
              {/* Product Image Stage */}
              <div className="relative w-full lg:w-[45%]">
                <div className="relative aspect-[4/4.5] rounded-[2.5rem] overflow-hidden shadow-ethereal">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.5 }}
                    src={getAssetUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent" />
                </div>
              </div>
 
              {/* Product Details */}
              <div className="w-full lg:w-[55%] space-y-6 lg:pl-8">
                <div className="inline-block px-3 py-1 bg-secondary rounded-lg text-gold font-body text-[10px] font-bold uppercase tracking-widest">
                  {product.category}
                </div>
                <h3 className="font-display text-2xl md:text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                  {product.name}
                </h3>
                <p className="text-muted-foreground font-body text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                  {product.description || "Unveiling our most awaited formula yet. Engineered for perfection, designed for the conscious soul."}
                </p>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <span className="font-body text-2xl font-bold text-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="w-8 h-[1px] bg-gold" />
                       <span className="text-gold font-body font-bold uppercase tracking-widest text-[10px]">Essential Collection</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/product/${product._id || product.id}`}
                      className="group px-8 py-4 bg-charcoal text-white font-body font-semibold text-[11px] uppercase tracking-widest rounded-full hover:bg-gold hover:text-charcoal transition-all duration-500 flex items-center gap-3"
                    >
                      <span>Pre-Order Now</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default NewArrivals;
