import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  GripVertical, 
  Save, 
  X, 
  Sparkles, 
  Tag, 
  Layout, 
  ListTree,
  AlertCircle,
  RefreshCw,
  Hash,
  MessageCircle,
  Smile
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const QuizSettings = () => {
  const { isDark } = useAdminTheme();
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/quiz/steps"));
      if (response.ok) {
        const data = await response.json();
        setSteps(data);
      }
    } catch (error) {
      toast.error("Failed to load quiz structure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteps();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This will remove this question and all its options from the quiz.")) return;
    try {
      const response = await fetch(getApiUrl(`/api/quiz/steps/${id}`), { method: "DELETE" });
      if (response.ok) {
        toast.success("Question deleted.");
        fetchSteps();
      }
    } catch (error) {
      toast.error("Failed to delete question.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingStep._id 
        ? getApiUrl(`/api/quiz/steps/${editingStep._id}`) 
        : getApiUrl("/api/quiz/steps");
      
      const response = await fetch(url, {
        method: editingStep._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStep)
      });

      if (response.ok) {
        toast.success("Quiz structure updated.");
        setIsModalOpen(false);
        fetchSteps();
      }
    } catch (error) {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    const newOption = { id: `opt_${Date.now()}`, label: "", sub: "", icon: "✨", recommendedTag: "" };
    setEditingStep({
      ...editingStep,
      options: [...editingStep.options, newOption]
    });
  };

  const removeOption = (optId: string) => {
    setEditingStep({
      ...editingStep,
      options: editingStep.options.filter((o: any) => o.id !== optId)
    });
  };

  const updateOption = (optId: string, field: string, value: string) => {
    setEditingStep({
      ...editingStep,
      options: editingStep.options.map((o: any) => o.id === optId ? { ...o, [field]: value } : o)
    });
  };

  const cardStyle = `backdrop-blur-3xl border rounded-[2.5rem] p-10 transition-all duration-700 ${
    isDark ? "bg-charcoal/40 border-white/5 shadow-black/50" : "bg-white border-gold/5 shadow-charcoal/5"
  }`;

  return (
    <div className="space-y-10 pb-20">
      <AdminHeader 
        title="Quiz"
        highlightedWord="Settings"
        subtitle="Customize the Radiance Ritual questions and recommendation mappings."
        isDark={isDark}
        action={{
          label: "Add Question",
          icon: Plus,
          onClick: () => {
            setEditingStep({ stepId: "", question: "", order: steps.length + 1, options: [] });
            setIsModalOpen(true);
          }
        }}
      />

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw size={40} className="animate-spin text-gold/20 mx-auto" />
          </div>
        ) : steps.length > 0 ? (
          steps.map((step, idx) => (
            <motion.div 
              key={step._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cardStyle}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center font-display font-bold text-xl">
                    {step.order}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{step.question}</h3>
                    <p className={`text-[9px] font-black uppercase tracking-widest opacity-40`}>Internal ID: {step.stepId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setEditingStep(step);
                      setIsModalOpen(true);
                    }}
                    className={`p-3 rounded-xl border transition-all ${isDark ? "border-white/5 hover:bg-white/5" : "border-charcoal/5 hover:bg-charcoal/5"}`}
                  >
                    <Edit2 size={16} className="text-gold" />
                  </button>
                  <button 
                    onClick={() => handleDelete(step._id)}
                    className={`p-3 rounded-xl border transition-all ${isDark ? "border-white/5 hover:bg-rose-500/10 text-rose-500/40 hover:text-rose-500" : "border-charcoal/5 hover:bg-rose-50 text-rose-300"}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {step.options.map((opt: any) => (
                  <div key={opt.id} className={`p-5 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-charcoal/5 border-charcoal/5"}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{opt.icon}</span>
                      <p className="text-xs font-bold uppercase tracking-wider">{opt.label}</p>
                    </div>
                    {opt.recommendedTag && (
                      <div className="flex items-center gap-2 text-[9px] font-black text-gold uppercase tracking-widest">
                        <Tag size={10} /> {opt.recommendedTag}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gold/10 rounded-[3rem]">
            <AlertCircle size={48} className="text-gold/10 mx-auto mb-4" />
            <p className="font-display italic opacity-40">No questions found. Start by adding one above.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-4xl rounded-[3rem] border shadow-2xl overflow-hidden my-auto ${
                isDark ? "bg-[#141414] border-white/10" : "bg-white border-gold/10"
              }`}
            >
              <form onSubmit={handleSave} className="p-10 md:p-14 space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-1">Configuration</p>
                    <h2 className="text-3xl font-display font-bold italic">Edit Question</h2>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isDark ? "border-white/10 hover:bg-white/5" : "border-charcoal/10 hover:bg-charcoal/5"}`}>
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Question Text</label>
                    <div className="relative">
                      <MessageCircle size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" />
                      <input 
                        required
                        value={editingStep.question}
                        onChange={e => setEditingStep({ ...editingStep, question: e.target.value })}
                        className={`w-full py-4 pl-14 pr-6 rounded-2xl border focus:outline-none transition-all ${isDark ? "bg-white/5 border-white/5 text-white" : "bg-white border-charcoal/10"}`}
                        placeholder="e.g. How would you describe your skin?"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Display Order</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" />
                      <input 
                        type="number"
                        required
                        value={editingStep.order}
                        onChange={e => setEditingStep({ ...editingStep, order: parseInt(e.target.value) })}
                        className={`w-full py-4 pl-14 pr-6 rounded-2xl border focus:outline-none transition-all ${isDark ? "bg-white/5 border-white/5 text-white" : "bg-white border-charcoal/10"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-3"><Layout size={18} className="text-gold" /> Options</h3>
                    <button 
                      type="button" 
                      onClick={addOption}
                      className="px-6 py-2.5 bg-gold/10 text-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-all"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                    {editingStep.options.map((opt: any) => (
                      <div key={opt.id} className={`p-6 rounded-[2rem] border grid grid-cols-1 md:grid-cols-12 gap-6 items-center ${isDark ? "bg-white/[0.02] border-white/5" : "bg-charcoal/[0.02] border-charcoal/5"}`}>
                        <div className="md:col-span-1 flex justify-center">
                          <input 
                            value={opt.icon}
                            onChange={e => updateOption(opt.id, "icon", e.target.value)}
                            className="w-10 h-10 text-center bg-transparent border-b border-gold/30 focus:outline-none text-xl"
                            placeholder="✨"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <input 
                            value={opt.label}
                            onChange={e => updateOption(opt.id, "label", e.target.value)}
                            className={`w-full py-3 px-4 rounded-xl border text-xs font-bold focus:outline-none ${isDark ? "bg-white/5 border-white/5" : "bg-white border-charcoal/5"}`}
                            placeholder="Option Label"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <input 
                            value={opt.sub}
                            onChange={e => updateOption(opt.id, "sub", e.target.value)}
                            className={`w-full py-3 px-4 rounded-xl border text-xs italic opacity-60 focus:outline-none ${isDark ? "bg-white/5 border-white/5" : "bg-white border-charcoal/5"}`}
                            placeholder="Subtext (optional)"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <div className="relative">
                            <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                            <input 
                              value={opt.recommendedTag}
                              onChange={e => updateOption(opt.id, "recommendedTag", e.target.value)}
                              className={`w-full py-2.5 pl-9 pr-4 rounded-xl border text-[10px] font-black uppercase tracking-widest focus:outline-none ${isDark ? "bg-white/5 border-white/5" : "bg-white border-charcoal/5"}`}
                              placeholder="TARGET TAG"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button type="button" onClick={() => removeOption(opt.id)} className="text-rose-light hover:scale-110 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 py-4 bg-gold text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {editingStep._id ? "Commit Changes" : "Initialize Question"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-10 py-4 rounded-[1.5rem] border text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? "border-white/10 text-white/40" : "border-charcoal/10 text-charcoal/40"}`}
                  >
                    Discard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizSettings;
