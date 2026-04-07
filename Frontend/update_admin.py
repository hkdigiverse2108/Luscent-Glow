import re

file_path = r"c:\Users\HP\Downloads\Lucsent_glow\Frontend\src\pages\Admin\AdminSettings.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

type_def = """type PaymentCreds = {
  activeGateway: "razorpay" | "cashfree";
  keyId: string;
  keySecret: string;
  mode: "sandbox" | "live";
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  cashfreeMode: "sandbox" | "live";
};

const DEFAULT_CREDS: PaymentCreds = {
  activeGateway: "razorpay",
  keyId: "",
  keySecret: "",
  mode: "sandbox",
  cashfreeAppId: "",
  cashfreeSecretKey: "",
  cashfreeMode: "sandbox",
};"""

content = re.sub(r'type PaymentCreds = \{.*?\};.*?const DEFAULT_CREDS: PaymentCreds = \{.*?\};', type_def, content, flags=re.DOTALL)

# Add showCashfreeSecret state
content = re.sub(r'const \[showKeySecret, setShowKeySecret\] = useState\(false\);', r'const [showKeySecret, setShowKeySecret] = useState(false);\n  const [showCashfreeSecret, setShowCashfreeSecret] = useState(false);', content)

# update fetchCreds mapping
new_fetch_creds = """        setCreds({
          activeGateway: data.activeGateway || "razorpay",
          keyId: data.keyId || "",
          keySecret: data.keySecret || "",
          mode: data.mode || "sandbox",
          cashfreeAppId: data.cashfreeAppId || "",
          cashfreeSecretKey: data.cashfreeSecretKey || "",
          cashfreeMode: data.cashfreeMode || "sandbox",
        });"""

content = re.sub(r'setCreds\(\{.*?keyId: data\.keyId \|\| "",.*?keySecret: data\.keySecret \|\| "",.*?mode: data\.mode \|\| "sandbox",\n\s*\}\);', new_fetch_creds, content, flags=re.DOTALL)

# update UI:
# from: `{/* Mode badge */}` to the end of payment card

new_payment_ui = """                <h3 className={`text-xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-charcoal"}`}>
                  Payment Gateway
                </h3>
                {/* Gateway badge */}
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                  creds.activeGateway === "cashfree"
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                }`}>
                  {creds.activeGateway === "cashfree" ? "Cashfree" : "Razorpay"} Active
                </span>
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
                        placeholder="TEST1049..."
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
        </motion.section>"""

content = re.sub(
    r'<h3 className=\{`text-xl font-extrabold uppercase tracking-tight \$\{isDark \? "text-white" : "text-charcoal"\}[\s\S]*?(?=<div className=\{`p-6 border rounded-\[2rem\])',
    new_payment_ui + "\n\n        ",
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
