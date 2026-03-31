import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { instagramPosts } from "@/data/products";

const InstagramFeed = () => {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl text-left">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <Instagram size={18} className="text-gold" />
              <p className="text-sm font-body font-bold text-gold uppercase tracking-[0.3em]">
                @luscentglow
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-[1.1]"
            >
              Our Journey on <span className="text-gold italic font-light">Instagram</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <p className="text-muted-foreground font-body max-w-xs text-right">
              Join our growing community of 50k+ radiant souls. Share your ritual using #LuscentGlow.
            </p>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {instagramPosts.map((post, i) => (
            <motion.a
              key={i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-ethereal hover-lift transition-all duration-500"
            >
              <img src={post.image} alt="Instagram post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-500 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full glass-premium flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                  <Instagram size={20} className="text-white" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
