import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiUrl } from "@/lib/api";
import PolicyLayout from "@/components/PolicyLayout";

interface PolicyInsight {
  icon: string;
  title: string;
  description: string;
}

interface PolicySection {
  id: string;
  title: string;
  content: string;
}

interface PolicyData {
  type: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  insights: PolicyInsight[];
  sections: PolicySection[];
}

const DynamicPolicy = () => {
  const { type } = useParams<{ type: string }>();
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/policies/${type}`));
        if (!response.ok) {
          if (response.status === 404) {
            console.error(`Status 404: Policy type "${type}" not found.`);
            navigate("/404");
            return;
          }
          throw new Error("Sanctuary Archive unreachable.");
        }
        const data = await response.json();
        setPolicy(data);
      } catch (error) {
        console.error("Error fetching policy:", error);
        // If it's not a 404 (already handled), we just stay on the page but show nothing
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
    window.scrollTo(0, 0);
  }, [type, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
        <div className="animate-pulse text-gold font-display text-xl uppercase tracking-widest">
          Illuminating Archives...
        </div>
      </div>
    );
  }

  if (!policy) return null;

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

export default DynamicPolicy;
