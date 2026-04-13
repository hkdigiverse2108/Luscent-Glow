import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Mail, 
  Trash2, 
  Search, 
  Calendar,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Server,
  Sparkles,
  ClipboardList,
  ChevronRight
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminNewsletter = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"list" | "config">("list");
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Settings State
  const [settings, setSettings] = useState({
    fromName: "",
    fromEmail: "",
    subject: "",
    headline: "",
    body1: "",
    body2: "",
    buttonText: "",
    quote: "",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch(getApiUrl("/api/newsletter/settings"));
      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...data,
          smtpPort: data.smtpPort || 587,
          smtpHost: data.smtpHost || "",
          smtpUser: data.smtpUser || "",
          smtpPassword: data.smtpPassword || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/newsletter/"));
      if (response.ok) {
        const data = await response.json();
        setSubs(data);
      }
    } catch (error) {
      toast.error("Could not reach the subscriber database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await fetch(getApiUrl("/api/newsletter/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        toast.success("Welcome Email settings saved successfully.");
        setActiveTab("list");
      } else {
        toast.error("Failed to commit settings.");
      }
    } catch (error) {
      toast.error("System connection error.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/newsletter/${email}`), {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Subscriber removed successfully.");
        fetchSubs();
      } else {
        toast.error("Removal failed.");
      }
    } catch (error) {
      toast.error("System connection error.");
    }
  };

  const filteredSubs = subs.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-4">
      <AdminHeader 
        title="Newsletter"
        highlightedWord="Manager"
        subtitle="Manage email subscribers and automated newsletter settings"
        isDark={isDark}
        action={activeTab === "config" ? {
          label: savingSettings ? "Saving..." : "Save Configuration",
          onClick: handleSaveSettings,
          icon: savingSettings ? Sparkles : CheckCircle,
          disabled: savingSettings
        } : undefined}
      >
        <div className="flex p-1 rounded-full border mt-4 w-fit bg-white/5 border-white/10">
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "list" 
                ? "bg-gold text-charcoal shadow-lg shadow-gold/20" 
                : isDark ? "text-white/40 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
            }`}
          >
            Subscriber List
          </button>
          <button 
            onClick={() => setActiveTab("config")}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "config" 
                ? "bg-gold text-charcoal shadow-lg shadow-gold/20" 
                : isDark ? "text-white/40 hover:text-white" : "text-charcoal/40 hover:text-charcoal"
            }`}
          >
            Welcome Email
          </button>
        </div>
      </AdminHeader>

      <AnimatePresence mode="wait">
        {activeTab === "list" ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Subscribers", value: subs.length, icon: Users, tint: "text-gold" },
                { label: "Direct Signups", value: subs.filter(s => !s.source || s.source === "Direct Signup").length, icon: Mail, tint: "text-gold/80" },
                { label: "Email Status", value: "Active", icon: Sparkles, tint: "text-emerald-400" }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] ${isDark ? "bg-charcoal/40 border-white/5" : "bg-white border-charcoal/5 shadow-xl shadow-charcoal/5"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-gold/60"}`}>{stat.label}</p>
                    <stat.icon size={18} className={stat.tint} />
                  </div>
                  <h4 className={`text-4xl font-display font-medium ${isDark ? "text-white" : "text-charcoal"}`}>{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
              <div className="relative group flex-1 max-w-xl">
                <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? "text-white/20 group-focus-within:text-gold" : "text-charcoal/60 group-focus-within:text-gold"
                }`} size={18} />
                <input 
                  type="text" 
                  placeholder="Search subscribers by email address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full backdrop-blur-2xl border rounded-2xl py-4 pl-16 pr-6 font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all ${
                    isDark 
                    ? "bg-charcoal/40 border-white/5 text-white placeholder:text-white/10" 
                    : "bg-white border-charcoal/5 text-charcoal placeholder:text-charcoal/60 shadow-sm"
                  }`}
                />
              </div>
              
              <button 
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                  isDark ? "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5" : "bg-white text-charcoal shadow-sm border border-charcoal/5 hover:bg-charcoal/5"
                }`}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <div className={`backdrop-blur-3xl border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 min-h-[600px] ${
              isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-charcoal/5 shadow-charcoal/5"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className={`border-b font-body text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${
                     isDark ? "bg-white/[0.04] border-white/10 text-white/30" : "bg-charcoal/[0.04] border-charcoal/10 text-charcoal/60"
                   }`}>
                      <tr>
                         <th className="px-8 py-6">Subscriber</th>
                         <th className="px-8 py-6">Origin</th>
                         <th className="px-8 py-6">Joined Date</th>
                         <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className={`divide-y transition-colors duration-700 ${
                     isDark ? "divide-white/10" : "divide-charcoal/10"
                   }`}>
                      {loading ? (
                         Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-8 py-4"><div className="h-6 w-48 bg-white/5 rounded-lg" /></td>
                            <td className="px-8 py-4"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                            <td className="px-8 py-4"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>
                            <td className="px-8 py-4"><div className="h-10 w-10 ml-auto bg-white/5 rounded-full" /></td>
                          </tr>
                        ))
                      ) : filteredSubs.length > 0 ? (
                        filteredSubs.map((s) => (
                          <tr key={s.email} className="group/row hover:bg-gold/5 transition-colors">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-gold transition-colors ${
                                      isDark ? "bg-gold/10 group-hover/row:bg-gold/20" : "bg-gold/5 shadow-inner"
                                    }`}>
                                       <Mail size={18} />
                                    </div>
                                    <span className={`text-[15px] font-bold tracking-tight transition-colors ${
                                      isDark ? "text-white" : "text-charcoal"
                                    }`}>{s.email}</span>
                                 </div>
                              </td>
                             <td className="px-8 py-5">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${
                                  isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-charcoal/5 border-charcoal/10 text-charcoal/60"
                                }`}>
                                  {s.source || "Direct Signup"}
                                </span>
                             </td>
                              <td className="px-8 py-5">
                                 <div className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest transition-colors ${
                                   isDark ? "text-white/40" : "text-charcoal/50"
                                 }`}>
                                    <Calendar size={16} />
                                    {new Date(s.subscribedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <button 
                                   onClick={() => handleDelete(s.email)}
                                   className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ml-auto ${
                                     isDark ? "bg-white/5 text-white/40 hover:text-rose-light hover:bg-rose-light/10" : "bg-charcoal/5 text-charcoal/40 hover:text-rose-brand hover:bg-rose-brand/10"
                                   }`}
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className={`px-8 py-24 text-center font-body text-base font-bold uppercase tracking-widest italic transition-colors ${
                            isDark ? "text-white/20" : "text-charcoal/40"
                          }`}>
                             No subscribers found.
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className={`p-8 md:p-12 rounded-[3rem] border backdrop-blur-3xl transition-all duration-700 ${
              isDark ? "bg-charcoal/40 border-white/5" : "bg-white border-charcoal/5 shadow-xl shadow-charcoal/5"
            }`}>
              {/* Email Content */}
              <div className="space-y-10">
                <div className="flex items-center gap-4 border-b pb-8 border-gold/10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-gold/10" : "bg-gold/5"}`}>
                    <Mail className="text-gold" size={28} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-display font-medium ${isDark ? "text-white" : "text-charcoal"}`}>Welcome Email Editor</h3>
                    <p className="text-[10px] text-gold/60 tracking-[0.3em] uppercase font-black mt-1">Configure the customer's first email</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Sender Display Name</label>
                    <input 
                      type="text" 
                      value={settings.fromName}
                      onChange={(e) => setSettings({...settings, fromName: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                      placeholder="e.g. Luscent Glow"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Email Subject Line</label>
                    <input 
                      type="text" 
                      value={settings.subject}
                      onChange={(e) => setSettings({...settings, subject: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Hero Headline</label>
                    <input 
                      type="text" 
                      value={settings.headline}
                      onChange={(e) => setSettings({...settings, headline: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Welcome Text (Section 1)</label>
                    <textarea 
                      rows={4}
                      value={settings.body1}
                      onChange={(e) => setSettings({...settings, body1: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all resize-none ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Secondary Text (Section 2)</label>
                    <textarea 
                      rows={4}
                      value={settings.body2}
                      onChange={(e) => setSettings({...settings, body2: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all resize-none ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Button Call-to-Action</label>
                    <input 
                      type="text" 
                      value={settings.buttonText}
                      onChange={(e) => setSettings({...settings, buttonText: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Email Footer Quote</label>
                    <input 
                      type="text" 
                      value={settings.quote}
                      onChange={(e) => setSettings({...settings, quote: e.target.value})}
                      className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                        isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                      }`}
                    />
                  </div>
                </div>

                {/* SMTP Setup */}
                <div className="pt-12 mt-4 border-t border-gold/10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-gold/10" : "bg-gold/5"}`}>
                      <Server className="text-gold" size={24} />
                    </div>
                    <div>
                      <h4 className={`text-xl font-display font-medium ${isDark ? "text-white/80" : "text-charcoal/80"}`}>Email SMTP Server Settings</h4>
                      <p className="text-[10px] text-gold/40 tracking-[0.3em] uppercase font-black mt-1">Configure the server used for sending emails</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">Dispatch Email</label>
                      <input 
                        type="email" 
                        value={settings.fromEmail}
                        onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                        className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                          isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                        }`}
                        placeholder="hello@luscentglow.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">SMTP Host</label>
                      <input 
                        type="text" 
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                        className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                          isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                        }`}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">SMTP Port</label>
                      <input 
                        type="number" 
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                        className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                          isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                        }`}
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">SMTP User</label>
                      <input 
                        type="email" 
                        value={settings.smtpUser}
                        onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                        className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                          isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                        }`}
                        placeholder="parthhkdigiverse@gmail.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 ml-1">SMTP Password</label>
                      <div className="relative">
                        <input 
                          type={showSmtpPass ? "text" : "password"}
                          value={settings.smtpPassword}
                          onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                          className={`w-full bg-transparent border-2 rounded-2xl py-4 px-6 font-body text-sm font-bold focus:outline-none focus:border-gold/50 transition-all ${
                            isDark ? "border-white/10 text-white" : "border-charcoal/10 text-charcoal"
                          }`}
                          placeholder="••••••••••••••••"
                        />
                        <button 
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold transition-colors"
                        >
                          {showSmtpPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNewsletter;
