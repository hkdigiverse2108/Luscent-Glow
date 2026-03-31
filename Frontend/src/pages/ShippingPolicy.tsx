import React from "react";
import PolicyLayout from "@/components/PolicyLayout";
import { Truck, PackageCheck, Zap, Globe2 } from "lucide-react";

const ShippingPolicy = () => {
  const insights = [
    {
      icon: <Zap size={24} />,
      title: "Fast Dispatch",
      description: "Orders are processed and dispatched within 1-2 business days of confirmation."
    },
    {
      icon: <PackageCheck size={24} />,
      title: "Glow Priority",
      description: "Get expedited 1-2 day delivery with our priority shipping option."
    },
    {
      icon: <Truck size={24} />,
      title: "Eco-Shipping",
      description: "Our carbon-neutral shipping partners ensure a sustainable journey for your glow."
    },
    {
      icon: <Globe2 size={24} />,
      title: "Tracking",
      description: "Receive real-time tracking updates via email as soon as your order leaves our facility."
    }
  ];

  const sections = [
    {
      id: "processing",
      title: "Order Processing Time",
      content: "Thank you for joining the Luscent Glow community. All orders are processed within 1-2 business days (excluding weekends and holidays). You will receive a confirmation email once your order has been successfully placed, followed by a tracking number once dispatched."
    },
    {
      id: "rates",
      title: "Shipping Rates & Delivery Estimates",
      content: (
        <>
          <p>We offer two tiers of shipping to accommodate your schedule:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Glow:</strong> 3-5 business days. Free for all orders over $75.</li>
            <li><strong>Priority Radiance:</strong> 1-2 business days. Available for a flat rate of $15.</li>
          </ul>
        </>
      )
    },
    {
      id: "international",
      title: "International Shipping",
      content: "We currently ship to select global locations. International delivery times vary (typically 7-14 business days). Please note that international orders may be subject to import duties and taxes, which are the responsibility of the recipient."
    },
    {
      id: "order-tracking",
      title: "Tracking Your Order",
      content: "As soon as your order has been dispatched, you'll receive a shipping confirmation email featuring a tracking number. You can monitor your package's journey through our website's tracking portal or directly through the carrier's link."
    },
    {
      id: "damages",
      title: "Lost or Damaged Items",
      content: "Luscent Glow is not liable for products damaged or lost during shipping. However, if your order arrives damaged, please save all packaging materials and damaged goods before filing a claim with the carrier and contacting our concierge team for assistance."
    }
  ];

  return (
    <PolicyLayout 
      title="Shipping Policy"
      subtitle="Ensuring a smooth, elegant journey to your doorstep."
      lastUpdated="March 30, 2026"
      insights={insights}
      sections={sections}
    />
  );
};

export default ShippingPolicy;
