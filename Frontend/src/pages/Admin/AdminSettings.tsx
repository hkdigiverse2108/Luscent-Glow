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
  FlaskConical
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { getApiUrl } from "../../lib/api";
import { toast } from "sonner";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

type PaymentCreds = {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  baseUrl: string;
  mode: "sandbox" | "production";
};

const DEFAULT_CREDS: PaymentCreds = {
  merchantId: "",
  saltKey: "",
  saltIndex: "1",
  baseUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox",
  mode: "sandbox",
};

const AdminSettings = () => {
  const { isDark } = useAdminTheme();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Payment credentials state
  const [creds, setCreds] = useState<PaymentCreds>(DEFAULT_CREDS);
  const [credsLoading, setCredsLoading] = useState(true);
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsResetting, setCredsResetting] = useState(false);
  const [showSaltKey, setShowSaltKey] = useState(false);
  const [hasStoredCreds, setHasStoredCreds] = useState(false);

  // ── Fetch WhatsApp ──────────────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/settings/global/"));
      if (response.ok) {
        const data = await response.json();
        setWhatsappNumber(data.whatsappNumber);
      }
    } catch (error) {
      toast.error("Could not reach the Settings Registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!whatsappNumber) {
      toast.error("WhatsApp number cannot be null.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(getApiUrl("/api/settings/global/"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber })
      });
      if (response.ok) {
        toast.success("WhatsApp Concierge registry updated.");
      } else {
        toast.error("Failed to update configuration.");
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
          merchantId: data.merchantId || "",
          saltKey: data.saltKey || "",
          saltIndex: data.saltIndex || "1",
          baseUrl: data.baseUrl || "https://api-preprod.phonepe.com/apis/pg-sandbox",
          mode: data.mode || "sandbox",
        });
        // If the DB returned a non-default merchant ID, credentials are stored
        setHasStoredCreds(!!data.merchantId && data.merchantId !== "PGTESTPAYUAT86");
      }
    } catch {
      toast.error("Could not load payment credentials.");
    } finally {
      setCredsLoading(false);
    }
  };

  const handleSaveCreds = async () => {
    if (!creds.merchantId || !creds.saltKey) {
      toast.error("Merchant ID and Salt Key are required.");
      return;
    }
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
    if (!confirm("This will reset all payment credentials to sandbox defaults. Are you sure?")) return;
    try {
      setCredsResetting(true);
      const res = await fetch(getApiUrl("/api/settings/global/payment-credentials"), {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Payment credentials reset to sandbox defaults.");
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

        {/* ── WhatsApp Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cardClass}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b pb-8 border-gold/10">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-xl">
              <Smartphone size={28} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                WhatsApp Concierge
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                Primary communication channel for seeker outreach and curation advice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
            <div className="space-y-4">
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
                  placeholder="e.g. 919537150942"
                />
              </div>
              <p className={`text-[10px] font-semibold uppercase tracking-wide leading-relaxed ${isDark ? "text-white/25" : "text-charcoal/35"}`}>
                Format: [Country Code][Number] — no symbols. Used globally for the floating WhatsApp button.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gold text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-xs hover:bg-gold/80 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
              >
                {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : "Update"}
              </button>
              <button
                onClick={fetchSettings}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs border transition-all ${
                  isDark ? "border-white/10 text-white/50 hover:bg-white/5" : "border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5"
                }`}
              >
                <RefreshCcw size={14} />
                Sync
              </button>
            </div>
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
                {/* Mode badge */}
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                  creds.mode === "production"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}>
                  {creds.mode === "production" ? <ShieldCheck size={10} /> : <FlaskConical size={10} />}
                  {creds.mode === "production" ? "Live / Production" : "Sandbox / Test"}
                </span>
                {hasStoredCreds && (
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Credentials Saved
                  </span>
                )}
              </div>
              <p className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-charcoal/60"}`}>
                PhonePe payment gateway configuration. Changes apply immediately without a server restart.
              </p>
            </div>
          </div>

          {credsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCcw size={24} className="animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Mode Toggle */}
              <div className="space-y-3">
                <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-gold"}`}>
                  Gateway Mode
                </label>
                <div className="flex gap-3">
                  {(["sandbox", "production"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        const newUrl = m === "production"
                          ? "https://api.phonepe.com/apis/hermes"
                          : "https://api-preprod.phonepe.com/apis/pg-sandbox";
                        setCreds({ ...creds, mode: m, baseUrl: newUrl });
                      }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        creds.mode === m
                          ? m === "production"
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-amber-500/20 border-amber-500/50 text-amber-400"
                          : isDark
                            ? "border-white/10 text-white/30 hover:border-white/20"
                            : "border-charcoal/10 text-charcoal/40 hover:border-charcoal/20"
                      }`}
                    >
                      {m === "production" ? <ShieldCheck size={12} /> : <FlaskConical size={12} />}
                      {m === "production" ? "Live Production" : "Sandbox / Test"}
                    </button>
                  ))}
                </div>
                {creds.mode === "production" && (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-amber-400 font-semibold leading-relaxed">
                      Production mode is live. Real transactions will be processed. Ensure credentials are correct before saving.
                    </p>
                  </div>
                )}
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Merchant ID */}
                <div className="space-y-3">
                  <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                    <Key size={12} /> Merchant ID
                  </label>
                  <input
                    type="text"
                    value={creds.merchantId}
                    onChange={(e) => setCreds({ ...creds, merchantId: e.target.value })}
                    className={`${inputClass} px-4`}
                    placeholder="e.g. MY_MERCHANT_ID"
                  />
                </div>

                {/* Salt Index */}
                <div className="space-y-3">
                  <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                    <Hash size={12} /> Salt Index
                  </label>
                  <input
                    type="text"
                    value={creds.saltIndex}
                    onChange={(e) => setCreds({ ...creds, saltIndex: e.target.value })}
                    className={`${inputClass} px-4`}
                    placeholder="e.g. 1"
                  />
                </div>

                {/* Salt Key – full width with visibility toggle */}
                <div className="md:col-span-2 space-y-3">
                  <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                    <Key size={12} /> Salt Key
                    <span className={`text-[9px] normal-case font-bold ${isDark ? "text-white/25" : "text-charcoal/35"}`}>(Keep secret)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSaltKey ? "text" : "password"}
                      value={creds.saltKey}
                      onChange={(e) => setCreds({ ...creds, saltKey: e.target.value })}
                      className={`${inputClass} px-4 pr-12`}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                    <button
                      onClick={() => setShowSaltKey(!showSaltKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold transition-colors"
                    >
                      {showSaltKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Base URL – full width */}
                <div className="md:col-span-2 space-y-3">
                  <label className={`text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? "text-slate-400" : "text-gold"}`}>
                    <Globe size={12} /> API Base URL
                    <span className={`text-[9px] normal-case font-semibold ${isDark ? "text-white/25" : "text-charcoal/35"}`}>(auto-set by mode toggle)</span>
                  </label>
                  <input
                    type="text"
                    value={creds.baseUrl}
                    onChange={(e) => setCreds({ ...creds, baseUrl: e.target.value })}
                    className={`${inputClass} px-4 font-mono text-xs`}
                    placeholder="https://api.phonepe.com/apis/hermes"
                  />
                </div>
              </div>

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
                  Reset to Defaults
                </button>
              </div>
            </div>
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
