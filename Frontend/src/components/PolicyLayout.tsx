import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { LucideIcon } from "lucide-react";

interface QuickInsight {
  icon: React.ReactNode;
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
      
      <main className="pt-40 pb-24">
        <div className="container mx-auto px-4">
          
          {/* Editorial Hero */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold font-body font-bold uppercase tracking-[0.3em] mb-4 text-xs"
            >
              Legal & Transparency
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl lg:text-8xl font-bold text-primary mb-6"
            >
              {title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-body text-muted-foreground text-lg mb-4"
            >
              {subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] font-body text-muted-foreground uppercase tracking-widest"
            >
              Last Updated: {lastUpdated}
            </motion.p>
          </div>

          {/* Quick Insights Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-24">
            {insights.map((insight, i) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-8 bg-white border border-gold/10 rounded-[2rem] hover:border-gold/30 transition-all shadow-sm group"
              >
                <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-gold">
                  {insight.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-primary mb-2 uppercase tracking-wider">
                  {insight.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Content */}
          <div className="max-w-4xl mx-auto bg-white border border-gold/10 rounded-[3rem] p-8 lg:p-20 shadow-ethereal">
            <div className="space-y-16">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-3xl font-bold text-primary border-b border-gold/10 pb-4">
                    {section.title}
                  </h2>
                  <div className="font-body text-muted-foreground text-lg leading-relaxed space-y-4">
                    {typeof section.content === "string" ? (
                      <p>{section.content}</p>
                    ) : (
                      section.content
                    )}
                  </div>
                </motion.section>
              ))}
            </div>
            
            <div className="mt-20 pt-12 border-t border-gold/10 text-center">
              <p className="font-body text-sm text-muted-foreground italic">
                Need more information? Our <a href="/contact" className="text-gold font-bold hover:underline">Glow Concierge</a> is here to help.
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
