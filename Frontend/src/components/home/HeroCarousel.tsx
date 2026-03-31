import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { heroSlides } from "@/data/products";

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[current];

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Parallax Image Background */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/assets/hero/hero-1.png"; // Fallback to first hero if others fail
                target.onerror = null;
              }}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-charcoal/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
              >
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="inline-block text-gold font-body text-sm lg:text-base uppercase tracking-[0.3em] font-medium mb-4"
                >
                  Luscent Glow Elite
                </motion.span>
                
                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="font-display text-5xl lg:text-8xl font-bold text-white leading-[1.1] mb-6 drop-shadow-2xl"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="text-lg lg:text-xl text-white/90 font-body font-light max-w-xl leading-relaxed mb-10"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  className="flex flex-wrap gap-4"
                >
                  <Link 
                    to={slide.link || "/products"}
                    className="group relative px-10 py-4 bg-gold text-charcoal font-body font-semibold text-sm uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500 flex items-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10">{slide.cta}</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-center">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative"
          >
            <div className={`w-0.5 transition-all duration-500 ${
              i === current ? "h-12 bg-gold" : "h-6 bg-white/20 group-hover:bg-white/50"
            }`} />
            {i === current && (
              <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-gold font-display text-sm font-bold">
                0{i + 1}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Scroll to Glow</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroCarousel;
