import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { instagramPosts } from "@/data/products";

interface InstagramFeedProps {
  settings?: {
    profileHandle: string;
    widgetId: string;
    description: string;
  };
}

const InstagramFeed = ({ settings }: InstagramFeedProps) => {
  const widgetId = settings?.widgetId || import.meta.env.VITE_LIGHTWIDGET_ID || "YOUR_LIGHTWIDGET_ID_HERE";
  const hasWidget = widgetId !== "YOUR_LIGHTWIDGET_ID_HERE";
  const profileHandle = settings?.profileHandle || "@hk_digiverse";
  const description = settings?.description || "Explore our latest innovations and milestones. Follow @hk_digiverse for daily tech inspiration.";

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
          {hasWidget ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-[2.5rem] overflow-hidden shadow-ethereal border border-gold/10"
            >
              {/* LightWidget.com Grid - The most robust dynamic feed solution */}
              <iframe 
                src={`https://lightwidget.com/widgets/${widgetId}.html`}
                scrolling="no" 
                allowTransparency={true} 
                className="lightwidget-widget w-full border-0 overflow-hidden"
                style={{ width: '100%', height: 'auto', minHeight: '600px' }}
                title="HK Digiverse Instagram Feed"
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 opacity-30 pointer-events-none grayscale">
              {instagramPosts.slice(0, 6).map((post, i) => (
                <div key={i} className="aspect-square rounded-[2rem] bg-muted/50 flex items-center justify-center border border-dashed border-gold/20">
                  <Instagram size={24} className="text-gold/20" />
                </div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <div className="glass-premium p-10 rounded-[3rem] text-center border border-gold/30 shadow-2xl max-w-md mx-6">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                    <Instagram size={32} className="text-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Live Feed Pending</h3>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    Setting up your automatic Instagram feed from <span className="text-gold font-semibold">{profileHandle}</span>. Once connected, your posts will appear here instantly.
                  </p>
                  <a 
                    href="https://lightwidget.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white rounded-full font-body font-bold text-sm hover:bg-gold/90 transition-all shadow-lg hover-lift"
                  >
                    Connect Yours Now
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
