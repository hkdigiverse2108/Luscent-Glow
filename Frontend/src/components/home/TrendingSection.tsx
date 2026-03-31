import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
          setTrending(data.filter((p: Product) => p.isTrending));
        }
      } catch (err) {
        console.error("Error fetching trending:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-body font-medium text-gold uppercase tracking-widest mb-2"
            >
              What's Hot
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl lg:text-4xl font-bold text-foreground"
            >
              Trending Today
            </motion.h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scroll("left")} className="p-2 border border-border rounded-full hover:bg-secondary transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll("right")} className="p-2 border border-border rounded-full hover:bg-secondary transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory min-h-[400px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[240px] max-w-[240px] aspect-[3/4] bg-secondary animate-pulse rounded-[2rem]" />
            ))
          ) : trending.length > 0 ? (
            trending.map((product) => (
              <div key={product._id || product.id} className="min-w-[240px] max-w-[240px] snap-start">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-20 italic text-muted-foreground font-body">
              The trends are being curated. Reveal them soon.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
