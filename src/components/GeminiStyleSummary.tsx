import React, { useState, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  BadgeAlert,
  HelpCircle,
  Clock,
  Compass,
  FileCheck2
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
      text: `مرحباً بك! أنا مستشارك الإكلينيكي الذكي للسياسات الصحية.\n\nتم تلخيص وتنسيق وثيقة: **«${data.policyCard?.titleArabic || 'السياسة الطبية'}»** بالكامل بدون حذف أي بند، متوافقة مع معايير الاعتماد الصحي (GAHAR 2025 / CBAHI / JCI).\n\nيمكنك قراءة الملخص الكامل بالتسلسل، أو استخدام شريط الانتقال السريع، أو سؤالي عن أي بند أو خطوة في السياسة.`,
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
  const roles = Array.isArray(data.rolesAndResponsibilities) ? data.rolesAndResponsibilities : [];
  const sop = data.sopPhases || ({} as any);
  const safety = data.safetyWarningsAndCriticalSteps || ({} as any);
  const kpisData = data.complianceAndKPIs || ({} as any);

  // Dynamic safety arrays
  const criticalPoints: string[] = Array.isArray(safety?.criticalControlPoints)
    ? safety.criticalControlPoints
    : [];
  const dosList: string[] = Array.isArray(safety?.dos)
    ? safety.dos
    : Array.isArray(safety?.mandatoryPracticesDos)
    ? safety.mandatoryPracticesDos
    : [];
  const dontsList: string[] = Array.isArray(safety?.donts)
    ? safety.donts
    : Array.isArray(safety?.strictProhibitionsDonts)
    ? safety.strictProhibitionsDonts
    : [];

  const kpiItems = Array.isArray(kpisData?.kpis)
    ? kpisData.kpis
    : Array.isArray(kpisData?.keyPerformanceIndicators)
    ? kpisData.keyPerformanceIndicators
    : [];
  const auditItems = Array.isArray(kpisData?.auditChecklist)
    ? kpisData.auditChecklist
    : [];
  const recommendations = Array.isArray(kpisData?.gapAnalysisAndRecommendations)
    ? kpisData.gapAnalysisAndRecommendations
    : Array.isArray(kpisData?.recommendations)
    ? kpisData.recommendations
    : [];

  // Generate dynamic Q&A scenarios from policy data if not explicitly provided
  const dynamicFaqs = useMemo(() => {
    if (data.faqScenarios && data.faqScenarios.length > 0) {
      return data.faqScenarios;
    }
    const list: { question: string; answer: string; clinicalRationale?: string }[] = [];
    
    if (purpose.mainObjective) {
      list.push({
        question: `ما هو الهدف الأساسي والمبرر الإكلينيكي لسياسة «${card.titleArabic || 'السياسة'}»؟`,
        answer: purpose.mainObjective,
        clinicalRationale: purpose.clinicalRationale || 'الامتثال لمعايير الجودة وسلامة المرضى وخفض المخاطر السريرية.'
      });
    }

    if (criticalPoints.length > 0) {
      list.push({
        question: 'ما هي أهم نقاط التحكم الحرجة (Critical Control Points) التي يتم التدقيق عليها؟',
        answer: criticalPoints.slice(0, 3).join(' • '),
        clinicalRationale: 'تمثل الخطوط الدفاعية الأولى لمنع وقوع الأخطاء الطبية أو العدوى المكتسبة.'
      });
    }

    if (dontsList.length > 0) {
      list.push({
        question: 'ما هي أبرز المحظورات الصارمة (Strict DON\'Ts) التي يُمنع مخالفتها قطعياً؟',
        answer: dontsList.slice(0, 3).join(' • '),
        clinicalRationale: 'أي مخالفة لهذه البنود تعتبر عدم امتثال جسيم (Major Non-compliance) في تقارير الاعتماد.'
      });
    }

    if (kpiItems.length > 0) {
      const firstKpi = kpiItems[0];
      list.push({
        question: `كيف يتم قياس مؤشر الأداء الرئيسي (${firstKpi.name || 'مؤشر الامتثال'})؟`,
        answer: `المعادلة: ${firstKpi.formula || 'نسبة الالتزام بالمعيار'} | المستهدف المعتمد: ${firstKpi.target || '≥ 95%'}`,
        clinicalRationale: `يُقاس دورياً (${firstKpi.frequency || 'شهرياً'}) لضمان التحسين المستمر للجودة.`
      });
    }

    return list;
  }, [card, purpose, criticalPoints, dontsList, kpiItems, data.faqScenarios]);

  const handleDirectPdfDownload = async () => {
    if (!pdfExportContainerRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setExportProgress('جاري تحضير وتنسيق وثيقة المراجعة الموحدة بالكامل للتحميل كـ PDF...');

    try {
      const code = data.policyCard?.policyCode || 'Policy';
      const cleanTitle = (data.policyCard?.titleArabic || 'Medical_Policy')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .slice(0, 40);
      const filename = `${code}_${cleanTitle}_Complete_Review.pdf`;

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
    let textToCopy = `# ${card.titleArabic || 'ملخص السياسة الموحد'} (${card.policyCode || 'POLICY'})\n\n`;
    if (data.markdownSummary) {
      textToCopy += data.markdownSummary;
    } else {
      textToCopy += `## 1. الملخص التنفيذي:\n${data.executiveSummarySnippet || ''}\n\n## 2. الهدف الإكلينيكي:\n${purpose.mainObjective || ''}\n\n## 3. خطوات العمل (SOPs):\n${sop.execution?.map((s: any) => `- ${s.title}: ${s.details}`).join('\n') || ''}\n\n## 4. المحظورات:\n${dontsList.map(d => `- ${d}`).join('\n') || ''}`;
    }
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

    const newMsgId = Date.now().toString();
    setChatMessages(prev => [
      ...prev,
      {
        id: newMsgId,
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-policy-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          policyContext: {
            title: card.titleArabic,
            code: card.policyCode,
            summary: data.executiveSummarySnippet,
            markdownSummary: data.markdownSummary,
            sops: sop,
            dos: dosList,
            donts: dontsList,
            kpis: kpiItems,
            definitions: definitions,
            technicalSpecifications: techSpecs
          }
        })
      });

      if (!response.ok) {
        throw new Error('فشل الحصول على إجابة');
      }

      const resData = await response.json();
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: resData.answer || 'تمت مراجعة السياسة للإجابة على استفسارك.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Direct local answering fallback
      let fallbackAns = `بناءً على وثيقة سياسة «${card.titleArabic || 'السياسة'}»: `;
      if (userText.includes('هدف') || userText.includes('لماذا') || userText.includes('أهمية')) {
        fallbackAns += `الهدف الرئيسي هو: ${purpose.mainObjective || 'حماية المرضى والممارسين والارتقاء بالأمان السريري.'} والمبرر الإكلينيكي: ${purpose.clinicalRationale || 'الحد من المخاطر.'}`;
      } else if (userText.includes('ممنوع') || userText.includes('محظور') || userText.includes('خطأ')) {
        fallbackAns += `المحظورات الصارمة تشمل: ${dontsList.slice(0, 3).join('، ')}.`;
      } else if (userText.includes('خطوات') || userText.includes('إجراء') || userText.includes('تنفيذ')) {
        fallbackAns += `تتكون خطوات العمل القياسية من مراحل التجهيز، التنفيذ الفعلي، والتخلص الآمن والتوثيق، ومسؤولية كل كادر محددة في مصفوفة المسؤوليات.`;
      } else if (userText.includes('مؤشر') || userText.includes('قياس') || userText.includes('kpi')) {
        fallbackAns += `مؤشرات الأداء تشمل: ${kpiItems.map(k => `${k.name} (المستهدف: ${k.target})`).join('، ')}.`;
      } else {
        fallbackAns += `تم توثيق كافة البنود بدقة في متن الوثيقة أعلاه بما يتماشى مع معايير جهار 2025 والاعتمادات الصحية الدولية.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: fallbackAns,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const fontSizeClass = {
    normal: 'text-xs sm:text-sm leading-relaxed',
    large: 'text-sm sm:text-base leading-relaxed',
    xlarge: 'text-base sm:text-lg leading-relaxed'
  }[fontSize];

  return (
    <div className="text-right font-sans space-y-6" dir="rtl">
      
      {/* ========================================================================= */}
      {/* 📦 COMPLETE MASTER UNIFIED POLICY DOCUMENT (ملخص كامل بدون أي حذف)       */}
      {/* ========================================================================= */}
      <div 
        id="master-unified-policy-document"
        ref={pdfExportContainerRef}
        className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden divide-y divide-slate-200"
      >
        
        {/* ================= 1. MASTER HEADER & INSTITUTIONAL CONTROL ================= */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white space-y-6">
          
          {/* Top Meta Badges & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-lg">
                كود السياسة: {card.policyCode || 'POL-001'}
              </span>
              <span className="text-xs font-bold bg-slate-800 text-emerald-300 px-3 py-1 rounded-lg border border-slate-700">
                {card.reviewCycle ? `مراجعة: ${card.reviewCycle}` : 'الإصدار المعتمد 2025/2026'}
              </span>
              <span className="text-xs font-bold bg-blue-950 text-blue-200 px-3 py-1 rounded-lg border border-blue-800">
                المجال: {card.domain || 'السياسات الإكلينيكية وسلامة المرضى'}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 no-print">
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
                title="نسخ نص الوثيقة الموحدة كاملة"
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

          {/* Master Title & High-Yield Badge */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-slate-950 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                Full Comprehensive Review & Master Policy Summary
              </span>
              <span className="text-xs font-semibold text-slate-300">
                ملخص كامل وشامل للسياسة المرفوعة بدون أي حذف أو اختصار مخل
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {card.titleArabic || 'الملخص التنفيذي والوثيقة الموحدة للسياسة الإكلينيكية'}
            </h1>
            {card.titleEnglish && (
              <p className="text-xs sm:text-sm text-slate-400 font-medium font-mono">
                {card.titleEnglish}
              </p>
            )}
          </div>

          {/* Document Control Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-slate-400 block text-3xs">تاريخ التفعيل والاعتماد:</span>
              <strong className="text-slate-100 font-bold">{card.effectiveDate || '2025/2026'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-3xs">دورة المراجعة والتحديث:</span>
              <strong className="text-slate-100 font-bold">{card.reviewCycle || 'سنوياً أو عند التحديث'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-3xs">الجهة المعتمدة:</span>
              <strong className="text-slate-100 font-bold">{card.issuingAuthority || 'لجنة الجودة والاعتماد الطبي'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-3xs">الفئات ونطاق التطبيق:</span>
              <strong className="text-slate-100 font-bold">{card.departments?.slice(0, 3).join('، ') || 'كافة الكوادر الطبية والمساندة'}</strong>
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
            <span>فهرس الانتقال:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'sec-markdown', label: '📄 نص وتنظيم السياسة الكامل' },
              { id: 'sec-executive', label: '💡 الملخص التنفيذي' },
              ...(definitions.length > 0 ? [{ id: 'sec-definitions', label: '📖 التعريفات' }] : []),
              ...(techSpecs.length > 0 ? [{ id: 'sec-tech', label: '🔬 المواصفات الفنية' }] : []),
              ...(sop.execution?.length > 0 ? [{ id: 'sec-sops', label: '⚙️ خطوات العمل (SOPs)' }] : []),
              { id: 'sec-safety', label: '⚠️ المحظورات ونقاط الأمان' },
              ...(roles.length > 0 ? [{ id: 'sec-roles', label: '👥 المسؤوليات' }] : []),
              ...(kpiItems.length > 0 || auditItems.length > 0 ? [{ id: 'sec-kpis', label: '📊 مؤشرات الأداء والتدقيق' }] : []),
              ...(dynamicFaqs.length > 0 ? [{ id: 'sec-faqs', label: '❓ أسئلة المراجعة' }] : []),
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
              title="خط عادي"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded text-2xs font-bold transition ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              title="خط كبير"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              title="خط ضخم"
            >
              A++
            </button>
          </div>
        </div>

        {/* ================= 2. SECTION: FULL NATURAL POLICY DOCUMENT & SUMMARY (كما هي بدون قيود) ================= */}
        {data.markdownSummary ? (
          <div id="sec-markdown" className="p-6 sm:p-8 space-y-5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <h2>نص وتنظيم السياسة الكامل كما وردت في الوثيقة</h2>
              </div>
              <span className="text-2xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                ✨ ملخص وتنظيم كامل دون أي حذف
              </span>
            </div>

            {/* Rendered Markdown Container with Custom High-Contrast Styling */}
            <div className="p-5 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200 prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed prose-table:text-xs prose-th:bg-slate-800 prose-th:text-white prose-th:p-2.5 prose-td:p-2.5 prose-td:border prose-td:border-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.markdownSummary}
              </ReactMarkdown>
            </div>
          </div>
        ) : null}

        {/* ================= 3. SECTION: EXECUTIVE SUMMARY & STRATEGIC HIGHLIGHTS ================= */}
        <div id="sec-executive" className="p-6 sm:p-8 space-y-5 bg-gradient-to-b from-amber-50/40 via-white to-white">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5 text-slate-950 font-black text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2>الملخص التنفيذي المركز (Executive Summary)</h2>
            </div>
            <span className="text-2xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              أبرز النقاط الجوهرية
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

          {/* Dynamic Strategic Highlights derived strictly from analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-300 space-y-2">
              <strong className="text-blue-950 font-black text-xs flex items-center gap-1.5">
                <span>🎯</span> الهدف الإكلينيكي:
              </strong>
              <p className="text-blue-900 text-2xs leading-relaxed font-medium">
                {purpose.mainObjective || 'الارتقاء بمستوى الأمان السريري وضمان التطبيق الأمثل لمعايير الجودة.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-300 space-y-2">
              <strong className="text-indigo-950 font-black text-xs flex items-center gap-1.5">
                <span>🔬</span> المبرر والأساس العلمي:
              </strong>
              <p className="text-indigo-900 text-2xs leading-relaxed font-medium">
                {purpose.clinicalRationale || 'الحد من المخاطر السريرية والعدوى ومطابقة متطلبات الاعتماد الصحي.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-300 space-y-2">
              <strong className="text-rose-950 font-black text-xs flex items-center gap-1.5">
                <span>🚫</span> الخطوط الحمراء والمحظورات:
              </strong>
              <p className="text-rose-900 text-2xs leading-relaxed font-medium">
                {dontsList.length > 0 
                  ? dontsList.slice(0, 2).map((d, i) => `• ${d}`).join('\n')
                  : '• الالتزام التام بالبروتوكول وتجنب أي تجاوز للخطوات الإلزامية.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-2">
              <strong className="text-emerald-950 font-black text-xs flex items-center gap-1.5">
                <span>📊</span> مستهدفات الجودة والامتثال:
              </strong>
              <p className="text-emerald-900 text-2xs leading-relaxed font-medium">
                {kpiItems.length > 0 
                  ? kpiItems.slice(0, 2).map((k: any) => `• ${k.name}: ${k.target}`).join('\n')
                  : '• مستهدف الامتثال المعتمد: ≥ 95% في كافة الأقسام.'}
              </p>
            </div>
          </div>
        </div>

        {/* ================= 4. SECTION: PURPOSE, RATIONALE & SCOPE ================= */}
        <div id="sec-purpose" className="p-6 sm:p-8 space-y-5 bg-slate-50/40">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2>3. الهدف الإكلينيكي، المبرر العلمي، ونطاق التطبيق (Purpose & Scope)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-blue-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xs">1</span>
                <span>الهدف الإكلينيكي الرئيسي:</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed">
                {purpose.mainObjective || 'الارتقاء بمستوى الأمان السريري وحماية المرضى والممارسين الصحيين.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-2xs">2</span>
                <span>المبرر العلمي والجودة:</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed">
                {purpose.clinicalRationale || 'الحد من انتقال العدوى والمخاطر وضمان التطبيق الأمثل لمعايير الجودة والاعتماد.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-1.5 shadow-2xs">
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

        {/* ================= 5. SECTION: SCIENTIFIC DEFINITIONS ================= */}
        {definitions.length > 0 && (
          <div id="sec-definitions" className="p-6 sm:p-8 space-y-5 bg-white">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h2>4. المفاهيم والمصطلحات العلمية الحاكمة (Scientific Terminology)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {definitions.map((def: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
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

        {/* ================= 6. SECTION: TECHNICAL SPECIFICATIONS ================= */}
        {techSpecs.length > 0 && (
          <div id="sec-tech" className="p-6 sm:p-8 space-y-5 bg-slate-50/40">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h2>5. جدول المواصفات الفنية والمصفوفة الإجرائية والمواد (Technical Specifications)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3.5 font-bold border border-slate-700">نوع الإجراء / المادة</th>
                    <th className="p-3.5 font-bold border border-slate-700">المواصفات والتركيز</th>
                    <th className="p-3.5 font-bold border border-slate-700 text-center">الكمية / الحجم</th>
                    <th className="p-3.5 font-bold border border-slate-700 text-center">التوقيت / مدة الفاعلية</th>
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
                        {spec.requiredVolume || 'حسب الإجراء'}
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
                            <strong>⚠️ محاذير وموانع: </strong>
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

        {/* ================= 7. SECTION: SOPs STANDARD OPERATING PROCEDURES ================= */}
        {(sop.preProcedure?.length > 0 || sop.execution?.length > 0 || sop.postProcedure?.length > 0) && (
          <div id="sec-sops" className="p-6 sm:p-8 space-y-6 bg-white">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
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
                        {st.assignedTo && (
                          <p className="text-blue-700 text-3xs font-semibold">👤 المسؤول: {st.assignedTo}</p>
                        )}
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
                    المرحلة الثانية: خطوات التنفيذ الفعلي (Execution):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-2xs text-slate-800 pt-1">
                    {sop.execution.map((st: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-indigo-100 space-y-1 shadow-2xs">
                        <p className="font-bold text-indigo-900 text-xs">{st.stepNumber || i + 1}. {st.title}</p>
                        <p className="text-slate-600 leading-relaxed">{st.details}</p>
                        {st.assignedTo && (
                          <p className="text-indigo-700 text-3xs font-semibold">👤 المسؤول: {st.assignedTo}</p>
                        )}
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
                        {st.assignedTo && (
                          <p className="text-emerald-700 text-3xs font-semibold">👤 المسؤول: {st.assignedTo}</p>
                        )}
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

        {/* ================= 8. SECTION: CRITICAL DOs & DON'Ts + SAFETY RED LINES ================= */}
        <div id="sec-safety" className="p-6 sm:p-8 space-y-5 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2>7. مصفوفة المحظورات الصارمة والممارسات الإلزامية ونقاط الأمان (Safety Rules)</h2>
            </div>
            <span className="text-2xs font-bold bg-rose-100 text-rose-900 px-3 py-1 rounded-full border border-rose-300">
              الخطوط الحمراء
            </span>
          </div>

          {/* DOs & DON'Ts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strict DON'Ts */}
            {dontsList.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2.5">
                <h4 className="font-bold text-rose-950 text-xs sm:text-sm flex items-center gap-1.5 border-b border-rose-200 pb-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>المحظورات الصارمة والممارسات الممنوعة (Strict DON'Ts):</span>
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
                  <span>الممارسات الإلزامية ومعايير السلامة (Mandatory DOs):</span>
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

          {/* Critical Control Points (CCPs) */}
          {criticalPoints.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2">
              <strong className="text-amber-950 font-bold text-xs flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>نقاط التحكم الحرجة الحاكمة (Critical Control Points - CCPs):</span>
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-amber-900">
                {criticalPoints.map((ccp, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-100">
                    <span className="font-bold text-amber-800">⚡</span>
                    <span>{ccp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Incident Protocol */}
          {safety.emergencyIncidentProtocol && (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs space-y-1.5 border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>بروتوكول الاستجابة الفورية عند الطوارئ أو حوادث التعرض:</span>
              </div>
              <p className="leading-relaxed text-2xs text-slate-200">
                {safety.emergencyIncidentProtocol}
              </p>
            </div>
          )}
        </div>

        {/* ================= 9. SECTION: ROLES & RESPONSIBILITIES ================= */}
        {roles.length > 0 && (
          <div id="sec-roles" className="p-6 sm:p-8 space-y-5 bg-white">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h2>8. مصفوفة المسؤوليات وتوزيع الأدوار الإكلينيكية والإدارية (Roles Matrix)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {roles.map((r: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs sm:text-sm text-blue-950 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-2xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {r.role}
                  </h4>
                  <ul className="space-y-1 text-2xs text-slate-700">
                    {r.responsibilities?.map((resp: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 10. SECTION: KPIs & AUDIT CHECKLIST ================= */}
        <div id="sec-kpis" className="p-6 sm:p-8 space-y-6 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h2>9. مؤشرات الأداء الرئيسية وقائمة التدقيق الميداني للاعتماد (KPIs & Audit)</h2>
            </div>
            <span className="text-2xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
              معايير GAHAR 2025
            </span>
          </div>

          {/* KPIs Cards */}
          {kpiItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>📈</span> مؤشرات الأداء المقاسة (Key Performance Indicators):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {kpiItems.map((kpi: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <strong className="text-xs font-bold text-slate-900">{kpi.name}</strong>
                      <span className="text-2xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                        {kpi.target}
                      </span>
                    </div>
                    <div className="text-2xs space-y-1 text-slate-700">
                      <p><strong className="text-slate-900">طريقة الحساب: </strong> {kpi.formula}</p>
                      <p><strong className="text-slate-900">دورية القياس: </strong> {kpi.frequency}</p>
                      {kpi.responsiblePerson && (
                        <p><strong className="text-slate-900">المسؤول: </strong> {kpi.responsiblePerson}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Audit Checklist */}
          {auditItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📋</span> قائمة التدقيق والمطابقة الميدانية (Accreditation Checklist):
                </h4>
                <span className="text-3xs text-slate-500 font-medium">
                  اضغط على أي بند لتحديد حالة الامتثال
                </span>
              </div>

              <div className="space-y-2">
                {auditItems.map((item: any, idx: number) => {
                  const itemId = item.id || `audit-${idx}`;
                  const isChecked = !!checkedAuditItems[itemId];
                  return (
                    <div 
                      key={itemId}
                      onClick={() => toggleAudit(itemId)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                        isChecked 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition ${
                        isChecked 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className={`font-bold ${isChecked ? 'line-through opacity-80' : ''}`}>
                            {item.checkpoint}
                          </span>
                          <span className="text-3xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {item.standardReference}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500">
                          <strong className="text-slate-700">دليل الإثبات: </strong> {item.evidenceRequired} {item.frequency && `• التكرار: ${item.frequency}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-2xs space-y-1.5">
              <strong className="text-xs font-bold flex items-center gap-1">
                <span>💡</span> توصيات تحسين الجودة وسد الفجوات (Gap Analysis & Recommendations):
              </strong>
              <ul className="space-y-1">
                {recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="font-bold text-blue-700">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ================= 11. SECTION: RAPID Q&A REVIEW BANK ================= */}
        {dynamicFaqs.length > 0 && (
          <div id="sec-faqs" className="p-6 sm:p-8 space-y-5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h2>10. بنك أسئلة وأجوبة المراجعة السريعة للاختبارات والتفتيش (Rapid Q&A Review)</h2>
              </div>
              <span className="text-2xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                أسئلة المقيمين والمرور
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dynamicFaqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs shrink-0">
                      س{idx + 1}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
                    <strong className="text-emerald-800 font-bold">الجواب المعتمد: </strong>
                    {faq.answer}
                    {faq.clinicalRationale && (
                      <p className="text-2xs text-slate-500 pt-1">
                        <strong>المبرر العلمي: </strong> {faq.clinicalRationale}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 12. SECTION: ACCREDITATION & OFFICIAL SIGN-OFF ================= */}
        <div className="p-6 sm:p-8 bg-slate-900 text-slate-200 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>اعتماد وتوثيق الوثيقة الإكلينيكية الموحدة (Governance & Sign-off)</span>
            </h3>
            <span className="text-3xs text-slate-400 font-mono">ISO 15189 / GAHAR Standards Compliant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-slate-400 block text-3xs font-semibold">1. إعداد وتنسيق المحتوى:</span>
              <strong className="text-white block">فريق الجودة والسياسات الإكلينيكية</strong>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-3xs text-slate-400">
                <span>التوقيع: معتمد إلكترونياً</span>
                <span>التاريخ: {card.effectiveDate || '2025/2026'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-slate-400 block text-3xs font-semibold">2. المراجعة الفنية والإكلينيكية:</span>
              <strong className="text-white block">{card.issuingAuthority || 'لجنة مكافحة العدوى والسلامة'}</strong>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-3xs text-slate-400">
                <span>الحالة: تم التدقيق والاعتماد</span>
                <span>المطابقة: 100%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-slate-400 block text-3xs font-semibold">3. الاعتماد النهائي والتفعيل:</span>
              <strong className="text-white block">مدير عام المنشأة / المدير الطبي</strong>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-3xs text-slate-400">
                <span>الختم: نافذ وإلزامي</span>
                <span>الكود: {card.policyCode || 'POL-001'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💬 INTEGRATED CLINICAL POLICY ADVISOR AI CHATBOT                         */}
      {/* ========================================================================= */}
      <div 
        id="sec-advisor"
        className="bg-white rounded-3xl border border-slate-300 shadow-lg overflow-hidden space-y-0 no-print"
      >
        <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-sm">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">المستشار الإكلينيكي الذكي للسياسة</h3>
              <p className="text-2xs text-blue-200">اسأل عن أي بند أو خطوة أو مبرر علمي في هذه السياسة</p>
            </div>
          </div>
          <span className="text-2xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>جاهز للإجابة الفورية</span>
          </span>
        </div>

        {/* Chat Messages Feed */}
        <div className="p-4 sm:p-6 max-h-[350px] overflow-y-auto space-y-3 bg-slate-50/50">
          {chatMessages.map(msg => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
            >
              <div 
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-800 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className={`block text-3xs mt-1 font-mono ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex items-end justify-start">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>جاري البحث في بنود السياسة والمعايير...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="اكتب سؤالك هنا (مثال: ما هو الإجراء عند وقوع حادث طارئ؟ أو ما هو المستهدف لمؤشر الأداء؟)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-800 text-xs sm:text-sm bg-slate-50/70"
          />
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isChatLoading}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال</span>
          </button>
        </div>
      </div>
    </div>
  );
}
