import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  Gift, 
  ShoppingBag,
  Percent,
  CheckCircle2,
  RefreshCcw,
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import { getApiUrl } from "../../lib/api";
import { toast } from "sonner";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import OfferModal from "../../components/Admin/OfferModal.tsx";

const AdminOffers = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"registry" | "settings">("registry");
  const [offers, setOffers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersRes, settingsRes] = await Promise.all([
        fetch(getApiUrl("/offers/")),
        fetch(getApiUrl("/offers/settings"))
      ]);
      
      if (offersRes.ok) setOffers(await offersRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (error) {
      toast.error("Failed to sync with the Offers repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response = await fetch(getApiUrl("/offers/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        toast.success("Offers branding synchronized.");
      }
    } catch (error) {
      toast.error("Failed to commit branding changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm("Are you certain you wish to purge this offer?")) return;
    try {
      const response = await fetch(getApiUrl(`/offers/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Offer successfully removed.");
        setOffers(offers.filter(o => (o._id || o.id) !== id));
      }
    } catch (error) {
      toast.error("Process failed.");
    }
  };

  const openModal = (offer: any = null) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flash": return <Clock size={16} className="text-rose-500" />;
      case "bundle": return <ShoppingBag size={16} className="text-gold" />;
      case "tier": return <Gift size={16} className="text-emerald-500" />;
      default: return <Percent size={16} className="text-blue-500" />;
    }
  };

  if (loading && !settings) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminHeader 
        title="Offers"
        highlightedWord="Registry"
        subtitle="Manage flash deals, value bundles, and tiered loyalty rewards."
        isDark={isDark}
        actions={[
          {
            label: "Add New Offer",
            onClick: () => openModal(),
            icon: Plus
          }
        ]}
      >
        <div className="flex items-center gap-6 mt-4">
          {[
            { id: "registry", label: "Deal Registry", icon: ShoppingBag },
            { id: "settings", label: "Page Branding", icon: Sparkles }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id 
                  ? "text-gold" 
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                />
              )}
            </button>
          ))}
        </div>
      </AdminHeader>

      <AnimatePresence mode="wait">
        {activeTab === "registry" ? (
          <motion.div 
            key="registry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {offers.map((offer) => (
              <div 
                key={offer._id || offer.id}
                className={`group relative p-6 rounded-[2.5rem] border transition-all duration-500 ${
                  isDark ? "bg-white/5 border-white/10 hover:border-gold/30" : "bg-white border-gold/10 shadow-xl"
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-2xl flex items-center justify-center ${
                    isDark ? "bg-white/5" : "bg-gold/10"
                  }`}>
                    {getTypeIcon(offer.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModal(offer)}
                      className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteOffer(offer._id || offer.id)}
                      className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[8px] font-black uppercase tracking-tighter">
                      {offer.type}
                    </span>
                    {!offer.isActive && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-tighter">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold font-display line-clamp-1">{offer.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 min-h-[32px]">
                    {offer.type === "flash" ? `Category: ${offer.category}` : offer.tag || offer.reward || "Detailed promotional offer"}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Highlight</p>
                      <p className="text-sm font-bold text-gold">
                        {offer.discount || offer.price || `Threshold: ₹${offer.threshold}`}
                      </p>
                    </div>
                    {offer.endTime && (
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Expires</p>
                        <p className="text-[10px] font-bold">{new Date(offer.endTime).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {offers.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40">
                <Sparkles size={40} className="mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No active treasures found in the registry.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl space-y-8"
          >
            <div className={`p-10 rounded-[3rem] border ${
              isDark ? "bg-white/5 border-white/10" : "bg-white border-gold/10 shadow-2xl"
            }`}>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Hero Narrative</h3>
                    <p className="text-xs text-muted-foreground">The primary invitation for the Offers sanctuary.</p>
                  </div>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-8 py-4 bg-gold text-charcoal rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-gold/20 hover:bg-white transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                  Commit Artifacts
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Hero Title</label>
                    <input 
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                      className={`w-full p-5 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all ${
                        isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2">Description</label>
                    <textarea 
                      value={settings.heroDescription}
                      onChange={(e) => setSettings({...settings, heroDescription: e.target.value})}
                      rows={4}
                      className={`w-full p-5 rounded-2xl border-none font-bold text-xs focus:ring-2 focus:ring-gold/30 transition-all resize-none ${
                        isDark ? "bg-white/5 text-white" : "bg-charcoal/5 text-charcoal"
                      }`}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-2 flex items-center gap-2">
                    <ImageIcon size={12} /> Cinematic Visual (URL)
                  </label>
                  <input 
                    value={settings.heroImage}
                    onChange={(e) => setSettings({...settings, heroImage: e.target.value})}
                    className={`w-full p-5 rounded-2xl border-none font-mono text-[10px] focus:ring-2 focus:ring-gold/30 transition-all ${
                      isDark ? "bg-white/5 text-gold" : "bg-charcoal/5 text-gold"
                    }`}
                  />
                  <div className="mt-4 aspect-video rounded-[2rem] overflow-hidden border border-white/5">
                    <img src={settings.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OfferModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={selectedOffer}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default AdminOffers;
