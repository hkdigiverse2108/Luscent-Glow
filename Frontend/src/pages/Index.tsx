import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrendingSection from "@/components/home/TrendingSection";
import CategorySection from "@/components/home/CategorySection";
import NewArrivals from "@/components/home/NewArrivals";
import BrandStory from "@/components/home/BrandStory";
import DiscountBanner from "@/components/home/DiscountBanner";
import InstagramFeed from "@/components/home/InstagramFeed";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getApiUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl("/home/settings"));
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch home settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-gold" size={48} />
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.5em] text-gold animate-pulse">Illuminating Sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel slides={settings?.heroSlides} />
        <TrendingSection 
          title={settings?.trendingTitle} 
          subtitle={settings?.trendingSubtitle} 
        />
        <CategorySection title={settings?.categoriesTitle} />
        <BrandStory story={settings?.brandStory} />
        <NewArrivals 
          title={settings?.newArrivalsTitle} 
          subtitle={settings?.newArrivalsSubtitle} 
        />
        <DiscountBanner banner={settings?.discountBanner} />
        <InstagramFeed settings={settings?.instagram} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
