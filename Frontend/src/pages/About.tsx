import { motion } from "framer-motion";
import { Leaf, Heart, Globe, Shield, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

import heroAbout from "@/assets/about/hero-about.png";
import valuesBotanical from "@/assets/about/values-botanical.png";
import curatorPortrait from "@/assets/about/curator-portrait.png";

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const values = [
    {
      icon: <Leaf className="text-gold" />,
      title: "Botanical Excellence",
      description: "We source the rarest, most potent botanical extracts to ensure your skin receives nature's finest curation."
    },
    {
      icon: <Heart className="text-gold" />,
      title: "Cruelty-Free Ethics",
      description: "Beauty should never come at a cost to others. We are 100% vegan and strictly against animal testing."
    },
    {
      icon: <Globe className="text-gold" />,
      title: "Sustainable Glow",
      description: "Our packaging is designed with the earth in mind—recyclable glass and minimal plastic footprint."
    },
    {
      icon: <Shield className="text-gold" />,
      title: "Dermal Integrity",
      description: "Every formula is dermatologically tested to respect the natural barrier of your skin."
    }
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30">
      <Header />
      
      <main>
        {/* Editorial Hero */}
        <section className="relative h-[85vh] overflow-hidden flex items-center">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img 
              src={heroAbout} 
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
              className="text-sm font-body font-bold text-gold uppercase tracking-[0.3em] mb-4"
            >
              The Luscent Chronicle
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="font-display text-5xl lg:text-8xl font-bold text-white leading-tight mb-8"
            >
              Curating Radiance,<br />
              Defying <span className="italic font-light">Convention.</span>
            </motion.h1>
          </div>
        </section>

        {/* Our Narrative */}
        <section className="py-24 lg:py-40 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <motion.div {...fadeIn}>
                <Sparkles size={32} className="mx-auto text-gold mb-8 opacity-50" />
                <h2 className="font-display text-3xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">
                  Beauty is not a trend.<br />It is a <span className="text-gold">Quiet Revolution.</span>
                </h2>
                <div className="space-y-6 text-lg font-body text-muted-foreground leading-relaxed">
                  <p>
                    Luscent Glow was born from a singular obsession: to bridge the gap between scientific precision and botanical poetry. We believe that skincare should not just be a routine, but a daily ritual of self-appreciation.
                  </p>
                  <p>
                    Founded in 2024, we set out to eliminate the noise of the beauty industry. No fillers, no empty promises—just pure, high-performance formulations designed to reveal the luminous skin you already possess.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Philosophy Grid */}
        <section className="py-20 bg-secondary/30 relative">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-background border border-gold/10 rounded-[2rem] hover:border-gold/30 transition-colors group"
                >
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 uppercase tracking-wider">{value.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-loose">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Large Visual Interlude */}
        <section className="h-[60vh] lg:h-[80vh] relative overflow-hidden flex items-center justify-center">
          <img 
            src={valuesBotanical} 
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
            <h3 className="font-display text-4xl lg:text-6xl font-bold uppercase tracking-[0.2em] mb-4">
              98% Natural Origins
            </h3>
            <p className="font-body text-sm lg:text-lg tracking-widest opacity-80">
              CRAFTED IN SMALL BATCHES FOR UNCOMPROMISED POTENCY
            </p>
          </motion.div>
        </section>

        {/* The Curators */}
        <section className="py-24 lg:py-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <img src={curatorPortrait} alt="Founder" className="w-full h-full object-cover" />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2 space-y-8"
              >
                <p className="text-gold font-body font-bold uppercase tracking-widest text-sm">Our Founder</p>
                <h2 className="font-display text-4xl lg:text-6xl font-bold text-foreground">A Vision of <span className="italic font-light">Subtle Luxury.</span></h2>
                <div className="space-y-6 text-muted-foreground font-body leading-relaxed text-lg">
                  <p>
                    "I wanted to create a space where beauty wasn't about concealment, but about enhancement. Luscent Glow is my love letter to skin that breathes, shines, and tells its own unique story."
                  </p>
                  <p className="font-display text-xl text-primary font-bold">— Janvi Vasani, Founder & Curator</p>
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
        <section className="py-20 border-y border-gold/10 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-around items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="font-display text-lg font-bold uppercase tracking-widest">100% Vegan</span>
              <span className="font-display text-lg font-bold uppercase tracking-widest">Paraben Free</span>
              <span className="font-display text-lg font-bold uppercase tracking-widest">Cruelty Free</span>
              <span className="font-display text-lg font-bold uppercase tracking-widest">Recyclable Glass</span>
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
