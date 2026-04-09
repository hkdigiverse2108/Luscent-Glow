import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Mail, MapPin, Send, CheckCircle2, ChevronDown, Phone, Zap } from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getApiUrl, getAssetUrl } from "@/lib/api";

const glowTexture = "/assets/contact/glow-texture.png";

const Contact = () => {
  const [config, setConfig] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const initialFormState = {
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: ""
  };

  const [formState, setFormState] = useState(initialFormState);

  const fetchConfig = async () => {
    try {
      const [contactRes, globalRes] = await Promise.all([
        fetch(getApiUrl("/api/contact-settings/settings")),
        fetch(getApiUrl("/api/settings/global/"))
      ]);
      
      let contactData = null;
      let globalData = null;

      if (contactRes.ok) {
        contactData = await contactRes.json();
      }
      if (globalRes.ok) {
        globalData = await globalRes.json();
        setGlobalSettings(globalData);
      }

      if (contactData) {
        // Merge global settings into channels if they exist
        if (globalData && contactData.channels) {
          contactData.channels = contactData.channels.map((chan: any) => {
            if (chan.badge === "Call Us" && globalData.supportPhone) {
              return { ...chan, value: globalData.supportPhone };
            }
            if (chan.badge === "Email Us" && globalData.supportEmail) {
              return { ...chan, value: globalData.supportEmail };
            }
            return chan;
          });
        }
        setConfig(contactData);
        if (contactData.formSubjects?.length > 0) {
          setFormState(prev => ({ ...prev, subject: contactData.formSubjects[0] }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
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
      const response = await fetch(getApiUrl("/api/contact/inquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      if (response.ok) {
        setIsSubmitted(true);
        setFormState({ ...initialFormState, subject: config?.formSubjects?.[0] || "" });
      } else {
        console.error("Failed to submit inquiry");
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
    }
  };

  // resolveIcon removed in favor of DynamicIcon component

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-gold animate-pulse">
            Establishing Concierge Ritual...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30 overflow-x-hidden">
      <Header />
      
      <main className="relative">
        {/* Abstract Background Texture */}
        <div className="fixed inset-0 pointer-events-none opacity-5 mix-blend-multiply">
          <img src={glowTexture} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Hero Section */}
        <section className="pt-24 pb-16 lg:pt-48 lg:pb-32 bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <p className="text-[10px] md:text-sm font-body font-bold text-gold uppercase tracking-[0.4em] mb-4 md:mb-6">Customer Support</p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 md:mb-8 text-glow-gold/30">
                {config.heroTitle.split(' Priority. ').length > 1 ? (
                   <>
                      {config.heroTitle.split(' Priority. ')[0]}<br />Our <span className="italic font-light text-gold/80">Priority.</span>
                   </>
                ) : config.heroTitle} <span className="text-gold italic font-light">Concierge</span>
              </h1>
              <p className="text-sm md:text-lg font-body text-white/60 leading-relaxed max-w-xl">
                {config.heroDescription}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-24 lg:py-40">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-24 items-start">
              
              {/* Interactive Concierge Form */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <h2 className="font-display text-3xl font-bold text-foreground capitalize">Send us a Message</h2>
                  <div className="h-1 w-20 bg-gold/30" />
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      <div className="relative group">
                        <input 
                          type="text" 
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({...formState, name: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-gold transition-colors font-body peer placeholder-transparent text-sm md:text-base"
                          placeholder="Name"
                          id="name"
                        />
                        <label 
                          htmlFor="name"
                          className="absolute left-0 top-4 text-xs md:text-sm text-muted-foreground font-body transition-all pointer-events-none 
                          peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                        >
                          Full Name
                        </label>
                      </div>
                      <div className="relative group">
                        <input 
                          type="email" 
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({...formState, email: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-gold transition-colors font-body peer placeholder-transparent text-sm md:text-base"
                          placeholder="Email"
                          id="email"
                        />
                        <label 
                          htmlFor="email"
                          className="absolute left-0 top-4 text-xs md:text-sm text-muted-foreground font-body transition-all pointer-events-none 
                          peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                        >
                          Email Address
                        </label>
                      </div>
                      <div className="relative group sm:col-span-2 lg:col-span-1">
                        <input 
                          type="tel" 
                          required
                          value={formState.phoneNumber}
                          onChange={(e) => setFormState({...formState, phoneNumber: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-gold transition-colors font-body peer placeholder-transparent text-sm md:text-base"
                          placeholder="Phone Number"
                          id="phoneNumber"
                        />
                        <label 
                          htmlFor="phoneNumber"
                          className="absolute left-0 top-4 text-xs md:text-sm text-muted-foreground font-body transition-all pointer-events-none 
                          peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                        >
                          Phone Number
                        </label>
                      </div>
                    </div>

                    <div className="relative">
                      <p className="text-xs font-body font-bold text-gold uppercase tracking-widest mb-4">How can we help?</p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {config.formSubjects.map((sub: string) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setFormState({...formState, subject: sub})}
                            className={`px-4 md:px-6 py-2 rounded-full border text-[10px] md:text-xs font-body font-bold uppercase tracking-widest transition-all ${
                              formState.subject === sub 
                                ? "bg-gold border-gold text-primary shadow-lg shadow-gold/20" 
                                : "border-border text-muted-foreground hover:border-gold/50"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative group">
                      <textarea 
                        required
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-border py-4 outline-none focus:border-gold transition-colors font-body min-h-[120px] md:min-h-[150px] resize-none peer placeholder-transparent text-sm md:text-base"
                        placeholder="Message"
                        id="message"
                      />
                      <label 
                        htmlFor="message"
                        className="absolute left-0 top-4 text-xs md:text-sm text-muted-foreground font-body transition-all pointer-events-none 
                        peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Tell us more about your inquiry
                      </label>
                    </div>

                    <button 
                      type="submit"
                      className="w-full sm:w-auto group flex items-center justify-center gap-4 px-10 md:px-12 py-4 md:py-5 bg-primary text-white rounded-full font-body font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-gold transition-all shadow-2xl hover:shadow-gold/30"
                    >
                      Send Message <Send size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 bg-secondary rounded-[3rem] text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gold/30">
                      <CheckCircle2 size={40} className="text-primary" />
                    </div>
                    <h3 className="font-display text-4xl font-bold text-foreground">Message Received.</h3>
                    <p className="font-body text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Thank you for reaching out. Our team has been notified and will get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs font-body font-bold text-gold uppercase tracking-[0.2em] border-b border-gold pb-1 hover:opacity-70 transition-opacity"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Artisan Channels & Boutique */}
              <div className="space-y-20">
                <motion.div 
                   initial={{ opacity: 0, x: 30 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   className="space-y-12"
                >
                  <div className="space-y-10">
                    {config.channels.map((chan: any, i: number) => {
                       const isPhone = chan.icon?.toLowerCase().includes('phone');
                       const isMail = chan.icon?.toLowerCase().includes('mail');
                       const href = isPhone ? `tel:${chan.value.replace(/\s+/g, '')}` : isMail ? `mailto:${chan.value}` : undefined;
                       
                       const ChannelContent = (
                         <div className="flex gap-8 group cursor-pointer">
                           <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-colors text-gold group-hover:text-primary">
                              <DynamicIcon name={chan.icon} size={24} />
                           </div>
                           <div className="space-y-2">
                             <p className="text-xs font-body font-bold text-gold uppercase tracking-widest">{chan.badge}</p>
                             <p className="font-display text-2xl font-bold text-foreground">{chan.value}</p>
                             <p className="text-sm font-body text-muted-foreground italic">{chan.desc}</p>
                           </div>
                         </div>
                       );

                       return href ? (
                         <a key={i} href={href} className="block no-underline">
                           {ChannelContent}
                         </a>
                       ) : (
                         <div key={i}>{ChannelContent}</div>
                       );
                    })}
                  </div>

                  {/* Boutique Preview */}
                  <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group">
                    <img src={getAssetUrl(config.boutiqueImage)} alt="Our Boutique" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </motion.div>
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

export default Contact;
