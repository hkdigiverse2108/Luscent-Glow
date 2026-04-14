import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimation } from "@/context/AnimationContext";

const AddToCartFlight = () => {
  const { flightData, clearFlight } = useAnimation();
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateTarget = () => {
      const cartIcon = document.getElementById("cart-icon-ref");
      if (cartIcon) {
        const rect = cartIcon.getBoundingClientRect();
        setTargetPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updateTarget();
    window.addEventListener("resize", updateTarget);
    return () => window.removeEventListener("resize", updateTarget);
  }, []);

  return (
    <AnimatePresence>
      {flightData && (
        <motion.div
          initial={{ 
            x: flightData.startX, 
            y: flightData.startY, 
            scale: 0.5, 
            opacity: 0 
          }}
          animate={{
            x: [flightData.startX, flightData.startX + (targetPos.x - flightData.startX) * 0.5, targetPos.x],
            y: [flightData.startY, flightData.startY - 150, targetPos.y], // Curved arc
            scale: [0.5, 1.2, 0.2],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 0.85,
            ease: "easeInOut",
          }}
          onAnimationComplete={clearFlight}
          className="fixed pointer-events-none z-[9999]"
          style={{ width: 24, height: 24, marginLeft: -12, marginTop: -12 }}
        >
          {/* The Golden Essence */}
          <div className="w-full h-full bg-gold rounded-full shadow-[0_0_20px_#B68F4C] blur-[2px] relative">
            <div className="absolute inset-0 bg-white/40 rounded-full scale-50" />
            <div className="absolute -inset-2 bg-gold/20 rounded-full blur-md animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartFlight;
