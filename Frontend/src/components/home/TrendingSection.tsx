import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const TrendingSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("/api/products/");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setTrending(data.filter((p: Product) => p.isTrending));
          } else {
            const { products } = await import("@/data/products");
            setTrending(products.filter(p => p.isTrending));
          }
        } else {
          const { products } = await import("@/data/products");
          setTrending(products.filter(p => p.isTrending));
        }
      } catch (err) {
        console.error("Error fetching trending:", err);
        const { products } = await import("@/data/products");
        setTrending(products.filter(p => p.isTrending));
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-light/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-gold mb-4"
            >
              <Sparkles size={16} />
              <span className="text-sm font-body font-semibold uppercase tracking-[0.25em]">Highly Coveted</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-tight"
            >
              Trending <span className="italic font-light text-gold/80">Essence</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-muted-foreground font-body text-base lg:text-lg max-w-lg"
            >
              Curated by our beauty experts, these are the formulas everyone is talking about this season.
            </motion.p>
          </div>

        </div>

        <div className="relative group/carousel">
          {/* Navigation Buttons - Positioned near cards */}
          <button 
            onClick={() => scroll("left")} 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-20 p-4 bg-white/80 backdrop-blur-md border border-gold/20 rounded-full hover:bg-gold hover:border-gold transition-all duration-500 shadow-xl opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center group/btn"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-charcoal group-hover/btn:scale-110 transition-transform" />
          </button>
          
          <button 
            onClick={() => scroll("right")} 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-20 p-4 bg-white/80 backdrop-blur-md border border-gold/20 rounded-full hover:bg-gold hover:border-gold transition-all duration-500 shadow-xl opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center group/btn"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-charcoal group-hover/btn:scale-110 transition-transform" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide pb-8 -mx-6 px-6 snap-x snap-mandatory min-h-[450px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[280px] max-w-[280px] aspect-[3/4.5] bg-secondary/40 animate-pulse rounded-[2.5rem]" />
              ))
            ) : trending.length > 0 ? (
              trending.map((product, i) => (
                <motion.div 
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="min-w-[280px] max-w-[280px] snap-start"
                >
                  <div className="hover-lift transition-all duration-500">
                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-20 italic text-muted-foreground font-body text-xl">
                Curating the next generation of radiance...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
