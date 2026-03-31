import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=400&fit=crop"
            alt="Sale banner"
            className="w-full h-64 lg:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-8 lg:px-16">
              <div className="max-w-md space-y-4">
                <p className="text-sm font-body font-semibold text-gold uppercase tracking-widest">
                  Limited Time Offer
                </p>
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground">
                  Flat 40% Off on Skincare
                </h3>
                <div className="flex items-center gap-4">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="text-center">
                      <div className="w-14 h-14 bg-background/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <span className="font-body font-bold text-xl text-primary-foreground">
                          {String(value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-[10px] text-primary-foreground/60 uppercase tracking-wider font-body mt-1 block">
                        {unit}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/products?category=skincare"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-primary font-body font-semibold text-sm uppercase tracking-wider rounded-full hover:bg-gold/90 transition-colors"
                >
                  Shop Now <ArrowRight size={16} />
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
