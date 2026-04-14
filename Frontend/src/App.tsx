import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext.tsx";
import { WishlistProvider } from "./context/WishlistContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import RadianceQuiz from "./pages/RadianceQuiz.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import FAQ from "./pages/FAQ.tsx";
import Login from "./pages/Login.tsx";
import DynamicPolicy from "./pages/DynamicPolicy.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import BulkOrders from "./pages/BulkOrders.tsx";
import GiftCards from "./pages/GiftCards.tsx";
import Blogs from "./pages/Blogs.tsx";
import BlogDetail from "./pages/BlogDetail.tsx";
import TrackOrder from "./pages/TrackOrder.tsx";
import Profile from "./pages/Profile.tsx";
import Orders from "./pages/Orders.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderSuccess from "./pages/OrderSuccess.tsx";
import Offers from "./pages/Offers.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.tsx";
import AdminHome from "./pages/Admin/AdminHome.tsx";
import AdminProducts from "./pages/Admin/AdminProducts.tsx";
import AdminOrders from "./pages/Admin/AdminOrders.tsx";
import InstagramFeedSettings from "./pages/Admin/AdminInstagram";
import AdminPromotions from "./pages/Admin/AdminPromotions";
import AdminUsers from "./pages/Admin/AdminUsers.tsx";
import AdminNewsletter from "./pages/Admin/AdminNewsletter.tsx";
import AdminSettings from "./pages/Admin/AdminSettings.tsx";
import AdminLogin from "./pages/Admin/AdminLogin.tsx";
import AdminGiftCards from "./pages/Admin/AdminGiftCards.tsx";
import AdminBulkOrders from "./pages/Admin/AdminBulkOrders.tsx";
import AdminCoupons from "./pages/Admin/AdminCoupons.tsx";
import AdminAbout from "./pages/Admin/AdminAbout.tsx";
import AdminContact from "./pages/Admin/AdminContact.tsx";
import AdminFAQ from "./pages/Admin/AdminFAQ.tsx";
import AdminPolicies from "./pages/Admin/PoliciesAdmin.tsx";
import AdminBlogs from "./pages/Admin/AdminBlogs.tsx";
import AdminReviews from "./pages/Admin/AdminReviews.tsx";
import AdminConsultations from "./pages/Admin/Consultations.tsx";
import QuizSettings from "./pages/Admin/QuizSettings.tsx";
import AdminFooter from "./pages/Admin/AdminFooter.tsx";
import AdminPayments from "./pages/Admin/AdminPayments.tsx";
import AdminCategories from "./pages/Admin/AdminCategories.tsx";
import AdminSocialMedia from "./pages/Admin/AdminSocialMedia.tsx";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute.tsx";
import { AdminThemeProvider } from "./context/AdminThemeContext.tsx";
import WhatsAppButton from "./components/WhatsAppButton";
import LuminaChatBot from "./components/LuminaChatBot";
import { useLocation } from "react-router-dom";

const GlobalFloatingButtons = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) return null;

  return (
    <>
      <WhatsAppButton />
      <LuminaChatBot />
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>
        <CartProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/quiz" element={<RadianceQuiz />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/bulk-orders" element={<BulkOrders />} />
                  <Route path="/gift-cards" element={<GiftCards />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:id" element={<BlogDetail />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/offers" element={<Offers />} />

                  {/* Dynamic Legal Sanctuary (Root-Level) */}
                  <Route path="/policy/:type" element={<DynamicPolicy />} />

                {/* Admin Sanctuary Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route path="/admin" element={
                  <AdminProtectedRoute />
                }>
                  <Route element={
                    <AdminThemeProvider>
                      <AdminLayout />
                    </AdminThemeProvider>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="home" element={<AdminHome />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="newsletter" element={<AdminNewsletter />} />
                    <Route path="gift-cards" element={<AdminGiftCards />} />
                    <Route path="promotions" element={<AdminPromotions />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="bulk-orders" element={<AdminBulkOrders />} />
                    <Route path="about" element={<AdminAbout />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="faq" element={<AdminFAQ />} />
                    <Route path="policies" element={<AdminPolicies />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="consultations" element={<AdminConsultations />} />
                    <Route path="quiz-settings" element={<QuizSettings />} />
                    <Route path="footer" element={<AdminFooter />} />
                    <Route path="social-media" element={<AdminSocialMedia />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GlobalFloatingButtons />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </CartProvider>
      </WishlistProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
