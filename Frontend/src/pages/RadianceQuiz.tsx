import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Check, ChevronLeft, RefreshCw, ShoppingBag, Heart, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { products, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const RadianceQuiz = () => {
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const res = await fetch("/api/quiz/steps");
        if (res.ok) {
          const data = await res.json();
          setSteps(data);
        }
      } catch (err) {
        console.error("Failed to load quiz steps:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSteps();
  }, []);

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [steps[currentStep].stepId]: optionId });
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setIsFinished(true), 300);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isFinished || steps.length === 0) return;
      try {
        setLoading(true);
        // Extract tags from selected answers
        const selectedTags = steps.map(step => {
          const selId = answers[step.stepId];
          return step.options.find((o: any) => o.id === selId)?.recommendedTag;
        }).filter(t => !!t);

        const response = await fetch(`/api/products/recommend?tags=${selectedTags.join(",")}`);
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
  }, [isFinished, answers, steps]);

  useEffect(() => {
    const submitConsultation = async () => {
      if (!isFinished || recommendations.length === 0) return;
      
      const userStr = localStorage.getItem("user");
      let userData = null;
      if (userStr && userStr !== "undefined") {
        try { userData = JSON.parse(userStr); } catch (e) {}
      }

      const submissionData = {
        skinType: answers.skinType,
        concern: answers.concern,
        routine: answers.routine,
        recommendedProductIds: recommendations.map(p => p._id || p.id),
        userName: userData?.name || "Anonymous Visitor",
        userEmail: userData?.email || null,
        createdAt: new Date().toISOString()
      };

      try {
        await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData)
        });
      } catch (err) {
        console.error("Error submitting consultation:", err);
      }
    };

    submitConsultation();
  }, [isFinished, recommendations]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {!isFinished ? (
            loading ? (
              <div className="py-40 text-center space-y-4">
                <RefreshCw size={40} className="animate-spin text-gold/30 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Preparing Your Consultation...</p>
              </div>
            ) : steps.length > 0 ? (
              <div className="space-y-12">
                <div className="text-center space-y-4 md:space-y-6">
                  <p className="text-[10px] md:text-xs font-body font-bold text-gold uppercase tracking-[0.3em]">Radiance Ritual Consultation</p>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-foreground italic px-4">Find Your Personalized Glow</h1>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden max-w-[200px] md:max-w-xs mx-auto mt-6 md:mt-8">
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
                    <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-center text-foreground font-light mb-8 md:mb-10 px-4">
                      {steps[currentStep]?.question}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {steps[currentStep]?.options.map((option: any) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          className={`group p-5 md:p-6 rounded-2xl md:rounded-3xl border text-left transition-all duration-500 hover:shadow-ethereal flex items-center gap-4 md:gap-5 ${
                            answers[steps[currentStep].stepId] === option.id 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-white border-gold/10 text-foreground hover:border-gold/30 hover:bg-gold/5"
                          }`}
                        >
                          <span className="text-2xl md:text-3xl filter grayscale group-hover:grayscale-0 transition-all">{option.icon}</span>
                          <div>
                            <p className="font-body font-bold text-[10px] md:text-sm tracking-widest mb-0.5 md:mb-1 uppercase">{option.label}</p>
                            <p className="text-[10px] md:text-xs opacity-60 italic">{option.sub}</p>
                          </div>
                          {answers[steps[currentStep].stepId] === option.id && <Check className="ml-auto text-gold" size={20} />}
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
              <div className="py-20 text-center space-y-6">
                <AlertCircle size={48} className="text-gold/20 mx-auto" />
                <p className="font-display italic text-muted-foreground">The consultation is momentarily unavailable. Please try again later.</p>
              </div>
            )
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4 md:space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 text-gold animate-pulse">
                  <Sparkles size={32} />
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-light text-primary tracking-tight leading-tight">
                  Your Radiance <span className="italic font-normal text-gold">Ritual</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-body max-w-sm mx-auto italic">
                  "Authentic glow begins with understanding. Based on your profile, we have curated these treasures to harmonize with your skin's natural rhythm."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                      onClick={() => {
                        addItem({
                          id: product._id || product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          quantity: 1
                        });
                        if (isInWishlist(product._id || product.id)) toggleWishlist(product);
                      }}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-full text-[10px] font-body font-bold uppercase tracking-widest hover:bg-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Ritual
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-8 pt-6 md:pt-10">
                <div className="p-6 md:p-8 border border-gold/10 bg-gold/5 rounded-[2rem] md:rounded-[3rem] max-w-2xl mx-auto">
                  <h3 className="font-display text-2xl md:text-3xl font-light mb-4">Complete Your Transformation</h3>
                  <p className="text-[10px] md:text-sm font-body text-muted-foreground mb-6">
                    Use code <span className="font-bold text-gold">GLOWCONSULT</span> for a complimentary signature sample with this ritual.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link 
                      to="/cart"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-body font-bold uppercase tracking-[0.15em] text-[10px] md:text-xs hover:bg-gold transition-all"
                    >
                      Purchase Ritual <ArrowRight size={16} />
                    </Link>
                    <button 
                      onClick={() => {
                        setIsFinished(false);
                        setCurrentStep(0);
                        setAnswers({});
                      }}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-gold/30 text-gold rounded-full font-body font-bold uppercase tracking-[0.15em] text-[10px] md:text-xs hover:bg-gold/5 transition-all"
                    >
                      <RefreshCw size={16} /> Retake Quiz
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RadianceQuiz;
