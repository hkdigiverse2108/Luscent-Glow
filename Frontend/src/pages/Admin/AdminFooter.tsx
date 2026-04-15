import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink,
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter,
  Mail,
  Phone,
  Layout,
  Type,
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getApiUrl } from "../../lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminFooter = () => {
  const { isDark } = useAdminTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footer, setFooter] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);

  const fetchFooter = async () => {
    try {
      const response = await fetch(getApiUrl("/api/footer/"));
      if (!response.ok) throw new Error("Failed to load");
      const data = await response.json();
      setFooter(data);
    } catch (error) {
      toast.error("Failed to fetch footer settings");
      // Initialize with default structure if fetch fails or is empty
      setFooter({
        brandDescription: "Elevate your beauty routine with our premium, cruelty-free cosmetics. Crafted with love, powered by nature.",
        email: "hello@luscentglow.com",
        phone: "+91 97126 63607",
        socials: [
          { platform: "Instagram", url: "#", icon: "Instagram" },
          { platform: "Facebook", url: "#", icon: "Facebook" },
          { platform: "Youtube", url: "#", icon: "Youtube" },
          { platform: "Twitter", url: "#", icon: "Twitter" }
        ],
        columns: [
          { title: "Information", links: [
            { label: "About Us", path: "/about" },
            { label: "Contact Us", path: "/contact" },
            { label: "Track Order", path: "/track-order" },
            { label: "Blogs", path: "/blogs" },
            { label: "FAQ's", path: "/faq" }
          ] },
          { title: "Policies", links: [
            { label: "Privacy Policy", path: "/privacy-policy" },
            { label: "Terms & Conditions", path: "/terms-and-conditions" }
          ] }
        ],
        newsletterTitle: "Newsletter Subscription",
        newsletterSubtitle: "Join our community",
        copyrightText: `© ${new Date().getFullYear()} Luscent Glow. All rights reserved.`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await fetch(getApiUrl("/policies/"));
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error("Policy fetch error:", error);
    }
  };

  useEffect(() => {
    fetchFooter();
    fetchPolicies();
  }, []);

  const handleSave = async () => {
    if (!footer) return;
    setSaving(true);
    try {
      const response = await fetch(getApiUrl("/api/footer/"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footer),
      });
      if (response.ok) {
        toast.success("Footer settings saved successfully");
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      toast.error("Failed to synchronize footer");
    } finally {
      setSaving(false);
    }
  };

  const addLink = (columnIndex: number) => {
    if (!footer) return;
    const newFooter = { ...footer };
    newFooter.columns[columnIndex].links.push({ label: "New Link", path: "/" });
    setFooter(newFooter);
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    if (!footer) return;
    const newFooter = { ...footer };
    newFooter.columns[columnIndex].links.splice(linkIndex, 1);
    setFooter(newFooter);
  };

  const updateLink = (columnIndex: number, linkIndex: number, field: string, value: string) => {
    if (!footer) return;
    const newFooter = { ...footer };
    newFooter.columns[columnIndex].links[linkIndex][field] = value;
    setFooter(newFooter);
  };

  const updateSocial = (index: number, field: string, value: string) => {
    if (!footer) return;
    const newSocials = [...footer.socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setFooter({ ...footer, socials: newSocials });
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  if (!footer) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="text-rose-500" size={40} />
      <p className="text-xs tracking-widest uppercase font-black opacity-40">Configuration Not Found</p>
      <button onClick={fetchFooter} className="px-6 py-2 rounded-xl bg-gold text-charcoal font-black text-[10px] uppercase tracking-widest">Retry Loading</button>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader 
        title="Footer"
        highlightedWord="Admin"
        subtitle="Manage the platform's footer navigation and links"
        isDark={isDark}
        actions={[
          {
            label: saving ? "Saving..." : "Save Changes",
            onClick: handleSave,
            icon: saving ? Loader2 : Save,
            disabled: saving,
            variant: "primary"
          }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Brand & Socials Stacked */}
        <div className="space-y-6">
          {/* Brand Identity Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-7 rounded-[32px] border shadow-xl ${isDark ? "bg-[#1a1a1a]/60 border-white/10" : "bg-white border-gold/10"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-gold/20 text-gold" : "bg-gold/10 text-gold"}`}>
                <Palette size={18} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Brand Identity</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Brand Narrative</label>
                <textarea 
                  value={footer.brandDescription}
                  onChange={(e) => setFooter({...footer, brandDescription: e.target.value})}
                  rows={3}
                  className={`w-full px-5 py-3 rounded-2xl border-none font-bold text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-all ${isDark ? "bg-white/5 text-white" : "bg-[#f4f4f4] text-charcoal"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 flex items-center gap-2">Support Email</label>
                <input 
                  type="email"
                  value={footer.email}
                  onChange={(e) => setFooter({...footer, email: e.target.value})}
                  className={`w-full px-5 py-3.5 rounded-xl border-none font-bold text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${isDark ? "bg-white/5 text-white" : "bg-[#f4f4f4] text-charcoal"}`}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 flex items-center gap-2">Contact Number</label>
                <input 
                  type="text"
                  value={footer.phone}
                  onChange={(e) => setFooter({...footer, phone: e.target.value})}
                  className={`w-full px-5 py-3.5 rounded-xl border-none font-bold text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${isDark ? "bg-white/5 text-white" : "bg-[#f4f4f4] text-charcoal"}`}
                />
              </div>
            </div>
          </motion.div>

          {/* Social Links Configuration Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-7 rounded-[32px] border shadow-xl ${isDark ? "bg-[#1a1a1a]/60 border-white/10" : "bg-white border-gold/10"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-gold/20 text-gold" : "bg-gold/10 text-gold"}`}>
                <Globe size={18} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Social Links</h3>
            </div>

            <div className="space-y-3">
              {footer.socials.map((social: any, idx: number) => (
                <div key={idx} className={`p-3 rounded-xl flex items-center gap-4 transition-all ${isDark ? "bg-white/5" : "bg-[#f4f4f4]"}`}>
                  <div className="text-gold flex-shrink-0">
                    {social.platform === "Instagram" && <Instagram size={16} />}
                    {social.platform === "Facebook" && <Facebook size={16} />}
                    {social.platform === "Youtube" && <Youtube size={16} />}
                    {social.platform === "Twitter" && <Twitter size={16} />}
                  </div>
                  <input 
                    type="text"
                    value={social.url}
                    onChange={(e) => updateSocial(idx, "url", e.target.value)}
                    className={`flex-1 bg-transparent font-bold text-[10px] focus:outline-none border-b border-transparent focus:border-gold/30 py-0.5 ${isDark ? "text-white" : "text-charcoal"}`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Middle & Right Columns: Full Height Links */}
        {footer.columns.map((column: any, colIdx: number) => (
          <motion.div 
            key={colIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (colIdx * 0.1) }}
            className={`p-7 rounded-[40px] border shadow-xl flex flex-col h-full min-h-[700px] ${isDark ? "bg-[#1a1a1a]/60 border-white/10" : "bg-white border-gold/10"}`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-500/10 text-rose-500"}`}>
                  <Layout size={22} />
                </div>
                <input 
                  type="text"
                  value={column.title}
                  onChange={(e) => {
                    const newFooter = {...footer};
                    newFooter.columns[colIdx].title = e.target.value;
                    setFooter(newFooter);
                  }}
                  className={`text-xl font-black uppercase tracking-tight bg-transparent focus:outline-none focus:text-gold transition-colors ${isDark ? "text-white" : "text-charcoal"}`}
                />
              </div>
              <button 
                onClick={() => addLink(colIdx)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"}`}
              >
                <Plus size={18} />
              </button>
            </div>

            <div className={`flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar py-2`}>
              {column.links.map((link: any, linkIdx: number) => (
                <div 
                  key={linkIdx} 
                  className={`group relative p-5 rounded-[22px] border flex items-center justify-between transition-all duration-500 ${isDark ? "bg-white/3 border-white/5 hover:bg-white/8 hover:border-gold/30" : "bg-white border-charcoal/5 hover:border-gold/30 shadow-sm"}`}
                >
                  <div className="flex-1 flex items-center justify-between mr-8 px-1">
                    <input 
                      type="text"
                      value={link.label}
                      placeholder="Label"
                      onChange={(e) => updateLink(colIdx, linkIdx, "label", e.target.value)}
                      className={`bg-transparent font-black text-[11px] uppercase tracking-tight focus:outline-none border-b border-transparent focus:border-gold/30 pb-0.5 w-[35%] ${isDark ? "text-white" : "text-charcoal"}`}
                    />
                    
                    {colIdx === 1 ? (
                      <select 
                        value={link.path.startsWith('/policies/') ? link.path.split('/policies/')[1] : (link.path.startsWith('/') ? link.path.substring(1) : "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = policies.find(p => p.type === val);
                          if (selected) {
                            updateLink(colIdx, linkIdx, "label", selected.title);
                            updateLink(colIdx, linkIdx, "path", `/${selected.type}`);
                          } else {
                            updateLink(colIdx, linkIdx, "path", `/${val}`);
                          }
                        }}
                        className={`bg-transparent font-bold text-[9px] uppercase border border-gold/20 rounded px-1.5 py-0.5 outline-none max-w-[35%] ${isDark ? "text-gold" : "text-charcoal"}`}
                      >
                        <option value="">Policy Suggestion...</option>
                        {policies.map(p => (
                          <option key={p.type} value={p.type} className={isDark ? "bg-charcoal" : "bg-white"}>{p.title}</option>
                        ))}
                      </select>
                    ) : null}

                    <input 
                      type="text"
                      value={link.path}
                      placeholder="Path"
                      onChange={(e) => updateLink(colIdx, linkIdx, "path", e.target.value)}
                      className={`bg-transparent font-bold text-[10px] font-mono tracking-wider opacity-30 focus:outline-none border-b border-transparent focus:border-gold/30 text-right w-[20%] ${isDark ? "text-white" : "text-charcoal"}`}
                    />
                  </div>
                  
                  <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => removeLink(colIdx, linkIdx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-7 rounded-[32px] border shadow-xl ${isDark ? "bg-[#1a1a1a]/60 border-white/10" : "bg-white border-gold/10"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold font-serif italic text-xl tracking-tighter">B</div>
                <h3 className="text-lg font-black uppercase tracking-tight">Newsletter Content</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Newsletter Title</label>
                  <input 
                    type="text"
                    value={footer.newsletterTitle}
                    onChange={(e) => setFooter({...footer, newsletterTitle: e.target.value})}
                    className={`w-full px-5 py-3.5 rounded-xl border-none font-bold text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${isDark ? "bg-white/5 text-white" : "bg-[#f4f4f4] text-charcoal"}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Newsletter Subtitle</label>
                  <input 
                    type="text"
                    value={footer.newsletterSubtitle}
                    onChange={(e) => setFooter({...footer, newsletterSubtitle: e.target.value})}
                    className={`w-full px-5 py-3.5 rounded-xl border-none font-bold text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${isDark ? "bg-white/5 text-white" : "bg-[#f4f4f4] text-charcoal"}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-gold/20 text-gold" : "bg-gold/10 text-gold"}`}>
                  <Type size={18} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Policies & Copyright</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Global Copyright</label>
                  <input 
                    type="text"
                    value={footer.copyrightText}
                    onChange={(e) => setFooter({...footer, copyrightText: e.target.value})}
                    className={`w-full px-5 py-3.5 rounded-xl border-none font-bold text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${isDark ? "bg-white/5 text-white" : "bg-[#f4f4f4] text-charcoal"}`}
                  />
                </div>
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDark ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-500/5 border-emerald-500/20 shadow-sm"}`}>
                  <AlertCircle className="text-emerald-500" size={16} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Synchronized: {new Date(footer.updatedAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminFooter;
