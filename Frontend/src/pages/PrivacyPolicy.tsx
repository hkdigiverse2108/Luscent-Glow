import React from "react";
import PolicyLayout from "@/components/PolicyLayout";
import { Shield, Eye, Lock, Globe } from "lucide-react";

const PrivacyPolicy = () => {
  const insights = [
    {
      icon: <Shield size={24} />,
      title: "Data Protection",
      description: "We use industry-standard encryption to protect your personal information at all times."
    },
    {
      icon: <Eye size={24} />,
      title: "Full Transparency",
      description: "You have complete control over how your data is collected and used."
    },
    {
      icon: <Lock size={24} />,
      title: "Secure Access",
      description: "Only authorized personnel have access to your data for fulfillment purposes."
    },
    {
      icon: <Globe size={24} />,
      title: "Privacy Rights",
      description: "We respect all regional data protection regulations (GDPR, CCPA, etc.)."
    }
  ];

  const sections = [
    {
      id: "collection",
      title: "Information We Collect",
      content: (
        <>
          <p>When you visit Luscent Glow, we collect certain information to provide you with a personalized experience. This includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Data:</strong> Name, email address, shipping address, and payment information provided during checkout.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with our website, including pages visited and products viewed.</li>
            <li><strong>Device Data:</strong> IP address, browser type, and device identifiers to optimize our technical performance.</li>
          </ul>
        </>
      )
    },
    {
      id: "usage",
      title: "How We Use Your Data",
      content: (
        <>
          <p>Your information is used to ensure a seamless skincare journey, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processing and fulfilling your orders.</li>
            <li>Communicating order updates and promotional offers (if opted-in).</li>
            <li>Improving our website and product offerings through analytics.</li>
            <li>Preventing fraudulent activities and ensuring platform security.</li>
          </ul>
        </>
      )
    },
    {
      id: "sharing",
      title: "Third-Party Sharing",
      content: "We never sell your personal data to third parties. We only share information with trusted service providers who assist us in operating our website, conducting our business, or servicing you, provided they agree to keep this information confidential."
    },
    {
      id: "rights",
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information at any time. Simply contact us via our concierge service or through the settings in your account profile."
    }
  ];

  return (
    <PolicyLayout 
      title="Privacy Policy"
      subtitle="Your trust is the foundation of our commitment to you."
      lastUpdated="March 30, 2026"
      insights={insights}
      sections={sections}
    />
  );
};

export default PrivacyPolicy;
