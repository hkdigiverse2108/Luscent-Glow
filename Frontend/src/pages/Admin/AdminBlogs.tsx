import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  Calendar, 
  User as UserIcon,
  Layout,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  Quote,
  MessageSquare,
  BookOpen
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import BlogPostModal from "../../components/Admin/BlogPostModal.tsx";
import EditorialVoiceModal from "../../components/Admin/EditorialVoiceModal.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";
import SEOForm from "../../components/Admin/SEOForm.tsx";

const AdminBlogs = () => {
  const { isDark } = useAdminTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [voices, setVoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "voices" | "seo">("posts");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [postsRes, settingsRes, voicesRes] = await Promise.all([
        fetch(getApiUrl("blogs")),
        fetch(getApiUrl("blogs/settings")),
        fetch(getApiUrl("blogs/editorial-voices"))
      ]);
      
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      }
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
      if (voicesRes.ok) {
        const voicesData = await voicesRes.json();
        setVoices(Array.isArray(voicesData) ? voicesData : []);
      }
    } catch (error) {
      toast.error("Failed to fetch blog data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setIsSettingsSaving(true);
    try {
      const response = await fetch(getApiUrl("blogs/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        toast.success("Blog settings saved.");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (error) {
      toast.error("Network connection failed.");
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const handleUpdateSeo = (newSeo: any) => {
    setSettings({ ...settings, seo: newSeo });
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(getApiUrl(`blogs/posts/${id}`), {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Post deleted.");
        fetchData();
      } else {
        toast.error("Failed to delete post.");
      }
    } catch (error) {
      toast.error("Delete operation failed.");
    }
  };

  const handleDeleteVoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;
    
    try {
      const response = await fetch(getApiUrl(`blogs/editorial-voices/${id}`), {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Author removed.");
        fetchData();
      } else {
        toast.error("Failed to remove author.");
      }
    } catch (error) {
      toast.error("Delete operation failed.");
    }
  };

  const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post => 
    post && (
      (post.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredVoices = (Array.isArray(voices) ? voices : []).filter(voice => 
    voice && (
      (voice.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (voice.insights || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <div className="py-20 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Loading Journal Records...</div>;
  }

  // Fallback for settings if fetch failed but loading finished
  const safeSettings = settings || {
    heroBadge: "The Journal",
    heroTitle: "Glow Haven Chronicles",
    finaleTitle: "Stay Inspired",
    finaleSubtitle: "Ritual of Radiance",
    seo: { title: "", description: "", keywords: "" }
  };

  return (
    <div className="space-y-2 pb-4">
      <AdminHeader
        title="Journal"
        highlightedWord="Sanctuary"
        subtitle="Curate your stories and editorial voices"
        isDark={isDark}
        action={{
          label: activeTab === "posts" ? "Create Post" : "Add Author",
          onClick: () => {
            if (activeTab === "posts") { setSelectedPost(null); setIsModalOpen(true); }
            else { setSelectedVoice(null); setIsVoiceModalOpen(true); }
          },
          icon: Plus
        }}
      >
        <div className="flex p-1 rounded-full border mt-2 w-fit bg-white/5 border-white/10">
          <button 
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "posts" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Blog Posts
          </button>
          <button 
            onClick={() => setActiveTab("voices")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "voices" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Author Voices
          </button>
          <button 
            onClick={() => setActiveTab("seo")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "seo" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            SEO Settings
          </button>
        </div>
      </AdminHeader>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Sidebar Settings - Static in both tabs for branding */}
        <div className="xl:col-span-1 space-y-4">
          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
             <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3 text-gold">
               <Sparkles size={20} /> Blog Settings
             </h3>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Badge</label>
                   <input 
                     value={safeSettings.heroBadge}
                     onChange={(e) => setSettings({ ...safeSettings, heroBadge: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Title</label>
                   <input 
                     value={safeSettings.heroTitle}
                     onChange={(e) => setSettings({ ...safeSettings, heroTitle: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Finale Title</label>
                   <input 
                     value={safeSettings.finaleTitle}
                     onChange={(e) => setSettings({ ...safeSettings, finaleTitle: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Finale Subtitle</label>
                   <input 
                     value={safeSettings.finaleSubtitle}
                     onChange={(e) => setSettings({ ...safeSettings, finaleSubtitle: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSettingsSaving}
                  className="w-full flex items-center justify-center gap-3 bg-gold/10 hover:bg-gold text-gold hover:text-charcoal py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isSettingsSaving ? "Saving..." : "Save Blog Settings"}
                </button>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-3 space-y-4">
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/50" size={20} />
              <input 
                type="text"
                placeholder={activeTab === "posts" ? "Search posts by title or author..." : "Search authors..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-16 pr-8 py-4 rounded-2xl border transition-all font-body text-sm ${isDark ? "bg-white/5 border-white/10 focus:border-gold/30" : "bg-white border-charcoal/10 focus:border-gold shadow-lg"}`}
              />
           </div>

            <AnimatePresence mode="wait">
             {activeTab === "posts" ? (
                <motion.div 
                  key="posts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6 min-h-[600px]"
                >
                  {filteredPosts.map((post) => (
                    <div key={post._id || post.id} className={`group p-4 rounded-3xl border transition-all hover:scale-[1.01] ${isDark ? "bg-white/5 border-white/10 hover:border-gold/30" : "bg-white border-charcoal/10 shadow-lg hover:border-gold/50"}`}>
                       <div className="flex flex-col lg:flex-row gap-6 items-center">
                          <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden relative shrink-0">
                             <img src={getAssetUrl(post.image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             {post.featured && (
                               <div className="absolute top-3 left-3 bg-gold text-primary p-2 rounded-lg shadow-lg">
                                 <Star size={12} fill="currentColor" />
                               </div>
                             )}
                          </div>
                          
                          <div className="flex-1 space-y-3 min-w-0">
                             <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gold">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                <span className="px-2 py-0.5 bg-gold/10 rounded-md border border-gold/20">{post.category}</span>
                             </div>
                             <h4 className="font-display text-xl font-bold truncate group-hover:text-gold transition-colors">{post.title}</h4>
                             <p className="text-xs text-muted-foreground line-clamp-2 italic">{post.excerpt}</p>
                             
                             <div className="flex items-center gap-3 pt-2">
                               <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                 <UserIcon size={12} />
                               </div>
                               <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{post.author}</span>
                             </div>
                          </div>

                          <div className="flex lg:flex-col gap-3">
                             <button 
                               onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}
                               className="p-3 rounded-2xl bg-gold/10 text-gold hover:bg-gold hover:text-charcoal transition-all"
                             >
                               <Edit2 size={18} />
                             </button>
                             <button 
                               onClick={() => handleDeletePost(post._id || post.id)}
                               className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                             >
                               <Trash2 size={18} />
                             </button>
                             <a 
                               href={`/blogs/${post.id || post._id}`} 
                               target="_blank" 
                               rel="noreferrer"
                               className="p-3 rounded-2xl bg-gold/10 text-gold/50 hover:text-gold transition-all"
                             >
                               <Eye size={18} />
                             </a>
                          </div>
                       </div>
                    </div>
                  ))}
                  {filteredPosts.length === 0 && (
                    <div className="py-20 text-center opacity-30 italic">No posts found...</div>
                  )}
                </motion.div>
             ) : activeTab === "voices" ? (
                <motion.div 
                  key="voices"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6 min-h-[600px]"
                >
                    {filteredVoices.map((voice) => {
                      const initials = (voice.name || "A V").split(' ').map((n: string) => n[0]).join('').slice(0, 2);
                      return (
                       <div key={voice._id || voice.id} className={`group p-6 rounded-[2.5rem] border transition-all hover:scale-[1.01] ${isDark ? "bg-white/5 border-white/10 hover:border-gold/30" : "bg-white border-charcoal/10 shadow-lg hover:border-gold/50"}`}>
                         <div className="flex flex-col lg:flex-row gap-8 items-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-2 border-gold/20 shadow-xl relative bg-secondary/30 flex items-center justify-center">
                               {voice.image ? (
                                 <img src={getAssetUrl(voice.image)} alt={voice.name} className="w-full h-full object-cover" />
                               ) : (
                                 <span className="font-display text-4xl font-bold text-gold/30 uppercase tracking-widest">{initials}</span>
                               )}
                               {voice.isActive && (
                                 <div className="absolute -bottom-1 -right-1 bg-gold text-charcoal p-1 rounded-full border-2 border-[#121212]">
                                   <CheckCircle2 size={14} />
                                 </div>
                               )}
                            </div>
                           
                           <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-4">
                                 <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-gold/10 text-gold rounded-full border border-gold/20">{voice.badge}</span>
                                 {voice.isActive && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Active Author</span>}
                              </div>
                              <h4 className="font-display text-4xl font-bold italic">{voice.name}</h4>
                              <div className="relative z-10 flex items-center justify-between">
                                 <div>
                                   <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-1">Blog Insights</h5>
                                   <p className={`text-xs font-semibold max-w-sm leading-relaxed opacity-60 line-clamp-2 italic`}>{voice.insights}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="flex lg:flex-col gap-3">
                              <button 
                                onClick={() => { setSelectedVoice(voice); setIsVoiceModalOpen(true); }}
                                className="p-3 rounded-2xl bg-gold/10 text-gold hover:bg-gold hover:text-charcoal transition-all"
                              >
                                 <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteVoice(voice._id || voice.id)}
                                className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                   {filteredVoices.length === 0 && (
                     <div className="py-20 text-center opacity-30 italic">No authors found...</div>
                   )}
                </motion.div>
             ) : (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
                    <SEOForm 
                      seo={safeSettings.seo || { title: "", description: "", keywords: "" }} 
                      onChange={handleUpdateSeo} 
                      isDark={isDark} 
                    />
                    <div className="mt-10 pt-8 border-t border-gold/10">
                      <button 
                        onClick={handleSaveSettings}
                        disabled={isSettingsSaving}
                        className="w-full flex items-center justify-center gap-3 bg-gold text-charcoal py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-gold/20"
                      >
                        {isSettingsSaving ? "Securing Archives..." : "Save Blog SEO Settings"}
                      </button>
                    </div>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      <BlogPostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
        onSuccess={fetchData}
        voices={voices}
      />

      <EditorialVoiceModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voice={selectedVoice}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminBlogs;
