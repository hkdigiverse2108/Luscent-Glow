import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getApiUrl } from "../lib/api";

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("919537150942"); // Legacy Fallback

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
        console.error("Failed to sync WhatsApp Concierge:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer"
      title="Chat with Concierge"
    >
      <MessageCircle size={26} className="text-white" />
    </motion.a>
  );
};

export default WhatsAppButton;
