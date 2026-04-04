import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  Layout,
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
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

const AdminLayout = () => {
  const { adminLogout } = useAuth();
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useAdminTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: ShoppingBag, label: "Products", path: "/admin/products" },
    { icon: ClipboardList, label: "Orders", path: "/admin/orders" },
    { icon: Users, label: "Subscribers", path: "/admin/newsletter" },
    { icon: MessageSquare, label: "Inquiries", path: "/admin/inquiries" },
    { icon: Layout, label: "Header", path: "/admin/branding" },
    { icon: Ticket, label: "Gift Cards", path: "/admin/gift-cards" },
    { icon: Package, label: "Bulk Orders", path: "/admin/bulk-orders" },
    { icon: Sparkles, label: "About Us", path: "/admin/about" },
    { icon: Phone, label: "Contact Us", path: "/admin/contact" },
    { icon: HelpCircle, label: "FAQ", path: "/admin/faq" },
    { icon: Edit2, label: "Blogs", path: "/admin/blogs" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

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

      {/* Premium Brand Sidebar */}
      <aside className={`w-72 backdrop-blur-3xl border-r flex flex-col relative z-20 shadow-2xl transition-all duration-700 ${
        isDark 
        ? "bg-charcoal/80 border-gold/10" 
        : "bg-white/90 border-gold/20"
      }`}>
        <div className="p-8 pb-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold to-rose-light flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className={`font-display text-xl font-semibold tracking-wide italic transition-colors duration-700 ${
                isDark ? "text-white" : "text-charcoal"
              }`}>
                Luscent <span className="text-gold">Glow</span>
              </h1>
              <p className={`text-[14px] font-extrabold uppercase tracking-[0.45em] -mt-1 ml-0.5 transition-colors duration-700 ${
                isDark ? "text-white/70" : "text-charcoal/90"
              }`}>Sanctuary</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeClass = isDark 
              ? "bg-gold/10 text-gold border border-gold/20 shadow-gold/5 shadow-lg" 
              : "bg-gold/10 text-gold border border-gold/30 shadow-gold/5 shadow-lg";
            
            const inactiveClass = isDark
              ? "text-white/50 hover:text-white hover:bg-white/5"
              : "text-charcoal/90 hover:text-indigo-600 hover:bg-charcoal/5";

            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-500 ${
                  isActive ? activeClass : inactiveClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? "text-gold" : "text-inherit"} />
                  <span className="text-[1.05rem] font-extrabold tracking-wide uppercase">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="activeInd" className="text-gold">
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle Ritual */}
        <div className="px-6 py-4">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-500 ${
              isDark 
              ? "bg-white/5 border-white/10 text-white/40 hover:text-gold hover:border-gold/30" 
              : "bg-charcoal/5 border-charcoal/10 text-charcoal/70 hover:text-gold hover:border-gold/30"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              {isDark ? "Obsidian State" : "Radiant State"}
            </span>
            <div className="flex items-center gap-2">
              {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </div>
          </button>
        </div>

        <div className={`p-6 border-t transition-colors duration-700 ${
          isDark ? "border-white/5" : "border-charcoal/5"
        }`}>
          <button 
            onClick={adminLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500 group ${
              isDark 
              ? "text-white/30 hover:text-rose-light hover:bg-rose-light/5" 
              : "text-charcoal/70 hover:text-rose-brand hover:bg-rose-brand/5"
            }`}
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className={`text-[0.95rem] font-bold tracking-wide uppercase transition-colors ${
              isDark ? "group-hover:text-rose-light" : "group-hover:text-rose-brand"
            }`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        <div className="relative z-10 p-8 md:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
