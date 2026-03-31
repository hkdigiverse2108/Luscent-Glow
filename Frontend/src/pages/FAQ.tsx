import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  Truck, 
  RefreshCcw, 
  ShieldCheck, 
  HelpCircle,
  Plus,
  Minus
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    category: "General",
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        id: "g1",
        question: "What makes Luscent Glow unique?",
        answer: "Luscent Glow bridges the gap between scientific precision and botanical poetry. Our formulas are crafted in small batches using rare botanical extracts and dermatologically-tested active ingredients to ensure maximum potency and safety."
      },
      {
        id: "g2",
        question: "Are your products suitable for sensitive skin?",
        answer: "Yes, most of our products are formulated with dermal integrity in mind. However, we always recommend performing a patch test on a small area of skin before full application, or consulting with a dermatologist if you have specific concerns."
      }
    ]
  },
  {
    category: "Orders & Shipping",
    icon: <Truck className="w-5 h-5" />,
    questions: [
      {
        id: "s1",
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 3-5 business days. For our 'Glow Priority' members, we offer expedited 1-2 day delivery. You will receive a tracking number via email as soon as your order is dispatched."
      },
      {
        id: "s2",
        question: "Do you ship internationally?",
        answer: "Currently, we ship within the continental United States and select international locations. Please check our shipping calculator at checkout for specific availability and rates for your region."
      }
    ]
  },
  {
    category: "Products",
    icon: <Package className="w-5 h-5" />,
    questions: [
      {
        id: "p1",
        question: "Are your products vegan and cruelty-free?",
        answer: "Absolutely. We are committed to ethical beauty. 100% of our products are vegan and we never test on animals at any stage of product development."
      },
      {
        id: "p2",
        question: "How should I store my skincare products?",
        answer: "To maintain the integrity of our botanical extracts, store your products in a cool, dry place away from direct sunlight. Some users prefer refrigeration for our serums to enhance their soothing effect."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    icon: <RefreshCcw className="w-5 h-5" />,
    questions: [
      {
        id: "r1",
        question: "What is your return policy?",
        answer: "We offer a 30-day satisfaction guarantee. If you are not completely satisfied with your purchase, you may return it for a full refund or exchange. The product must be at least 50% full to be eligible."
      },
      {
        id: "r2",
        question: "How do I start a return?",
        answer: "Simply contact our 'Glow Concierge' via the Contact page or email us at support@luscentglow.com with your order number, and we will guide you through the process."
      }
    ]
  }
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("General");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqData
    .filter(cat => cat.category === activeCategory)
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }));

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold font-body font-bold uppercase tracking-[0.3em] mb-4 text-xs"
            >
              Concierge Services
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl lg:text-7xl font-bold text-foreground mb-6"
            >
              How can we <span className="italic font-light">assist you?</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-body text-muted-foreground text-lg"
            >
              Explore our curated guide to the most frequent inquiries regarding 
              your journey to radiant skin.
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto mb-16 relative"
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <input 
              type="text"
              placeholder="Search for a question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-gold/10 rounded-2xl font-body text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all shadow-ethereal"
            />
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            {/* Sidebar Categories */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:w-1/3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide"
            >
              {faqData.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`
                    flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap
                    ${activeCategory === cat.category 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                      : "bg-white text-muted-foreground hover:bg-gold/5 hover:text-primary"}
                  `}
                >
                  <span className={`${activeCategory === cat.category ? "text-gold" : "text-muted-foreground/50"}`}>
                    {cat.icon}
                  </span>
                  <span className="font-body font-bold uppercase tracking-wider text-xs">
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
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFaqs[0]?.questions.length > 0 ? (
                      filteredFaqs[0].questions.map((q) => (
                        <AccordionItem 
                          key={q.id} 
                          value={q.id}
                          className="bg-white border border-gold/10 rounded-2xl px-6 data-[state=open]:border-gold/30 transition-all shadow-sm"
                        >
                          <AccordionTrigger className="font-display text-xl font-bold text-foreground hover:no-underline text-left py-6">
                            {q.question}
                          </AccordionTrigger>
                          <AccordionContent className="font-body text-muted-foreground text-lg leading-relaxed pb-6">
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
                  Still have questions?
                </h3>
                <p className="font-body text-muted-foreground mb-6">
                  Our Glow Concierge team is here to assist you with any personalized requests.
                </p>
                <a 
                  href="/contact"
                  className="inline-block px-10 py-4 bg-primary text-primary-foreground font-body font-bold uppercase tracking-widest text-xs rounded-full hover:bg-gold transition-all shadow-xl hover:shadow-gold/20"
                >
                  Contact Concierge
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
