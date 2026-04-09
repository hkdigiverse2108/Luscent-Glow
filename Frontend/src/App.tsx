import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext.tsx";
import { WishlistProvider } from "./context/WishlistContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
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
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.tsx";
import AdminHome from "./pages/Admin/AdminHome.tsx";
import AdminProducts from "./pages/Admin/AdminProducts.tsx";
import AdminOrders from "./pages/Admin/AdminOrders.tsx";
import AdminUsers from "./pages/Admin/AdminUsers.tsx";
import AdminNewsletter from "./pages/Admin/AdminNewsletter.tsx";
import AdminInquiries from "./pages/Admin/AdminInquiries.tsx";
import AdminSettings from "./pages/Admin/AdminSettings.tsx";
import AdminLogin from "./pages/Admin/AdminLogin.tsx";
import AdminBranding from "./pages/Admin/AdminBranding.tsx";
import AdminGiftCards from "./pages/Admin/AdminGiftCards.tsx";
import AdminBulkOrders from "./pages/Admin/AdminBulkOrders.tsx";
import AdminAbout from "./pages/Admin/AdminAbout.tsx";
import AdminContact from "./pages/Admin/AdminContact.tsx";
import AdminFAQ from "./pages/Admin/AdminFAQ.tsx";
import AdminPolicies from "./pages/Admin/PoliciesAdmin.tsx";
import AdminBlogs from "./pages/Admin/AdminBlogs.tsx";
import AdminReviews from "./pages/Admin/AdminReviews.tsx";
import AdminFooter from "./pages/Admin/AdminFooter.tsx";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute.tsx";
import { AdminThemeProvider } from "./context/AdminThemeContext.tsx";

const queryClient = new QueryClient();

const App = () => (
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
                
                {/* Dynamic Legal Sanctuary (Root-Level) */}
                <Route path="/:type" element={<DynamicPolicy />} />

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
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="newsletter" element={<AdminNewsletter />} />
                    <Route path="inquiries" element={<AdminInquiries />} />
                    <Route path="branding" element={<AdminBranding />} />
                    <Route path="gift-cards" element={<AdminGiftCards />} />
                    <Route path="bulk-orders" element={<AdminBulkOrders />} />
                    <Route path="about" element={<AdminAbout />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="faq" element={<AdminFAQ />} />
                    <Route path="policies" element={<AdminPolicies />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="footer" element={<AdminFooter />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </CartProvider>
    </WishlistProvider>
  </QueryClientProvider>
);

export default App;
