import React from "react";
import { Globe, Type, AlignLeft, Hash } from "lucide-react";

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
}

interface SEOFormProps {
  seo: SEOData;
  onChange: (seo: SEOData) => void;
  isDark: boolean;
}

const SEOForm: React.FC<SEOFormProps> = ({ seo, onChange, isDark }) => {
  const inputClass = `w-full px-6 py-4 rounded-2xl border-2 font-body text-sm font-semibold outline-none transition-all duration-300 ${
    isDark
      ? "bg-white/5 border-white/10 text-white focus:border-gold focus:bg-white/10 placeholder:text-white/20"
      : "bg-charcoal/5 border-charcoal/10 text-charcoal focus:border-gold focus:bg-white placeholder:text-charcoal/30"
  }`;

  const labelClass = `text-[11px] font-extrabold uppercase tracking-[0.3em] flex items-center gap-2 ${
    isDark ? "text-slate-400" : "text-gold"
  }`;

  return (
    <div className="space-y-8 mt-10 pt-10 border-t border-gold/10">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shadow-lg">
          <Globe size={20} />
        </div>
        <div>
          <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-white" : "text-charcoal"}`}>
            Search Engine Optimization
          </h4>
          <p className={`text-[10px] font-bold ${isDark ? "text-white/40" : "text-charcoal/60"}`}>
            Manage how this page appears in search results.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>
            <Type size={12} /> Meta Title
          </label>
          <input
            type="text"
            value={seo?.title || ""}
            onChange={(e) => onChange({ ...seo, title: e.target.value })}
            className={inputClass}
            placeholder="Browser tab title..."
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            <AlignLeft size={12} /> Meta Description
          </label>
          <textarea
            value={seo?.description || ""}
            onChange={(e) => onChange({ ...seo, description: e.target.value })}
            className={`${inputClass} min-h-[100px] resize-none h-32`}
            placeholder="Brief summary for search engines..."
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            <Hash size={12} /> Keywords (Comma Separated)
          </label>
          <input
            type="text"
            value={seo?.keywords || ""}
            onChange={(e) => onChange({ ...seo, keywords: e.target.value })}
            className={inputClass}
            placeholder="beauty, skincare, rituals..."
          />
        </div>
      </div>
    </div>
  );
};

export default SEOForm;
