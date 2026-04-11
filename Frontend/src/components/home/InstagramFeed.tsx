import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Play, ExternalLink } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface InstagramFeedProps {
  settings?: {
    profileHandle: string;
    widgetId: string;
    description: string;
    useCustomFeed?: boolean;
  };
}

const InstagramFeed = ({ settings }: InstagramFeedProps) => {
  const [customPosts, setCustomPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const useCustomFeed = settings?.useCustomFeed || false;
  const widgetId = settings?.widgetId || import.meta.env.VITE_LIGHTWIDGET_ID || "e28ed63b938158708c05b3804025caf6";
  const hasWidget = widgetId !== "e28ed63b938158708c05b3804025caf6";
  const profileHandle = settings?.profileHandle || "@hk_digiverse";
  const description = settings?.description || "Explore our latest innovations and milestones. Follow @hk_digiverse for daily tech inspiration.";

  useEffect(() => {
    if (useCustomFeed) {
      const fetchCustomPosts = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(getApiUrl("/api/instagram/"));
          if (response.ok) {
            const data = await response.json();
            setCustomPosts(data);
          }
        } catch (err) {
          console.error("Failed to fetch custom discovery grid:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomPosts();
    }
  }, [useCustomFeed]);

  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl text-left">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <Instagram size={18} className="text-gold" />
              <p className="text-sm font-body font-bold text-gold uppercase tracking-[0.3em]">
                {profileHandle}
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-[1.1]"
            >
              Our Journey on <span className="text-gold italic font-light">Instagram</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <p className="text-muted-foreground font-body max-w-xs text-right">
              {description}
            </p>
          </motion.div>
        </div>

        <div className="relative group">
          {useCustomFeed ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customPosts.map((post, idx) => (
                <motion.a
                  key={post._id || idx}
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border border-gold/5 bg-secondary/30 block"
                >
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption || "Instagram Post"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  
                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
                      {post.type === 'reel' ? <Play size={24} fill="white" /> : <ExternalLink size={24} />}
                    </div>
                    {post.type === 'reel' && (
                      <span className="mt-4 text-[10px] font-bold text-white uppercase tracking-[0.2em]">View Reel</span>
                    )}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-60">
                    <Instagram size={18} />
                  </div>
                </motion.a>
              ))}
              
              {customPosts.length === 0 && !isLoading && (
                <div className="col-span-full py-20 text-center glass-premium rounded-[3rem] border border-gold/10">
                   <p className="text-muted-foreground font-body italic">Curation in progress. Please check back later.</p>
                </div>
              )}
            </div>
          ) : hasWidget ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-[2.5rem] overflow-hidden shadow-ethereal border border-gold/10"
            >
              <iframe 
                src={`https://lightwidget.com/widgets/${widgetId}.html`}
                scrolling="no" 
                allowtransparency="true" 
                className="lightwidget-widget w-full border-0 overflow-hidden"
                style={{ width: '100%', height: 'auto', minHeight: '600px' }}
                title="HK Digiverse Instagram Feed"
              />
            </motion.div>
          ) : (
             <div className="py-20 text-center glass-premium rounded-[3rem] border border-gold/10">
               <p className="text-muted-foreground font-body italic">Automated feed link pending.</p>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
