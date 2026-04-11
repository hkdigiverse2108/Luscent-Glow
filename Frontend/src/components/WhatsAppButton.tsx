import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getApiUrl } from "../lib/api";

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("919537150942"); // Legacy Fallback
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl("/api/settings/global/"));
        if (response.ok) {
          const data = await response.json();
          if (data.whatsappNumber) {
            setWhatsappNumber(data.whatsappNumber);
          }
        }
      } catch (error) {
        console.error("Failed to sync WhatsApp Support:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div 
      className="fixed bottom-[88px] right-6 z-[190] flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: -12, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white/90 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-xl shadow-xl pointer-events-none"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 whitespace-nowrap">
              Chat with us
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ delay: 1, type: "spring" }}
        className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all cursor-pointer relative z-10"
        title="Chat with Support"
      >
        <MessageCircle size={26} className="text-white" />
        
        {/* Subtle Pulse Effect */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10" />
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
