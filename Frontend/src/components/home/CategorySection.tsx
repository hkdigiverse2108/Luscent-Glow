import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";

interface CategorySectionProps {
  title?: string;
}

const CategorySection = ({ title }: CategorySectionProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(getApiUrl("/api/categories/?hide_empty=true"));
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Define grid spans for a "Bento" look
  const spans = [
    "md:col-span-2 md:row-span-2", // Large
    "md:col-span-2 md:row-span-1", // Wide
    "md:col-span-1 md:row-span-1", // Square
    "md:col-span-1 md:row-span-1", // Square
    "md:col-span-2 md:row-span-1", // Wide
    "md:col-span-2 md:row-span-1", // Wide
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[#FDFCFB]">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs md:text-sm font-body font-bold text-gold uppercase tracking-[0.3em] mb-3 md:mb-4 block"
            >
              The Collections
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl lg:text-6xl font-bold text-foreground leading-[1.1]"
            >
              {title || "Curated for Your Unique Ritual"}
            </motion.h2>
          </div>
          <Link 
            to="/products"
            className="group flex items-center gap-3 font-body font-semibold text-charcoal hover:text-gold transition-colors duration-300"
          >
            <span className="uppercase tracking-widest text-xs md:text-sm">View All Categories</span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-gold transition-colors">
              <ArrowRight size={16} className="md:w-4.5 md:h-4.5" />
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
            <Loader2 className="animate-spin text-gold" size={32} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold italic">Synchronizing Taxonomy...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[200px] md:auto-rows-[240px] gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id || cat.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`${spans[i] || "md:col-span-1"} group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-ethereal hover-lift transition-all duration-700`}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="block w-full h-full"
                >
                  {/* Background Image */}
                  <img
                    src={getAssetUrl(cat.image)}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent group-hover:from-charcoal/80 transition-all duration-500" />
                  
                  {/* Content */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-2xl lg:text-3xl font-bold text-white mb-1 group-hover:text-gold transition-colors duration-300">
                          {cat.name}
                        </h3>
                        <p className="text-white/70 text-xs uppercase tracking-widest font-body opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          Explore Collection
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full glass-premium flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <ArrowRight size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
