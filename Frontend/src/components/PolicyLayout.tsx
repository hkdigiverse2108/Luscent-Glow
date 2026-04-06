import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { 
  Sparkles
} from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";

interface QuickInsight {
  icon: React.ReactNode | string;
  title: string;
  description: string;
}

interface PolicySection {
  id: string;
  title: string;
  content: string | React.ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  insights: QuickInsight[];
  sections: PolicySection[];
}

// resolveIcon removed in favor of DynamicIcon component

const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  insights,
  sections
}) => {
  return (
    <div className="min-h-screen bg-[#FDFBF9] selection:bg-gold/30">
      <Header />
      
      <main className="pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4">
          
          {/* Editorial Hero */}
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20 px-4">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold font-body font-bold uppercase tracking-[0.3em] mb-4 text-[10px] md:text-xs"
            >
              Legal & Transparency
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-primary mb-6 leading-tight md:leading-[1.1]"
            >
              {title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-body text-muted-foreground text-sm md:text-lg mb-4 italic"
            >
              "{subtitle}"
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[9px] md:text-[10px] font-body text-muted-foreground uppercase tracking-widest"
            >
              Last Updated: {lastUpdated}
            </motion.p>
          </div>

          {/* Quick Insights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16 md:mb-24 px-4">
            {insights.map((insight, i) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-6 md:p-8 bg-white border border-gold/10 rounded-2xl md:rounded-[2rem] hover:border-gold/30 transition-all shadow-sm group text-center sm:text-left"
              >
                <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform text-gold">
                  <DynamicIcon name={insight.icon as string} size={24} />
                </div>
                <h3 className="font-display text-lg md:text-xl font-bold text-primary mb-2 uppercase tracking-wider">
                  {insight.title}
                </h3>
                <p className="font-body text-xs md:text-sm text-muted-foreground leading-relaxed italic">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Content */}
          <div className="max-w-4xl mx-auto bg-white border border-gold/10 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 lg:p-20 shadow-ethereal mx-4">
            <div className="space-y-12 md:space-y-16">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary border-b border-gold/10 pb-4">
                    {section.title}
                  </h2>
                  <div className="font-body text-muted-foreground text-sm md:text-lg leading-relaxed space-y-4 policy-content">
                    {typeof section.content === "string" ? (
                      <div dangerouslySetInnerHTML={{ __html: section.content }} />
                    ) : (
                      section.content
                    )}
                  </div>
                </motion.section>
              ))}
            </div>
            
            <div className="mt-20 pt-12 border-t border-gold/10 text-center">
              <p className="font-body text-sm text-muted-foreground italic">
                Need more information? Our <Link to="/contact" className="text-gold font-bold hover:underline">Glow Concierge</Link> is here to help.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PolicyLayout;
