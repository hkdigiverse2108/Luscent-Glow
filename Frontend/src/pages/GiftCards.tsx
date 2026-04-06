import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  Sparkles, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight,
  Wallet,
  Mail,
  ShieldCheck,
  Zap
} from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getApiUrl, getAssetUrl } from "@/lib/api";

// Dynamic Icon Resolver removed in favor of DynamicIcon component

const GiftCards = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [amount, setAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientMobile, setRecipientMobile] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  
  const { addItem } = useCart();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(getApiUrl("/api/gift-cards/settings"));
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
          if (data.themes?.length > 0) setSelectedTheme(data.themes[0]);
          if (data.amounts?.length > 0) setAmount(data.amounts[1] || data.amounts[0]);
        }
      } catch (error) {
        toast.error("Could not reach the Gifting Sanctuary.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  const handleAddToBag = () => {
    if (!recipientName || !senderName || !recipientMobile) {
      toast.error("Please provide recipient name, mobile, and sender name");
      return;
    }
    
    addItem({
      id: `giftcard-${selectedTheme?.id || 'default'}-${Date.now()}`,
      name: `Digital Gift Card — ${selectedTheme?.name || 'Radiant'}`,
      price: finalAmount,
      image: selectedTheme?.image || "/assets/gift-cards/gold.png",
      category: "Gift Cards",
      quantity: 1,
      metadata: { 
        theme: selectedTheme?.id, 
        recipient: recipientName, 
        recipientMobile,
        message,
        price: finalAmount,
        image: selectedTheme?.image
      }
    });
    
    toast.success("Gift Card added to your bag");
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center font-display text-xs uppercase tracking-widest text-gold animate-pulse">
        Entering the Gifting Sanctuary...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] lg:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={getAssetUrl(config.heroImage || "/assets/gift-cards/hero.png")} alt="Gifting Luxury" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-transparent" />
          </div>
          
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 mb-4 bg-white/10 backdrop-blur-md">
                <Gift size={16} className="text-gold" />
                <span className="text-[10px] font-body font-bold text-white uppercase tracking-[0.25em]">The Ultimate Expression</span>
              </div>
              <h1 className="font-display text-5xl lg:text-8xl font-bold text-white leading-tight uppercase">
                {config.heroTitle.split(' ')[0]} <span className="italic font-light text-gold/80">{config.heroTitle.split(' ').length > 1 ? config.heroTitle.split(' ').slice(1).join(' ') : "Gift"}</span>
              </h1>
              <p className="text-white/80 font-body text-lg lg:text-xl max-w-xl mx-auto font-light leading-relaxed">
                {config.heroDescription}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Customization Section */}
        <section className="py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              
              <div className="space-y-12">
                <div className="space-y-6">
                  <h2 className="font-display text-4xl font-bold text-foreground flex items-center gap-4">
                    01. <span className="text-gold/60 italic font-light">Select Theme</span>
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {config.themes.map((theme: any) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`group relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-500 ${
                          selectedTheme?.id === theme.id ? "border-gold shadow-lg scale-105" : "border-transparent opacity-60 grayscale hover:grayscale-0"
                        }`}
                      >
                        <img src={getAssetUrl(theme.image)} alt={theme.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="font-display text-4xl font-bold text-foreground flex items-center gap-4">
                    02. <span className="text-gold/60 italic font-light">Choose Amount</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {config.amounts.map((amt: number) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`py-4 rounded-2xl font-body font-bold text-sm transition-all duration-500 border-2 ${
                          amount === amt && !customAmount ? "bg-charcoal text-white border-charcoal shadow-xl" : "bg-white text-muted-foreground border-border hover:border-gold/50"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter Custom Amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full py-4 px-6 bg-white border-2 border-border rounded-2xl font-body text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-body font-bold text-sm uppercase tracking-widest">INR</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="font-display text-4xl font-bold text-foreground flex items-center gap-4">
                    03. <span className="text-gold/60 italic font-light">Add Details</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Recipient Full Name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full py-4 px-6 bg-white border-2 border-border rounded-2xl font-body text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Recipient Mobile Number"
                      value={recipientMobile}
                      onChange={(e) => setRecipientMobile(e.target.value)}
                      className="w-full py-4 px-6 bg-white border-2 border-border rounded-2xl font-body text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full py-4 px-6 bg-white border-2 border-border rounded-2xl font-body text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <textarea
                    placeholder="Enter a heartfelt message..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full py-4 px-6 bg-white border-2 border-border rounded-2xl font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToBag}
                  className="w-full py-5 bg-gold text-charcoal font-body font-bold text-sm uppercase tracking-[0.2em] rounded-full hover:bg-charcoal hover:text-white transition-all duration-500 shadow-ethereal flex items-center justify-center gap-3"
                >
                  Confirm & Add to Bag <ArrowRight size={18} />
                </motion.button>
              </div>

              {/* Real-time Preview */}
              <div className="lg:sticky lg:top-32">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-body font-bold uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">Live Canvas Preview</h3>
                    <div className="h-[1px] bg-border flex-1 ml-4" />
                  </div>
                  
                  <motion.div
                    key={selectedTheme?.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-[16/10] bg-charcoal rounded-[2.5rem] overflow-hidden shadow-ethereal"
                  >
                    <img src={getAssetUrl(selectedTheme?.image)} alt="Card Theme" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 mb-1">Gifting Radiance</p>
                          <h4 className="font-display text-xl lg:text-2xl font-bold tracking-widest">LUSCENT GLOW</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 mb-1">Value Card</p>
                          <div className="font-body text-2xl lg:text-4xl font-bold tracking-tight">₹{finalAmount.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-4 font-bold">
                        <div className="h-[1px] bg-white/20" />
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60 font-bold">Prepared For</p>
                          <p className="font-display text-2xl font-semibold italic font-bold">{recipientName || "Your Special Someone"}</p>
                        </div>
                        {message && (
                          <p className="text-xs lg:text-sm font-body font-light italic text-white/80 line-clamp-2 max-w-sm font-bold">" {message} "</p>
                        )}
                        <div className="flex justify-between items-center pt-2 font-bold">
                           <div className="flex gap-1.5 font-bold">
                              <div className="w-6 h-6 rounded-full glass-premium flex items-center justify-center font-bold">
                                <CheckCircle2 size={12} className="text-white" />
                              </div>
                              <span className="text-[9px] uppercase tracking-widest font-bold pt-1 font-bold">Authentic Digital Original</span>
                           </div>
                           <p className="text-[9px] font-body opacity-40 uppercase tracking-widest font-bold">Valid for 365 Days</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {config.features.map((item: any, i: number) => (
                      <div key={i} className="text-center space-y-2 p-5 rounded-[2rem] bg-secondary/30 backdrop-blur-sm border border-secondary/20">
                        <div className="mx-auto w-10 h-10 rounded-full glass-premium flex items-center justify-center text-gold mb-2 shadow-sm">
                          <DynamicIcon name={item.icon} size={18} />
                        </div>
                        <h4 className="text-[10px] font-body font-bold uppercase tracking-widest text-[#2D2424]">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-body leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-charcoal text-white overflow-hidden relative">
           <div className="container mx-auto px-6 lg:px-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="space-y-8">
                    <span className="text-gold font-body text-sm font-bold uppercase tracking-[0.4em] block">Redefining Gifting</span>
                    <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                       {config.benefitsTitle.includes(' is a ') ? config.benefitsTitle.split(' is a ')[0] : config.benefitsTitle} 
                       {config.benefitsTitle.includes(' is a ') && (
                         <span className="italic font-light text-gold/80"> is a {config.benefitsTitle.split(' is a ')[1]}</span>
                       )}
                    </h2>
                    <p className="text-white/60 font-body text-lg leading-relaxed max-w-xl">
                       {config.benefitsDescription}
                    </p>
                    <ul className="space-y-4">
                       {config.benefitsList.map((item: string, i: number) => (
                         <li key={i} className="flex items-center gap-3 text-sm font-body font-light">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                            {item}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="relative group perspective-[1000px]">
                    <motion.div 
                      whileHover={{ rotateY: -15, rotateX: 5 }}
                      transition={{ duration: 1 }}
                      className="relative z-10 aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
                    >
                       <img src={getAssetUrl(selectedTheme?.image)} alt="Gifting View" className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="absolute -inset-10 bg-gold/10 rounded-full blur-[100px] animate-pulse" />
                 </div>
              </div>
           </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 lg:py-32 overflow-hidden">
           <div className="container mx-auto px-6 lg:px-12 max-w-4xl font-bold">
              <div className="text-center mb-16 font-bold">
                 <h2 className="font-display text-4xl lg:text-6xl font-bold text-foreground font-bold">Gifting <span className="text-gold italic font-bold">Intelligence</span></h2>
                 <p className="mt-4 text-muted-foreground font-body font-bold">Common inquiries about our digital gift certificates.</p>
              </div>
              
              <div className="space-y-6 font-bold">
                {config.faqs.map((item: any, i: number) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-8 bg-white border border-border/50 rounded-[2rem] hover:border-gold/30 hover:shadow-xl transition-all duration-500 font-bold"
                  >
                    <h4 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-3 font-bold">
                       <span className="text-gold font-bold">/</span> {item.q}
                    </h4>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed font-bold">{item.a}</p>
                  </motion.div>
                ))}
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GiftCards;
