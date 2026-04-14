import React, { createContext, useContext, useState, ReactNode } from "react";

interface AnimationContextType {
  triggerFlight: (startX: number, startY: number) => void;
  flightData: { startX: number; startY: number } | null;
  clearFlight: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flightData, setFlightData] = useState<{ startX: number; startY: number } | null>(null);

  const triggerFlight = (startX: number, startY: number) => {
    setFlightData({ startX, startY });
  };

  const clearFlight = () => {
    setFlightData(null);
  };

  return (
    <AnimationContext.Provider value={{ triggerFlight, flightData, clearFlight }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};
