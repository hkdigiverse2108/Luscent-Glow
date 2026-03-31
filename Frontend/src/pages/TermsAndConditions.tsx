import React from "react";
import PolicyLayout from "@/components/PolicyLayout";
import { FileText, UserCheck, ShieldAlert, Award } from "lucide-react";

const TermsAndConditions = () => {
  const insights = [
    {
      icon: <FileText size={24} />,
      title: "Agreement",
      description: "By using our platform, you agree to comply with our terms and standards."
    },
    {
      icon: <UserCheck size={24} />,
      title: "User Conduct",
      description: "We expect a respectful and honest community of skincare enthusiasts."
    },
    {
      icon: <ShieldAlert size={24} />,
      title: "Liability",
      description: "We strive for excellence but are not responsible for certain unforeseen events."
    },
    {
      icon: <Award size={24} />,
      title: "Fair Usage",
      description: "Our content and branding are protected by intellectual property laws."
    }
  ];

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: "Welcome to Luscent Glow. By accessing and using our website, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please refrain from using our platform."
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      content: (
        <>
          <p>All content on this website, including text, graphics, logos, images, and software, is the property of Luscent Glow and is protected by copyright and intellectual property laws.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Permitted Use:</strong> You may access our website only for personal, non-commercial use.</li>
            <li><strong>Restrictions:</strong> Any reproduction, modification, or distribution of our content without express written consent is strictly prohibited.</li>
          </ul>
        </>
      )
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      content: "When creating an account, you are responsible for maintaining the confidentiality of your credentials. You agree to accept responsibility for all activities that occur under your account."
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: "Luscent Glow will not be liable for any damages arising out of your use of our platform. While we strive to provide the most accurate skincare guidance, our products and advice are for aesthetic purposes and do not replace professional medical advice."
    },
    {
      id: "governing",
      title: "Governing Law",
      content: "These Terms and Conditions are governed by the laws of the jurisdiction in which we operate, and any disputes will be subject to the courts of that jurisdiction."
    }
  ];

  return (
    <PolicyLayout 
      title="Terms & Conditions"
      subtitle="The principles that guide our relationship with you."
      lastUpdated="March 30, 2026"
      insights={insights}
      sections={sections}
    />
  );
};

export default TermsAndConditions;
