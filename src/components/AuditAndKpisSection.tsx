import React, { useState } from 'react';
import { ComplianceAndKPIs, AuditChecklistItem } from '../types';
import { 
  ClipboardCheck, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  BarChart3, 
  Sparkles,
  Download,
  RotateCcw
} from 'lucide-react';

interface AuditAndKpisSectionProps {
  data: ComplianceAndKPIs;
  policyTitle?: string;
}

export const AuditAndKpisSection: React.FC<AuditAndKpisSectionProps> = ({ data, policyTitle = 'السياسة' }) => {
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>(() =>
    (data.auditChecklist || []).map((item) => ({
      ...item,
      status: item.status || 'untested',
    }))
  );

  const [activeTab, setActiveTab] = useState<'checklist' | 'kpis' | 'gaps'>('checklist');

  const updateItemStatus = (id: string, status: 'compliant' | 'partial' | 'non_compliant') => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const resetAudit = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, status: 'untested' })));
  };

  // Calculations
  const totalItems = checklist.length;
  const compliantCount = checklist.filter((i) => i.status === 'compliant').length;
  const partialCount = checklist.filter((i) => i.status === 'partial').length;
  const nonCompliantCount = checklist.filter((i) => i.status === 'non_compliant').length;
  const testedCount = compliantCount + partialCount + nonCompliantCount;

  // Score: compliant = 100%, partial = 50%, non_compliant = 0%
  const score =
    testedCount > 0
      ? Math.round(((compliantCount * 1 + partialCount * 0.5) / testedCount) * 100)
      : 100;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-blue-800 border-r-4 border-blue-800 pr-2 uppercase tracking-wide">
            7. معايير التقييم والامتثال والتدقيق والمؤشرات (Compliance & KPIs)
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'checklist' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            قائمة التدقيق الميداني ({totalItems})
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'kpis' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مؤشرات الأداء KPIs ({data.kpis?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'gaps' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            توصيات الاعتماد ({data.gapAnalysisAndRecommendations?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Audit Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Audit Score Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center sm:text-right border-l sm:border-l-0 sm:border-r border-slate-200 pl-2 sm:pr-3">
              <span className="text-2xs text-slate-500 block">نسبة المطابقة الحالية</span>
              <span className={`text-xl font-bold font-mono ${score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                {score}%
              </span>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-2xs text-slate-500 block">مطابق تماماً</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">{compliantCount} / {totalItems}</span>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-2xs text-slate-500 block">مطابق جزئياً</span>
              <span className="text-lg font-bold text-amber-700 font-mono">{partialCount}</span>
            </div>
            <div className="text-center sm:text-right flex items-center justify-between">
              <div>
                <span className="text-2xs text-slate-500 block">غير مطابق</span>
                <span className="text-lg font-bold text-rose-700 font-mono">{nonCompliantCount}</span>
              </div>
              <button
                onClick={resetAudit}
                title="إعادة ضبط التدقيق"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {checklist.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-2.5 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-2xs font-mono font-bold border border-blue-200">
                        {item.standardReference}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-2xs">
                        الدورية: {item.frequency || 'شهرياً'}
                      </span>
                    </div>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                      {item.checkpoint}
                    </h4>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => updateItemStatus(item.id, 'compliant')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        item.status === 'compliant'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مطابق</span>
                    </button>
                    <button
                      onClick={() => updateItemStatus(item.id, 'partial')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        item.status === 'partial'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>جزئي</span>
                    </button>
                    <button
                      onClick={() => updateItemStatus(item.id, 'non_compliant')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        item.status === 'non_compliant'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>غير مطابق</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Required */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                  <span className="font-semibold text-slate-700 shrink-0">أدلة الإثبات والتوثيق المطلوبة:</span>
                  <span className="text-slate-600">{item.evidenceRequired}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: KPIs */}
      {activeTab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.kpis?.map((kpi, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-snug">{kpi.name}</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white text-xs font-mono font-bold shrink-0">
                  المستهدف: {kpi.target}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-800 shrink-0">طريقة الحساب / المعادلة:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 text-2xs leading-relaxed">
                    {kpi.formula}
                  </span>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
                  <span>دورية القياس: <strong>{kpi.frequency}</strong></span>
                  {kpi.responsiblePerson && (
                    <span>المسؤول: <strong>{kpi.responsiblePerson}</strong></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Gaps & Recommendations */}
      {activeTab === 'gaps' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>توصيات الاستعداد لزيارات الاعتماد الصحي (CBAHI / JCI Surveys):</span>
            </div>
            <p className="text-slate-700">
              خطوات تصحيحية وإجرائية مقترحة لسد ثغرات الامتثال وضمان الجاهزية الكاملة للتدقيق الخارجي.
            </p>
          </div>

          <div className="space-y-2">
            {data.gapAnalysisAndRecommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-2xs"
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
