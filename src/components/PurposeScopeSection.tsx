import React from 'react';
import { PurposeAndScope } from '../types';
import { Target, CheckCircle2, AlertOctagon, Sparkles } from 'lucide-react';

interface PurposeScopeSectionProps {
  data: PurposeAndScope;
}

export const PurposeScopeSection: React.FC<PurposeScopeSectionProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-blue-800 border-r-4 border-blue-800 pr-2 uppercase tracking-wide">
          2. الهدف الأساسي ونطاق التطبيق (Purpose & Scope)
        </h2>
        <span className="text-xs text-slate-500 hidden sm:inline">
          الغايات الإكلينيكية والتنظيمية والمجالات المستهدفة
        </span>
      </div>

      {/* Main Objective & Clinical Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span>الهدف الأساسي للسياسة (Main Objective):</span>
          </div>
          <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
            {data.mainObjective}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Target className="w-4 h-4 text-slate-600" />
            <span>المبرر الإكلينيكي والتنظيمي (Clinical & Regulatory Rationale):</span>
          </div>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
            {data.clinicalRationale}
          </p>
        </div>
      </div>

      {/* Scope and Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Scope list */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>نطاق التطبيق والمستهدفون (Scope of Application):</span>
          </h4>
          <ul className="space-y-1.5">
            {data.scope.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        {data.exclusions && data.exclusions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>الاستثناءات والحدود (Exclusions & Limitations):</span>
            </h4>
            <ul className="space-y-1.5">
              {data.exclusions.map((exc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/80">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{exc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
