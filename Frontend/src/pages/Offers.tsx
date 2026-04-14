import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import { getApiUrl } from "@/lib/api";
import { Product, products } from "@/data/products";

const Offers = () => {
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const [prodRes, promoRes] = await Promise.all([
          fetch(getApiUrl("/api/products/")),
          fetch(getApiUrl("/api/promotions/"))
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          // Filter products that have an applied promotion
          const offers = data.filter((p: any) => p.appliedPromotionId);
          setFetchedProducts(offers);
        }

        if (promoRes.ok) {
          const promoData = await promoRes.json();
          setPromotions(promoData);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching offers:", err);
        setError("Failed to load exclusive offers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const pageSEO = {
    title: "Exclusive Offers | Luscent Glow",
    description: "Discover our limited-time botanical skincare rituals at special prices.",
    keywords: "skincare offers, beauty discounts, luxury skincare sale"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO seo={pageSEO} />
      <Header />
      
      <main className="container mx-auto px-4 py-12 lg:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <Sparkles size={12} /> Special Rituals
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold text-foreground leading-[1.1]"
          >
            Exclusive <span className="italic text-gold">Offers</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body text-muted-foreground text-sm md:text-base max-w-xl mx-auto tracking-wide leading-relaxed"
          >
            Discover our curated collection of botanical masterpieces, temporarily featured at exceptional values for our most dedicated connoisseurs.
          </motion.p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-gold" size={40} />
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-gold animate-pulse">Consulting the library...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-rose/5 rounded-[3rem] border border-rose/10 max-w-xl mx-auto">
            <p className="font-display text-xl text-rose/70 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-rose text-white rounded-full font-body font-bold uppercase tracking-widest text-[10px] hover:bg-rose/80 transition-all"
            >
              Retry
            </button>
          </div>
        ) : fetchedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {fetchedProducts.map((product, i) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <Zap size={10} className="fill-white" /> Limited Offer
                </div>
                <ProductCard 
                  product={product} 
                  promotion={promotions.find(p => p._id === product.appliedPromotionId)} 
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 space-y-8 max-w-xl mx-auto border border-dashed border-gold/20 rounded-[3rem] bg-gold/[0.02]">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground/30">
              <Zap size={32} />
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl text-foreground">No Active Offers Found</p>
              <p className="font-body text-sm text-muted-foreground">Our laboratories are currently preparing new exclusive rituals. Please visit our main collection in the meantime.</p>
            </div>
            <a 
              href="/products" 
              className="inline-block px-10 py-4 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-xl shadow-primary/10"
            >
              Explore Collection
            </a>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
