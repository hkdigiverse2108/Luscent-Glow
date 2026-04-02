import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
const brandStoryImg = "/assets/hero/brand-story.png";

const BrandStory = () => {
  return (
    <section className="relative py-20 md:py-32 lg:py-48 overflow-hidden bg-charcoal">
      {/* Background Image with Fixed Effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={brandStoryImg}
          alt="Brand Story"
          className="w-full h-full object-cover opacity-60 md:mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/40 md:to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-gold font-body text-sm font-bold uppercase tracking-[0.4em] block">
              Our Philosophy
            </span>
            
            <h2 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
              The <span className="italic font-light text-gold/80">Alchemy</span> of Radiance
            </h2>
            
            <p className="text-white/80 font-body text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-light">
              We believe skincare is more than a routine; it is a sacred ritual. By merging ancient botanical wisdom with cutting-edge molecular science, we create formulas that don't just sit on the surface — they transform from within.
            </p>

            <div className="pt-6">
              <Link
                to="/about"
                className="group inline-flex items-center gap-4 text-white hover:text-gold transition-colors duration-500"
              >
                <span className="font-body font-bold uppercase tracking-widest text-sm">Read Our Full Story</span>
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold group-hover:bg-gold transition-all duration-500">
                  <ArrowRight size={20} className="group-hover:text-charcoal transition-colors" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Glassy Floating Accent */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 hidden lg:block w-72 h-72 glass-premium rounded-[4rem] opacity-30 blur-sm"
      />
    </section>
  );
};

export default BrandStory;
