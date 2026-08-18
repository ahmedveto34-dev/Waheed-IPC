import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Send, 
  FileText, 
  ShieldAlert, 
  CheckCheck, 
  AlertTriangle, 
  Bookmark, 
  Layers, 
  BookOpen, 
  FlaskConical, 
  Users, 
  Printer, 
  Building2, 
  CheckSquare, 
  XCircle, 
  Stethoscope, 
  Activity, 
  FileDown,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  BadgeAlert
} from 'lucide-react';
import { PolicyAnalysisResult } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { A4FinalReviewDocument } from './A4FinalReviewDocument';

interface GeminiStyleSummaryProps {
  data: PolicyAnalysisResult;
  onSwitchToA4?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export function GeminiStyleSummary({ data, onSwitchToA4 }: GeminiStyleSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [checkedAuditItems, setCheckedAuditItems] = useState<Record<string, boolean>>({});
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const pdfExportContainerRef = useRef<HTMLDivElement>(null);
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `مرحباً بك! أنا مستشارك الإكلينيكي الذكي للسياسات الصحية.\n\nتم تجميع وتنسيق وثيقة: **«${data.policyCard?.titleArabic || 'السياسة الطبية'}»** بالكامل في عنصر واحد موحد وشامل، مطابق لمعايير الاعتماد الصحي (GAHAR 2025 / CBAHI / JCI).\n\nيمكنك قراءة الوثيقة كاملة بالتسلسل، أو استخدام شريط الانتقال السريع بالأعلى، أو سؤالي عن أي بند في السياسة.`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Safe data extraction
  const card = data.policyCard || ({} as any);
  const purpose = data.purposeAndScope || ({} as any);
  const definitions = Array.isArray(data.scientificDefinitions) ? data.scientificDefinitions : [];
  const techSpecs = Array.isArray(data.technicalSpecifications) ? data.technicalSpecifications : [];
  const fiveMoments = Array.isArray((data as any).fiveMomentsDetail) 
    ? (data as any).fiveMomentsDetail 
    : Array.isArray(data.fiveMomentsDetails) 
    ? data.fiveMomentsDetails 
    : [];
  const skinCare = data.skinAndGloveCare || ({} as any);
  const infra = data.infrastructureRequirements || ({} as any);
  const roles = Array.isArray(data.rolesAndResponsibilities) ? data.rolesAndResponsibilities : [];
  const sop = data.sopPhases || ({} as any);
  const safety = data.safetyWarningsAndCriticalSteps || ({} as any);
  const kpisData = data.complianceAndKPIs || ({} as any);

  // Extract safe arrays for safety
  const criticalPoints: string[] = Array.isArray(safety?.criticalControlPoints)
    ? safety.criticalControlPoints
    : [];
  const dosList: string[] = Array.isArray(safety?.mandatoryPracticesDos)
    ? safety.mandatoryPracticesDos
    : [];
  const dontsList: string[] = Array.isArray(safety?.strictProhibitionsDonts)
    ? safety.strictProhibitionsDonts
    : [];

  const kpiItems = Array.isArray(kpisData?.keyPerformanceIndicators)
    ? kpisData.keyPerformanceIndicators
    : [];
  const auditItems = Array.isArray(kpisData?.auditChecklist)
    ? kpisData.auditChecklist
    : [];
  const recommendations = Array.isArray(kpisData?.recommendations)
    ? kpisData.recommendations
    : [];

  const handleDirectPdfDownload = async () => {
    if (!pdfExportContainerRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setExportProgress('جاري تحضير وتنسيق وثيقة المراجعة الموحدة بالكامل للتحميل كـ PDF...');

    try {
      const code = data.policyCard?.policyCode || 'Policy';
      const cleanTitle = (data.policyCard?.titleArabic || 'Medical_Policy')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .slice(0, 40);
      const filename = `${code}_${cleanTitle}_Unified_Master_Review.pdf`;

      await exportElementToPdf(pdfExportContainerRef.current, {
        filename,
        title: data.policyCard?.titleArabic,
        onProgress: (text) => setExportProgress(text)
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      if (onSwitchToA4) {
        onSwitchToA4();
      } else {
        window.print();
      }
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  const handleCopyMarkdown = () => {
    const textToCopy = `# ${card.titleArabic || 'ملخص السياسة الموحد'} (${card.policyCode || 'IPC-POL'})\n\n## 1. الملخص التنفيذي:\n${data.executiveSummarySnippet || ''}\n\n## 2. الهدف الإكلينيكي:\n${purpose.mainObjective || ''}\n\n## 3. خطوات العمل (SOPs):\n${sop.execution?.map((s: any) => `- ${s.title}: ${s.details}`).join('\n') || ''}\n\n## 4. المحظورات الصارمة:\n${dontsList.map(d => `- ${d}`).join('\n') || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleAudit = (id: string) => {
    setCheckedAuditItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      await new Promise(r => setTimeout(r, 600));

      let answer = `بناءً على وثيقة السياسة الموحدة **«${card.titleArabic || 'السياسة'}»**:\n\n`;

      if (userText.includes('5') || userText.includes('نقاط') || userText.includes('لخص') || userText.includes('كبسولة')) {
        answer += `1. **الهدف الإكلينيكي:** ${purpose.mainObjective || 'الامتثال للمعايير ومنع انتقال العدوى'}.\n2. **الأزمنة والمقادير:** فرك كحولي 20-30 ثانية (3-5 مل) • غسيل مائي 40-60 ثانية.\n3. **أخطر محظور:** ${dontsList[0] || 'حظر تزويد العبوات (Zero Top-up) والقفازات لا تغني عن نظافة الأيدي'}.\n4. **الفئة المسؤولة:** ${card.departments?.join('، ') || 'جميع الكوادر الطبية والتمريضية'}.\n5. **مؤشر الامتثال:** ${kpiItems[0]?.indicatorName || 'معدل الامتثال العام'} بنسبة مستهدفة ${kpiItems[0]?.target || '≥ 90%'}.`;
      } else if (userText.includes('جهار') || userText.includes('GAHAR') || userText.includes('تفتيش') || userText.includes('سؤال')) {
        answer += `نقاط التفتيش والاعتماد الأساسية وفق معايير جهار:\n- التحقق من تطبيق اللحظات الخمس (WHO 5 Moments).\n- التأكد من معرفة الكادر بالأزمنة الإلزامية وخلو الأصابع من الحلي والطلاء.\n- مطابقة سجلات التدريب الشهرية ونسبة الامتثال (المستهدف ≥ 90%).`;
      } else {
        answer += `وفقاً لبنود الوثيقة الموحدة:\n- **المبرر الإكلينيكي:** ${purpose.clinicalRationale || 'حماية المرضى والعاملين'}.\n- **المواصفات الفنية:** تلتزم بكافة معايير ${card.alignedStandards?.[0]?.standardBody || 'GAHAR 2025'}.\n- يمكنك مراجعة جداول خطوات العمل القياسية والمحظورات في الأقسام أعلاه.`;
      }

      const geminiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: answer,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, geminiMsg]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const fontSizeClass = fontSize === 'large' ? 'text-base' : fontSize === 'xlarge' ? 'text-lg' : 'text-xs sm:text-sm';

  return (
    <div className="text-right font-sans space-y-6" dir="rtl">
      
      {/* ========================================================================= */}
      {/* 📦 ONE UNIFIED MASTER CONTAINER (تجميع كل العناصر في عنصر واحد متكامل)       */}
      {/* ========================================================================= */}
      <div 
        id="master-unified-policy-document"
        className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden divide-y divide-slate-200"
      >
        
        {/* ================= 1. MASTER HEADER & DOCUMENT CONTROL ================= */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white space-y-6">
          
          {/* Top Meta Badges & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-lg">
                كود السياسة: {card.policyCode || 'IPC-POL-001'}
              </span>
              <span className="text-xs font-bold bg-slate-800 text-emerald-300 px-3 py-1 rounded-lg border border-slate-700">
                {card.reviewCycle ? 'إصدار معتمد ومحدث' : 'الإصدار المعتمد 2025/2026'}
              </span>
              <span className="text-xs font-bold bg-blue-950 text-blue-200 px-3 py-1 rounded-lg border border-blue-800">
                المجال: {card.domain || 'السياسات الإكلينيكية ومكافحة العدوى'}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDirectPdfDownload}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
                title="تصدير وتحميل الوثيقة الموحدة كاملة كملف PDF عالي الجودة"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                    <span>جاري التصدير...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-white" />
                    <span>تصدير PDF مباشر</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                title="نسخ نص الوثيقة الموحدة"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>

              {onSwitchToA4 && (
                <button
                  onClick={onSwitchToA4}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>معاينة ورقة A4</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Title & Study Guide Badge */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-slate-950 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                High-Yield Master Study Guide & Cram Sheet
              </span>
              <span className="text-xs font-semibold text-slate-300">
                مذكرة المراجعة النهائية والوثيقة الإكلينيكية الموحدة الشاملة
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {card.titleArabic || 'الملخص التنفيذي والوثيقة الموحدة للسياسة الإكلينيكية'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {card.titleEnglish || 'Clinical & Operational Healthcare Policy Review & Master SOP Guide'}
            </p>
          </div>

          {/* Document Control Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-slate-400 block text-3xs">تاريخ التفعيل والاعتماد:</span>
              <strong className="text-slate-100 font-bold">{card.effectiveDate || '2025/2026'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-3xs">دورة المراجعة والتحديث:</span>
              <strong className="text-slate-100 font-bold">{card.reviewCycle || 'كل 3 سنوات أو عند التحديث'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-3xs">الجهة المعتمدة:</span>
              <strong className="text-slate-100 font-bold">{card.issuingAuthority || 'لجنة مكافحة العدوى والجودة'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-3xs">الفئات ونطاق التطبيق:</span>
              <strong className="text-slate-100 font-bold">{card.departments?.slice(0, 2).join('، ') || 'كافة الكوادر الطبية والمساندة'}</strong>
            </div>
          </div>

          {/* Aligned Quality Standards */}
          {card.alignedStandards && card.alignedStandards.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>الاعتمادات والمعايير المرجعية المتوافقة:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {card.alignedStandards.map((std: any, i: number) => (
                  <span 
                    key={i} 
                    className="text-2xs font-semibold bg-slate-800 text-slate-100 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <strong>{std.standardBody}</strong>
                    {std.clauseNumber && <span className="text-slate-400 font-mono">({std.clauseNumber})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= STICKY IN-PAGE QUICK JUMP RIBBON ================= */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-2.5 border-b border-slate-700 flex items-center justify-between gap-2 overflow-x-auto text-xs no-print">
          <div className="flex items-center gap-1 text-slate-300 font-bold shrink-0">
            <span className="text-amber-400">⚡</span>
            <span>فهرس الانتقال السريع:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'sec-capsules', label: '1. الكبسولات الذهبية' },
              { id: 'sec-purpose', label: '2. الأهداف والنطاق' },
              { id: 'sec-definitions', label: '3. التعريفات' },
              { id: 'sec-tech', label: '4. المواصفات الفنية' },
              { id: 'sec-moments', label: '5. اللحظات الخمس' },
              { id: 'sec-sops', label: '6. خطوات SOPs' },
              { id: 'sec-safety', label: '7. المحظورات والخطوط الحمراء' },
              { id: 'sec-qa', label: '8. بنك الأسئلة Q&A' },
              { id: 'sec-checklist', label: '9. قائمة التدقيق' },
              { id: 'sec-kpis', label: '10. مؤشرات الأداء' },
              { id: 'sec-advisor', label: '💬 المستشار الذكي' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-700 text-slate-200 hover:text-white font-medium text-2xs transition shrink-0 cursor-pointer border border-slate-700"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded text-3xs font-bold transition ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-2xs font-bold transition ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              A++
            </button>
          </div>
        </div>

        {/* ================= 2. SECTION: EXECUTIVE SUMMARY & GOLDEN CAPSULES ================= */}
        <div id="sec-capsules" className="p-6 sm:p-8 space-y-5 bg-gradient-to-b from-amber-50/40 via-white to-white">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5 text-slate-950 font-black text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2>1. الملخص التنفيذي والكبسولات الذهبية للمراجعة السريعة (Golden Cram Capsules)</h2>
            </div>
            <span className="text-2xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              مراجعة سريعة قبل التقييم
            </span>
          </div>

          {/* Executive Narrative */}
          {data.executiveSummarySnippet && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-800 leading-relaxed text-justify shadow-2xs">
              <p className={fontSizeClass}>
                {data.executiveSummarySnippet}
              </p>
            </div>
          )}

          {/* 4 High-Yield Cram Capsules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2">
              <strong className="text-amber-950 font-black text-xs flex items-center gap-1.5">
                <span>⭐</span> الهدف الإكلينيكي الحرج:
              </strong>
              <p className="text-amber-900 text-2xs leading-relaxed font-medium">
                {purpose.mainObjective || 'الحد من انتقال العدوى المكتسبة وضمان بيئة استشفاء آمنة وخالية من الميكروبات المقاومة.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-300 space-y-2">
              <strong className="text-blue-950 font-black text-xs flex items-center gap-1.5">
                <span>⏱️</span> أزمنة وكميات التطبيق:
              </strong>
              <p className="text-blue-900 text-2xs leading-relaxed font-medium">
                • فرك كحولي: <strong>20 - 30 ثانية</strong> (3-5 مل).<br />
                • غسيل مائي: <strong>40 - 60 ثانية</strong> (ماء وصابون).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-300 space-y-2">
              <strong className="text-rose-950 font-black text-xs flex items-center gap-1.5">
                <span>🚫</span> الخطوط الحمراء الصارمة:
              </strong>
              <p className="text-rose-900 text-2xs leading-relaxed font-medium">
                • حظر تزويد العبوات <strong>(Zero Top-up)</strong>.<br />
                • القفازات لا تغني عن تطهير اليدين إطلاقاً.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-2">
              <strong className="text-emerald-950 font-black text-xs flex items-center gap-1.5">
                <span>🎯</span> مستهدفات الجودة والامتثال:
              </strong>
              <p className="text-emerald-900 text-2xs leading-relaxed font-medium">
                • نسبة الامتثال العامة المستهدفة: <strong>≥ 90%</strong>.<br />
                • معدل استهلاك الكحول: <strong>≥ 20 لتر / 1000 يوم مريض</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ================= 3. SECTION: PURPOSE, RATIONALE & SCOPE ================= */}
        <div id="sec-purpose" className="p-6 sm:p-8 space-y-5 bg-white">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2>2. الهدف الإكلينيكي، المبرر العلمي، ونطاق التطبيق (Purpose & Scope)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xs">1</span>
                <span>الهدف الإكلينيكي الرئيسي:</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed">
                {purpose.mainObjective || 'الارتقاء بمستوى الأمان السريري وحماية المرضى والممارسين الصحيين.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-2xs">2</span>
                <span>المبرر العلمي والجودة:</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed">
                {purpose.clinicalRationale || 'الحد من انتقال العدوى المكتسبة وضمان التطبيق الأمثل لمعايير الجودة والاعتماد.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-2xs">3</span>
                <span>نطاق التطبيق والفئات:</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed">
                {purpose.scope?.length > 0 ? purpose.scope.join(' • ') : card.departments?.join(' • ') || 'جميع العاملين والكوادر الطبية والإدارية والمساندة.'}
              </p>
            </div>
          </div>

          {purpose.exclusions && purpose.exclusions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-2xs space-y-1">
              <strong>الاستثناءات والحدود الإجرائية: </strong>
              <span>{purpose.exclusions.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* ================= 4. SECTION: SCIENTIFIC DEFINITIONS ================= */}
        {definitions.length > 0 && (
          <div id="sec-definitions" className="p-6 sm:p-8 space-y-5 bg-slate-50/50">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h2>3. المفاهيم والمصطلحات العلمية الحاكمة (Scientific Terminology)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {definitions.map((def: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-800 text-white flex items-center justify-center text-2xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {def.term}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {def.definition}
                  </p>
                  {def.clinicalSignificance && (
                    <div className="text-2xs bg-emerald-50 text-emerald-950 p-2 rounded-xl border border-emerald-200/80 font-medium">
                      <strong>الأهمية الإكلينيكية: </strong> {def.clinicalSignificance}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 5. SECTION: TECHNICAL SPECIFICATIONS ================= */}
        {techSpecs.length > 0 && (
          <div id="sec-tech" className="p-6 sm:p-8 space-y-5 bg-white">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h2>4. جدول المواصفات الفنية والمصفوفة الإجرائية للمطهرات (Technical Specifications)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3.5 font-bold border border-slate-700">نوع الإجراء والتقنية</th>
                    <th className="p-3.5 font-bold border border-slate-700">المادة الفعالة والتركيز</th>
                    <th className="p-3.5 font-bold border border-slate-700 text-center">الكمية / الحجم</th>
                    <th className="p-3.5 font-bold border border-slate-700 text-center">زمن التلامس الفعال</th>
                    <th className="p-3.5 font-bold border border-slate-700">دواعي الاستخدام والموانع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {techSpecs.map((spec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900 border border-slate-200 align-top">
                        {spec.techniqueName}
                      </td>
                      <td className="p-3.5 text-slate-800 border border-slate-200 align-top">
                        {spec.agentAndConcentration}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-blue-900 border border-slate-200 align-top">
                        {spec.requiredVolume || '3 - 5 مل'}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-800 border border-slate-200 align-top">
                        {spec.contactTime}
                      </td>
                      <td className="p-3.5 text-slate-700 border border-slate-200 align-top text-2xs space-y-1">
                        {spec.indications && (
                          <div>
                            <strong className="text-emerald-900">الدواعي: </strong>
                            {Array.isArray(spec.indications) ? spec.indications.join(' • ') : spec.indications}
                          </div>
                        )}
                        {Array.isArray(spec.contraindicationsOrLimitations) && spec.contraindicationsOrLimitations.length > 0 && (
                          <div className="text-rose-900 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                            <strong>⚠️ محاذير: </strong>
                            {spec.contraindicationsOrLimitations.join(' • ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 6. SECTION: WHO FIVE MOMENTS ================= */}
        {fiveMoments.length > 0 && (
          <div id="sec-moments" className="p-6 sm:p-8 space-y-5 bg-slate-50/50">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <Bookmark className="w-4 h-4" />
              </div>
              <h2>5. اللحظات الإكلينيكية الحاكمة ومحطات التدخل الإلزامي (WHO 5 Moments)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {fiveMoments.map((m: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-800 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-xs">
                    {m.momentNumber || idx + 1}
                  </div>
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900">{m.momentName}</h4>
                      {m.timing && (
                        <span className="text-2xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-semibold">
                          {m.timing}
                        </span>
                      )}
                    </div>
                    {m.clinicalExamples && (
                      <p className="text-slate-600 text-2xs pt-1 leading-relaxed">
                        <strong className="text-slate-800">أمثلة إكلينيكية: </strong>
                        {Array.isArray(m.clinicalExamples) ? m.clinicalExamples.join('، ') : m.clinicalExamples}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 7. SECTION: SOPs STANDARD OPERATING PROCEDURES ================= */}
        {(sop.preProcedure || sop.execution || sop.postProcedure) && (
          <div id="sec-sops" className="p-6 sm:p-8 space-y-6 bg-white">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <CheckCheck className="w-4 h-4" />
              </div>
              <h2>6. خطوات العمل القياسية المتسلسلة (SOPs) ونقاط التحكم الحرجة</h2>
            </div>

            <div className="space-y-5">
              {/* Pre-Procedure */}
              {sop.preProcedure && sop.preProcedure.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <h4 className="font-bold text-blue-950 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                    المرحلة الأولى: ما قبل الإجراء والتجهيز (Pre-Procedure):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-2xs text-slate-800 pt-1">
                    {sop.preProcedure.map((st: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-blue-100 space-y-1 shadow-2xs">
                        <p className="font-bold text-blue-900 text-xs">{st.stepNumber || i + 1}. {st.title}</p>
                        <p className="text-slate-600 leading-relaxed">{st.details}</p>
                        {st.keySafetyPoint && (
                          <p className="text-emerald-800 text-3xs font-semibold pt-0.5">🔒 نقطة أمان: {st.keySafetyPoint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution */}
              {sop.execution && sop.execution.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <h4 className="font-bold text-indigo-950 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                    المرحلة الثانية: خطوات التنفيذ الإكلينيكي (Execution):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-2xs text-slate-800 pt-1">
                    {sop.execution.map((st: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-indigo-100 space-y-1 shadow-2xs">
                        <p className="font-bold text-indigo-900 text-xs">{st.stepNumber || i + 1}. {st.title}</p>
                        <p className="text-slate-600 leading-relaxed">{st.details}</p>
                        {st.keySafetyPoint && (
                          <p className="text-indigo-800 text-3xs font-semibold pt-0.5">🔒 نقطة أمان: {st.keySafetyPoint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-Procedure */}
              {sop.postProcedure && sop.postProcedure.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                    المرحلة الثالثة: ما بعد الإجراء والتخلص الآمن والتوثيق (Post-Procedure):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-2xs text-slate-800 pt-1">
                    {sop.postProcedure.map((st: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1 shadow-2xs">
                        <p className="font-bold text-emerald-900 text-xs">{st.stepNumber || i + 1}. {st.title}</p>
                        <p className="text-slate-600 leading-relaxed">{st.details}</p>
                        {st.keySafetyPoint && (
                          <p className="text-emerald-800 text-3xs font-semibold pt-0.5">🔒 نقطة أمان: {st.keySafetyPoint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 8. SECTION: CRITICAL DOs & DON'Ts + PITFALLS MATRIX ================= */}
        <div id="sec-safety" className="p-6 sm:p-8 space-y-5 bg-slate-50/50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2>7. مصفوفة المحظورات الصارمة ومقارنة الأخطاء الشائعة بالصواب (Pitfalls vs Standards)</h2>
            </div>
            <span className="text-2xs font-bold bg-rose-100 text-rose-900 px-3 py-1 rounded-full border border-rose-300">
              الخطوط الحمراء
            </span>
          </div>

          {/* Pitfalls vs Golden Standard Table */}
          <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-2xs bg-white">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3.5 text-right w-1/2 text-rose-300">❌ الخطأ الإكلينيكي الشائع المحظور (Pitfall)</th>
                  <th className="p-3.5 text-right w-1/2 text-emerald-300">✅ الصواب والمعيار الذهبي الإلزامي (Standard)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-rose-50/30 hover:bg-rose-50/60 transition">
                  <td className="p-3.5 text-rose-950 font-medium leading-relaxed">
                    تجفيف اليدين بالمناشف أو التلويح بعد الفرك الكحولي لتسريعه قبل اكتمال المدة.
                  </td>
                  <td className="p-3.5 text-emerald-950 font-bold bg-emerald-50/50 leading-relaxed">
                    ترك الكحول يجف ذاتياً بالهواء (20-30 ثانية) حتى اكتمال التبخر والقتل الميكروبي الفعال.
                  </td>
                </tr>
                <tr className="bg-rose-50/30 hover:bg-rose-50/60 transition">
                  <td className="p-3.5 text-rose-950 font-medium leading-relaxed">
                    استخدام الكحول عند وجود اتساخ مرئي أو دماء أو مع ميكروب C. difficile.
                  </td>
                  <td className="p-3.5 text-emerald-950 font-bold bg-emerald-50/50 leading-relaxed">
                    الغسيل المائي الإجباري بالماء والصابون (40-60 ثانية) للتخلص الميكانيكي من الأبواغ.
                  </td>
                </tr>
                <tr className="bg-rose-50/30 hover:bg-rose-50/60 transition">
                  <td className="p-3.5 text-rose-950 font-medium leading-relaxed">
                    تزويد أو سكب محلول مطهر جديد فوق المتبقي في العبوة (Top-up).
                  </td>
                  <td className="p-3.5 text-emerald-950 font-bold bg-emerald-50/50 leading-relaxed">
                    تفريغ العبوة بالكامل، ثم غسلها وتطهيرها وتجفيفها قبل الملء، أو استبدالها بعبوة مقفلة جديدة.
                  </td>
                </tr>
                <tr className="bg-rose-50/30 hover:bg-rose-50/60 transition">
                  <td className="p-3.5 text-rose-950 font-medium leading-relaxed">
                    ارتداء القفازات كبديل عن تطهير اليدين أو الانتقال بها بين المرضى.
                  </td>
                  <td className="p-3.5 text-emerald-950 font-bold bg-emerald-50/50 leading-relaxed">
                    القفازات لا تغني عن نظافة الأيدي؛ تطهير اليدين قبل الارتداء وفور النزع وتبديلها بين المرضى.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DOs & DON'Ts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strict DON'Ts */}
            {dontsList.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2.5">
                <h4 className="font-bold text-rose-950 text-xs sm:text-sm flex items-center gap-1.5 border-b border-rose-200 pb-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>المحظورات الصارمة والممارسات الممنوعة (DON'Ts):</span>
                </h4>
                <ul className="space-y-1.5 text-2xs text-rose-950">
                  {dontsList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold shrink-0">❌</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mandatory DOs */}
            {dosList.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5 border-b border-emerald-200 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>الممارسات الإلزامية ومعايير السلامة (DOs):</span>
                </h4>
                <ul className="space-y-1.5 text-2xs text-emerald-950">
                  {dosList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✔️</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Emergency Incident Protocol */}
          {safety.emergencyIncidentProtocol && (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs space-y-1.5 border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>بروتوكول الاستجابة الفورية عند الطوارئ أو حوادث التعرض المهني:</span>
              </div>
              <p className="leading-relaxed text-2xs text-slate-200">
                {safety.emergencyIncidentProtocol}
              </p>
            </div>
          )}
        </div>

        {/* ================= 9. SECTION: RAPID Q&A REVIEW BANK ================= */}
        <div id="sec-qa" className="p-6 sm:p-8 space-y-5 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <span className="text-sm font-black">❓</span>
              </div>
              <h2>8. بنك أسئلة وأجوبة المراجعة السريعة للاختبارات والتفتيش (Rapid Q&A Review Bank)</h2>
            </div>
            <span className="text-2xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              أسئلة المقيمين والمرور
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs shrink-0">س1</span>
                <span>متى يكون غسيل الأيدي بالماء والصابون إجبارياً بدلاً من الفرك الكحولي؟</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
                <strong className="text-emerald-800 font-bold">الجواب المعتمد: </strong>
                عند وجود اتساخ مرئي بالدم أو سوائل الجسم، أو بعد استخدام المرحاض، أو عند التعامل مع حالات العدوى المتبوغة مثل <em>Clostridioides difficile</em> والروتافيروس (حيث أن الكحول غير قاتل للأبواغ الجرثومية).
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs shrink-0">س2</span>
                <span>ما هي اللحظات الخمس لنظافة الأيدي المعتمدة من منظمة الصحة العالمية (WHO 5 Moments)؟</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
                <strong className="text-emerald-800 font-bold">الجواب المعتمد: </strong>
                1. قبل ملامسة المريض • 2. قبل الإجراءات النظيفة/المعقمة • 3. بعد التعرض لسوائل الجسم • 4. بعد ملامسة المريض • 5. بعد ملامسة البيئة المحيطة بالمريض.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs shrink-0">س3</span>
                <span>ما هي شروط وسياسة تعبئة موزعات المطهرات (Zero Top-up Policy)؟</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
                <strong className="text-emerald-800 font-bold">الجواب المعتمد: </strong>
                يحظر قطعياً سكب مطهر جديد فوق المتبقي بالعبوة. يجب استهلاك العبوة حتى الفراغ، ثم غسلها وتطهيرها وتجفيفها كلياً قبل إعادة التعبئة، ويفضل الاعتماد على العبوات وحيدة الاستخدام ذات النظام المقفل.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs shrink-0">س4</span>
                <span>هل يغني ارتداء القفازات الطبية عن تطهير اليدين؟</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
                <strong className="text-emerald-800 font-bold">الجواب المعتمد: </strong>
                القفازات لا تغني إطلاقاً عن نظافة الأيدي. يجب تطهير اليدين مباشرة قبل ارتداء القفازات وفور نزعها، مع تبديل القفازات بين كل إجراء ومريض، وحظر تطهير القفازات بالكحول.
              </div>
            </div>
          </div>
        </div>

        {/* ================= 10. SECTION: ROLES & RESPONSIBILITIES ================= */}
        {roles.length > 0 && (
          <div className="p-6 sm:p-8 space-y-5 bg-slate-50/50">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h2>9. مصفوفة توزيع الأدوار والمسؤوليات (Roles & Responsibilities Matrix)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {roles.map((r: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Users className="w-3.5 h-3.5 text-blue-800" />
                    <span>{r.role}</span>
                  </h4>
                  <ul className="space-y-1 text-2xs text-slate-700 list-disc list-inside">
                    {Array.isArray(r.responsibilities) ? r.responsibilities.map((resp: string, i: number) => (
                      <li key={i} className="leading-relaxed">{resp}</li>
                    )) : <li>{r.responsibilities}</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 11. SECTION: AUDIT CHECKLIST & KPIs ================= */}
        <div id="sec-checklist" className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2>10. قائمة الفحص الميداني ومؤشرات الأداء المقاسة (Audit Checklist & KPIs)</h2>
            </div>
            <span className="text-2xs font-bold text-teal-900 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              أداة المفتش الصحي
            </span>
          </div>

          {/* KPIs Grid */}
          {kpiItems.length > 0 && (
            <div id="sec-kpis" className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>مؤشرات الأداء الرئيسية المقاسة (Key Performance Indicators):</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kpiItems.map((k: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-1 text-xs shadow-2xs">
                    <p className="font-bold text-teal-950">{k.indicatorName}</p>
                    <div className="flex items-center justify-between text-2xs text-teal-900 font-mono font-bold">
                      <span>المستهدف: {k.target}</span>
                      <span>التكرار: {k.frequency || 'شهرياً'}</span>
                    </div>
                    {k.calculationFormula && (
                      <p className="text-3xs text-slate-600 pt-0.5">المعادلة: {k.calculationFormula}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Audit Checklist */}
          {auditItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-800" />
                <span>قائمة التدقيق والمطابقة التفاعلية (Interactive Audit Checklist):</span>
              </h4>
              <div className="space-y-2">
                {auditItems.map((item: any, idx: number) => {
                  const isChecked = !!checkedAuditItems[item.id || idx];
                  return (
                    <div 
                      key={item.id || idx}
                      onClick={() => toggleAudit(item.id || idx.toString())}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 text-xs ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded text-blue-800 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 space-y-0.5">
                        <p className="font-bold text-xs">{item.checkpoint}</p>
                        <p className="text-2xs text-slate-500">
                          <span className="font-semibold text-slate-700">دليل الإثبات:</span> {item.evidenceRequired} • <span className="font-semibold text-slate-700">المعيار:</span> {item.standardReference}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= 12. SECTION: EMBEDDED AI SMART POLICY ADVISOR ================= */}
        <div id="sec-advisor" className="p-6 sm:p-8 space-y-4 bg-slate-900 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <h2>المستشار الإكلينيكي الذكي للسياسة (Interactive AI Policy Assistant)</h2>
            </div>
            <span className="text-2xs font-bold bg-purple-950 text-purple-200 px-3 py-1 rounded-full border border-purple-800">
              إجابات مباشرة وفورية
            </span>
          </div>

          <p className="text-xs text-slate-300">
            اطرح أي سؤال حول بنود هذه السياسة، معايير جهار، أو سيناريوهات التفتيش الميداني:
          </p>

          {/* Chat Messages Log */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 max-h-80 overflow-y-auto">
            {chatMessages.map(msg => (
              <div 
                key={msg.id}
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white mr-8 text-left'
                    : 'bg-slate-800 text-slate-100 ml-8 border border-slate-700 whitespace-pre-line'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-3xs opacity-75">
                  <span className="font-bold">{msg.sender === 'user' ? 'سؤالك:' : 'المستشار الذكي:'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input & Suggested Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب سؤالك هنا (مثال: ما هي المحظورات الصارمة؟ أو ما هي أزمنة الفرك الكحولي؟)..."
                className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>إرسال</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-2xs text-slate-400 pt-1">
              <span>مقترحات سريعة:</span>
              <button 
                onClick={() => { setChatInput('لخص لي السياسة في 5 نقاط ذهبية حرجة'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                💡 لخص في 5 نقاط ذهبية
              </button>
              <button 
                onClick={() => { setChatInput('ما هي أسئلة مقيم جهار المتوقعة حول هذه السياسة؟'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                🔍 أسئلة جهار المتوقعة
              </button>
              <button 
                onClick={() => { setChatInput('ما هي المحظورات الصارمة والخطوط الحمراء؟'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                🚫 الخطوط الحمراء
              </button>
            </div>
          </div>
        </div>

        {/* ================= 13. OFFICIAL SIGN-OFF FOOTER ================= */}
        <div className="p-6 sm:p-8 bg-slate-100 text-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-2xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <strong className="block text-slate-900 font-bold">إعداد وتنسيق:</strong>
              <p className="text-slate-600">فريق مكافحة العدوى وإدارة الجودة</p>
              <p className="text-3xs text-slate-400">التاريخ: {card.effectiveDate || '2025/2026'}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <strong className="block text-slate-900 font-bold">المراجعة والتدقيق:</strong>
              <p className="text-slate-600">لجنة السياسات والإجراءات الإكلينيكية</p>
              <p className="text-3xs text-slate-400">الاعتماد: GAHAR / CBAHI / JCI</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <strong className="block text-slate-900 font-bold">الاعتماد النهائي:</strong>
              <p className="text-slate-600">المدير الطبي والمدير التنفيذي للمنشأة</p>
              <p className="text-3xs text-slate-400">حالة السياسة: سارية ومعتمدة</p>
            </div>
          </div>

          <div className="text-center text-3xs text-slate-500 pt-2">
            تم استخراج وتنسيق هذا الملخص الموحد الشامل عبر نظام مراجعة وتلخيص السياسات الطبية الذكي © 2025/2026
          </div>
        </div>

      </div>

      {/* Offscreen Hidden Container for Direct PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-0" aria-hidden="true">
        <div ref={pdfExportContainerRef} className="w-[210mm] bg-white">
          <A4FinalReviewDocument data={data} isPrintOnly={false} />
        </div>
      </div>

    </div>
  );
}
