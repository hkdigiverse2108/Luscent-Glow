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
  Clock,
  Eye
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import BlogPostModal from "../../components/Admin/BlogPostModal";

const AdminBlogs = () => {
  const { isDark } = useAdminTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [postsRes, settingsRes] = await Promise.all([
        fetch(getApiUrl("blogs")),
        fetch(getApiUrl("blogs/settings"))
      ]);
      
      if (postsRes.ok) setPosts(await postsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !settings) {
    return <div className="py-20 text-center font-display text-xl animate-pulse text-gold uppercase tracking-[0.3em]">Opening The Journal...</div>;
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gold/10 pb-8">
        <div className="space-y-1">
          <h2 className={`font-display text-4xl font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-charcoal"}`}>
            Journal <span className="text-gold italic">Ledger</span>
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Storytelling & Editorial Governance</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => { setSelectedPost(null); setIsModalOpen(true); }}
             className="flex items-center gap-3 bg-gold hover:bg-gold/80 text-charcoal px-8 py-4 rounded-full font-body font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/20"
           >
             <Plus size={18} />
             <span>Compose Story</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Editorial Settings Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-charcoal/10 shadow-xl"}`}>
             <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3 text-gold">
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
                  className="w-full flex items-center justify-center gap-3 bg-secondary/50 hover:bg-gold text-gold hover:text-primary py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isSettingsSaving ? "Saving..." : "Update Brand Finale"}
                </button>
             </div>
          </div>
        </div>

        {/* Stories Ledger */}
        <div className="xl:col-span-3 space-y-8">
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold/50" size={20} />
              <input 
                type="text"
                placeholder="Search chronicles by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-16 pr-8 py-5 rounded-3xl border transition-all font-body text-sm ${isDark ? "bg-white/5 border-white/10 focus:border-gold/30" : "bg-white border-charcoal/10 focus:border-gold shadow-lg"}`}
              />
           </div>

           <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <div key={post._id || post.id} className={`group p-6 rounded-[2rem] border transition-all hover:scale-[1.01] ${isDark ? "bg-white/5 border-white/10 hover:border-gold/30" : "bg-white border-charcoal/10 shadow-lg hover:border-gold/50"}`}>
                   <div className="flex flex-col lg:flex-row gap-8 items-center">
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
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
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
                           className="p-4 rounded-2xl bg-secondary/50 text-gold hover:bg-gold hover:text-primary transition-all"
                         >
                           <Edit2 size={18} />
                         </button>
                         <button 
                           onClick={() => handleDeletePost(post._id || post.id)}
                           className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                         >
                           <Trash2 size={18} />
                         </button>
                         <a 
                           href={`/blogs/${post.id || post._id}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-4 rounded-2xl bg-secondary/50 text-gold/50 hover:text-gold transition-all"
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
           </div>
        </div>
      </div>

      <BlogPostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminBlogs;
