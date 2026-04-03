import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Clock, User, ArrowRight, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { blogPosts, blogCategories } from "@/data/blogData";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

const Blogs = () => {
  const featuredPost = blogPosts.find(post => post.featured) || blogPosts[0];
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/api/newsletter/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Welcome to our inner circle!");
        setEmail("");
      } else {
        toast.error(data.detail || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Could not reach our sanctuary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = blogPosts.filter(post => post.id !== featuredPost.id);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      
      <main>
        {/* Cinematic Hero Spotlight */}
        <section className="relative py-12 lg:py-16 overflow-hidden bg-charcoal">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 opacity-40" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-light/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 opacity-30" />
          
          <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-center">
              {/* Featured Image Stage */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="w-full lg:w-3/5"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gold/10 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative aspect-[16/9] rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.5 }}
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* Featured Content Area */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-full lg:w-2/5 space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-body font-bold text-gold/60 uppercase tracking-widest">
                    <span>{featuredPost.date}</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {featuredPost.title}
                  </h1>
                  <p className="text-white/60 font-body text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 border-t border-white/10 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                      <User size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-bold text-white/40 uppercase tracking-widest">Thought by</p>
                      <p className="text-xs font-body font-bold text-white uppercase tracking-wider">{featuredPost.author}</p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/blogs/${featuredPost.id}`}
                    className="group px-8 py-4 bg-gold text-charcoal font-body font-bold uppercase tracking-[0.15em] text-[10px] rounded-full hover:bg-white transition-all duration-500 shadow-xl flex items-center gap-3"
                  >
                    <span>Read The Story</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories & Grid */}
        <section className="py-10 md:py-16 bg-[#faf9f6]">
          <div className="container mx-auto px-4 md:px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-gold mb-4"
                >
                  <div className="h-[1px] w-8 bg-gold" />
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em]">The Journal</span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
                >
                  Glow Haven <span className="text-gradient-gold italic font-light">Chronicles</span>
                </motion.h2>
              </div>
            </div>

            {/* Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Cinematic Brand Finale */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          {/* Subtle Aura Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/5 rounded-full blur-[120px] opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-light/5 rounded-full blur-[100px] opacity-30" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-8 mb-4"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "4rem" }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-gold/60" 
                />
                <Sparkles size={24} className="text-gold/40 animate-pulse" strokeWidth={1} />
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "4rem" }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gradient-to-l from-transparent via-gold/30 to-gold/60" 
                />
              </motion.div>
              
              <div className="space-y-6">
                <motion.h3 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-5xl md:text-6xl lg:text-8xl font-light text-charcoal tracking-tighter"
                >
                  Stay <span className="text-gradient-gold italic font-normal">Inspired</span>
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <p className="font-body text-[10px] md:text-xs text-charcoal/30 uppercase tracking-[0.6em] leading-relaxed">
                    Every story is an invitation to your own
                  </p>
                  <p className="font-display text-xl md:text-2xl text-gold/60 italic font-light">
                    Ritual of Radiance
                  </p>
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

export default Blogs;
