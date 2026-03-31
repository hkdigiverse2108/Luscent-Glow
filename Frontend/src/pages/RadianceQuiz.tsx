import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Check, ChevronLeft, RefreshCw, ShoppingBag, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { products, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

const steps = [
  {
    id: "skinType",
    question: "How would you describe your current skin state?",
    options: [
      { id: "dry", label: "Dry & Dehydrated", sub: "Feels tight, looks dull", icon: "💧" },
      { id: "oily", label: "Oily & Shiny", sub: "Excess sebum, enlarged pores", icon: "✨" },
      { id: "combination", label: "Combination", sub: "Oily T-zone, dry cheeks", icon: "🌓" },
      { id: "sensitive", label: "Sensitive", sub: "Prone to redness, reactive", icon: "🌸" }
    ]
  },
  {
    id: "concern",
    question: "What is your primary focus at the moment?",
    options: [
      { id: "glow", label: "Radiance & Glow", sub: "Revive tired, dull complexion", icon: "✨" },
      { id: "aging", label: "Aging Gracefully", sub: "Fine lines, loss of firmness", icon: "⏳" },
      { id: "acne", label: "Clarifying", sub: "Blemishes, texture, congestion", icon: "🧼" },
      { id: "recovery", label: "Barrier Recovery", sub: "Soothing, deep nourishment", icon: "🛡️" }
    ]
  },
  {
    id: "routine",
    question: "What is your preferred ritual style?",
    options: [
      { id: "minimal", label: "The Minimalist", sub: "3 essential steps max", icon: "⚪" },
      { id: "balanced", label: "Golden Balance", sub: "The perfect 5-step flow", icon: "🌅" },
      { id: "luxury", label: "The Maximalist", sub: "Full 10-step immersion", icon: "💎" }
    ]
  }
];

const RadianceQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: optionId });
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setIsFinished(true), 300);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isFinished) return;
      try {
        setLoading(true);
        const params = new URLSearchParams(answers);
        const response = await fetch(`/api/products/recommend?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [isFinished, answers]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {!isFinished ? (
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <p className="text-xs font-body font-bold text-gold uppercase tracking-[0.3em]">Radiance Ritual Consultation</p>
                <h1 className="font-display text-4xl lg:text-5xl font-light text-foreground italic">Find Your Personalized Glow</h1>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden max-w-xs mx-auto mt-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    className="h-full bg-gold shadow-[0_0_10px_rgba(182,143,76,0.3)]"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="font-display text-2xl lg:text-3xl text-center text-foreground font-light mb-10">
                    {steps[currentStep].question}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {steps[currentStep].options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className={`group p-6 rounded-3xl border text-left transition-all duration-500 hover:shadow-ethereal flex items-center gap-5 ${
                          answers[steps[currentStep].id] === option.id 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white border-gold/10 text-foreground hover:border-gold/30 hover:bg-gold/5"
                        }`}
                      >
                        <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{option.icon}</span>
                        <div>
                          <p className="font-body font-bold text-sm tracking-wide mb-1 uppercase">{option.label}</p>
                          <p className="text-xs opacity-60 italic">{option.sub}</p>
                        </div>
                        {answers[steps[currentStep].id] === option.id && <Check className="ml-auto text-gold" size={20} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {currentStep > 0 && (
                <div className="text-center">
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground hover:text-gold flex items-center gap-2 mx-auto"
                  >
                    <ChevronLeft size={14} /> Back to Previous
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-16"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold animate-pulse">
                  <Sparkles size={32} />
                </div>
                <h1 className="font-display text-4xl lg:text-6xl font-light text-foreground tracking-tight">
                  Your Radiance <span className="italic font-normal">Ritual</span>
                </h1>
                <p className="text-muted-foreground font-body max-w-md mx-auto italic">
                  "Authentic glow begins with understanding. Based on your profile, we have curated these treasures to harmonize with your skin's natural rhythm."
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {loading ? (
                  <div className="col-span-3 text-center py-20">
                    <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-display italic text-muted-foreground">Curating your customized ritual...</p>
                  </div>
                ) : recommendations.map((product, i) => (
                  <motion.div
                    key={product._id || product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="glass-gold p-8 rounded-[3rem] text-center space-y-4 hover:shadow-2xl transition-all group"
                  >
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-lg">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-bold text-gold uppercase tracking-widest mb-1">{product.category}</p>
                      <h3 className="font-display text-xl font-normal text-foreground group-hover:text-gold transition-colors">{product.name}</h3>
                    </div>
                    <button 
                      onClick={() => addItem({
                        id: product._id || product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        quantity: 1
                      })}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-full text-[10px] font-body font-bold uppercase tracking-widest hover:bg-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Ritual
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-8 pt-10">
                <div className="p-8 border border-gold/10 bg-gold/5 rounded-[3rem] max-w-2xl mx-auto">
                  <h3 className="font-display text-2xl font-light mb-4">Complete Your Transformation</h3>
                  <p className="text-sm font-body text-muted-foreground mb-6">
                    Use code <span className="font-bold text-gold">GLOWCONSULT</span> for a complimentary signature sample with this ritual.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link 
                      to="/cart"
                      className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold transition-all"
                    >
                      Purchase Full Ritual <ArrowRight size={18} />
                    </Link>
                    <button 
                      onClick={() => {
                        setIsFinished(false);
                        setCurrentStep(0);
                        setAnswers({});
                      }}
                      className="inline-flex items-center gap-3 px-10 py-4 border border-gold/30 text-gold rounded-full font-body font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/5 transition-all"
                    >
                      <RefreshCw size={18} /> Retake Quiz
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default RadianceQuiz;
