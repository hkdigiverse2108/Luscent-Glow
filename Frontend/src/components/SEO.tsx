import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

interface SEOProps {
  seo?: SEOData;
}

const SEO: React.FC<SEOProps> = ({ seo }) => {
  const { data: globalSettings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/settings/global/"));
      if (!response.ok) throw new Error("Failed to fetch global settings");
      return response.json();
    },
  });

  const defaultSEO = globalSettings?.seo || {};
  
  const title = seo?.title || defaultSEO.title || "Luscent Glow | Pure Botanical Radiance";
  const description = seo?.description || defaultSEO.description || "Premium, cruelty-free botanical skincare and makeup crafted for your authentic brilliance.";
  const keywords = seo?.keywords || defaultSEO.keywords || "skincare, beauty, botanical, cruelty-free, luscent glow";
  const ogImage = seo?.ogImage || defaultSEO.ogImage || "/og-image.png";

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
