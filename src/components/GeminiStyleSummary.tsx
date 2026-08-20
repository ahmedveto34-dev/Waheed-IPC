import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Copy, 
  CheckCircle2, 
  Printer, 
  FileDown,
  Loader2,
  FileText,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Users,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  GitBranch,
  BookOpen,
  Target,
  CheckSquare,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { PolicyAnalysisResult } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { MermaidViewer } from './MermaidViewer';

interface GeminiStyleSummaryProps {
  data: PolicyAnalysisResult;
  onSwitchToA4?: () => void;
  onReset?: () => void;
}

export function GeminiStyleSummary({ data, onReset }: GeminiStyleSummaryProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'document' | 'flowchart'>('visual');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [activeSopPhase, setActiveSopPhase] = useState<'all' | 'pre' | 'exec' | 'post'>('all');
  const printContainerRef = useRef<HTMLDivElement>(null);

  const card = data.policyCard || ({} as any);
  const purpose = data.purposeAndScope || ({} as any);
  const safety = (data.safetyWarningsAndCriticalSteps || {}) as any;
  const sop = data.sopPhases || { preProcedure: [], execution: [], postProcedure: [] };
  const roles = data.rolesAndResponsibilities || [];
  const definitions = data.scientificDefinitions || [];
  const compliance = data.complianceAndKPIs || { auditChecklist: [], kpis: [], gapAnalysisAndRecommendations: [] };

  const dontsList: string[] = safety.donts || safety.strictProhibitionsDonts || [];
  const dosList: string[] = safety.dos || safety.mandatoryDos || [];
  const ccpList: string[] = safety.criticalControlPoints || [];

  // Generate clean unified markdown content if markdownSummary is not directly provided
  const formattedContent = useMemo(() => {
    if (data.markdownSummary && data.markdownSummary.trim().length > 0) {
      return data.markdownSummary;
    }

    // Build standard clean markdown summary from structured attributes
    let md = `# ${card.titleArabic || 'ملخص وثيقة السياسة والإجراءات'}\n\n`;
    if (card.titleEnglish) {
      md += `*${card.titleEnglish}*\n\n`;
    }
    md += `**كود السياسة:** \`${card.policyCode || 'POL-001'}\` | **المجال:** ${card.domain || 'السياسات الإكلينيكية والتشغيلية'}\n\n---\n\n`;

    if (data.executiveSummarySnippet) {
      md += `## 1. الملخص التنفيذي والنقاط الجوهرية\n\n${data.executiveSummarySnippet}\n\n`;
    }

    if (purpose.mainObjective) {
      md += `## 2. الغرض ونطاق التطبيق\n\n- **الهدف الأساسي:** ${purpose.mainObjective}\n`;
      if (purpose.clinicalRationale) {
        md += `- **المبرر الإكلينيكي والجودة:** ${purpose.clinicalRationale}\n`;
      }
      if (purpose.scope?.length) {
        md += `- **نطاق التطبيق:** ${purpose.scope.join('، ')}\n`;
      }
      md += `\n`;
    }

    if (definitions.length) {
      md += `## 3. التعريفات والمصطلحات الأساسية\n\n`;
      definitions.forEach((def: any) => {
        md += `- **${def.term}:** ${def.definition}\n`;
      });
      md += `\n`;
    }

    if (roles.length) {
      md += `## 4. مصفوفة المسؤوليات وتوزيع الأدوار\n\n`;
      roles.forEach((r: any) => {
        md += `### 🔹 ${r.role}\n`;
        (r.responsibilities || []).forEach((resp: string) => {
          md += `- ${resp}\n`;
        });
        md += `\n`;
      });
    }

    const allSteps = [
      ...(sop.preProcedure || []).map((s: any) => ({ ...s, phase: 'قبل الإجراء' })),
      ...(sop.execution || []).map((s: any) => ({ ...s, phase: 'أثناء التنفيذ' })),
      ...(sop.postProcedure || []).map((s: any) => ({ ...s, phase: 'بعد الإجراء' }))
    ];

    if (allSteps.length) {
      md += `## 5. خطوات العمل القياسية (SOPs)\n\n`;
      allSteps.forEach((step: any, idx: number) => {
        md += `${idx + 1}. **[${step.phase}] ${step.title}:** ${step.details}`;
        if (step.assignedTo) md += ` *(المسؤول: ${step.assignedTo})*`;
        if (step.keySafetyPoint) md += ` ⚠️ **نقطة أمان:** ${step.keySafetyPoint}`;
        md += `\n`;
      });
      md += `\n`;
    }

    if (dontsList.length || dosList.length) {
      md += `## 6. المحظورات الصارمة والخطوط الحمراء (Safety Red Lines)\n\n`;
      if (dosList.length) {
        md += `### ✅ الممارسات الإلزامية:\n`;
        dosList.forEach((doItem: string) => {
          md += `- ${doItem}\n`;
        });
        md += `\n`;
      }
      if (dontsList.length) {
        md += `### ⛔ المحظورات الصارمة:\n`;
        dontsList.forEach((dont: string) => {
          md += `- ${dont}\n`;
        });
        md += `\n`;
      }
    }

    if (compliance.kpis?.length) {
      md += `## 7. مؤشرات الأداء والامتثال (KPIs)\n\n`;
      compliance.kpis.forEach((kpi: any) => {
        const details = [
          kpi.target ? `المستهدف: ${kpi.target}` : '',
          kpi.frequency ? `دورية القياس: ${kpi.frequency}` : '',
          kpi.formula ? `المعادلة: ${kpi.formula}` : ''
        ].filter(Boolean).join(' | ');
        md += `- **${kpi.name}**${details ? ` (${details})` : ''}\n`;
      });
      md += `\n`;
    }

    return md;
  }, [data, card, purpose, definitions, roles, sop, dosList, dontsList, compliance]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectPdfDownload = async () => {
    if (!printContainerRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setExportProgress('جاري تحضير ملف PDF...');

    try {
      const code = card.policyCode || 'Policy';
      const cleanTitle = (card.titleArabic || 'Medical_Policy')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .slice(0, 40);
      const filename = `${code}_${cleanTitle}_Summary.pdf`;

      await exportElementToPdf(printContainerRef.current, {
        filename,
        title: card.titleArabic || 'ملخص السياسة الطبية',
        onProgress: (text) => setExportProgress(text)
      });
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  const textClass = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg'
  }[fontSize];

  return (
    <div className="text-right font-sans space-y-4" dir="rtl">
      
      {/* Top Action & Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {card.titleArabic || 'ملخص وثيقة السياسة والإجراءات'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {card.policyCode && (
                <span className="text-2xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  كود: {card.policyCode}
                </span>
              )}
              {card.domain && (
                <span className="text-2xs text-slate-500 font-medium">
                  {card.domain}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Tools */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Main View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>الملخص المرئي والمنظم</span>
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'document'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>النص الكامل للوثيقة</span>
            </button>
            {data.mermaidFlowchart?.code && (
              <button
                onClick={() => setActiveTab('flowchart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'flowchart'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>المخطط الانسيابي</span>
              </button>
            )}
          </div>

          {/* Font Size Adjuster for text mode */}
          {activeTab === 'document' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${fontSize === 'sm' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                title="حجم خط صغير"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${fontSize === 'base' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                title="حجم خط افتراضي"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${fontSize === 'lg' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                title="حجم خط كبير"
              >
                A+
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
            title="نسخ ملخص السياسة"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الملخص'}</span>
          </button>

          <button
            onClick={handleDirectPdfDownload}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-900 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
            title="تصدير وتحميل كملف PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري التصدير...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>تصدير PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            title="طباعة"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
              title="تحليل وتلخيص سياسة جديدة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>سياسة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Container */}
      <div ref={printContainerRef} className="space-y-6">

        {/* ========================================================================= */}
        {/* VIEW 1: STRUCTURED VISUAL POLICY & INSTRUCTIVE GUIDES (الملخص المرئي والمنظم) */}
        {/* ========================================================================= */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            
            {/* 1. Official Header & Standards Alignment Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                      وثيقة سياسة وإجراءات معتمدة
                    </span>
                    {card.policyCode && (
                      <span className="font-mono text-xs font-bold text-slate-500">
                        كود: {card.policyCode}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {card.titleArabic || 'سياسة الرعاية الطبية والإجراءات التشغيلية'}
                  </h1>
                  {card.titleEnglish && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium font-sans">
                      {card.titleEnglish}
                    </p>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-3xs text-slate-400 block font-bold">المجال / التخصص</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{card.domain || 'الجودة ومكافحة العدوى'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-3xs text-slate-400 block font-bold">تاريخ التفعيل</span>
                    <span className="font-bold text-slate-800">{card.effectiveDate || '2025/2026'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-3xs text-slate-400 block font-bold">دورية المراجعة</span>
                    <span className="font-bold text-slate-800">{card.reviewCycle || 'سنوياً'}</span>
                  </div>
                </div>
              </div>

              {/* Target Departments & Standards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {card.departments && card.departments.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">الأقسام والكوادر المستهدفة:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {card.departments.map((dept: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-2xs font-semibold">
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {card.alignedStandards && card.alignedStandards.length > 0 && (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">معايير الاعتماد المتوافقة:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {card.alignedStandards.map((std: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-bold" title={std.description}>
                            {std.standardBody} {std.clauseNumber ? `(${std.clauseNumber})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Executive Summary & Purpose & Clinical Scope */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Executive Summary Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>الملخص التنفيذي والنقاط الجوهرية (Executive Brief)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                  {data.executiveSummarySnippet || 'تم تلخيص ومطابقة محاور هذه السياسة لتتوافق مع أعلى معايير الجودة وسلامة المرضى والاعتماد الصحي.'}
                </p>
                {purpose.mainObjective && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                    <Target className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">الهدف الاستراتيجي: </span>
                      <span>{purpose.mainObjective}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scope & Applicability Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>نطاق التطبيق والمبرر الإكلينيكي</span>
                </div>
                {purpose.clinicalRationale && (
                  <div className="text-xs text-slate-700 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-950 block mb-0.5">المبرر الإكلينيكي:</span>
                    <p className="leading-relaxed">{purpose.clinicalRationale}</p>
                  </div>
                )}
                {purpose.scope && purpose.scope.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-2xs font-bold text-slate-500">يشمل التطبيق:</span>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {purpose.scope.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Instructive Visual SOP Workflow (الصور والبطاقات الإرشادية والتنفيذية للسياسة) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      خطوات العمل القياسية والإرشادات التنفيذية (Standard Operating Procedures)
                    </h3>
                    <p className="text-2xs text-slate-500">
                      تسلسل الإجراءات الطبية المعتمدة ومحددات السلامة الحرجة
                    </p>
                  </div>
                </div>

                {/* Phase Filter Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setActiveSopPhase('all')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeSopPhase === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
                  >
                    كافة المراحل
                  </button>
                  <button
                    onClick={() => setActiveSopPhase('pre')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeSopPhase === 'pre' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600'}`}
                  >
                    1. قبل الإجراء
                  </button>
                  <button
                    onClick={() => setActiveSopPhase('exec')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeSopPhase === 'exec' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600'}`}
                  >
                    2. التنفيذ
                  </button>
                  <button
                    onClick={() => setActiveSopPhase('post')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${activeSopPhase === 'post' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'}`}
                  >
                    3. بعد الإجراء
                  </button>
                </div>
              </div>

              {/* SOP Step Cards Grid */}
              <div className="space-y-4">
                
                {/* Pre-procedure Phase */}
                {(activeSopPhase === 'all' || activeSopPhase === 'pre') && sop.preProcedure && sop.preProcedure.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h4 className="font-bold text-xs sm:text-sm text-blue-950">
                        المرحلة الأولى: التحضير والتجهيز ما قبل الإجراء (Pre-Procedure)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sop.preProcedure.map((step: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-xl p-3.5 space-y-2 transition shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {step.stepNumber || idx + 1}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 flex-1">
                              {step.title}
                            </span>
                            {step.assignedTo && (
                              <span className="text-3xs bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded">
                                {step.assignedTo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pr-8">
                            {step.details}
                          </p>
                          {step.keySafetyPoint && (
                            <div className="mr-8 text-2xs bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200/70 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>تنبيه أمان:</strong> {step.keySafetyPoint}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Phase */}
                {(activeSopPhase === 'all' || activeSopPhase === 'exec') && sop.execution && sop.execution.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <h4 className="font-bold text-xs sm:text-sm text-indigo-950">
                        المرحلة الثانية: خطوات التنفيذ الإكلينيكي المباشر (Execution)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sop.execution.map((step: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-xl p-3.5 space-y-2 transition shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {step.stepNumber || idx + 1}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 flex-1">
                              {step.title}
                            </span>
                            {step.assignedTo && (
                              <span className="text-3xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                                {step.assignedTo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pr-8">
                            {step.details}
                          </p>
                          {step.keySafetyPoint && (
                            <div className="mr-8 text-2xs bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200/70 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>تنبيه أمان:</strong> {step.keySafetyPoint}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post-procedure Phase */}
                {(activeSopPhase === 'all' || activeSopPhase === 'post') && sop.postProcedure && sop.postProcedure.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                        المرحلة الثالثة: ما بعد الإجراء والتطهير والتوثيق (Post-Procedure)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sop.postProcedure.map((step: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 rounded-xl p-3.5 space-y-2 transition shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {step.stepNumber || idx + 1}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 flex-1">
                              {step.title}
                            </span>
                            {step.assignedTo && (
                              <span className="text-3xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                                {step.assignedTo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pr-8">
                            {step.details}
                          </p>
                          {step.keySafetyPoint && (
                            <div className="mr-8 text-2xs bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200/70 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>تنبيه أمان:</strong> {step.keySafetyPoint}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Critical Warnings & Safety Red Lines (المحظورات الصارمة والخطوط الحمراء) */}
            {(dontsList.length > 0 || dosList.length > 0 || ccpList.length > 0 || safety.emergencyIncidentProtocol) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Strict Prohibitions (DON'Ts) */}
                <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm sm:text-base">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>المحظورات الصارمة والخطوط الحمراء (DON'Ts)</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-rose-950 font-medium">
                    {dontsList.map((dont: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                        <span className="text-rose-600 font-bold text-sm shrink-0">⛔</span>
                        <span className="leading-snug">{dont}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mandatory Practices (DOs) & Emergency Protocol */}
                <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>الممارسات الإلزامية ونقاط التحكم (DOs)</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-emerald-950 font-medium">
                    {dosList.map((doItem: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                        <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                        <span className="leading-snug">{doItem}</span>
                      </li>
                    ))}
                  </ul>

                  {safety.emergencyIncidentProtocol && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1 text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        بروتوكول التعامل الفوري مع الحوادث والتعرض:
                      </span>
                      <p className="text-amber-950 leading-relaxed">
                        {safety.emergencyIncidentProtocol}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Roles & Responsibilities Matrix */}
            {roles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      مصفوفة المسؤوليات وتوزيع الأدوار (Roles & Responsibilities)
                    </h3>
                    <p className="text-2xs text-slate-500">
                      تحديد الواجبات والمساءلة الإكلينيكية والإدارية
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {roles.map((r: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>{r.role}</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700 leading-relaxed">
                        {(r.responsibilities || []).map((resp: string, rIdx: number) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Scientific Definitions & Quality Checklist / KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Definitions */}
              {definitions.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                    <span>التعريفات والمصطلحات الإكلينيكية</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {definitions.map((def: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                        <span className="font-bold text-blue-900 block">{def.term}:</span>
                        <p className="text-slate-700 leading-relaxed">{def.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KPIs and Audit Checklist */}
              {compliance.kpis && compliance.kpis.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    <span>مؤشرات الأداء وقائمة التدقيق (KPIs & Audit Checklist)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {compliance.kpis.map((kpi: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-slate-900 block">{kpi.name}</span>
                          {kpi.formula && <span className="text-3xs text-slate-500 font-mono block">المعادلة: {kpi.formula}</span>}
                        </div>
                        <div className="text-left shrink-0">
                          {kpi.target && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-2xs block mb-0.5">
                              المستهدف: {kpi.target}
                            </span>
                          )}
                          {kpi.frequency && (
                            <span className="text-3xs text-slate-400 block font-medium">
                              دورية القياس: {kpi.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FULL FORMATTED MARKDOWN DOCUMENT (النص الكامل المنظم للمستند) */}
        {/* ========================================================================= */}
        {activeTab === 'document' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-slate-900">
            <div className={`prose prose-slate max-w-none ${textClass}
              prose-headings:font-bold prose-headings:text-slate-900 
              prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-3 prose-h1:mt-2
              prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-blue-900
              prose-h3:text-base sm:prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
              prose-p:leading-relaxed prose-p:text-slate-800
              prose-li:text-slate-800 prose-li:my-1
              prose-strong:text-slate-950 prose-strong:font-bold
              prose-table:w-full prose-table:my-4 prose-table:border prose-table:border-slate-200 prose-table:rounded-xl prose-table:overflow-hidden
              prose-th:bg-slate-100 prose-th:text-slate-900 prose-th:font-bold prose-th:p-3 prose-th:border prose-th:border-slate-200
              prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-td:text-slate-800
              prose-blockquote:border-r-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-l-lg prose-blockquote:text-slate-700
              prose-hr:my-6 prose-hr:border-slate-200`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formattedContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: WORKFLOW FLOWCHART DIAGRAM (المخطط الانسيابي للعمليات) */}
        {/* ========================================================================= */}
        {activeTab === 'flowchart' && data.mermaidFlowchart?.code && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <MermaidViewer 
              code={data.mermaidFlowchart.code} 
              description={data.mermaidFlowchart.description || 'مخطط سير العمليات التنفيذية للسياسة'} 
            />
          </div>
        )}

      </div>
    </div>
  );
}

