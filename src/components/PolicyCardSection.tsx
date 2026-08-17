import React from 'react';
import { PolicyCard } from '../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Award,
  Layers
} from 'lucide-react';

interface PolicyCardSectionProps {
  card: PolicyCard;
}

export const PolicyCardSection: React.FC<PolicyCardSectionProps> = ({ card }) => {
  const getStandardBadgeColor = (body: string) => {
    const b = body.toUpperCase();
    if (b.includes('CBAHI')) return 'bg-green-50 text-green-700 border-green-200';
    if (b.includes('JCI')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (b.includes('OSHA')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (b.includes('WHO') || b.includes('CDC')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5">
      {/* Header with Title and Code */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-blue-800 border-r-4 border-blue-800 pr-2 uppercase tracking-wide">
              1. بطاقة السياسة والمجال
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              <Layers className="w-3 h-3" />
              {card.domain || 'سياسة رعاية صحية'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              كود: {card.policyCode || 'POL-REF-001'}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {card.titleArabic}
          </h1>
          {card.titleEnglish && (
            <p className="text-xs md:text-sm font-medium text-slate-500 font-sans tracking-wide">
              {card.titleEnglish}
            </p>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-1 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 shrink-0">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            <span>تاريخ السريان: <strong className="text-slate-800 font-semibold">{card.effectiveDate || '2026'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>دورة المراجعة: <strong className="text-slate-800 font-semibold">{card.reviewCycle || 'سنوياً'}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Departments and Aligned Standards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
        {/* Concerned Departments */}
        <div className="md:col-span-5 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>الأقسام والإدارات المعنية بالتطبيق:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {card.departments && card.departments.length > 0 ? (
              card.departments.map((dept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-md border border-slate-200 transition"
                >
                  {dept}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">كافة الأقسام الطبية والتمريضية</span>
            )}
          </div>
        </div>

        {/* Aligned Standards */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>مطابقة المعايير والاعتماد المرجعي (Accreditation):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {card.alignedStandards && card.alignedStandards.length > 0 ? (
              card.alignedStandards.map((std, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${getStandardBadgeColor(
                    std.standardBody
                  )}`}
                >
                  <Award className="w-4 h-4 shrink-0 mt-0.5 opacity-85 text-blue-700" />
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{std.standardBody}</span>
                      {std.clauseNumber && (
                        <span className="text-2xs bg-white/80 px-1.5 py-0.2 rounded font-mono border border-slate-200">
                          {std.clauseNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-2xs leading-relaxed opacity-90 line-clamp-2">
                      {std.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 p-2 border border-dashed rounded-lg">
                معايير مكافحة العدوى والجودة المعتمدة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
