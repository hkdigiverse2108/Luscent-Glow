import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Mail, MapPin, Send, CheckCircle2, ChevronDown, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getApiUrl } from "@/lib/api";

const boutiqueStorefront = "/assets/contact/boutique-storefront.png";
const glowTexture = "/assets/contact/glow-texture.png";

const Contact = () => {
  const [formStep, setFormStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "Curation Advice",
    message: ""
  });

  const subjects = [
    "Curation Advice",
    "Order Support",
    "Partnership Inquiry",
    "Press & Media",
    "General Exploration"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl("/contact/inquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error("Failed to submit inquiry");
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
              <p className="text-[10px] md:text-sm font-body font-bold text-gold uppercase tracking-[0.4em] mb-4 md:mb-6">The Glow Concierge</p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 md:mb-8 text-glow-gold/30">
                Your Radiance,<br />Our <span className="italic font-light text-gold/80">Priority.</span>
              </h1>
              <p className="text-sm md:text-lg font-body text-white/60 leading-relaxed max-w-xl">
                Whether you seek personalized product curation or require immediate support, our artisan team is here to illuminate your journey.
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
                  <h2 className="font-display text-3xl font-bold text-foreground capitalize">Initiate a Conversation</h2>
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
                      <p className="text-xs font-body font-bold text-gold uppercase tracking-widest mb-4">Nature of Inquiry</p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {subjects.map((sub) => (
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
                        Tell us more about your discovery
                      </label>
                    </div>

                    <button 
                      type="submit"
                      className="w-full sm:w-auto group flex items-center justify-center gap-4 px-10 md:px-12 py-4 md:py-5 bg-primary text-white rounded-full font-body font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-gold transition-all shadow-2xl hover:shadow-gold/30"
                    >
                      Illuminate My Inquiry <Send size={16} className="group-hover:translate-x-2 transition-transform" />
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
                    <h3 className="font-display text-4xl font-bold text-foreground">Inquiry Received.</h3>
                    <p className="font-body text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Our artisan team has been notified. Expect a personalized response within 24 radiance hours.
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
                    <div className="flex gap-8 group">
                      <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-colors">
                        <Phone size={24} className="group-hover:text-primary transition-colors text-gold" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-body font-bold text-gold uppercase tracking-widest">Digital Concierge</p>
                        <p className="font-display text-2xl font-bold text-foreground">+91 97126 63607</p>
                        <p className="text-sm font-body text-muted-foreground italic">Available for one-on-one WhatsApp curation.</p>
                      </div>
                    </div>

                    <div className="flex gap-8 group">
                      <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-colors">
                        <Mail size={24} className="group-hover:text-primary transition-colors text-gold" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-body font-bold text-gold uppercase tracking-widest">Artisan Support</p>
                        <p className="font-display text-2xl font-bold text-foreground">hello@luscentglow.com</p>
                        <p className="text-sm font-body text-muted-foreground italic">For deeper inquiries and shared visions.</p>
                      </div>
                    </div>
                  </div>

                  {/* Boutique Preview */}
                  <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group">
                    <img src={boutiqueStorefront} alt="Our Boutique" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* Quick FAQ Strip */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Seeking Instant Curation?</h3>
                <p className="text-white/40 font-body italic text-sm">Most inquiries are illuminated in our FAQ registry.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {["Shipping Registry", "Return Rituals", "Authenticity Seal"].map((item) => (
                  <button key={item} className="px-8 py-3 border border-white/20 rounded-full text-[10px] font-body font-bold text-white uppercase tracking-widest hover:border-gold hover:text-gold transition-all">
                    {item}
                  </button>
                ))}
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
