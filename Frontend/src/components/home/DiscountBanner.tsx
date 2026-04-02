import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TicketPercent } from "lucide-react";
import { Link } from "react-router-dom";

const DiscountBanner = () => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);

  const calcTimeLeft = () => {
    const diff = endDate.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[400px] md:min-h-[450px] flex items-center bg-charcoal shadow-ethereal"
        >
          {/* Background Image with Mask */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=600&fit=crop"
              alt="Sale banner"
              className="w-full h-full object-cover opacity-60 md:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/60 md:to-transparent" />
          </div>

          <div className="relative z-10 w-full lg:px-24 py-16">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3 text-gold">
                <TicketPercent size={20} />
                <span className="text-sm font-body font-bold uppercase tracking-[0.3em]">Exclusive Invitation</span>
              </div>
              
              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
                Save <span className="text-gold italic">40%</span> on All <br className="hidden md:block"/> Essential Radiance.
              </h3>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8">
                <div className="flex items-center gap-2 md:gap-3">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="text-center group">
                      <div className="w-12 h-12 md:w-16 md:h-16 glass-premium rounded-xl md:rounded-2xl flex items-center justify-center border-white/10 group-hover:border-gold/30 transition-colors">
                        <span className="font-body font-bold text-lg md:text-2xl text-white">
                          {String(value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] font-medium mt-1 md:mt-2 block">
                        {unit}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="h-10 w-[1px] bg-white/20 mx-2 hidden lg:block" />
                
                <Link
                  to="/offers"
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-gold text-charcoal font-body font-bold text-xs md:text-sm uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500 shadow-2xl flex items-center justify-center gap-3"
                >
                  Retrieve Offer <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DiscountBanner;
