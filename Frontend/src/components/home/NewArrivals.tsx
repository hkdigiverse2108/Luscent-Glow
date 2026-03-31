import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Sparkle } from "lucide-react";
import { Link } from "react-router-dom";

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const response = await fetch("/api/products/");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setNewProducts(data.filter((p: Product) => p.isNew));
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
    <section className="py-24 lg:py-32 overflow-hidden bg-white">
      <div className="container mx-auto px-6 lg:px-12">
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
            className="font-display text-4xl lg:text-7xl font-bold text-foreground mb-6"
          >
            Spring <span className="text-gradient-gold italic font-light">Newcomers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-body text-lg max-w-2xl mx-auto"
          >
            Introducing the latest breakthrough formulas, curated specifically for the modern aesthetic and timed for the season of rebirth.
          </motion.p>
        </div>

        {/* Featured Spotlight */}
        <div className="space-y-32 mb-32">
          {featured.map((product, i) => (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-24`}
            >
              {/* Product Image Stage */}
              <div className="relative w-full lg:w-1/2">
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-ethereal">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.5 }}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent" />
                </div>
                {/* Float Decoration */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 hidden lg:block w-40 h-40 glass-gold rounded-full blur-2xl opacity-60" 
                />
                <motion.div 
                   animate={{ y: [0, 20, 0] }}
                   transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute -bottom-10 -left-10 hidden lg:block w-32 h-32 bg-rose-light/20 rounded-full blur-2xl opacity-60" 
                />
              </div>

              {/* Product Details */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="inline-block px-3 py-1 bg-secondary rounded-lg text-gold font-body text-xs font-bold uppercase tracking-widest">
                  {product.category}
                </div>
                <h3 className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  {product.name}
                </h3>
                <p className="text-muted-foreground font-body text-lg lg:text-xl leading-relaxed">
                  {product.description || "Unveiling our most awaited formula yet. Engineered for perfection, designed for the conscious soul."}
                </p>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <span className="font-body text-3xl font-bold text-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="w-10 h-[1px] bg-gold" />
                       <span className="text-gold font-body font-bold uppercase tracking-widest text-xs">Essential Collection</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/product/${product._id || product.id}`}
                      className="group px-10 py-5 bg-charcoal text-white font-body font-semibold text-sm uppercase tracking-widest rounded-full hover:bg-gold hover:text-charcoal transition-all duration-500 flex items-center gap-3"
                    >
                      <span>Pre-Order Now</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other New Arrivals Grid */}
        {remaining.length > 0 && (
          <div className="pt-20 border-t border-border/50">
            <h4 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-12 flex items-center gap-4">
              More to <span className="text-gold italic">Uncover</span>
              <div className="flex-1 h-[1px] bg-border/50" />
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {remaining.map((product, i) => (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
