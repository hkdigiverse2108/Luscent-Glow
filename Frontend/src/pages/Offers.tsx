import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  ArrowRight, 
  Gift, 
  Percent, 
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Offers = () => {
  const [timeLeft, setTimeLeft] = useState({ 
    hours: 4, 
    minutes: 22, 
    seconds: 15 
  });

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  const flashDeals = [
    { 
      title: "Midnight Radiance Flash Sale", 
      discount: "FLAT 40% OFF", 
      category: "Skincare Essentials",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop",
      endsIn: formatTime(timeLeft)
    },
    { 
      title: "Weekend Lip Color Special", 
      discount: "BUY 2 GET 1 FREE", 
      category: "Luxury Makeup",
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=400&fit=crop",
      endsIn: "12:45:00" // This one can remain static or also use the timer
    }
  ];

  const bundles = [
    {
      name: "The Ultimate Glow Kit",
      items: ["Hydra Serum", "Silk Foundation", "Velvet Lipstick"],
      price: "₹3,499",
      originalPrice: "₹4,297",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop",
      tag: "Best Seller"
    },
    {
      name: "Daily Essentials Set",
      items: ["Cleansing Gel", "Niacinamide Toner", "Day Cream"],
      price: "₹2,199",
      originalPrice: "₹2,899",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
      tag: "Must Have"
    }
  ];



  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Page Hero */}
        <section className="relative h-[60vh] lg:h-[70vh] flex items-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&h=900&fit=crop" 
            alt="Offers background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 backdrop-blur-md rounded-full border border-gold/30">
                <Sparkles size={16} className="text-gold" />
                <span className="text-xs font-body font-bold text-gold uppercase tracking-[0.2em]">Current Special Offers</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1]">
                Exclusive <span className="text-gold italic">Treasures</span> Waiting For You
              </h1>
              <p className="font-body text-lg text-white/70 max-w-lg">
                Unlock limited-time discounts on our premium, cruelty-free collection. 
                Your journey to radiance starts with these exclusive offers.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#flash-deals" className="px-8 py-4 bg-gold text-primary font-body font-bold uppercase tracking-widest text-xs rounded-full hover:shadow-lg hover:shadow-gold/20 transition-all">
                  Explore Offers
                </a>
                <Link to="/products" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-body font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/20 transition-all">
                  Shop Collection
                </Link>
              </div>
            </motion.div>
          </div>
        </section>



        {/* Flash Deals Section */}
        <section id="flash-deals" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-light/30 rounded-full text-rose-brand">
                <Clock size={14} />
                <span className="text-[10px] font-body font-bold uppercase tracking-widest">Limited Availability</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-primary italic">Limited Time Flash Sale</h2>
              <p className="text-muted-foreground font-body max-w-xl mx-auto">
                These special offers disappear quickly. 
                Claim yours before the timer runs out.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {flashDeals.map((deal, idx) => (
                <motion.div
                  key={deal.title}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden shadow-ethereal border border-border group"
                >
                  <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                    <img 
                      src={deal.image} 
                      alt={deal.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 px-4 py-2 bg-primary/90 text-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-tighter">
                      {deal.category}
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="text-rose-brand font-body text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-brand rounded-full animate-pulse" />
                        Ends In {deal.endsIn}
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary group-hover:text-gold transition-colors">{deal.title}</h3>
                      <div className="text-4xl font-display font-black text-primary/10 select-none group-hover:text-gold/10 transition-colors">
                        {deal.discount}
                      </div>
                    </div>
                    <Link 
                      to="/products"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-body font-bold uppercase tracking-widest text-xs rounded-full hover:bg-gold transition-all duration-300"
                    >
                      Shop Flash Sale <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bundle & Tiered Rewards */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.1]">
                    The More You <span className="text-gold italic">Shop</span>, 
                    The More You Save
                  </h2>
                  <p className="text-white/60 font-body leading-relaxed">
                    Improve your daily routine. Our tiered rewards and value sets are 
                    designed to provide the best results with the best value.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { threshold: "₹2,499", reward: "Free Mini Serum (Worth ₹599)" },
                    { threshold: "₹3,999", reward: "Flat ₹500 Instant Discount" },
                    { threshold: "₹5,499", reward: "Free Luxury Beauty Pouch + ₹750 Off" },
                  ].map((tier, idx) => (
                    <motion.div 
                      key={tier.threshold}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-6 group hover:bg-white/10 transition-all hover:border-gold/30"
                    >
                      <div className="w-12 h-12 bg-gold/20 flex items-center justify-center rounded-xl text-gold group-hover:scale-110 transition-transform">
                        <Gift size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-gold font-body font-bold uppercase tracking-widest">Spend {tier.threshold}</div>
                        <div className="text-sm font-body font-medium">{tier.reward}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                {bundles.map((bundle, idx) => (
                  <motion.div
                    key={bundle.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2rem] p-4 group"
                  >
                    <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                      <img 
                        src={bundle.image} 
                        alt={bundle.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-gold text-primary text-[9px] font-bold uppercase rounded-full">
                        {bundle.tag}
                      </div>
                    </div>
                    <div className="px-4 pb-6 space-y-4 text-primary">
                      <h4 className="font-display text-xl font-bold">{bundle.name}</h4>
                      <ul className="space-y-2">
                        {bundle.items.map(item => (
                          <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                            <Sparkles size={12} className="text-gold" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-xs text-muted-foreground line-through mr-2">{bundle.originalPrice}</span>
                          <span className="text-xl font-display font-bold text-primary">{bundle.price}</span>
                        </div>
                        <button className="p-3 bg-secondary rounded-xl text-primary hover:bg-gold transition-colors">
                          <ShoppingBag size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        </section>

        {/* FAQ / Info Bar */}
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-gold mb-2">
                  <Percent size={28} />
                </div>
                <h4 className="font-display text-xl font-bold">Stackable Rewards?</h4>
                <p className="text-muted-foreground text-sm font-body leading-relaxed px-4">
                  Refer to each coupon for compatibility. Most shop discounts cannot be combined with sitewide promotions.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-gold mb-2">
                  <Gift size={28} />
                </div>
                <h4 className="font-display text-xl font-bold">Birthday Bonus</h4>
                <p className="text-muted-foreground text-sm font-body leading-relaxed px-4">
                  Join our Radiant Rewards club to receive a personalized luxury gift on your special day.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-gold mb-2">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="font-display text-xl font-bold">Bulk Purchase</h4>
                <p className="text-muted-foreground text-sm font-body leading-relaxed px-4">
                  Planning a bridal shower or social event? Contact us for bespoke bulk offer packages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Offers;
