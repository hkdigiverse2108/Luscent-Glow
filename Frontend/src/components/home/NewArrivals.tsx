import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const response = await fetch("/api/products/");
        if (response.ok) {
          const data = await response.json();
          setNewProducts(data.filter((p: Product) => p.isNew));
        }
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNew();
  }, []);

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-body font-medium text-gold uppercase tracking-widest mb-2"
          >
            Just Arrived
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl lg:text-4xl font-bold text-foreground"
          >
            New Arrivals
          </motion.h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-[2rem]" />
            ))
          ) : newProducts.length > 0 ? (
            newProducts.map((product, i) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 italic text-muted-foreground font-body">
              New treasures are on their way.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
