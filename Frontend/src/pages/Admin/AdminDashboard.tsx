import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Users,
  Package,
  IndianRupee,
  MessageSquare,
  Star,
  Rss,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import { getApiUrl } from "../../lib/api";

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 10_00_000
    ? `₹${(n / 10_00_000).toFixed(1)}L`
    : n >= 1_000
    ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

const statusColor: Record<string, string> = {
  Processing:    "bg-amber-400/15 text-amber-400 border-amber-400/25",
  "Quality Check":"bg-sky-400/15 text-sky-400 border-sky-400/25",
  Shipped:       "bg-blue-400/15 text-blue-400 border-blue-400/25",
  Delivered:     "bg-emerald-400/15 text-emerald-400 border-emerald-400/25",
  Cancelled:     "bg-rose-400/15 text-rose-400 border-rose-400/25",
};

const statusIcon: Record<string, React.ElementType> = {
  Processing:     Clock,
  "Quality Check": TrendingUp,
  Shipped:        Truck,
  Delivered:      CheckCircle2,
  Cancelled:      XCircle,
};

// ── types ──────────────────────────────────────────────────────────────────
type StatCard = {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  href: string;
};

const AdminDashboard = () => {
  const { isDark } = useAdminTheme();

  const [stats, setStats]         = useState<StatCard[]>([]);
  const [recentOrders, setRecent] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, usersRes, productsRes,  newsletterRes, giftCardsRes, reviewsRes] =
          await Promise.allSettled([
            fetch(getApiUrl("/api/orders/")),
            fetch(getApiUrl("/api/users/")),
            fetch(getApiUrl("/api/products/")),
            fetch(getApiUrl("/api/newsletter/")),
            fetch(getApiUrl("/api/gift-cards/")),
            fetch(getApiUrl("/api/reviews/")),
          ]);

        const orders: any[]       = ordersRes.status === "fulfilled" && ordersRes.value.ok ? await ordersRes.value.json() : [];
        const users: any[]        = usersRes.status === "fulfilled" && usersRes.value.ok ? await usersRes.value.json() : [];
        const products: any[]     = productsRes.status === "fulfilled" && productsRes.value.ok ? await productsRes.value.json() : [];
        const newsletter: any[]   = newsletterRes.status === "fulfilled" && newsletterRes.value.ok ? await newsletterRes.value.json() : [];
        const giftCards: any[]    = giftCardsRes.status === "fulfilled" && giftCardsRes.value.ok ? await giftCardsRes.value.json() : [];
        const reviews: any[]      = reviewsRes.status === "fulfilled" && reviewsRes.value.ok ? await reviewsRes.value.json() : [];

        const totalRevenue = orders
          .filter((o) => o.paymentStatus === "Paid")
          .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

        const paidOrders   = orders.filter((o) => o.paymentStatus === "Paid").length;
        const pendingOrders = orders.filter((o) => o.status === "Processing").length;

        setStats([
          {
            label: "Total Revenue",
            value: fmt(totalRevenue),
            sub: `${paidOrders} paid orders`,
            icon: IndianRupee,
            accent: "from-gold/20 to-gold/5 border-gold/20 text-gold",
            href: "/admin/orders",
          },
          {
            label: "Total Orders",
            value: String(orders.length),
            sub: `${pendingOrders} processing`,
            icon: ShoppingBag,
            accent: "from-sky-400/20 to-sky-400/5 border-sky-400/20 text-sky-400",
            href: "/admin/orders",
          },
          {
            label: "Registered Users",
            value: String(users.length),
            sub: `${users.filter((u) => u.isAdmin).length} admins`,
            icon: Users,
            accent: "from-violet-400/20 to-violet-400/5 border-violet-400/20 text-violet-400",
            href: "/admin/users",
          },
          {
            label: "Products",
            value: String(products.length),
            sub: `${products.filter((p) => p.isNew).length} new arrivals`,
            icon: Package,
            accent: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/20 text-emerald-400",
            href: "/admin/products",
          },
          {
            label: "Subscribers",
            value: String(newsletter.length),
            sub: "Newsletter list",
            icon: Rss,
            accent: "from-amber-400/20 to-amber-400/5 border-amber-400/20 text-amber-400",
            href: "/admin/newsletter",
          },
          {
            label: "Gift Cards",
            value: String(giftCards.length),
            sub: `${giftCards.filter((g) => g.isActive).length} active`,
            icon: Ticket,
            accent: "from-pink-400/20 to-pink-400/5 border-pink-400/20 text-pink-400",
            href: "/admin/gift-cards",
          },
          {
            label: "Total Reviews",
            value: String(reviews.length),
            sub: `${reviews.filter((r) => r.rating >= 4).length} positive`,
            icon: Star,
            accent: "from-amber-400/20 to-amber-400/5 border-amber-400/20 text-amber-400",
            href: "/admin/reviews",
          },
          {
            label: "Catalogue",
            value: `${products.filter((p) => p.isTrending).length}`,
            sub: "Trending products",
            icon: TrendingUp,
            accent: "from-cyan-400/20 to-cyan-400/5 border-cyan-400/20 text-cyan-400",
            href: "/admin/products",
          },
        ]);

        setRecent(orders.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const card = `relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
    isDark ? "bg-white/4 hover:bg-white/6" : "bg-white hover:bg-white shadow-sm hover:shadow-md"
  }`;

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-gold" />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold/60 animate-pulse">
          Loading Dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <AdminHeader
        title="Platform"
        highlightedWord="Dashboard"
        subtitle="Real-time snapshot of your store's performance."
        isDark={isDark}
      />

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link to={s.href} className={`${card} group block bg-gradient-to-br border ${s.accent}`}>
                {/* icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${s.accent} border`}>
                  <Icon size={17} />
                </div>

                {/* value */}
                <p className={`text-2xl font-bold tabular-nums leading-none mb-1 transition-colors ${
                  isDark ? "text-white" : "text-charcoal"
                }`}>
                  {s.value}
                </p>

                {/* label */}
                <p className={`text-[11px] font-semibold mb-0.5 ${isDark ? "text-white/60" : "text-charcoal/60"}`}>
                  {s.label}
                </p>

                {/* sub */}
                <p className={`text-[10px] font-medium ${isDark ? "text-white/30" : "text-charcoal/35"}`}>
                  {s.sub}
                </p>

                {/* arrow on hover */}
                <ArrowRight
                  size={13}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-60 transition-all group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={`rounded-2xl border overflow-hidden ${
          isDark ? "bg-white/4 border-white/8" : "bg-white border-charcoal/8 shadow-sm"
        }`}
      >
        {/* header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "border-white/6" : "border-charcoal/6"
        }`}>
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} className="text-gold" />
            <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-charcoal"}`}>
              Recent Orders
            </h2>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-[11px] font-semibold text-gold hover:text-gold/70 transition-colors"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {/* table */}
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={28} className={isDark ? "text-white/20" : "text-charcoal/20"} />
            <p className={`text-xs font-semibold ${isDark ? "text-white/30" : "text-charcoal/35"}`}>
              No orders yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-[10px] font-black uppercase tracking-widest ${
                  isDark ? "text-white/25 border-b border-white/5" : "text-charcoal/30 border-b border-charcoal/5"
                }`}>
                  <th className="text-left px-6 py-3 font-black">Order</th>
                  <th className="text-left px-4 py-3 font-black">Customer</th>
                  <th className="text-left px-4 py-3 font-black">Status</th>
                  <th className="text-left px-4 py-3 font-black">Payment</th>
                  <th className="text-right px-6 py-3 font-black">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {recentOrders.map((order, i) => {
                  const StatusIcon = statusIcon[order.status] || Clock;
                  const colorClass = statusColor[order.status] || "bg-white/10 text-white/50 border-white/10";
                  return (
                    <motion.tr
                      key={order._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 + i * 0.04 }}
                      className={`transition-colors ${
                        isDark ? "hover:bg-white/3" : "hover:bg-charcoal/2"
                      }`}
                    >
                      {/* Order # */}
                      <td className="px-6 py-3.5">
                        <span className={`text-[11px] font-bold font-mono ${
                          isDark ? "text-gold/80" : "text-gold"
                        }`}>
                          {order.orderNumber || "—"}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[12px] font-medium ${
                          isDark ? "text-white/70" : "text-charcoal/70"
                        }`}>
                          {order.userMobile || "Guest"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass}`}>
                          <StatusIcon size={10} />
                          {order.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          order.paymentStatus === "Paid"
                            ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/25"
                            : "bg-amber-400/15 text-amber-400 border-amber-400/25"
                        }`}>
                          {order.paymentStatus === "Paid"
                            ? <CheckCircle2 size={10} />
                            : <Clock size={10} />
                          }
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-3.5 text-right">
                        <span className={`text-[13px] font-bold tabular-nums ${
                          isDark ? "text-white" : "text-charcoal"
                        }`}>
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Quick Links ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-3 ${
          isDark ? "text-white/25" : "text-charcoal/30"
        }`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Add Product",   href: "/admin/products",   icon: Package,      color: "text-emerald-400" },
            { label: "View Orders",   href: "/admin/orders",     icon: ShoppingBag,  color: "text-sky-400" },
            { label: "Manage Users",  href: "/admin/users",      icon: Users,        color: "text-violet-400" },
            { label: "Gift Cards",    href: "/admin/gift-cards", icon: Ticket,       color: "text-pink-400" },
            { label: "Settings",      href: "/admin/settings",   icon: Rss,          color: "text-amber-400" },
          ].map((q) => (
            <Link
              key={q.href}
              to={q.href}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 text-center ${
                isDark
                  ? "bg-white/4 border-white/6 hover:bg-white/8 hover:border-white/12"
                  : "bg-white border-charcoal/8 hover:border-gold/25 hover:shadow-sm shadow-none"
              }`}
            >
              <q.icon size={20} className={`${q.color} group-hover:scale-110 transition-transform`} />
              <span className={`text-[11px] font-semibold leading-tight ${
                isDark ? "text-white/60 group-hover:text-white/90" : "text-charcoal/55 group-hover:text-charcoal"
              }`}>
                {q.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
