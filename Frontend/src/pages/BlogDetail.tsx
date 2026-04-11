import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  ArrowLeft, Calendar, User, Mail, ArrowRight, ChevronRight, ShoppingBag,
  Sparkles, Heart
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { getApiUrl, getAssetUrl } from "@/lib/api";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [activeVoice, setActiveVoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, voicesRes] = await Promise.all([
          fetch(getApiUrl(`blogs/${id}`)),
          fetch(getApiUrl("blogs/editorial-voices"))
        ]);
        
        let postData = null;
        if (postRes.ok) {
          postData = await postRes.json();
          setPost(postData);
        }

        if (voicesRes.ok) {
          const voicesData = await voicesRes.json();
          // Find the specific voice matching this post's author
          const matchedVoice = voicesData.find((v: any) => v.name === postData?.author);
          
          if (matchedVoice) {
            setActiveVoice(matchedVoice);
          } else {
            // Fallback: Use the 'active' featured voice or the first available
            const active = voicesData.find((v: any) => v.isActive);
            setActiveVoice(active || (voicesData.length > 0 ? voicesData[0] : null));
          }
        }
      } catch (error) {
        console.error("Failed to fetch story details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Header />
        <div className="container mx-auto px-6 py-40 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto p-12 bg-white rounded-[3rem] shadow-ethereal border border-gold/10"
          >
            <h1 className="font-display text-4xl mb-6 text-foreground italic">Story Not Found</h1>
            <p className="text-muted-foreground font-body mb-8">This specific treasure has returned to the archives or moved to a new section.</p>
            <Link to="/blogs" className="text-gold font-body font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-x-1 transition-transform">
              <ArrowLeft size={18} /> Return to Journal
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#faf9f6] selection:bg-gold/20 selection:text-gold">
      <Header />

      <main>
        {/* Modern Reading Progress Bar */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1.5 bg-gold z-[101] origin-left"
          style={{ scaleX }}
        />

        {/* Immersive Editorial Header */}
        <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden bg-charcoal">
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            src={getAssetUrl(post.image)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent" />
          
          <div className="absolute inset-0 container mx-auto px-4 md:px-6 lg:px-12 flex flex-col justify-end pb-12 md:pb-24 lg:pb-32">
            <div className="max-w-5xl space-y-6 md:space-y-8">
              {/* Proper Breadcrumbs */}
              <nav className="flex flex-wrap items-center gap-2 md:gap-3 text-xs font-body font-bold text-white uppercase tracking-[0.2em] mb-4 md:mb-6">
                <Link to="/" className="hover:text-gold transition-all">Home</Link>
                <ChevronRight size={10} className="text-gold/60" />
                <Link to="/blogs" className="hover:text-gold transition-all">Journal</Link>
                <ChevronRight size={10} className="text-gold/60" />
                <span className="text-white/60 truncate max-w-[150px] md:max-w-[200px]">{post.title}</span>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
              >
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-body font-bold text-gold uppercase tracking-[0.3em]">{post.category}</span>
                </div>
                
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 md:mb-12 shadow-text">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 md:gap-12 text-[11px] md:text-xs font-body font-bold text-white uppercase tracking-widest border-t border-white/20 pt-6 md:pt-10">
                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center bg-gold/10 group-hover:bg-gold transition-all duration-500">
                      <User size={16} className="text-gold group-hover:text-charcoal" />
                    </div>
                    <div>
                      <p className="text-white/60 mb-0.5 md:mb-1 tracking-[0.2em]">Written By</p>
                      <p className="text-white group-hover:text-gold transition-all">{post.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                      <Calendar size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/60 mb-0.5 md:mb-1 tracking-[0.2em]">Published</p>
                      <p className="text-white">{post.date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content & Shopping Synergy Section */}
        <section className="py-16 md:py-24 lg:py-40 relative -mt-10 md:-mt-16 lg:-mt-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-12">
            <div className="flex flex-col xl:flex-row gap-12 md:gap-24 relative">
              
              {/* High-Legibility Article Body */}
              <article className="flex-1 max-w-[850px] mx-auto xl:mx-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="prose prose-stone max-w-none md:prose-xl
                      prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                      prose-p:font-body prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-6 md:prose-p:mb-10 prose-p:text-sm md:prose-p:text-lg
                      prose-a:text-gold prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-[1.5rem] md:prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-10 md:prose-img:my-20
                      prose-strong:text-foreground prose-strong:font-bold
                    "
                    dangerouslySetInnerHTML={{ __html: post.content || "" }}
                  />

                {/* Author Signature */}
                <div className="mt-16 md:mt-32 pt-12 md:pt-20 border-t border-gold/10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8 md:gap-12">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-gold to-rose-light rounded-full blur-[10px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-secondary overflow-hidden border-2 border-white shadow-xl flex items-center justify-center">
                      {activeVoice?.image ? (
                        <img src={getAssetUrl(activeVoice.image)} alt={activeVoice.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={44} className="text-gold/40" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="text-[10px] font-body font-bold text-gold uppercase tracking-[0.3em]">{activeVoice?.badge || "Editorial Voice"}</span>
                      <div className="h-[1px] hidden md:block flex-1 bg-gold/10" />
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground italic">{activeVoice?.name || post.author}</h3>
                    <p className="text-muted-foreground font-body text-base md:text-lg leading-relaxed max-w-2xl italic">
                      "{activeVoice?.quote || "A voice of authority in modern radiance..."}"
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
