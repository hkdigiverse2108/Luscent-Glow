import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Palette,
  Sun,
  Moon,
  Ticket,
  Package,
  Phone,
  HelpCircle,
  Shield,
  Edit2,
  Percent,
  Layout,
  Rss,
  Globe,
  UserCheck,
  Star,
  CreditCard,
  Tag,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",     path: "/admin/dashboard" },
    ]
  },
  {
    label: "Content",
    items: [
      { icon: Layout,          label: "Home Page",     path: "/admin/home" },
      { icon: ShoppingBag,     label: "Products",      path: "/admin/products" },
      { icon: Edit2,           label: "Journal Management", path: "/admin/blogs" },
    ]
  },
  {
    label: "Commerce",
    items: [
      { icon: ClipboardList,   label: "Orders",        path: "/admin/orders" },
      { icon: CreditCard,      label: "Payments",      path: "/admin/payments" },
      { icon: Ticket,          label: "Gift Cards",    path: "/admin/gift-cards" },
      { icon: Zap,             label: "Home Promotions", path: "/admin/promotions" },
      { icon: Tag,             label: "Coupons",       path: "/admin/coupons" },
      { icon: Package,         label: "Bulk Orders",   path: "/admin/bulk-orders" },
    ]
  },
  {
    label: "Audience",
    items: [
      { icon: Users,           label: "Users",         path: "/admin/users" },
      { icon: Star,            label: "Reviews",       path: "/admin/reviews" },
      { icon: Rss,             label: "Subscribers",   path: "/admin/newsletter" },
    ]
  },
  {
    label: "Site",
    items: [
      { icon: Sparkles,        label: "About Us",      path: "/admin/about" },
      { icon: Phone,           label: "Contact Us",    path: "/admin/contact" },
      { icon: HelpCircle,      label: "FAQ",           path: "/admin/faq" },
      { icon: Shield,          label: "Policies",      path: "/admin/policies" },
      { icon: Globe,           label: "Global Footer", path: "/admin/footer" },
    ]
  },
  {
    label: "System",
    items: [
      { icon: Settings,        label: "Settings",      path: "/admin/settings" },
    ]
  },
];

const AdminLayout = () => {
  const { adminLogout } = useAuth();
  const location = useLocation();
  const { isDark, toggleTheme } = useAdminTheme();

  return (
    <div className={`min-h-screen flex overflow-hidden font-body relative transition-colors duration-700 ${
      isDark ? "bg-[#0f0f0f] text-white" : "bg-[#faf9f6] text-charcoal"
    }`}>
      {/* Cinematic Backdrop Glow */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-light/5 rounded-full blur-[150px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className={`w-[230px] flex-shrink-0 backdrop-blur-3xl border-r flex flex-col relative z-20 transition-all duration-700 ${
        isDark
          ? "bg-charcoal/80 border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.4)]"
          : "bg-white/95 border-gold/10 shadow-[0_0_40px_rgba(0,0,0,0.06)]"
      }`}>

        {/* Brand Mark */}
        <div className="px-5 pt-6 pb-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold to-rose-light flex items-center justify-center shadow-[0_6px_18px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-all duration-500 flex-shrink-0">
              <Sparkles className="text-white" size={18} />
            </div>
            <div className="leading-none">
              <h1 className={`font-display text-[1.05rem] font-bold tracking-tight italic transition-colors duration-700 ${
                isDark ? "text-white" : "text-charcoal"
              }`}>
                Luscent <span className="text-gold">Glow</span>
              </h1>
              <p className={`text-[8px] font-black uppercase tracking-[0.5em] mt-0.5 transition-colors duration-700 ${
                isDark ? "text-white/30" : "text-charcoal/35"
              }`}>Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className={`mx-5 h-px mb-3 ${isDark ? "bg-white/5" : "bg-charcoal/8"}`} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide space-y-4">
          {menuGroups.map((group) => {
            return (
              <div key={group.label}>
                {/* Group Label */}
                <p className={`px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.35em] ${
                  isDark ? "text-white/20" : "text-charcoal/30"
                }`}>
                  {group.label}
                </p>

                {/* Items */}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <motion.div
                        key={item.path}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Link
                          to={item.path}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                            isActive
                              ? isDark
                                ? "bg-gold/12 border border-gold/25"
                                : "bg-gold/10 border border-gold/25"
                              : isDark
                                ? "text-white/45 hover:text-white hover:bg-white/5 border border-transparent"
                                : "text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 border border-transparent"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeGlow"
                              className="absolute inset-0 bg-gold/5 blur-lg"
                            />
                          )}

                          <div className="flex items-center gap-2.5 relative z-10">
                            <item.icon
                              size={15}
                              className={`flex-shrink-0 transition-colors ${
                                isActive
                                  ? "text-gold"
                                  : "text-inherit group-hover:text-gold"
                              }`}
                            />
                            <span className={`text-[0.78rem] font-semibold tracking-wide transition-colors leading-none ${
                              isActive
                                ? isDark ? "text-white" : "text-charcoal"
                                : "text-inherit"
                            }`}>
                              {item.label}
                            </span>
                          </div>

                          {isActive && (
                            <ChevronRight
                              size={11}
                              className="text-gold/60 relative z-10 flex-shrink-0"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

      </aside>

      {/* ── Main Stage ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide flex flex-col">
        <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
