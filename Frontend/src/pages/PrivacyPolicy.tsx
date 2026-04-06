import React, { useState, useEffect } from "react";
import PolicyLayout from "@/components/PolicyLayout";
import { getApiUrl } from "@/lib/api";

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(getApiUrl("/api/policies/privacy-policy"));
        if (response.ok) {
          const data = await response.json();
          setPolicy(data);
        }
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  if (loading || !policy) {
    return <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center font-display text-gold animate-pulse tracking-widest uppercase">Illuminating Sanctuary...</div>;
  }

  return (
    <PolicyLayout 
      title={policy.title}
      subtitle={policy.subtitle}
      lastUpdated={policy.lastUpdated}
      insights={policy.insights}
      sections={policy.sections}
    />
  );
};

export default PrivacyPolicy;
