import React from "react";
import PolicyLayout from "@/components/PolicyLayout";
import { XCircle, Clock, CheckCircle2, CreditCard } from "lucide-react";

const CancellationPolicy = () => {
  const insights = [
    {
      icon: <Clock size={24} />,
      title: "6-Hour Window",
      description: "Cancel your order within 6 hours of placement for a full, immediate refund."
    },
    {
      icon: <XCircle size={24} />,
      title: "No Hassle",
      description: "Cancellations are easy and direct through your account or our concierge email."
    },
    {
      icon: <CheckCircle2 size={24} />,
      title: "Quick Approval",
      description: "Once requested within the timeframe, your cancellation is approved automatically."
    },
    {
      icon: <CreditCard size={24} />,
      title: "Instant Refund",
      description: "Funds are released back to your original payment method immediately upon approval."
    }
  ];

  const sections = [
    {
      id: "window",
      title: "Cancellation Window",
      content: "We understand that plans can change. To ensure our fulfillment process remains efficient, we offer a 6-hour window from the time of order placement to cancel your order and receive a full refund."
    },
    {
      id: "how-to",
      title: "How to Cancel",
      content: (
        <>
          <p>Please use one of the following methods to cancel your order:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Log in to your account and select "Cancel Order" in your order history.</li>
            <li>Email our concierge at support@luscentglow.com with your order number.</li>
          </ul>
        </>
      )
    },
    {
      id: "after-window",
      title: "Cancellations After 6 Hours",
      content: "Once the 6-hour window has passed, our team has likely begun the fulfillment process. In this case, we are unable to cancel the order. However, you are still eligible to return the items for a refund once they arrive, in accordance with our Return Policy."
    },
    {
      id: "refunds",
      title: "Refund Process",
      content: "Once a cancellation is confirmed, your refund will be initiated immediately. Depending on your bank or credit card issuer, it may take 5-7 business days for the funds to reflect in your account."
    },
    {
      id: "pre-orders",
      title: "Pre-Orders & Limited Releases",
      content: "Please note that pre-ordered items or certain limited-edition releases may have specific cancellation terms, which will be clearly stated at the time of purchase."
    }
  ];

  return (
    <PolicyLayout 
      title="Cancellation Policy"
      subtitle="Flexible guidance for your changing beauty needs."
      lastUpdated="March 30, 2026"
      insights={insights}
      sections={sections}
    />
  );
};

export default CancellationPolicy;
