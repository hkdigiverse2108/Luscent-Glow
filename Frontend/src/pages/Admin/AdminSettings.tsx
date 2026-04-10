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
  Store,
  MapPin,
  ShieldAlert
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
};

type ShiprocketCreds = {
  shiprocketEmail: string;
  shiprocketPassword: string;
  shiprocketPickupLocation: string;
};

type SmtpCreds = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
};

const DEFAULT_PAYMENT: PaymentCreds = {
  activeGateway: "razorpay",
  keyId: "",
  keySecret: "",
  mode: "sandbox",
  cashfreeAppId: "",
  cashfreeSecretKey: "",
  cashfreeMode: "sandbox",
};

const DEFAULT_SHIPROCKET: ShiprocketCreds = {
  shiprocketEmail: "",
  shiprocketPassword: "",
  shiprocketPickupLocation: "Primary",
};

const DEFAULT_SMTP: SmtpCreds = {
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
};

const AdminSettings = () => {
  const { isDark } = useAdminTheme();
  
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Payment credentials state
  const [payment, setPayment] = useState<PaymentCreds>(DEFAULT_PAYMENT);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentResetting, setPaymentResetting] = useState(false);
  
  // Shiprocket state
  const [shiprocket, setShiprocket] = useState<ShiprocketCreds>(DEFAULT_SHIPROCKET);
  const [shiprocketLoading, setShiprocketLoading] = useState(true);
  const [shiprocketSaving, setShiprocketSaving] = useState(false);

  const [shiprocketResetting, setShiprocketResetting] = useState(false);

  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showCashfreeSecret, setShowCashfreeSecret] = useState(false);
  const [showShiprocketPassword, setShowShiprocketPassword] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    syncAllRituals();
  }, []);

  const syncAllRituals = () => {
    fetchPayment();
    fetchShiprocket();
  };

  // ── Fetch Global Settings ──────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/settings/global/"));
      if (response.ok) {
        const data = await response.json();
        setWhatsappNumber(data.whatsappNumber || "");
        setCopyrightText(data.copyrightText || "");
      }
    } catch (error) {
      toast.error("Could not reach the Settings Database.");
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
          copyrightText
        })
      });
      if (response.ok) {
        toast.success("Settings updated successfully.");
      } else {
        toast.error("Failed to update settings.");
      }
    } catch {
      toast.error("Systemic update failure.");
    } finally {
      setSaving(false);
    }
  };

  // ── Fetch Rituals ────────────────────────────────────────────────────────

  const fetchPayment = async () => {
    try {
      setPaymentLoading(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"));
      if (res.ok) {
        const data = await res.json();
        setPayment({
          activeGateway: data.activeGateway || "razorpay",
          keyId: data.keyId || "",
          keySecret: data.keySecret || "",
          mode: data.mode || "sandbox",
          cashfreeAppId: data.cashfreeAppId || "",
          cashfreeSecretKey: data.cashfreeSecretKey || "",
          cashfreeMode: data.cashfreeMode || "sandbox",
        });
      }
    } catch {
      toast.error("Could not load payment credentials.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchShiprocket = async () => {
    try {
      setShiprocketLoading(true);
      const res = await fetch(getApiUrl("/api/settings/global/shiprocket-credentials"));
      if (res.ok) {
        const data = await res.json();
        setShiprocket({
          shiprocketEmail: data.shiprocketEmail || "",
          shiprocketPassword: data.shiprocketPassword || "",
          shiprocketPickupLocation: data.shiprocketPickupLocation || "Primary",
        });
      }
    } catch {
      toast.error("Logistics sync failure.");
    } finally {
      setShiprocketLoading(false);
    }
  };


  // ── Save Rituals ──────────────────────────────────────────────────────────

  const handleSavePayment = async () => {
    try {
      setPaymentSaving(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
      if (res.ok) toast.success("Payment credentials secured.");
      else toast.error("Failed to secure payment credentials.");
    } catch {
      toast.error("System connection failure during payment ritual.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleSaveShiprocket = async () => {
    try {
      setShiprocketSaving(true);
      const res = await fetch(getApiUrl("/api/settings/global/shiprocket-credentials"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shiprocket),
      });
      if (res.ok) toast.success("Logistics ritual updated.");
      else toast.error("Failed to update logistics.");
    } catch {
      toast.error("Logistics system failure.");
    } finally {
      setShiprocketSaving(false);
    }
  };


  const handleResetPayment = async () => {
    if (!confirm("This will reset payment credentials to defaults from .env. Are you sure?")) return;
    try {
      setPaymentResetting(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"), { method: "DELETE" });
      if (res.ok) {
        toast.success("Payment credentials reset and persisted.");
        await fetchPayment();
      } else toast.error("Reset failed.");
    } catch {
      toast.error("Reset ritual failure.");
    } finally {
      setPaymentResetting(false);
    }
  };

  const handleResetShiprocket = async () => {
    if (!confirm("This will reset logistics credentials to defaults from .env. Are you sure?")) return;
    try {
      setShiprocketResetting(true);
      const res = await fetch(getApiUrl("/api/settings/global/shiprocket-credentials"), { method: "DELETE" });
      if (res.ok) {
        toast.success("Logistics credentials reset and persisted.");
        await fetchShiprocket();
      } else toast.error("Reset failed.");
    } catch {
      toast.error("Logistics reset failure.");
    } finally {
      setShiprocketResetting(false);
    }
  };

  const cardClass = `relative overflow-hidden backdrop-blur-3xl border rounded-[2.5rem] p-8 md:p-10 transition-all duration-700 ${
    isDark ? "bg-charcoal/40 border-white/12 shadow-2xl" : "bg-white border-charcoal/12 shadow-xl"
  }`;

  const inputClass = `w-full pr-6 py-4 rounded-2xl border-2 font-body text-sm font-semibold outline-none transition-all duration-300 ${
    isDark
      ? "bg-white/5 border-white/10 text-white focus:border-gold focus:bg-white/10 placeholder:text-white/20"
      : "bg-charcoal/5 border-charcoal/10 text-charcoal focus:border-gold focus:bg-white placeholder:text-charcoal/30"
  }`;

  if (loading || paymentLoading || shiprocketLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-body text-xs uppercase tracking-[0.3em] text-gold animate-pulse">
          Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <AdminHeader
        title="Settings"
        highlightedWord="Management"
        subtitle="Manage platform connectivity, payment gateway, and outreach channels."
        isDark={isDark}
      />

      <div className="max-w-4xl space-y-8">


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
                Global Settings
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Primary communication channels for customer support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 md:col-span-2">
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving Changes..." : "Save Settings"}
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
                Manage site-wide footer and legal text.
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
              {saving ? "Saving Changes..." : "Save Settings"}
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
                {payment.activeGateway === "cashfree" ? (
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 bg-purple-500/15 text-purple-400 border border-purple-500/30`}>
                    Cashfree Active
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/30`}>
                    Razorpay Active
                  </span>
                )}
                {(!!payment.keyId || !!payment.cashfreeAppId) && (
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

          {paymentLoading ? (
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
                      onClick={() => setPayment({ ...payment, activeGateway: g })}
                      className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        payment.activeGateway === g
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

              {payment.activeGateway === "razorpay" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-3">
                    <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                      Razorpay Mode
                    </label>
                    <div className="flex gap-3">
                      {(["sandbox", "live"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPayment({ ...payment, mode: m })}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            payment.mode === m
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
                        value={payment.keyId}
                        onChange={(e) => setPayment({ ...payment, keyId: e.target.value })}
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
                          value={payment.keySecret}
                          onChange={(e) => setPayment({ ...payment, keySecret: e.target.value })}
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
                          onClick={() => setPayment({ ...payment, cashfreeMode: m })}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                            payment.cashfreeMode === m
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
                        value={payment.cashfreeAppId}
                        onChange={(e) => setPayment({ ...payment, cashfreeAppId: e.target.value })}
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
                          value={payment.cashfreeSecretKey}
                          onChange={(e) => setPayment({ ...payment, cashfreeSecretKey: e.target.value })}
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
                  onClick={handleSavePayment}
                  disabled={paymentSaving}
                  className="flex items-center gap-2 px-8 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                >
                  {paymentSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                  {paymentSaving ? "Saving..." : "Save Credentials"}
                </button>
                <button
                  onClick={fetchPayment}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border transition-all ${
                    isDark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5"
                  }`}
                >
                  <RefreshCcw size={14} />
                  Sync
                </button>
                <button
                  onClick={handleResetPayment}
                  disabled={paymentResetting}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50 ml-auto"
                >
                  {paymentResetting ? <RefreshCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
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

          {shiprocketLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCcw size={24} className="animate-spin text-gold" />
            </div>
          ) : (
            <>
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
                      value={shiprocket.shiprocketEmail}
                      onChange={(e) => setShiprocket({ ...shiprocket, shiprocketEmail: e.target.value })}
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
                      type={showShiprocketPassword ? "text" : "password"}
                      value={shiprocket.shiprocketPassword}
                      onChange={(e) => setShiprocket({ ...shiprocket, shiprocketPassword: e.target.value })}
                      className={`${inputClass} pl-12 pr-12`}
                      placeholder="xxxxxxxx"
                    />
                    <button 
                      onClick={() => setShowShiprocketPassword(!showShiprocketPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold transition-colors"
                      type="button"
                    >
                      {showShiprocketPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
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
                      value={shiprocket.shiprocketPickupLocation}
                      onChange={(e) => setShiprocket({ ...shiprocket, shiprocketPickupLocation: e.target.value })}
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
                  onClick={handleSaveShiprocket}
                  disabled={shiprocketSaving}
                  className="px-8 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {shiprocketSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                  {shiprocketSaving ? "Synchronizing..." : "Save Logistics Config"}
                </button>
                <button
                  onClick={fetchShiprocket}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border transition-all ${
                    isDark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5"
                  }`}
                >
                  <RefreshCcw size={14} />
                  Re-Sync
                </button>
                <button
                  onClick={handleResetShiprocket}
                  disabled={shiprocketResetting}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border border-rose-500/20 text-rose-500/60 hover:bg-rose-500/5 transition-all disabled:opacity-50`}
                >
                  {shiprocketResetting ? <RefreshCcw size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                  Reset Defaults
                </button>
              </div>
            </>
          )}
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
