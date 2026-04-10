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
import BlogPostModal from "../../components/Admin/BlogPostModal";
import EditorialVoiceModal from "../../components/Admin/EditorialVoiceModal";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminBlogs = () => {
  const { isDark } = useAdminTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [voices, setVoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "voices">("posts");
  
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
      
      if (postsRes.ok) setPosts(await postsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (voicesRes.ok) setVoices(await voicesRes.json());
    } catch (error) {
      toast.error("Failed to fetch journal data.");
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
        toast.success("Editorial settings synchronized.");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (error) {
      toast.error("Network connection failed.");
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story from the chronicles?")) return;
    
    try {
      const response = await fetch(getApiUrl(`blogs/${id}`), {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Story removed.");
        fetchData();
      } else {
        toast.error("Failed to remove story.");
      }
    } catch (error) {
      toast.error("Delete operation failed.");
    }
  };

  const handleDeleteVoice = async (id: string) => {
    if (!confirm("Are you sure you want to burn this editorial authority?")) return;
    
    try {
      const response = await fetch(getApiUrl(`blogs/editorial-voices/${id}`), {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Voice removed.");
        fetchData();
      } else {
        toast.error("Failed to remove voice.");
      }
    } catch (error) {
      toast.error("Delete operation failed.");
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVoices = voices.filter(voice => 
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.quote.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !settings) {
    return <div className="py-10 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Opening The Journal...</div>;
  }

  return (
    <div className="space-y-2 pb-4">
      <AdminHeader
        title="Journal"
        highlightedWord="Concierge"
        subtitle="Editorial authority and chronicled narratives"
        isDark={isDark}
        action={{
          label: activeTab === "posts" ? "Compose Story" : "Archive Voice",
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
            Story Chronicles
          </button>
          <button 
            onClick={() => setActiveTab("voices")}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "voices" ? "bg-gold text-charcoal" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Editorial Authority
          </button>
        </div>
      </AdminHeader>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Sidebar Settings - Static in both tabs for branding */}
        <div className="xl:col-span-1 space-y-4">
          <div className={`p-4 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
             <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-3 text-gold">
               <Sparkles size={20} /> Editorial Branding
             </h3>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Badge</label>
                   <input 
                     value={settings.heroBadge}
                     onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hero Title</label>
                   <input 
                     value={settings.heroTitle}
                     onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Finale Title</label>
                   <input 
                     value={settings.finaleTitle}
                     onChange={(e) => setSettings({ ...settings, finaleTitle: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Finale Subtitle</label>
                   <input 
                     value={settings.finaleSubtitle}
                     onChange={(e) => setSettings({ ...settings, finaleSubtitle: e.target.value })}
                     className="w-full p-4 rounded-xl border bg-transparent text-sm font-bold"
                   />
                </div>
                
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSettingsSaving}
                  className="w-full flex items-center justify-center gap-3 bg-gold/10 hover:bg-gold text-gold hover:text-charcoal py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isSettingsSaving ? "Saving..." : "Update Brand Finale"}
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
                placeholder={activeTab === "posts" ? "Search chronicles by title or author..." : "Search editorial authorities..."}
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
                    <div className="py-20 text-center opacity-30 italic">No stories match your current search ritual...</div>
                  )}
               </motion.div>
             ) : (
               <motion.div 
                 key="voices"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="grid gap-6 min-h-[600px]"
               >
                  {filteredVoices.map((voice) => (
                    <div key={voice._id || voice.id} className={`group p-6 rounded-[2.5rem] border transition-all hover:scale-[1.01] ${isDark ? "bg-white/5 border-white/10 hover:border-gold/30" : "bg-white border-charcoal/10 shadow-lg hover:border-gold/50"}`}>
                       <div className="flex flex-col lg:flex-row gap-8 items-center">
                          <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-2 border-gold/20 shadow-xl relative">
                             <img src={getAssetUrl(voice.image)} alt={voice.name} className="w-full h-full object-cover" />
                             {voice.isActive && (
                               <div className="absolute -bottom-1 -right-1 bg-gold text-charcoal p-1 rounded-full border-2 border-[#121212]">
                                 <CheckCircle2 size={14} />
                               </div>
                             )}
                          </div>
                          
                          <div className="flex-1 space-y-4">
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-gold/10 text-gold rounded-full border border-gold/20">{voice.badge}</span>
                                {voice.isActive && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Currently Illuminating</span>}
                             </div>
                             <h4 className="font-display text-4xl font-bold italic">{voice.name}</h4>
                             <div className="relative">
                               <Quote className="absolute -left-6 -top-2 opacity-10 text-gold" size={32} />
                               <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">"{voice.quote}"</p>
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
                  ))}
                  {filteredVoices.length === 0 && (
                    <div className="py-20 text-center opacity-30 italic">No editorial authorities archived in the sanctum...</div>
                  )}
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
