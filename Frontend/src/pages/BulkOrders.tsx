import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Truck, 
  ShieldCheck, 
  Users, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Gift, 
  Layers,
  Zap
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getApiUrl, getAssetUrl } from "@/lib/api";

const BulkOrders = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const initialFormState = {
    name: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    estimatedQuantity: "",
    subject: "Bulk/Corporate Inquiry",
    message: ""
  };

  const [formState, setFormState] = useState(initialFormState);

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/bulk-orders/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        if (data.quantities?.length > 0) {
          setFormState(prev => ({ ...prev, estimatedQuantity: data.quantities[0] }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch bulk order settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl("/api/contact/bulk-inquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      if (response.ok) {
        setIsSubmitted(true);
        setFormState({ ...initialFormState, estimatedQuantity: config?.quantities?.[0] || "" });
      }
    } catch (err) {
      console.error("Error submitting bulk inquiry:", err);
    }
  };

  const resolveIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'Layers': return <Layers size={size} />;
      case 'Truck': return <Truck size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Building2': return <Building2 size={size} />;
      case 'Users': return <Users size={size} />;
      case 'Package': return <Package size={size} />;
      default: return <Zap size={size} />;
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-gold animate-pulse">
          Establishing Corporate Connection...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30">
      <Header />
      
      <main>
        {/* Floating Abstract Element */}
        <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-40 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6 md:mb-8">
                  <Gift size={14} className="text-gold" />
                  <span className="text-[10px] font-body font-bold text-gold uppercase tracking-[0.2em]">{config.heroBadge}</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 md:mb-8">
                  {config.heroTitle.split(' Corporate ').length > 1 ? (
                    <>
                      {config.heroTitle.split(' Corporate ')[0]} <span className="italic font-light text-gold">Corporate</span> {config.heroTitle.split(' Corporate ')[1]}
                    </>
                  ) : config.heroTitle}
                </h1>
                <p className="text-base md:text-lg font-body text-muted-foreground leading-relaxed mb-8 md:mb-12 max-w-lg mx-auto lg:mx-0 italic">
                  "{config.heroDescription}"
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  <a href="#inquiry-form" className="px-8 md:px-10 py-4 md:py-5 bg-primary text-white rounded-full font-body font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-gold transition-all shadow-xl hover:shadow-gold/20">
                    Initiate Consultation
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10">
                  <img 
                    src={getAssetUrl(config.heroImage)} 
                    alt="Luxury Corporate Gifting" 
                    className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 border-2 border-gold/20 rounded-[3rem] z-0 hidden lg:block" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Brand Pillars */}
        <section className="py-16 md:py-24 bg-secondary/30 backdrop-blur-sm border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center sm:text-left">
              {config.features.map((feature: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-4 flex flex-col items-center sm:items-start"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gold shadow-sm group-hover:scale-110 transition-transform">
                    {resolveIcon(feature.icon)}
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-bold text-foreground uppercase tracking-wider">{feature.title}</h3>
                  <p className="text-xs md:text-sm font-body text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Portal */}
        <section id="inquiry-form" className="py-20 md:py-32 lg:py-48">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-12 md:gap-20">
                <div className="lg:col-span-2 space-y-8 text-center lg:text-left">
                  <div className="space-y-4">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                      {config.inquiryTitle.split(' Portal ').length > 1 ? (
                        <>
                          {config.inquiryTitle.split(' Portal ')[0]} <span className="text-gold italic font-light">Portal</span> {config.inquiryTitle.split(' Portal ')[1]}
                        </>
                      ) : config.inquiryTitle}
                    </h2>
                    <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                      {config.inquiryDescription}
                    </p>
                  </div>
                  <div className="p-6 md:p-8 bg-primary rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col sm:flex-row lg:flex-col gap-6 md:gap-6">
                    {config.stats.map((stat: any, i: number) => (
                      <div key={i} className="flex items-center justify-center lg:justify-start gap-4">
                        {resolveIcon(stat.icon, 20)}
                        <p className="text-xs md:text-sm font-body font-bold uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3">
                  {!isSubmitted ? (
                    <motion.form 
                      onSubmit={handleSubmit}
                      className="space-y-6 md:space-y-8"
                    >
                      <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-body font-bold text-gold uppercase tracking-widest pl-1">Full Name</label>
                          <input 
                            required
                            type="text"
                            value={formState.name}
                            onChange={(e) => setFormState({...formState, name: e.target.value})}
                            className="w-full bg-white border border-border px-6 py-4 rounded-xl md:rounded-2xl focus:outline-none focus:border-gold transition-colors font-body text-sm"
                            placeholder="Alex Thorne"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-body font-bold text-gold uppercase tracking-widest pl-1">Corporate Email</label>
                          <input 
                            required
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({...formState, email: e.target.value})}
                            className="w-full bg-white border border-border px-6 py-4 rounded-xl md:rounded-2xl focus:outline-none focus:border-gold transition-colors font-body text-sm"
                            placeholder="alex@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-body font-bold text-gold uppercase tracking-widest pl-1">Company Name</label>
                          <input 
                            required
                            type="text"
                            value={formState.companyName}
                            onChange={(e) => setFormState({...formState, companyName: e.target.value})}
                            className="w-full bg-white border border-border px-6 py-4 rounded-xl md:rounded-2xl focus:outline-none focus:border-gold transition-colors font-body text-sm"
                            placeholder="Vanguard Elite Ltd."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px) font-body font-bold text-gold uppercase tracking-widest pl-1">Contact Number</label>
                          <input 
                            required
                            type="tel"
                            value={formState.phoneNumber}
                            onChange={(e) => setFormState({...formState, phoneNumber: e.target.value})}
                            className="w-full bg-white border border-border px-6 py-4 rounded-xl md:rounded-2xl focus:outline-none focus:border-gold transition-colors font-body text-sm"
                            placeholder="+91 99999 99999"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-body font-bold text-gold uppercase tracking-widest pl-1">Estimated Quantity</label>
                        <div className="flex flex-wrap gap-4">
                          {config.quantities.map((q: string) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setFormState({...formState, estimatedQuantity: q})}
                              className={`px-8 py-3 rounded-full text-xs font-body font-bold border transition-all ${
                                formState.estimatedQuantity === q 
                                ? "bg-gold border-gold text-primary shadow-lg shadow-gold/20" 
                                : "bg-white border-border text-muted-foreground hover:border-gold/50"
                              }`}
                            >
                              {q} Units
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-body font-bold text-gold uppercase tracking-widest pl-1">Special Requirements</label>
                        <textarea 
                          required
                          value={formState.message}
                          onChange={(e) => setFormState({...formState, message: e.target.value})}
                          rows={4}
                          className="w-full bg-white border border-border px-6 py-4 rounded-2xl focus:outline-none focus:border-gold transition-colors font-body text-sm resize-none"
                          placeholder="Tell us about your event or branding needs..."
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-5 bg-primary text-white rounded-2xl font-body font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        Submit Corporate Brief <Send size={16} />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-16 bg-secondary/50 rounded-[3rem] text-center border-2 border-dashed border-gold/30"
                    >
                      <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gold/20">
                        <CheckCircle2 className="text-primary" size={32} />
                      </div>
                      <h3 className="font-display text-3xl font-bold text-foreground mb-4">Brief Authenticated.</h3>
                      <p className="font-body text-muted-foreground leading-relaxed max-w-sm mx-auto mb-8">
                        Your bulk inquiry has been prioritized. Our corporate curator will connect with you shortly.
                      </p>
                      <button 
                        onClick={() => setIsSubmitted(false)}
                        className="text-[10px] font-body font-bold text-gold uppercase tracking-widest border-b-2 border-gold pb-1"
                      >
                        Submit Another Brief
                      </button>
                    </motion.div>
                  )}
                </div>
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

export default BulkOrders;
