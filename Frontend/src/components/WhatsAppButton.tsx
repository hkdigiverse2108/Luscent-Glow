import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "../lib/api";

const WhatsappIcon = ({ size = 26, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
  </svg>
);

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
        <WhatsappIcon size={32} className="text-white" />
        
        {/* Subtle Pulse Effect */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 -z-10" />
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
