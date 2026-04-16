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
  Zap,
  Instagram,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
      { icon: Settings, label: "Settings", path: "/admin/settings" },
    ]
  },
  {
    label: "Content",
    items: [
      { icon: Layout, label: "Home Page", path: "/admin/home" },
      { icon: ShoppingBag, label: "Products", path: "/admin/products" },
      { icon: Tag, label: "Categories", path: "/admin/categories" },
      { icon: Edit2, label: "Journal Management", path: "/admin/blogs" },
      { icon: HelpCircle, label: "Quiz Management", path: "/admin/quiz-settings" },
      { icon: Instagram, label: "Social Media", path: "/admin/social-media" },
    ]
  },
  {
    label: "Commerce",
    items: [
      { icon: ClipboardList,   label: "Orders",        path: "/admin/orders" },
      { icon: CreditCard,      label: "Payments",      path: "/admin/payments" },
      { icon: Package,         label: "Inventory",     path: "/admin/inventory" },
      { icon: Ticket,          label: "Gift Cards",    path: "/admin/gift-cards" },
      { icon: Zap,             label: "Home Promotions", path: "/admin/promotions" },
      { icon: Tag,             label: "Coupons",       path: "/admin/coupons" },
      { icon: Package,         label: "Bulk Orders",   path: "/admin/bulk-orders" },
    ]
  },
  {
    label: "Audience",
    items: [
      { icon: Sparkles,      label: "Consultations", path: "/admin/consultations" },
      { icon: Users,         label: "Users",         path: "/admin/users" },
      { icon: Star,          label: "Reviews",       path: "/admin/reviews" },
      { icon: Rss,           label: "Subscribers",   path: "/admin/newsletter" },
    ]
  },
  {
    label: "Site",
    items: [
      { icon: Sparkles, label: "About Us", path: "/admin/about" },
      { icon: Phone, label: "Contact Us", path: "/admin/contact" },
      { icon: HelpCircle, label: "FAQ", path: "/admin/faq" },
      { icon: Shield, label: "Policies", path: "/admin/policies" },
      { icon: Globe, label: "Global Footer", path: "/admin/footer" },
    ]
  },
];

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const { adminLogout } = useAuth();
  const location = useLocation();
  const { isDark, themeConfig } = useAdminTheme();

  // Theme-specific backdrops — each palette gets its own cinematic signature
  const backdropGlows = {
    obsidian: (
      <>
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(212,175,55,0.05)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[160px]" style={{ backgroundColor: 'rgba(212,100,80,0.04)' }} />
      </>
    ),
    radiant: (
      <>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(182,143,76,0.06)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(200,170,100,0.04)' }} />
      </>
    ),
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden font-body relative transition-colors duration-700"
      style={{ backgroundColor: themeConfig.vars['--adm-bg'], color: themeConfig.vars['--adm-text'] }}
    >
      {/* Cinematic Backdrop Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={themeConfig.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        >
          {backdropGlows[themeConfig.id]}
        </motion.div>
      </AnimatePresence>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 230,
          x: typeof window !== 'undefined' && window.innerWidth < 1024 
            ? (isMobileNavOpen ? 0 : -230) 
            : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed lg:relative flex-shrink-0 backdrop-blur-3xl border-r flex flex-col z-50 transition-colors duration-700 h-full`}
        style={{
          backgroundColor: isDark ? 'rgba(20,20,20,0.75)' : 'rgba(255,255,255,0.92)',
          borderColor: themeConfig.vars['--adm-border'],
          boxShadow: isDark ? '0 0 60px rgba(0,0,0,0.5)' : '0 0 40px rgba(0,0,0,0.06)'
        }}
      >

        {/* Brand Mark & Toggle */}
        <div className={`px-5 pt-6 pb-5 flex items-center justify-between ${isCollapsed ? 'flex-col gap-6' : ''}`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_6px_18px_rgba(212,175,55,0.25)] group-hover:scale-110 transition-all duration-500 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${themeConfig.vars['--adm-accent']}cc, ${themeConfig.vars['--adm-accent']}66)` }}
            >
              <Sparkles className="text-white" size={18} />
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="leading-none"
                >
                  <h1 className="font-display text-[1.05rem] font-bold tracking-tight italic transition-colors duration-700" style={{ color: themeConfig.vars['--adm-text'] }}>
                    Luscent <span style={{ color: themeConfig.vars['--adm-accent'] }}>Glow</span>
                  </h1>
                  <p className="text-[8px] font-black uppercase tracking-[0.5em] mt-0.5 transition-colors duration-700" style={{ color: themeConfig.vars['--adm-text-dim'] }}>Admin Panel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center hover:bg-gold/10 text-muted-foreground hover:text-gold transition-all duration-300"
          >
            <Menu size={18} className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gold/10 text-muted-foreground hover:text-gold transition-all duration-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px mb-3 transition-colors duration-700" style={{ backgroundColor: themeConfig.vars['--adm-border'] }} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide space-y-4">
          {menuGroups.map((group) => {
            return (
              <div key={group.label}>
                {/* Group Label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.35em] transition-colors duration-700 pointer-events-none"
                      style={{ color: themeConfig.vars['--adm-text-dim'] }}
                    >
                      {group.label}
                    </motion.p>
                  )}
                </AnimatePresence>

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
                          className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden border"
                          style={isActive ? {
                            backgroundColor: `${themeConfig.vars['--adm-accent']}12`,
                            borderColor: `${themeConfig.vars['--adm-accent']}30`,
                            color: themeConfig.vars['--adm-text'],
                          } : {
                            borderColor: 'transparent',
                            color: themeConfig.vars['--adm-text-muted'],
                          }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeGlow"
                              className="absolute inset-0 blur-lg"
                              style={{ backgroundColor: `${themeConfig.vars['--adm-accent']}08` }}
                            />
                          )}

                          <div className={`flex items-center gap-2.5 relative z-10 ${isCollapsed ? 'w-full justify-center' : ''}`}>
                            <item.icon
                              size={15}
                              className="flex-shrink-0 transition-colors"
                              style={{ color: isActive ? themeConfig.vars['--adm-accent'] : 'inherit' }}
                            />
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[0.78rem] font-semibold tracking-wide transition-colors leading-none"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </div>

                          {isActive && !isCollapsed && (
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

      </motion.aside>

      {/* ── Main Stage ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide flex flex-col">
        {/* Mobile Header Ritual */}
        <header 
          className="lg:hidden flex items-center justify-between px-6 py-4 border-b backdrop-blur-3xl sticky top-0 z-40"
          style={{ backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.92)', borderColor: themeConfig.vars['--adm-border'] }}
        >
          <div className="flex items-center gap-3">
             <Sparkles style={{ color: themeConfig.vars['--adm-accent'] }} size={20} />
             <span className="font-display font-bold italic text-sm">Luscent <span style={{ color: themeConfig.vars['--adm-accent'] }}>Glow</span></span>
          </div>
          <button 
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-gold transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
