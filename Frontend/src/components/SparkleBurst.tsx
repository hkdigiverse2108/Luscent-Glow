import React from "react";
import { motion } from "framer-motion";

interface SparkleProps {
  color: string;
  size: number;
}

const Sparkle = ({ color, size }: SparkleProps) => {
  const path = "M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z";
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 68 68"
      fill="none"
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{ 
        scale: [0, 1.2, 0], 
        opacity: [0, 1, 0],
        rotate: [0, 90, 180],
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
      }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
      }}
      className="absolute pointer-events-none"
      style={{ left: "50%", top: "50%" }}
    >
      <path d={path} fill={color} />
    </motion.svg>
  );
};

interface SparkleBurstProps {
  active: boolean;
}

const SparkleBurst: React.FC<SparkleBurstProps> = ({ active }) => {
  if (!active) return null;

  const sparkles = Array.from({ length: 12 });
  const colors = ["#B68F4C", "#EAD8B1", "#FFFFFF", "#F5F5F5"];

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {sparkles.map((_, i) => (
        <Sparkle 
          key={i} 
          color={colors[i % colors.length]} 
          size={10 + Math.random() * 20} 
        />
      ))}
    </div>
  );
};

export default SparkleBurst;
