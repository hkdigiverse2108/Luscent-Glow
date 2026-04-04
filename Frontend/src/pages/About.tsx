import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Heart, Globe, Shield, Sparkles, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getApiUrl, getAssetUrl } from "@/lib/api";

const About = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/about/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch About Us settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const resolveIcon = (iconName: string) => {
    switch (iconName) {
      case "Leaf": return <Leaf className="text-gold" />;
      case "Heart": return <Heart className="text-gold" />;
      case "Globe": return <Globe className="text-gold" />;
      case "Shield": return <Shield className="text-gold" />;
      default: return <Zap className="text-gold" />;
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-gold animate-pulse">
          Establishing Brand Ritual...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30">
      <Header />
      
      <main>
        {/* Editorial Hero */}
        <section className="relative min-h-[60vh] lg:h-[85vh] overflow-hidden flex items-center">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img 
              src={getAssetUrl(config.heroImage)} 
              alt="The Origin of Glow" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/30 to-background" />
          </motion.div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] md:text-sm font-body font-bold text-gold uppercase tracking-[0.3em] mb-4"
            >
              {config.heroBadge}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-white leading-tight mb-8"
            >
              {config.heroTitle.split(' Convention. ').length > 1 ? (
                <>
                  {config.heroTitle.split(' Convention. ')[0]}<br className="hidden md:block" />
                  Defying <span className="italic font-light text-gold/80">Convention.</span>
                </>
              ) : config.heroTitle}
            </motion.h1>
          </div>
        </section>

        {/* Our Narrative */}
        <section className="py-24 lg:py-40 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <motion.div {...fadeIn}>
                <Sparkles size={32} className="mx-auto text-gold mb-8 opacity-50" />
                <h2 className="font-display text-2xl md:text-3xl lg:text-5xl font-bold text-foreground mb-6 md:mb-8 leading-tight">
                  {config.narrativeTitle.split(' Revolution. ').length > 1 ? (
                    <>
                      {config.narrativeTitle.split(' Revolution. ')[0]}<br className="hidden md:block" />It is a <span className="text-gold italic font-light">Revolution.</span>
                    </>
                  ) : config.narrativeTitle}
                </h2>
                <div className="space-y-4 md:space-y-6 text-base md:text-lg font-body text-muted-foreground leading-relaxed text-left max-w-2xl mx-auto">
                   {config.narrativeParagraphs.map((para: string, i: number) => (
                     <p key={i}>{para}</p>
                   ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Philosophy Grid */}
        <section className="py-16 md:py-20 bg-secondary/30 relative">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {config.values.map((value: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-background border border-gold/10 rounded-[2rem] hover:border-gold/30 transition-colors group"
                >
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {resolveIcon(value.icon)}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 uppercase tracking-wider">{value.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-loose">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Large Visual Interlude */}
        <section className="h-[60vh] lg:h-[80vh] relative overflow-hidden flex items-center justify-center">
          <img 
            src={getAssetUrl(config.interludeImage)} 
            alt="The Science of Purity" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 relative z-10 text-center text-white"
          >
            <h3 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[0.2em] mb-4">
              {config.interludeTitle}
            </h3>
            <p className="font-body text-[10px] md:text-sm lg:text-lg tracking-[0.3em] font-bold opacity-80">
              {config.interludeSubtitle}
            </p>
          </motion.div>
        </section>

        {/* The Curators */}
        <section className="py-20 md:py-32 lg:py-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <img src={getAssetUrl(config.curatorImage)} alt="Founder" className="w-full h-full object-cover" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2 space-y-8"
              >
                <p className="text-gold font-body font-bold uppercase tracking-widest text-sm">{config.curatorBadge}</p>
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  {config.curatorTitle.split(' Luxury. ').length > 1 ? (
                    <>
                      {config.curatorTitle.split(' Luxury. ')[0]} <span className="italic font-light">Luxury.</span>
                    </>
                  ) : config.curatorTitle}
                </h2>
                <div className="space-y-6 text-muted-foreground font-body leading-relaxed text-base md:text-lg">
                  <p>
                    "{config.curatorQuote}"
                  </p>
                  <p className="font-display text-lg md:text-xl text-primary font-bold">{config.curatorName}</p>
                </div>
                <div className="pt-8">
                  <button className="px-10 py-4 bg-primary text-primary-foreground font-body font-bold uppercase tracking-widest text-xs rounded-full hover:bg-gold transition-all shadow-xl hover:shadow-gold/20">
                    Explore Our Vision
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Commitment Badge */}
        <section className="py-16 md:py-20 border-y border-gold/10 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center md:justify-around items-center gap-8 md:gap-12 opacity-60">
               {config.commitments.map((commit: string, i: number) => (
                 <span key={i} className="font-display text-xs md:text-lg font-bold uppercase tracking-[0.3em]">{commit}</span>
               ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default About;
