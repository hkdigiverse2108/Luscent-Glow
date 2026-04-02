import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Clock, User, ArrowRight, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { blogPosts, blogCategories } from "@/data/blogData";
import { Link } from "react-router-dom";

const Blogs = () => {
  const featuredPost = blogPosts.find(post => post.featured) || blogPosts[0];
  
  const filteredPosts = blogPosts.filter(post => post.id !== featuredPost.id);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      
      <main>
        {/* Cinematic Hero Spotlight */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-charcoal">
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
        <section className="py-16 md:py-24 lg:py-32 bg-[#faf9f6]">
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

        {/* Luxury Newsletter Section */}
        <section className="py-16 md:py-24 lg:py-40 relative">
          <div className="container mx-auto px-4 md:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden group bg-charcoal rounded-[4rem] lg:rounded-[6rem] p-12 lg:p-24 text-center shadow-2xl"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(182,143,76,0.15),_transparent_70%)]" />
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold/20 rounded-full blur-[100px] opacity-20 animate-float" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-light/10 rounded-full blur-[100px] opacity-30 animate-pulse" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 text-gold/60">
                    <div className="h-[1px] w-12 bg-gold/30" />
                    <Mail size={20} className="animate-bounce" />
                    <div className="h-[1px] w-12 bg-gold/30" />
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight">
                    Stay <span className="text-gradient-gold italic font-light">Radiant</span>
                  </h2>
                  <p className="text-white/60 font-body text-sm md:text-lg leading-relaxed">
                    Join our inner circle for exclusive skincare rituals, early product unveiling, and mindful beauty inspiration straight to your sanctuary.
                  </p>
                </div>

                <div className="relative max-w-lg mx-auto flex flex-col items-center">
                  <input
                    type="email"
                    placeholder="Enter your email sanctuary"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-full py-4 md:py-6 md:pr-44 md:pl-8 px-6 text-white font-body focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all text-sm md:text-base focus:placeholder:opacity-0"
                  />
                  <button className="w-full md:w-auto md:absolute md:right-2 md:top-2 md:bottom-2 mt-4 md:mt-0 py-4 md:py-0 px-10 bg-gold text-charcoal font-body font-bold rounded-2xl md:rounded-full uppercase tracking-widest text-[10px] md:text-[10px] hover:bg-white transition-all duration-500 shadow-xl group/btn min-h-[48px]">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Subscribe <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
                
                <p className="text-[10px] font-body text-white/30 uppercase tracking-[0.2em]">
                  By joining, you agree to our <Link to="/privacy-policy" className="text-gold/60 underline hover:text-gold transition-colors">Privacy Sanctum</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Blogs;
