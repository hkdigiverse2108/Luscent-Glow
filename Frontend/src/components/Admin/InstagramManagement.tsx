import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Instagram, Image as ImageIcon, Video, Trash2, Edit3, Move, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import InstagramPostModal from "./InstagramPostModal.tsx";

const InstagramManagement = () => {
  const { isDark } = useAdminTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [useCustomFeed, setUseCustomFeed] = useState(false);

  // Fetch both the settings and the posts
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Home Settings to get the 'useCustomFeed' flag
      const settingsRes = await fetch(getApiUrl("/api/home/settings"));
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setUseCustomFeed(data.instagram?.useCustomFeed || false);
      }

      // 2. Fetch all Instagram posts (admin endpoint)
      const postsRes = await fetch(getApiUrl("/api/instagram/admin"));
      if (postsRes.ok) {
        setPosts(await postsRes.json());
      }
    } catch (err) {
      toast.error("Failed to sync with social database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFeedMode = async () => {
    const newMode = !useCustomFeed;
    try {
      // We need to update the HomeSettings for the instagram block
      const settingsRes = await fetch(getApiUrl("/api/home/settings"));
      if (settingsRes.ok) {
        const currentData = await settingsRes.json();
        const updatedInstagram = {
          ...currentData.instagram,
          useCustomFeed: newMode
        };

        const updateRes = await fetch(getApiUrl("/api/home/settings"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instagram: updatedInstagram }),
        });

        if (updateRes.ok) {
          setUseCustomFeed(newMode);
          toast.success(newMode ? "Custom Discovery Grid enabled." : "Automated Instagram Widget restored.");
        }
      }
    } catch (err) {
      toast.error("Failed to switch discovery modes.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Banish this entry from the sanctuary forever?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/instagram/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post removed from gallery.");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete entry.");
    }
  };

  return (
    <div className="space-y-12">
      {/* Configuration Hub */}
      <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-charcoal/5 border-charcoal/5'} backdrop-blur-xl`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${useCustomFeed ? 'bg-gold/20' : 'bg-muted/10'}`}>
              <Instagram className={useCustomFeed ? 'text-gold' : 'text-muted-foreground'} size={32} />
            </div>
            <div>
              <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>DISCOVERY MODE</h3>
              <p className="text-sm text-muted-foreground font-body">Choose between automated LightWidget or custom manual curation.</p>
            </div>
          </div>
          
          <button
            onClick={handleToggleFeedMode}
            className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-body font-bold transition-all border-2 ${
              useCustomFeed 
                ? 'border-gold bg-gold/5 text-gold' 
                : 'border-white/10 bg-white/5 text-muted-foreground'
            }`}
          >
            {useCustomFeed ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            {useCustomFeed ? 'MANUAL CURATION ACTIVE' : 'LIGHTWIDGET ACTIVE'}
          </button>
        </div>
      </div>

      {/* Gallery Title & Action */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-charcoal'}`}>CUSTOM GALLERY</h2>
          <p className="text-muted-foreground font-body mt-2">Hand-pick the visual stories that define your brand ethos.</p>
        </div>
        <button
          onClick={() => { setSelectedPost(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 px-8 py-4 bg-gold rounded-2xl text-white font-body font-bold tracking-widest hover:bg-gold/90 transition-all shadow-lg hover:shadow-gold/20"
        >
          <Plus size={20} />
          ADD ENTRY
        </button>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center glass-premium rounded-[3rem] border border-white/10">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Instagram size={40} className="text-gold" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">The Sanctuary is Empty</h3>
          <p className="text-muted-foreground font-body">Start curating your visual ritual by adding your first Instagram post or reel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border ${
                  isDark ? 'bg-charcoal border-white/10' : 'bg-white border-charcoal/5'
                } shadow-xl`}
              >
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* Overlay Type Badge */}
                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-charcoal/80 backdrop-blur-md rounded-full border border-white/10">
                  {post.type === 'reel' ? <Video size={14} className="text-gold" /> : <ImageIcon size={14} className="text-gold" />}
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{post.type}</span>
                </div>

                {/* Status Badge */}
                {!post.isActive && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-red-500/80 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">HIDDEN</span>
                  </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                  <button
                    onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all shadow-xl"
                    title="Edit Ritual"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    title="Banish Entry"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Info Bar */}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-charcoal to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                      <Move size={14} className="text-gold" />
                    </div>
                    <span className="text-xs font-body font-bold text-white/60">ORDER: {post.order}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Manual Curation Disclaimer */}
      {!useCustomFeed && (
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-gold/5 border-gold/20' : 'bg-gold/10 border-gold/20'} flex items-center gap-4`}>
          <AlertCircle className="text-gold shrink-0" size={24} />
          <p className={`text-sm font-body ${isDark ? 'text-gold/80' : 'text-gold/90'}`}>
            Manual entries are currently hidden because <strong>LightWidget Mode</strong> is active. Enable "Manual Curation" above to switch to this custom gallery on the homepage.
          </p>
        </div>
      )}

      <InstagramPostModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPost(null); }}
        post={selectedPost}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default InstagramManagement;
