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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <TrendingSection />
        <CategorySection />
        <BrandStory />
        <NewArrivals />
        <DiscountBanner />
        <InstagramFeed />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
