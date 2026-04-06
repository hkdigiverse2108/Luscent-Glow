import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  Truck, 
  RefreshCcw, 
  ShieldCheck, 
  HelpCircle,
  Plus,
  Minus,
  Zap
} from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getApiUrl } from "@/lib/api";

const FAQ = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConfig = async () => {
    try {
      const response = await fetch(getApiUrl("/api/faq/settings"));
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        if (data.categories?.length > 0) {
          setActiveCategory(data.categories[0].category);
        }
      }
    } catch (error) {
      console.error("Failed to fetch FAQ settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // resolveIcon removed in favor of DynamicIcon component

  const filteredFaqs = config?.categories
    ? config.categories
        .filter((cat: any) => cat.category === activeCategory)
        .map((cat: any) => ({
          ...cat,
          questions: cat.questions.filter((q: any) => 
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }))
    : [];

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-gold animate-pulse">
            Establishing Concierge Connection...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 px-4">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold font-body font-bold uppercase tracking-[0.3em] mb-4 text-[10px] md:text-xs"
            >
              {config.heroBadge}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight md:leading-[1.1]"
            >
              {config.heroTitle.split(' assist you? ').length > 1 ? (
                <>
                  How can we <span className="italic font-light">assist you?</span>
                </>
              ) : config.heroTitle}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-body text-muted-foreground text-sm md:text-lg italic"
            >
              "{config.heroDescription}"
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto mb-12 md:mb-16 relative px-4"
          >
            <div className="absolute inset-y-0 left-9 md:left-5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" />
            </div>
            <input 
              type="text"
              placeholder="Search for a question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 md:pl-14 pr-6 py-4 md:py-5 bg-white border border-gold/10 rounded-xl md:rounded-2xl font-body text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all shadow-ethereal"
            />
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            {/* Sidebar Categories */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:w-1/3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide px-4 md:px-0"
            >
              {config.categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`
                    flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-xl transition-all duration-300 whitespace-nowrap
                    ${activeCategory === cat.category 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                      : "bg-white text-muted-foreground hover:bg-gold/5 hover:text-primary border border-gold/5"}
                  `}
                >
                  <span className={`${activeCategory === cat.category ? "text-gold" : "text-muted-foreground/50"} flex-shrink-0`}>
                    <DynamicIcon name={cat.icon} size={20} />
                  </span>
                  <span className="font-body font-bold uppercase tracking-wider text-[10px] md:text-xs">
                    {cat.category}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* FAQ List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:w-2/3"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Accordion type="single" collapsible className="space-y-4 px-4 md:px-0">
                    {filteredFaqs[0]?.questions.length > 0 ? (
                      filteredFaqs[0].questions.map((q: any) => (
                        <AccordionItem 
                          key={q.id} 
                          value={q.id}
                          className="bg-white border border-gold/10 rounded-xl md:rounded-2xl px-5 md:px-6 data-[state=open]:border-gold/30 transition-all shadow-sm"
                        >
                          <AccordionTrigger className="font-display text-lg md:text-xl font-bold text-foreground hover:no-underline text-left py-5 md:py-6">
                            {q.question}
                          </AccordionTrigger>
                          <AccordionContent className="font-body text-muted-foreground text-sm md:text-lg leading-relaxed pb-5 md:pb-6 italic">
                            {q.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-2xl border border-gold/10">
                        <HelpCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="font-body text-muted-foreground">No questions found matching your search.</p>
                      </div>
                    )}
                  </Accordion>
                </motion.div>
              </AnimatePresence>

              {/* Support Card */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-12 p-8 glass-gold rounded-[2rem] text-center border border-gold/20"
              >
                <div className="flex justify-center mb-4 text-gold">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2 uppercase tracking-wider">
                  {config.supportTitle}
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  {config.supportDescription}
                </p>
                <a 
                  href={config.supportButtonLink}
                  className="inline-block px-10 py-4 bg-primary text-primary-foreground font-body font-bold uppercase tracking-widest text-xs rounded-full hover:bg-gold transition-all shadow-xl hover:shadow-gold/20"
                >
                  {config.supportButtonText}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default FAQ;
