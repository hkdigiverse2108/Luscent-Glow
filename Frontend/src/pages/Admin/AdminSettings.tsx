import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone,
  Save,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  MessageCircle,
  CreditCard,
  Key,
  Hash,
  Globe,
  AlertTriangle,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  FlaskConical,
  Mail,
  Phone,
  Truck,
  Tag,
  Copyright,
  Store
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { getApiUrl } from "../../lib/api";
import { toast } from "sonner";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

type PaymentCreds = {
  activeGateway: "razorpay" | "cashfree";
  keyId: string;
  keySecret: string;
  mode: "sandbox" | "live";
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  cashfreeMode: "sandbox" | "live";
  shiprocketEmail: string;
  shiprocketPassword: string;
};

const DEFAULT_CREDS: PaymentCreds = {
  activeGateway: "razorpay",
  keyId: "",
  keySecret: "",
  mode: "sandbox",
  cashfreeAppId: "",
  cashfreeSecretKey: "",
  cashfreeMode: "sandbox",
  shiprocketEmail: "",
  shiprocketPassword: "",
};

const AdminSettings = () => {
  const { isDark } = useAdminTheme();
  
  // Global Settings State
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
  const [promoText, setPromoText] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Payment credentials state
  const [creds, setCreds] = useState<PaymentCreds>(DEFAULT_CREDS);
  const [credsLoading, setCredsLoading] = useState(true);
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsResetting, setCredsResetting] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showCashfreeSecret, setShowCashfreeSecret] = useState(false);
  const [hasStoredCreds, setHasStoredCreds] = useState(false);

  // ── Fetch Global Settings ──────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/settings/global/"));
      if (response.ok) {
        const data = await response.json();
        setWhatsappNumber(data.whatsappNumber || "");
        setStoreName(data.storeName || "");
        setSupportEmail(data.supportEmail || "");
        setSupportPhone(data.supportPhone || "");
        setFreeShippingThreshold(data.freeShippingThreshold || 0);
        setPromoText(data.promoText || "");
        setPromoCode(data.promoCode || "");
        setCopyrightText(data.copyrightText || "");
      }
    } catch (error) {
      toast.error("Could not reach the Settings Registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch(getApiUrl("/api/settings/global/"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          whatsappNumber,
          storeName,
          supportEmail,
          supportPhone,
          freeShippingThreshold,
          promoText,
          promoCode,
          copyrightText
        })
      });
      if (response.ok) {
        toast.success("Global Platform configurations committed.");
      } else {
        toast.error("Failed to update registry.");
      }
    } catch {
      toast.error("Systemic update failure.");
    } finally {
      setSaving(false);
    }
  };

  // ── Fetch Payment Credentials ───────────────────────────────────────────────
  const fetchCreds = async () => {
    try {
      setCredsLoading(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"));
      if (res.ok) {
        const data = await res.json();
        setCreds({
          activeGateway: data.activeGateway || "razorpay",
          keyId: data.keyId || "",
          keySecret: data.keySecret || "",
          mode: data.mode || "sandbox",
          cashfreeAppId: data.cashfreeAppId || "",
          cashfreeSecretKey: data.cashfreeSecretKey || "",
          cashfreeMode: data.cashfreeMode || "sandbox",
        });
        setHasStoredCreds(!!data.keyId || !!data.cashfreeAppId);
      }
    } catch {
      toast.error("Could not load payment credentials.");
    } finally {
      setCredsLoading(false);
    }
  };

  const handleSaveCreds = async () => {
    try {
      setCredsSaving(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      if (res.ok) {
        toast.success("Payment credentials committed to the sanctuary.");
        setHasStoredCreds(true);
      } else {
        toast.error("Failed to save payment credentials.");
      }
    } catch {
      toast.error("Payment credential sync failed.");
    } finally {
      setCredsSaving(false);
    }
  };

  const handleResetCreds = async () => {
    if (!confirm("This will reset all payment credentials to defaults. Are you sure?")) return;
    try {
      setCredsResetting(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"), {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Payment credentials reset to defaults.");
        setCreds(DEFAULT_CREDS);
        setHasStoredCreds(false);
        await fetchCreds();
      } else {
        toast.error("Reset failed.");
      }
    } catch {
      toast.error("Could not reach the API.");
    } finally {
      setCredsResetting(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCreds();
  }, []);

  const cardClass = `relative overflow-hidden backdrop-blur-3xl border rounded-[2.5rem] p-8 md:p-10 transition-all duration-700 ${
    isDark ? "bg-charcoal/40 border-white/12 shadow-2xl" : "bg-white border-charcoal/12 shadow-xl"
  }`;

  const inputClass = `w-full pr-6 py-4 rounded-2xl border-2 font-body text-sm font-semibold outline-none transition-all duration-300 ${
    isDark
      ? "bg-white/5 border-white/10 text-white focus:border-gold focus:bg-white/10 placeholder:text-white/20"
      : "bg-charcoal/5 border-charcoal/10 text-charcoal focus:border-gold focus:bg-white placeholder:text-charcoal/30"
  }`;

  if (loading && credsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-body text-xs uppercase tracking-[0.3em] text-gold animate-pulse">
          Synchronizing Settings Concierge...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <AdminHeader
        title="Settings"
        highlightedWord="Concierge"
        subtitle="Manage platform connectivity, payment gateway, and outreach channels."
        isDark={isDark}
      />

      <div className="max-w-4xl space-y-8">

        {/* ── Store Identity ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cardClass}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Store size={28} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                Store Identity
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Define the primary name and branding identity of your digital sanctuary.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Official Store Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Luscent Glow"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Global Concierge ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Smartphone size={28} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                Global Concierge
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Primary communication channels for seeker outreach and support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <MessageCircle size={18} />
                </div>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="919537150942"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Support Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="hello@luscentglow.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Support Phone
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="+91 97126 63607"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Promotional Rituals ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cardClass}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Sparkles size={28} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                Promotional Rituals
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Configure global banners and shipping thresholds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Free Shipping Threshold (₹)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Truck size={18} />
                </div>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Promo Banner Text
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Tag size={18} />
                </div>
                <input
                  type="text"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="Use Code"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Active Promo Code
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Hash size={18} />
                </div>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="GLOW15"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── System Strings ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cardClass}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Globe size={28} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                System Strings
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Manage site-wide footer and legal text artifacts.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Global Copyright Text
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Copyright size={18} />
                </div>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="© 2026 Luscent Glow. All rights reserved."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving Changes..." : "Commit Registry Updates"}
            </button>
            <button
              onClick={fetchSettings}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border transition-all ${
                isDark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5"
              }`}
            >
              <RefreshCcw size={14} />
              Re-Sync
            </button>
          </div>
        </motion.section>

        {/* ── Payment Gateway Credentials ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl flex-shrink-0">
              <CreditCard size={28} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                  Payment Gateway
                </h3>
                {creds.activeGateway === "cashfree" ? (
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 bg-purple-500/15 text-purple-400 border border-purple-500/30`}>
                    Cashfree Active
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/30`}>
                    Razorpay Active
                  </span>
                )}
                {hasStoredCreds && (
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Credentials Saved
                  </span>
                )}
              </div>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Configure Razorpay or Cashfree gateways. Changes apply immediately.
              </p>
            </div>
          </div>

          {credsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCcw size={24} className="animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-8">
              
              <div className="space-y-3 pb-6 border-b border-gold/10">
                <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                  Active Gateway Selection
                </label>
                <div className="flex gap-3">
                  {(["razorpay", "cashfree"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setCreds({ ...creds, activeGateway: g })}
                      className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        creds.activeGateway === g
                          ? "bg-gold/10 border-gold/40 text-gold shadow-[0_0_15px_rgba(182,143,76,0.15)]"
                          : isDark
                            ? "border-white/10 text-white/30 hover:border-white/20 hover:bg-white/5"
                            : "border-charcoal/10 text-charcoal/40 hover:border-charcoal/20 hover:bg-charcoal/5"
                      }`}
                    >
                      <CreditCard size={14} />
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {creds.activeGateway === "razorpay" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-3">
                    <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                      Razorpay Mode
                    </label>
                    <div className="flex gap-3">
                      {(["sandbox", "live"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setCreds({ ...creds, mode: m })}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            creds.mode === m
                              ? m === "live"
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                : "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : isDark
                                ? "border-white/10 text-white/30 hover:border-white/20"
                                : "border-charcoal/10 text-charcoal/40 hover:border-charcoal/20"
                          }`}
                        >
                          {m === "live" ? <ShieldCheck size={12} /> : <FlaskConical size={12} />}
                          {m === "live" ? "Live Production" : "Sandbox / Test"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                        <Key size={12} /> Razorpay Key ID
                      </label>
                      <input
                        type="text"
                        value={creds.keyId}
                        onChange={(e) => setCreds({ ...creds, keyId: e.target.value })}
                        className={`${inputClass} px-4`}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                        <Key size={12} /> Razorpay Key Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showKeySecret ? "text" : "password"}
                          value={creds.keySecret}
                          onChange={(e) => setCreds({ ...creds, keySecret: e.target.value })}
                          className={`${inputClass} px-4 pr-12`}
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                        <button onClick={() => setShowKeySecret(!showKeySecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60">
                          {showKeySecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-3">
                    <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                      Cashfree Mode
                    </label>
                    <div className="flex gap-3">
                      {(["sandbox", "live"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setCreds({ ...creds, cashfreeMode: m })}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            creds.cashfreeMode === m
                              ? m === "live"
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                : "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : isDark
                                ? "border-white/10 text-white/30 hover:border-white/20"
                                : "border-charcoal/10 text-charcoal/40 hover:border-charcoal/20"
                          }`}
                        >
                          {m === "live" ? <ShieldCheck size={12} /> : <FlaskConical size={12} />}
                          {m === "live" ? "Live Production" : "Sandbox / Test"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                        <Key size={12} /> Cashfree App ID
                      </label>
                      <input
                        type="text"
                        value={creds.cashfreeAppId}
                        onChange={(e) => setCreds({ ...creds, cashfreeAppId: e.target.value })}
                        className={`${inputClass} px-4`}
                        placeholder="TEST..."
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                        <Key size={12} /> Cashfree Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showCashfreeSecret ? "text" : "password"}
                          value={creds.cashfreeSecretKey}
                          onChange={(e) => setCreds({ ...creds, cashfreeSecretKey: e.target.value })}
                          className={`${inputClass} px-4 pr-12`}
                          placeholder="cfsk_ma_test_..."
                        />
                        <button onClick={() => setShowCashfreeSecret(!showCashfreeSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60">
                          {showCashfreeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={handleSaveCreds}
                  disabled={credsSaving}
                  className="flex items-center gap-2 px-8 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                >
                  {credsSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                  {credsSaving ? "Saving..." : "Save Credentials"}
                </button>
                <button
                  onClick={fetchCreds}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border transition-all ${
                    isDark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5"
                  }`}
                >
                  <RefreshCcw size={14} />
                  Sync
                </button>
                <button
                  onClick={handleResetCreds}
                  disabled={credsResetting}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50 ml-auto"
                >
                  {credsResetting ? <RefreshCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  Reset Defaults
                </button>
              </div>
            </div>
          )}
        </motion.section>

        {/* ── Shiprocket Logistics ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cardClass}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Truck size={28} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                Shiprocket Logistics
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Configure Shiprocket API for real-time order tracking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Shiprocket Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={creds.shiprocketEmail}
                  onChange={(e) => setCreds({ ...creds, shiprocketEmail: e.target.value })}
                  className={`${inputClass} pl-12`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Shiprocket Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <Key size={18} />
                </div>
                <input
                  type={showKeySecret ? "text" : "password"}
                  value={creds.shiprocketPassword}
                  onChange={(e) => setCreds({ ...creds, shiprocketPassword: e.target.value })}
                  className={`${inputClass} pl-12`}
                  placeholder="xxxxxxxx"
                />
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                Shiprocket Pickup Nickname
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  value={creds.shiprocketPickupLocation}
                  onChange={(e) => setCreds({ ...creds, shiprocketPickupLocation: e.target.value })}
                  className={`${inputClass} pl-12`}
                  placeholder="e.g. Primary, Warehouse1, Home"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic font-medium px-1">
                This must match the "Nickname" of the pickup location in your Shiprocket panel.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-10">
            <button
              onClick={handleSaveCreds}
              disabled={credsSaving}
              className="px-8 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50 flex items-center gap-2"
            >
              {credsSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
              {credsSaving ? "Synchronizing..." : "Save Logistics Config"}
            </button>
          </div>
        </motion.section>

        {/* ── System Health ── */}
        <div className={`p-6 border rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-700 ${
          isDark ? "bg-white/5 border-white/12" : "bg-charcoal/5 border-charcoal/12"
        }`}>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Sparkles size={22} />
            </div>
            <div>
              <p className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-white/40" : "text-charcoal/60"}`}>
                Systemic Registry Health
              </p>
              <p className={`text-lg font-extrabold uppercase tracking-[0.08em] ${isDark ? "text-white" : "text-charcoal"}`}>
                Connectivity Optimized
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gold font-bold uppercase tracking-widest text-[10px]">
            <CheckCircle2 size={14} />
            Cloud Synchronization Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
