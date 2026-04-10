import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  ChevronRight,
  Shield,
  FileText,
  X,
  Globe,
  Loader2,
  Search,
  Save,
  RefreshCcw,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  Sparkles,
  Type,
  Hash,
  Edit3,
} from "lucide-react";
import DynamicIcon from "../../components/DynamicIcon.tsx";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

// ── Icon library ────────────────────────────────────────────────────────────
const ICON_LIBRARY = [
  "Shield", "ShieldCheck", "ShieldAlert", "ShieldOff", "Lock", "Unlock", "Key",
  "FileText", "FileCheck", "FileSearch", "FileLock", "FileWarning",
  "Globe", "Globe2", "Network", "Eye", "EyeOff",
  "User", "UserCheck", "UserPlus", "UserMinus", "Users", "UserCog",
  "Award", "BadgeCheck", "Medal", "Sparkles", "Zap", "Flame", "Droplets", "Sun", "Moon",
  "RefreshCcw", "RefreshCw", "RotateCcw", "History", "Clock", "Hourglass",
  "Check", "CheckCircle", "CheckCircle2", "CheckSquare",
  "X", "XCircle", "XSquare", "AlertCircle", "AlertTriangle", "Info", "HelpCircle",
  "Truck", "Package", "PackageCheck", "PackageX", "Box", "Archive",
  "Mail", "MessageCircle", "MessageSquare", "Phone", "Inbox",
  "CreditCard", "Wallet", "Banknote", "Receipt", "ShoppingCart", "Tag", "Gift",
  "Heart", "Star", "Activity", "BarChart", "LineChart", "PieChart",
  "Database", "Cloud", "CloudUpload", "CloudDownload",
  "Settings", "Sliders", "Filter", "Search", "Maximize", "Minimize",
  "ExternalLink", "Link", "Paperclip", "Bookmark", "Flag",
  "Camera", "Image", "Video", "Mic", "Music",
  "Layout", "Grid", "Layers", "Fingerprint", "ScrollText", "Scroll",
  "Scale", "BookOpen", "Book", "Newspaper", "ClipboardList", "Clipboard",
  "Calendar", "CalendarCheck", "MapPin", "Navigation", "Compass",
];

// ── Types ────────────────────────────────────────────────────────────────────
type PolicyInsight = { icon: string; title: string; description: string };
type PolicySection = { id: string; icon?: string; title: string; content: string };
type Policy = {
  type: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  heroIcon?: string;
  insights: PolicyInsight[];
  sections: PolicySection[];
};

// ── Icon Picker ──────────────────────────────────────────────────────────────
const IconPicker = ({
  isOpen,
  onClose,
  onSelect,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: string) => void;
  isDark: boolean;
}) => {
  const [q, setQ] = useState("");
  const filtered = ICON_LIBRARY.filter((i) => i.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (isOpen) setQ("");
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative w-full max-w-xl max-h-[80vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
              isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-charcoal/10"
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between gap-4 ${
              isDark ? "border-white/6" : "border-charcoal/6"
            }`}>
              <div>
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-charcoal"}`}>
                  Choose an Icon
                </h3>
                <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? "text-white/30" : "text-charcoal/40"}`}>
                  {filtered.length} icons available
                </p>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/40" : "hover:bg-charcoal/8 text-charcoal/40"}`}>
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className={`px-6 py-3 border-b ${isDark ? "border-white/5" : "border-charcoal/5"}`}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                <input
                  autoFocus
                  placeholder="Search icons…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className={`w-full py-2.5 pl-9 pr-4 rounded-xl text-sm font-medium outline-none border transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/8 text-white placeholder:text-white/20 focus:border-gold/40"
                      : "bg-charcoal/5 border-charcoal/8 text-charcoal placeholder:text-charcoal/30 focus:border-gold/50"
                  }`}
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {filtered.map((icon) => (
                  <button
                    key={icon}
                    title={icon}
                    onClick={() => { onSelect(icon); onClose(); }}
                    className={`group flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${
                      isDark
                        ? "hover:bg-gold/15 text-white/40 hover:text-gold"
                        : "hover:bg-gold/12 text-charcoal/40 hover:text-gold"
                    }`}
                  >
                    <DynamicIcon name={icon} size={20} />
                    <span className="text-[8px] font-semibold opacity-0 group-hover:opacity-70 truncate w-full text-center leading-none">
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Icon Button ──────────────────────────────────────────────────────────────
const IconButton = ({
  iconName,
  onClick,
  size = 18,
  isDark,
}: {
  iconName: string;
  onClick: () => void;
  size?: number;
  isDark: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={`Current: ${iconName}. Click to change.`}
    className={`group relative flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
      isDark
        ? "bg-gold/10 border-gold/20 text-gold hover:bg-gold hover:text-charcoal hover:border-gold"
        : "bg-gold/10 border-gold/20 text-gold hover:bg-gold hover:text-white hover:border-gold"
    }`}
  >
    <DynamicIcon name={iconName || "Shield"} size={size} />
    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gold rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <Edit3 size={7} className="text-white" />
    </span>
  </button>
);

// ── Field Label ──────────────────────────────────────────────────────────────
const Label = ({ children, isDark }: { children: React.ReactNode; isDark: boolean }) => (
  <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 ${isDark ? "text-white/30" : "text-charcoal/35"}`}>
    {children}
  </p>
);

const inputCls = (isDark: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/8 text-white focus:border-gold/50 placeholder:text-white/20"
      : "bg-charcoal/4 border-charcoal/8 text-charcoal focus:border-gold/50 placeholder:text-charcoal/25"
  }`;

const cardCls = (isDark: boolean) =>
  `rounded-2xl border p-6 space-y-5 ${isDark ? "bg-white/4 border-white/8" : "bg-white border-charcoal/8 shadow-sm"}`;

// ── Main Component ────────────────────────────────────────────────────────────
const PoliciesAdmin = () => {
  const { isDark } = useAdminTheme();
  const [policies, setPolicies] = useState<Pick<Policy, "type" | "title">[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Icon picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCallback, setPickerCallback] = useState<(icon: string) => void>(() => () => {});

  // Create modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (newTitle) {
      setNewSlug(
        newTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-")
      );
    }
  }, [newTitle]);

  const openPicker = (cb: (icon: string) => void) => {
    setPickerCallback(() => cb);
    setPickerOpen(true);
  };

  // ── API ────────────────────────────────────────────────────────────────────
  const fetchList = async () => {
    try {
      const res = await fetch(getApiUrl("/api/policies/"));
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
        if (data.length > 0 && !selectedType) setSelectedType(data[0].type);
      }
    } catch {
      toast.error("Could not reach the policy database.");
    }
  };

  const fetchDetail = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/policies/${type}`));
      if (res.ok) setPolicy(await res.json());
      else toast.error("Policy not found.");
    } catch {
      toast.error("Failed to load policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);
  useEffect(() => { if (selectedType) fetchDetail(selectedType); }, [selectedType]);

  const handleSave = async () => {
    if (!policy) return;
    setIsSaving(true);
    try {
      const res = await fetch(getApiUrl(`/api/policies/${selectedType}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        toast.success(`"${policy.title}" saved.`);
        fetchList();
      } else {
        toast.error("Save failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle || !newSlug) { toast.error("Title and slug are required."); return; }
    const slug = newSlug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const body = {
      type: slug,
      title: newTitle,
      subtitle: "Ensuring clarity and trust for our valued users.",
      lastUpdated: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      heroIcon: "Shield",
      insights: [{ icon: "Shield", title: "Protection", description: "Add your key highlight here." }],
      sections: [{ id: "introduction", icon: "FileText", title: "Introduction", content: "<p>Write your policy content here...</p>" }],
    };
    try {
      const res = await fetch(getApiUrl(`/api/policies/${slug}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Policy created!");
        setIsCreating(false);
        setNewTitle(""); setNewSlug("");
        await fetchList();
        setSelectedType(slug);
      } else {
        toast.error("Creation failed.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleDelete = async () => {
    if (!policy) return;
    if (!confirm(`Delete "${policy.title}" permanently?`)) return;
    try {
      const res = await fetch(getApiUrl(`/api/policies/${selectedType}`), { method: "DELETE" });
      if (res.ok) {
        toast.success("Policy deleted.");
        const remaining = policies.filter((p) => p.type !== selectedType);
        setPolicies(remaining);
        if (remaining.length > 0) setSelectedType(remaining[0].type);
        else { setPolicy(null); setSelectedType(""); }
      } else {
        toast.error("Delete failed.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <AdminHeader
        title="Policy"
        highlightedWord="Manager"
        subtitle="CRUD control over all legal and compliance pages."
        isDark={isDark}
        actions={[
          {
            label: "Delete Policy",
            onClick: handleDelete,
            icon: Trash2,
            variant: "danger",
          },
          {
            label: isSaving ? "Saving…" : "Save Changes",
            onClick: handleSave,
            icon: isSaving ? RefreshCcw : CheckCircle2,
            disabled: isSaving || !policy,
            variant: "primary",
          },
        ]}
      >
        {/* Policy selector row */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`pr-10 pl-4 py-2.5 rounded-xl border text-xs font-bold outline-none appearance-none cursor-pointer transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-charcoal/10 text-charcoal"
              }`}
            >
              {policies.map((p) => (
                <option key={p.type} value={p.type} className={isDark ? "bg-[#1a1a1a]" : "bg-white"}>
                  {p.title}
                </option>
              ))}
            </select>
            <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gold pointer-events-none" />
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold/25 bg-gold/8 text-gold text-[10px] font-bold uppercase tracking-widest hover:bg-gold/15 transition-all"
          >
            <PlusCircle size={13} />
            New Policy
          </button>
        </div>
      </AdminHeader>

      {/* Loading */}
      {loading && !policy && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gold" />
        </div>
      )}

      {/* Main Editor */}
      {policy && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* 1. TITLE CRUD Card */}
            <div className={cardCls(isDark)}>
              <div className="flex items-center gap-2.5 mb-1">
                <Type size={15} className="text-gold flex-shrink-0" />
                <h3 className={`text-xs font-black uppercase tracking-[0.25em] ${isDark ? "text-white/70" : "text-charcoal/70"}`}>
                  Title & Identity
                </h3>
              </div>

              {/* Title row */}
              <div>
                <Label isDark={isDark}>Policy Title</Label>
                <div className="flex items-center gap-3">
                  <IconButton
                    iconName={policy.heroIcon || "Shield"}
                    onClick={() => openPicker((icon) => setPolicy({ ...policy, heroIcon: icon }))}
                    size={18}
                    isDark={isDark}
                  />
                  <input
                    value={policy.title}
                    onChange={(e) => setPolicy({ ...policy, title: e.target.value })}
                    placeholder="Policy Display Title"
                    className={`${inputCls(isDark)} flex-1 font-bold text-base`}
                  />
                </div>
                <p className={`text-[10px] mt-1.5 ml-1 ${isDark ? "text-white/25" : "text-charcoal/30"}`}>
                  Click the icon to change it. The title appears in the page heading.
                </p>
              </div>

              {/* Slug (read-only) */}
              <div>
                <Label isDark={isDark}>URL Slug (Read-only)</Label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border font-mono text-xs bg-transparent border-dashed border-gold/20 text-gold">
                  <Hash size={12} className="text-gold/50 flex-shrink-0" />
                  /policies/{policy.type}
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <Label isDark={isDark}>Subtitle / Tagline</Label>
                <textarea
                  value={policy.subtitle}
                  onChange={(e) => setPolicy({ ...policy, subtitle: e.target.value })}
                  rows={2}
                  className={`${inputCls(isDark)} resize-none`}
                  placeholder="Brief description shown below the title…"
                />
              </div>

              {/* Last Updated */}
              <div>
                <Label isDark={isDark}>Last Updated</Label>
                <input
                  value={policy.lastUpdated}
                  onChange={(e) => setPolicy({ ...policy, lastUpdated: e.target.value })}
                  className={inputCls(isDark)}
                  placeholder="e.g. April 6, 2026"
                />
              </div>
            </div>

            {/* 2. Quick Highlights (Insights) */}
            <div className={cardCls(isDark)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-gold flex-shrink-0" />
                  <h3 className={`text-xs font-black uppercase tracking-[0.25em] ${isDark ? "text-white/70" : "text-charcoal/70"}`}>
                    Quick Highlights
                  </h3>
                </div>
                <button
                  onClick={() =>
                    setPolicy({
                      ...policy,
                      insights: [...policy.insights, { icon: "Shield", title: "New Highlight", description: "Description…" }],
                    })
                  }
                  className="flex items-center gap-1.5 text-[10px] font-bold text-gold hover:text-gold/70 transition-colors uppercase tracking-widest"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              <div className="space-y-3 mt-1">
                {policy.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`relative group flex items-start gap-3 p-4 rounded-xl border transition-all ${
                      isDark ? "bg-white/3 border-white/6 hover:border-white/12" : "bg-charcoal/3 border-charcoal/6 hover:border-charcoal/12"
                    }`}
                  >
                    {/* Icon */}
                    <IconButton
                      iconName={insight.icon}
                      onClick={() =>
                        openPicker((icon) => {
                          const updated = [...policy.insights];
                          updated[idx] = { ...updated[idx], icon };
                          setPolicy({ ...policy, insights: updated });
                        })
                      }
                      isDark={isDark}
                    />

                    {/* Fields */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        value={insight.title}
                        onChange={(e) => {
                          const updated = [...policy.insights];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setPolicy({ ...policy, insights: updated });
                        }}
                        placeholder="Highlight Title"
                        className={`w-full px-3 py-1.5 rounded-lg border text-sm font-bold outline-none transition-all ${
                          isDark
                            ? "bg-white/5 border-white/8 text-white focus:border-gold/40"
                            : "bg-white border-charcoal/8 text-charcoal focus:border-gold/40"
                        }`}
                      />
                      <textarea
                        value={insight.description}
                        onChange={(e) => {
                          const updated = [...policy.insights];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setPolicy({ ...policy, insights: updated });
                        }}
                        placeholder="Short description…"
                        rows={2}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs font-medium outline-none resize-none transition-all ${
                          isDark
                            ? "bg-white/5 border-white/8 text-white/70 focus:border-gold/40"
                            : "bg-white border-charcoal/8 text-charcoal/70 focus:border-gold/40"
                        }`}
                      />
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        const updated = policy.insights.filter((_, i) => i !== idx);
                        setPolicy({ ...policy, insights: updated });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-500 mt-0.5 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Sections ──────────────────────────────────────── */}
          <div className={cardCls(isDark)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={15} className="text-gold flex-shrink-0" />
                <h3 className={`text-xs font-black uppercase tracking-[0.25em] ${isDark ? "text-white/70" : "text-charcoal/70"}`}>
                  Content Sections
                </h3>
              </div>
              <button
                onClick={() => {
                  const newId = `section_${Date.now()}`;
                  setPolicy({
                    ...policy,
                    sections: [
                      ...policy.sections,
                      { id: newId, icon: "FileText", title: "New Section", content: "<p>Write content here…</p>" },
                    ],
                  });
                  setExpandedSection(newId);
                }}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gold hover:text-gold/70 transition-colors uppercase tracking-widest"
              >
                <Plus size={12} /> Add Section
              </button>
            </div>

            <div className="space-y-2 mt-1">
              {policy.sections.map((section, sIdx) => {
                const isExpanded = expandedSection === section.id;
                return (
                  <div
                    key={section.id}
                    className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? isDark ? "border-gold/25 bg-white/4" : "border-gold/25 bg-gold/3"
                        : isDark ? "border-white/6 hover:border-white/12" : "border-charcoal/6 hover:border-charcoal/12"
                    }`}
                  >
                    {/* Section header row */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    >
                      {/* Section icon (click to change) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openPicker((icon) => {
                            const updated = [...policy.sections];
                            updated[sIdx] = { ...updated[sIdx], icon };
                            setPolicy({ ...policy, sections: updated });
                          });
                        }}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer hover:bg-gold hover:text-charcoal hover:border-gold ${
                          isDark ? "bg-white/5 border-white/8 text-gold/70" : "bg-charcoal/5 border-charcoal/8 text-gold"
                        }`}
                        title="Click to change icon"
                      >
                        <DynamicIcon name={section.icon || "FileText"} size={14} />
                      </div>

                      {/* Title inline edit */}
                      <input
                        value={section.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const updated = [...policy.sections];
                          updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                          setPolicy({ ...policy, sections: updated });
                        }}
                        className={`flex-1 bg-transparent border-none outline-none text-sm font-bold min-w-0 ${
                          isDark ? "text-white placeholder:text-white/20" : "text-charcoal placeholder:text-charcoal/25"
                        }`}
                        placeholder="Section Title"
                      />

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ChevronRight
                          size={14}
                          className={`text-gold/40 transition-transform duration-300 ${isExpanded ? "rotate-90 text-gold" : ""}`}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPolicy({ ...policy, sections: policy.sections.filter((_, i) => i !== sIdx) });
                          }}
                          className="text-transparent group-hover:text-rose-400 hover:text-rose-400 transition-colors"
                          title="Delete section"
                        >
                          <Trash2 size={13} className="text-rose-400/40 hover:text-rose-400" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className={`px-4 pb-4 space-y-3 border-t ${isDark ? "border-white/5" : "border-charcoal/5"}`}>
                            {/* Anchor ID */}
                            <div className="pt-3">
                              <Label isDark={isDark}>Section Anchor ID</Label>
                              <input
                                value={section.id}
                                onChange={(e) => {
                                  const newId = e.target.value.toLowerCase().replace(/\s+/g, "-");
                                  const updated = [...policy.sections];
                                  updated[sIdx] = { ...updated[sIdx], id: newId };
                                  setPolicy({ ...policy, sections: updated });
                                  setExpandedSection(newId);
                                }}
                                className="w-full px-3 py-2 rounded-lg border font-mono text-xs text-gold outline-none transition-all bg-transparent border-dashed border-gold/20 focus:border-gold/40"
                              />
                            </div>
                            {/* Content */}
                            <div>
                              <Label isDark={isDark}>Content (HTML supported)</Label>
                              <textarea
                                value={section.content}
                                onChange={(e) => {
                                  const updated = [...policy.sections];
                                  updated[sIdx] = { ...updated[sIdx], content: e.target.value };
                                  setPolicy({ ...policy, sections: updated });
                                }}
                                rows={8}
                                className={`w-full px-4 py-3 rounded-xl border text-sm leading-relaxed font-medium outline-none resize-y transition-all ${
                                  isDark
                                    ? "bg-white/4 border-white/8 text-white/80 focus:border-gold/40 placeholder:text-white/20"
                                    : "bg-charcoal/3 border-charcoal/8 text-charcoal/80 focus:border-gold/40 placeholder:text-charcoal/25"
                                }`}
                                placeholder="<p>Your policy content here...</p>"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {policy.sections.length === 0 && (
                <div className={`flex flex-col items-center justify-center py-10 rounded-xl border border-dashed ${
                  isDark ? "border-white/8 text-white/25" : "border-charcoal/10 text-charcoal/30"
                }`}>
                  <FileText size={24} className="mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No sections yet. Add one above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Policy Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
                isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-charcoal/10"
              }`}
            >
              <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? "border-white/6" : "border-charcoal/6"}`}>
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-charcoal"}`}>
                  Create New <span className="text-gold">Policy</span>
                </h3>
                <button onClick={() => setIsCreating(false)} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/8 text-white/40" : "hover:bg-charcoal/8 text-charcoal/40"}`}>
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <Label isDark={isDark}>Policy Title</Label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Loyalty Program Policy"
                    className={inputCls(isDark)}
                    autoFocus
                  />
                </div>

                <div>
                  <Label isDark={isDark}>URL Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Hash size={13} className="text-gold/50" />
                    </span>
                    <input
                      value={newSlug}
                      onChange={(e) =>
                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                      }
                      placeholder="loyalty-program"
                      className={`${inputCls(isDark)} pl-9 font-mono text-gold`}
                    />
                  </div>
                </div>

                {newSlug && (
                  <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
                    isDark ? "bg-gold/8 border-gold/20" : "bg-gold/8 border-gold/20"
                  }`}>
                    <AlertTriangle size={13} className="text-gold mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-gold font-semibold leading-relaxed">
                      Creates a live page at{" "}
                      <span className="font-mono font-bold">/policies/{newSlug}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setIsCreating(false)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border uppercase tracking-widest transition-all ${
                      isDark ? "border-white/10 text-white/40 hover:bg-white/5" : "border-charcoal/10 text-charcoal/50 hover:bg-charcoal/5"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 py-3 rounded-xl text-xs font-bold bg-gold text-white hover:bg-gold/85 transition-all uppercase tracking-widest"
                  >
                    Create Policy
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Global Icon Picker ──────────────────────────────────────────────── */}
      <IconPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(icon) => pickerCallback(icon)}
        isDark={isDark}
      />
    </div>
  );
};

export default PoliciesAdmin;
