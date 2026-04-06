import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TicketPercent } from "lucide-react";
import { Link } from "react-router-dom";
import { getAssetUrl } from "@/lib/api";

interface DiscountBannerProps {
  banner?: {
    image: string;
    title: string;
    subtitle: string;
    discountText: string;
    buttonText: string;
    buttonLink: string;
    endDate?: string;
  };
}

const DiscountBanner = ({ banner }: DiscountBannerProps) => {
  const defaultBanner = {
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=600&fit=crop",
    title: "Save 40% on All Essential Radiance.",
    subtitle: "Exclusive Invitation",
    discountText: "40% OFF",
    buttonText: "Retrieve Offer",
    buttonLink: "/offers",
    endDate: ""
  };

  const activeBanner = banner || defaultBanner;
  
  // Dynamic Target Date Calculation
  const getTargetDate = () => {
    if (activeBanner.endDate && activeBanner.endDate !== "") {
      return new Date(activeBanner.endDate);
    }
    // Universal Fallback: 72-hour sliding window protocol
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 3);
    return fallback;
  };

  const [targetDate, setTargetDate] = useState(getTargetDate());

  const calcTimeLeft = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  useEffect(() => {
    setTargetDate(getTargetDate());
  }, [activeBanner.endDate]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

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
              src={getAssetUrl(activeBanner.image)}
              alt={activeBanner.title}
              className="w-full h-full object-cover opacity-60 md:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/60 md:to-transparent" />
          </div>

          <div className="relative z-10 w-full lg:px-24 py-16">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3 text-gold">
                <TicketPercent size={20} />
                <span className="text-sm font-body font-bold uppercase tracking-[0.3em]">{activeBanner.subtitle}</span>
              </div>
              
              <h3 className="font-display text-4xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
                {activeBanner.title}
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
                  to={activeBanner.buttonLink}
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-gold text-charcoal font-body font-bold text-xs md:text-sm uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500 shadow-2xl flex items-center justify-center gap-3"
                >
                  {activeBanner.buttonText} <ArrowRight size={18} />
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
