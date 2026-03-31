import React from "react";
import PolicyLayout from "@/components/PolicyLayout";
import { RefreshCcw, ShieldCheck, Mail, HelpCircle } from "lucide-react";

const ReturnPolicy = () => {
  const insights = [
    {
      icon: <RefreshCcw size={24} />,
      title: "30-Day Window",
      description: "You have 30 days from the date of delivery to initiate a return or exchange."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Quality Promise",
      description: "Items must be in original condition or at least 50% full to be eligible for a refund."
    },
    {
      icon: <Mail size={24} />,
      title: "Seamless Support",
      description: "Our Glow Concierge is available 24/7 to guide you through the return process."
    },
    {
      icon: <HelpCircle size={24} />,
      title: "Easy Refunds",
      description: "Refunds are processed back to your original payment method within 7-10 business days."
    }
  ];

  const sections = [
    {
      id: "eligibility",
      title: "Eligibility for Returns",
      content: (
        <>
          <p>At Luscent Glow, we want you to be completely satisfied with your skincare journey. If a product doesn't meet your expectations, we accept returns on items that are in their original packaging or have been used for less than 50% of their volume.</p>
          <p>Please note that promotional items, gift cards, and certain limited-edition sets are non-refundable unless defective.</p>
        </>
      )
    },
    {
      id: "process",
      title: "The Return Process",
      content: (
        <>
          <p>Initiating a return is simple. Please follow these steps:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact our concierge at support@luscentglow.com with your order number.</li>
            <li>Once approved, you will receive a prepaid return shipping label via email.</li>
            <li>Securely pack the items in the original box if possible.</li>
            <li>Drop off the package at any authorized carrier location.</li>
          </ul>
        </>
      )
    },
    {
      id: "refunds",
      title: "Refund Timeline",
      content: "Once your return is received and inspected, we will send you an email notification. Approved refunds will be processed immediately and will automatically be applied to your original method of payment within 7-10 business days, depending on your financial institution."
    },
    {
      id: "exchanges",
      title: "Exchanges",
      content: "We only replace items if they are defective or damaged during transit. If you need to exchange an item for a different variant, please contact our concierge team for assistance."
    }
  ];

  return (
    <PolicyLayout 
      title="Return & Refund"
      subtitle="Ensuring your satisfaction with every luminous drop."
      lastUpdated="March 30, 2026"
      insights={insights}
      sections={sections}
    />
  );
};

export default ReturnPolicy;
