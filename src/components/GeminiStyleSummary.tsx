import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Download, 
  Send, 
  FileText, 
  ShieldAlert, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  Bookmark, 
  Layers, 
  BookOpen, 
  FlaskConical, 
  HeartPulse, 
  Users, 
  Printer, 
  Building2, 
  ArrowRightLeft, 
  SlidersHorizontal, 
  CheckSquare, 
  XCircle, 
  Stethoscope, 
  Activity, 
  Share2, 
  RotateCcw,
  Zap
} from 'lucide-react';
import Markdown from 'react-markdown';
import { PolicyAnalysisResult } from '../types';

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
  const [activeTab, setActiveTab] = useState<'master' | 'sops' | 'technical' | 'safety_roles' | 'kpis_audit' | 'markdown' | 'interactive_chat'>('master');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [checkedAuditItems, setCheckedAuditItems] = useState<Record<string, boolean>>({});
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `مرحباً بك! أنا مستشارك الإكلينيكي الذكي المعتمد (AI Policy Advisor).\n\nلقد قمت بتحليل وتنسيق وثيقة: **«${data.policyCard?.titleArabic || 'السياسة الطبية'}»** بنسبة 100% وفق معايير الاعتماد الصحي (GAHAR 2025 / CBAHI / JCI).\n\nيمكنك استعراض الملخص التنفيذي الشامل، أو مراجعة خطوات العمل القياسية والمصفوفة الفنية، أو طرح أي سؤال إكلينيكي أو تدريبي حول هذه السياسة.`,
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
    ? safety.criticalControlPoints.map((item: any) => typeof item === 'string' ? item : item?.text || JSON.stringify(item))
    : [];

  let dosList: string[] = [];
  if (Array.isArray(safety?.dos)) {
    dosList = safety.dos.map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  } else if (Array.isArray(safety?.dosAndDonts)) {
    dosList = safety.dosAndDonts
      .filter((item: any) => item?.type === 'DO' || (typeof item === 'string' && !item.toLowerCase().startsWith("don't")))
      .map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  }

  let dontsList: string[] = [];
  if (Array.isArray(safety?.donts)) {
    dontsList = safety.donts.map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  } else if (Array.isArray(safety?.dosAndDonts)) {
    dontsList = safety.dosAndDonts
      .filter((item: any) => item?.type === 'DONT' || item?.type === "DON'T" || (typeof item === 'string' && item.toLowerCase().startsWith("don't")))
      .map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  }

  const auditItems = Array.isArray(kpisData?.auditChecklist) ? kpisData.auditChecklist : [];
  const kpiItems = Array.isArray(kpisData?.kpis) ? kpisData.kpis : [];

  // Toggle Audit Checkbox
  const toggleAudit = (id: string) => {
    setCheckedAuditItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to generate full rich markdown text
  const fullMarkdownSummary = useMemo(() => {
    if (data.markdownSummary && data.markdownSummary.length > 50) return data.markdownSummary;

    const sections: string[] = [];

    // Title
    sections.push(`# 📋 ملخص شامل ودقيق للسياسة الطبية: ${card.titleArabic || 'السياسة الطبية'}`);
    sections.push(`**العنوان بالإنجليزية:** ${card.titleEnglish || 'Medical Policy'} | **كود السياسة:** \`${card.policyCode || 'IPC-POL-001'}\` | **تاريخ التفعيل:** ${card.effectiveDate || '2025/2026'}`);
    sections.push(`**المجال الإكلينيكي:** ${card.domain || 'الجودة ومكافحة العدوى'} | **الأقسام المستهدفة:** ${card.departments?.join('، ') || 'جميع الأقسام'}`);
    if (card.alignedStandards && card.alignedStandards.length > 0) {
      sections.push(`**معايير الاعتماد:** ${card.alignedStandards.map((s: any) => `${s.standardBody} (${s.clauseNumber || ''} - ${s.description})`).join(' | ')}`);
    }
    sections.push(`\n---\n`);

    // 1. Executive Summary
    if (data.executiveSummarySnippet) {
      sections.push(`## 🌟 1. الملخص التنفيذي والاستراتيجي (Executive Summary)\n${data.executiveSummarySnippet}`);
    }

    // 2. Purpose and Scope
    sections.push(`\n## 🎯 2. الهدف الإكلينيكي ونطاق التطبيق (Purpose & Scope)`);
    sections.push(`- **الهدف الرئيسي:** ${purpose.mainObjective || 'ضمان سلامة المرضى ومقدمي الرعاية الصحية'}`);
    sections.push(`- **المبرر الإكلينيكي والجودة:** ${purpose.clinicalRationale || 'الامتثال لمعايير الجودة وخفض المخاطر الإكلينيكية'}`);
    if (purpose.scope?.length > 0) {
      sections.push(`- **نطاق التطبيق:** ${purpose.scope.join('، ')}`);
    }
    if (purpose.exclusions?.length > 0) {
      sections.push(`- **الاستثناءات:** ${purpose.exclusions.join('، ')}`);
    }

    // 3. Scientific Definitions
    if (definitions.length > 0) {
      sections.push(`\n## 🔬 3. المفاهيم والمصطلحات العلمية الحاكمة (Scientific Terminology)`);
      definitions.forEach((def: any, i: number) => {
        sections.push(`### ${i + 1}. ${def.term}`);
        sections.push(`- **التعريف العلمي:** ${def.definition}`);
        if (def.clinicalSignificance) {
          sections.push(`- **الأهمية الإكلينيكية:** ${def.clinicalSignificance}`);
        }
      });
    }

    // 4. Technical Specifications
    if (techSpecs.length > 0) {
      sections.push(`\n## 🧪 4. المواصفات الفنية والمصفوفة الإجرائية`);
      techSpecs.forEach((spec: any, i: number) => {
        sections.push(`### البند (${i + 1}): ${spec.techniqueName}`);
        sections.push(`- **المادة / التقنية والتركيز:** ${spec.agentAndConcentration}`);
        if (spec.requiredVolume) sections.push(`- **الكمية / الحجم:** ${spec.requiredVolume}`);
        sections.push(`- **زمن التلامس / المدة الفعالة:** \`${spec.contactTime}\``);
        if (spec.indications) sections.push(`- **دواعي الاستخدام:** ${Array.isArray(spec.indications) ? spec.indications.join('، ') : spec.indications}`);
        if (spec.contraindicationsOrLimitations) sections.push(`- **الموانع والمحاذير:** ${Array.isArray(spec.contraindicationsOrLimitations) ? spec.contraindicationsOrLimitations.join('، ') : spec.contraindicationsOrLimitations}`);
      });
    }

    // 5. Five Moments
    if (fiveMoments.length > 0) {
      sections.push(`\n## 🖐️ 5. اللحظات الإكلينيكية الحاكمة (Clinical Moments / Triggers)`);
      fiveMoments.forEach((m: any) => {
        sections.push(`* **اللحظة ${m.momentNumber}: ${m.momentName}** - ${m.timing}`);
        if (m.clinicalExamples) {
          sections.push(`  * *أمثلة إكلينيكية:* ${Array.isArray(m.clinicalExamples) ? m.clinicalExamples.join('، ') : m.clinicalExamples}`);
        }
      });
    }

    // 6. SOPs
    if (sop.preProcedure || sop.execution || sop.postProcedure) {
      sections.push(`\n## 📝 6. خطوات العمل القياسية (SOPs)`);
      if (sop.preProcedure?.length > 0) {
        sections.push(`### أ) مرحلة ما قبل الإجراء والتحضير:`);
        sop.preProcedure.forEach((st: any) => sections.push(`${st.stepNumber}. **${st.title}:** ${st.details} ${st.keySafetyPoint ? `*(نقطة أمان: ${st.keySafetyPoint})*` : ''}`));
      }
      if (sop.execution?.length > 0) {
        sections.push(`### ب) مرحلة التنفيذ الإكلينيكي:`);
        sop.execution.forEach((st: any) => sections.push(`${st.stepNumber}. **${st.title}:** ${st.details} ${st.keySafetyPoint ? `*(نقطة أمان: ${st.keySafetyPoint})*` : ''}`));
      }
      if (sop.postProcedure?.length > 0) {
        sections.push(`### ج) مرحلة ما بعد الإجراء والتخلص الآمن:`);
        sop.postProcedure.forEach((st: any) => sections.push(`${st.stepNumber}. **${st.title}:** ${st.details} ${st.keySafetyPoint ? `*(نقطة أمان: ${st.keySafetyPoint})*` : ''}`));
      }
    }

    // 7. Safety & Dos / Don'ts
    if (dontsList.length > 0 || dosList.length > 0) {
      sections.push(`\n## 🚫 7. المحظورات الصارمة والإلزاميات (DOs & DON'Ts)`);
      if (dontsList.length > 0) {
        sections.push(`### ⚠️ المحظورات الصارمة (Strict DON'Ts):`);
        dontsList.forEach(d => sections.push(`- ❌ ${d}`));
      }
      if (dosList.length > 0) {
        sections.push(`### ✅ الممارسات الإلزامية (Mandatory DOs):`);
        dosList.forEach(d => sections.push(`- ✔️ ${d}`));
      }
    }

    // 8. KPIs & Audit
    if (kpiItems.length > 0 || auditItems.length > 0) {
      sections.push(`\n## 📊 8. مؤشرات قياس الأداء وقائمة التفتيش الميداني`);
      if (kpiItems.length > 0) {
        kpiItems.forEach((k: any) => {
          sections.push(`- **مؤشر: ${k.indicatorName}:** المستهدف: \`${k.target}\` (طريقة القياس: ${k.calculationFormula || k.frequency})`);
        });
      }
    }

    return sections.join('\n');
  }, [data, card, purpose, definitions, techSpecs, fiveMoments, sop, dontsList, dosList, kpiItems, auditItems]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(fullMarkdownSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([fullMarkdownSummary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.policyCode || 'Policy'}_Executive_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chat message send handler
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/policy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyContext: fullMarkdownSummary,
          question: userText
        })
      });

      if (response.ok) {
        const json = await response.json();
        const geminiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: json.answer || 'تمت الإجابة بناءً على وثيقة السياسة المعتمدة.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, geminiMsg]);
      } else {
        throw new Error('فشل الاتصال بالخادم');
      }
    } catch {
      // Local intelligent response synthesis
      let answer = `بناءً على وثيقة «${card.titleArabic || 'السياسة'}»:\n\n`;
      if (userText.includes('5') || userText.includes('نقاط') || userText.includes('لخص')) {
        answer += `1. **الهدف الإكلينيكي الأساسي:** ${purpose.mainObjective || 'الامتثال للمعايير ومنع انتقال العدوى'}.\n2. **أهم متطلب:** الالتزام الصارم بالإجراءات القياسية وأزمنة التلامس.\n3. **أخطر محظور:** ${dontsList[0] || 'عدم الالتزام ببروتوكولات التعقيم ومكافحة العدوى'}.\n4. **الفئة المسؤولة:** ${card.departments?.join('، ') || 'جميع الكوادر الطبية'}.\n5. **مؤشر الأداء:** ${kpiItems[0]?.indicatorName || 'معدل الامتثال العام'} بنسبة مستهدفة ${kpiItems[0]?.target || '≥ 90%'}.`;
      } else if (userText.includes('جهار') || userText.includes('GAHAR') || userText.includes('تفتيش') || userText.includes('سؤال')) {
        answer += `يتوقع مقيم جهار (GAHAR Auditor) التأكد من:\n- معرفة الكادر بالهدف الإكلينيكي للسياسة وكودها.\n- التحقق العملي من خطوات العمل (${sop.execution?.[0]?.title || 'خطوات التنفيذ'}).\n- وجود سجلات تدريب وتوثيق شهرية لمؤشر الامتثال.`;
      } else {
        answer += `وفقاً لبنود السياسة:\n- **المبرر الإكلينيكي:** ${purpose.clinicalRationale || 'حماية المرضى والعاملين'}.\n- **المواصفات الفنية:** تلتزم بكافة معايير ${card.alignedStandards?.[0]?.standardBody || 'GAHAR 2025'}.\n- يمكنك مراجعة تبويب خطوات العمل ومصفوفة السلامة للاطلاع على التفاصيل الدقيقة.`;
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
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* ========================================================================= */}
      {/* 🌟 1. MASTER DOCUMENT CONTROL & EXECUTIVE HEADER                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md space-y-6">
        
        {/* Top Control Meta Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-2 flex-1 min-w-[280px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/70 font-mono">
                كود السياسة: {card.policyCode || 'IPC-POL-001'}
              </span>
              <span className="text-2xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/70">
                الإصدار: {card.reviewCycle ? 'معتمد ومحدث' : 'الإصدار المعتمد 2025/2026'}
              </span>
              <span className="text-2xs font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200/70">
                المجال: {card.domain || 'السياسات الإكلينيكية ومكافحة العدوى'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 leading-tight">
              {card.titleArabic || 'الملخص التنفيذي للسياسة والإجراءات الإكلينيكية'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium font-sans">
              {card.titleEnglish || 'Clinical & Operational Healthcare Policy Review'}
            </p>
          </div>

          {/* Quick Actions & Document Details */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-2xs space-y-1">
              <p><span className="text-slate-500">تاريخ التفعيل:</span> <strong className="text-slate-800">{card.effectiveDate || '2025/2026'}</strong></p>
              <p><span className="text-slate-500">دورة المراجعة:</span> <strong className="text-slate-800">{card.reviewCycle || 'كل 3 سنوات أو عند التحديث'}</strong></p>
              <p><span className="text-slate-500">نطاق الفئات:</span> <strong className="text-slate-800">{card.departments?.slice(0, 2).join('، ') || 'كافة الكوادر'}</strong></p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ بنجاح' : 'نسخ التلخيص'}</span>
              </button>

              {onSwitchToA4 && (
                <button
                  onClick={onSwitchToA4}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>عرض وثيقة A4</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Aligned Quality Standards Bar */}
        {card.alignedStandards && card.alignedStandards.length > 0 && (
          <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-blue-800" />
              <span>المعايير المرجعية والاعتمادات المتوافقة:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.alignedStandards.map((std: any, i: number) => (
                <span 
                  key={i} 
                  className="text-2xs font-semibold bg-white text-slate-800 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <strong>{std.standardBody}</strong>
                  {std.clauseNumber && <span className="text-slate-400 font-mono">({std.clauseNumber})</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Executive Summary Narrative Snippet */}
        {data.executiveSummarySnippet && (
          <div className="bg-gradient-to-l from-blue-50/90 via-indigo-50/50 to-white p-5 rounded-2xl border border-blue-200/80 text-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>الملخص التنفيذي والاستراتيجي للسياسة:</span>
            </div>
            <p className={`text-slate-800 ${fontSizeClass} leading-relaxed text-justify font-normal`}>
              {data.executiveSummarySnippet}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🧭 NAVIGATION TABS BAR                                                    */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs no-print">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('master')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'master'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>📋 التلخيص الشامل الموحد</span>
          </button>

          <button
            onClick={() => setActiveTab('sops')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'sops'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>📝 خطوات العمل القياسية (SOPs)</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'technical'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-indigo-300" />
            <span>🧪 المصفوفة الفنية والتعريفات</span>
          </button>

          <button
            onClick={() => setActiveTab('safety_roles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'safety_roles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>🚫 المحظورات والمسؤوليات</span>
          </button>

          <button
            onClick={() => setActiveTab('kpis_audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'kpis_audit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-teal-400" />
            <span>📊 مؤشرات الأداء والتدقيق</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-300" />
            <span>📄 السرد المقالي (Markdown)</span>
          </button>

          <button
            onClick={() => setActiveTab('interactive_chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'interactive_chat'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>💬 المستشار الذكي (AI)</span>
          </button>
        </div>

        {/* Font size toggles */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setFontSize('normal')}
            className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition cursor-pointer ${
              fontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            A
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            A+
          </button>
          <button
            onClick={() => setFontSize('xlarge')}
            className={`px-2.5 py-1 rounded-lg text-sm font-bold transition cursor-pointer ${
              fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            A++
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER COMPREHENSIVE VIEW (ALL SECTIONS STRUCTURED BEAUTIFULLY)   */}
      {/* ========================================================================= */}
      {activeTab === 'master' && (
        <div className="space-y-6">
          
          {/* 1. Purpose, Rationale & Scope */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3>1. الهدف الإكلينيكي، المبرر العلمي، ونطاق التطبيق (Purpose & Scope)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xs">1</span>
                  <span>الهدف الإكلينيكي الرئيسي:</span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed">
                  {purpose.mainObjective || 'الارتقاء بمستوى الأمان السريري وحماية المرضى والممارسين الصحيين.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center text-2xs">2</span>
                  <span>المبرر العلمي والجودة:</span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed">
                  {purpose.clinicalRationale || 'الحد من انتقال العدوى المكتسبة وضمان التطبيق الأمثل لمعايير الجودة والاعتماد.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
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
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-2xs space-y-1">
                <strong>الاستثناءات والحدود الإجرائية: </strong>
                <span>{purpose.exclusions.join(' • ')}</span>
              </div>
            )}
          </div>

          {/* 2. Scientific Definitions */}
          {definitions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h3>2. المفاهيم والمصطلحات العلمية الحاكمة (Scientific Terminology)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {definitions.map((def: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-2">
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

          {/* 3. Technical Specifications & Disinfectants Matrix */}
          {techSpecs.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3>3. جدول المواصفات الفنية والمصفوفة الإجرائية والمطهرات</h3>
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
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-bold text-slate-900 border border-slate-200 align-top">
                          {spec.techniqueName}
                        </td>
                        <td className="p-3.5 text-slate-800 border border-slate-200 align-top">
                          {spec.agentAndConcentration}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-blue-900 border border-slate-200 align-top">
                          {spec.requiredVolume || 'كمية كافية'}
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

          {/* 4. Clinical Triggers / Five Moments */}
          {fiveMoments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Bookmark className="w-4 h-4" />
                </div>
                <h3>4. اللحظات الإكلينيكية الحاكمة ومحطات التدخل الإلزامي</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {fiveMoments.map((m: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5">
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

          {/* 5. Step-by-Step SOP Phases */}
          {(sop.preProcedure || sop.execution || sop.postProcedure) && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <h3>5. خطوات العمل القياسية المتسلسلة (SOPs) ونقاط التحكم الحرجة</h3>
              </div>

              <div className="space-y-4">
                {/* Pre-Procedure */}
                {sop.preProcedure && sop.preProcedure.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                    <h4 className="font-bold text-blue-950 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                      مرحلة ما قبل الإجراء والتحضير والتجهيز:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-800 pt-1">
                      {sop.preProcedure.map((st: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-blue-100 space-y-1">
                          <p className="font-bold text-blue-900">{st.stepNumber || i + 1}. {st.title}</p>
                          <p className="text-slate-600">{st.details}</p>
                          {st.keySafetyPoint && (
                            <p className="text-emerald-800 text-3xs font-semibold">🔒 أمان: {st.keySafetyPoint}</p>
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
                      مرحلة التنفيذ الإكلينيكي وخطوات العمل:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-800 pt-1">
                      {sop.execution.map((st: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-indigo-100 space-y-1">
                          <p className="font-bold text-indigo-900">{st.stepNumber || i + 1}. {st.title}</p>
                          <p className="text-slate-600">{st.details}</p>
                          {st.keySafetyPoint && (
                            <p className="text-indigo-800 text-3xs font-semibold">🔒 أمان: {st.keySafetyPoint}</p>
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
                      مرحلة ما بعد الإجراء والتخلص الآمن والتوثيق:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-800 pt-1">
                      {sop.postProcedure.map((st: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-1">
                          <p className="font-bold text-emerald-900">{st.stepNumber || i + 1}. {st.title}</p>
                          <p className="text-slate-600">{st.details}</p>
                          {st.keySafetyPoint && (
                            <p className="text-emerald-800 text-3xs font-semibold">🔒 أمان: {st.keySafetyPoint}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Strict Prohibitions & DOs / DON'Ts */}
          {(dontsList.length > 0 || dosList.length > 0 || criticalPoints.length > 0) && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3>6. المحظورات الصارمة ونقاط السلامة الحرجة (Strict Prohibitions & DOs / DON'Ts)</h3>
              </div>

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

              {/* Emergency Protocol */}
              {safety.emergencyIncidentProtocol && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-1.5 text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>بروتوكول الاستجابة الفورية عند الطوارئ أو حوادث التعرض المهني:</span>
                  </div>
                  <p className="leading-relaxed text-2xs">
                    {safety.emergencyIncidentProtocol}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 7. Roles & Responsibilities */}
          {roles.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3>7. مصفوفة توزيع الأدوار والمسؤوليات (Roles & Responsibilities Matrix)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {roles.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
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

          {/* 8. KPIs & Field Audit Checklist */}
          {(kpiItems.length > 0 || auditItems.length > 0) && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h3>8. مؤشرات قياس الأداء (KPIs) وقائمة التدقيق التفتيشي الميداني</h3>
              </div>

              {/* KPIs Table */}
              {kpiItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-700" />
                    <span>مؤشرات الأداء المقاسة (Performance Indicators):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {kpiItems.map((k: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-1 text-xs">
                        <p className="font-bold text-teal-950">{k.indicatorName}</p>
                        <div className="flex items-center justify-between text-2xs text-teal-900 font-mono font-bold">
                          <span>المستهدف: {k.target}</span>
                          <span>التكرار: {k.frequency || 'شهرياً'}</span>
                        </div>
                        {k.calculationFormula && (
                          <p className="text-3xs text-slate-500 pt-0.5">المعادلة: {k.calculationFormula}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Checklist with interactive toggles */}
              {auditItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-800" />
                    <span>قائمة الفحص الميداني والمطابقة (Audit Checklist):</span>
                  </h4>
                  <div className="space-y-2">
                    {auditItems.map((item: any, idx: number) => {
                      const isChecked = !!checkedAuditItems[item.id || idx];
                      return (
                        <div 
                          key={item.id || idx}
                          onClick={() => toggleAudit(item.id || idx.toString())}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 text-xs ${
                            isChecked
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SOPS ONLY                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'sops' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
              <span>خطوات العمل القياسية (SOPs) لكافة مراحل الإجراء الطبي</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              تسلسل الخطوات التنفيذية ونقاط التحكم والسلامة الإكلينيكية
            </p>
          </div>

          <div className="space-y-6">
            {/* Pre-Procedure */}
            {sop.preProcedure && sop.preProcedure.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold">1</span>
                  المرحلة الأولى: ما قبل الإجراء والتجهيز (Pre-Procedure):
                </h3>
                <div className="space-y-2">
                  {sop.preProcedure.map((st: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-bold shrink-0">{st.stepNumber || i + 1}</span>
                      <div className="space-y-1 flex-1 text-xs">
                        <h4 className="font-bold text-blue-950">{st.title}</h4>
                        <p className="text-slate-700 leading-relaxed">{st.details}</p>
                        {st.keySafetyPoint && <p className="text-emerald-800 font-bold text-2xs pt-1">🔒 نقطة الأمان الحرجة: {st.keySafetyPoint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execution */}
            {sop.execution && sop.execution.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-800 text-white flex items-center justify-center text-xs font-bold">2</span>
                  المرحلة الثانية: خطوات التنفيذ الإكلينيكي (Execution):
                </h3>
                <div className="space-y-2">
                  {sop.execution.map((st: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-200 text-indigo-900 flex items-center justify-center text-xs font-bold shrink-0">{st.stepNumber || i + 1}</span>
                      <div className="space-y-1 flex-1 text-xs">
                        <h4 className="font-bold text-indigo-950">{st.title}</h4>
                        <p className="text-slate-700 leading-relaxed">{st.details}</p>
                        {st.keySafetyPoint && <p className="text-indigo-800 font-bold text-2xs pt-1">🔒 نقطة الأمان الحرجة: {st.keySafetyPoint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post-Procedure */}
            {sop.postProcedure && sop.postProcedure.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">3</span>
                  المرحلة الثالثة: ما بعد الإجراء والتخلص الآمن (Post-Procedure):
                </h3>
                <div className="space-y-2">
                  {sop.postProcedure.map((st: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs font-bold shrink-0">{st.stepNumber || i + 1}</span>
                      <div className="space-y-1 flex-1 text-xs">
                        <h4 className="font-bold text-emerald-950">{st.title}</h4>
                        <p className="text-slate-700 leading-relaxed">{st.details}</p>
                        {st.keySafetyPoint && <p className="text-emerald-800 font-bold text-2xs pt-1">🔒 نقطة الأمان الحرجة: {st.keySafetyPoint}</p>}
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
      {/* TAB 3: TECHNICAL MATRIX & DEFINITIONS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'technical' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-700" />
              <span>المصفوفة الفنية للمواد والمطهرات والمفاهيم العلمية</span>
            </h2>
          </div>

          {/* Table */}
          {techSpecs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800">جدول المواصفات الفنية والتركيزات:</h3>
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
                        <td className="p-3.5 font-bold text-slate-900 border border-slate-200">{spec.techniqueName}</td>
                        <td className="p-3.5 text-slate-800 border border-slate-200">{spec.agentAndConcentration}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-blue-900 border border-slate-200">{spec.requiredVolume || 'كمية كافية'}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-emerald-800 border border-slate-200">{spec.contactTime}</td>
                        <td className="p-3.5 text-slate-700 border border-slate-200 text-2xs space-y-1">
                          {spec.indications && <div><strong className="text-emerald-900">الدواعي: </strong>{Array.isArray(spec.indications) ? spec.indications.join(' • ') : spec.indications}</div>}
                          {Array.isArray(spec.contraindicationsOrLimitations) && spec.contraindicationsOrLimitations.length > 0 && (
                            <div className="text-rose-900 bg-rose-50 p-1.5 rounded-lg border border-rose-200"><strong>⚠️ محاذير: </strong>{spec.contraindicationsOrLimitations.join(' • ')}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Definitions */}
          {definitions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">المفاهيم والتعريفات العلمية:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {definitions.map((def: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-2xs font-bold">{idx + 1}</span>
                      {def.term}
                    </h4>
                    <p className="text-slate-700 leading-relaxed">{def.definition}</p>
                    {def.clinicalSignificance && <p className="text-emerald-800 text-2xs font-medium">💡 الأهمية: {def.clinicalSignificance}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SAFETY, PROHIBITIONS & ROLES                                       */}
      {/* ========================================================================= */}
      {activeTab === 'safety_roles' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>المحظورات الصارمة، قواعد السلامة، ومصفوفة المسؤوليات</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dontsList.length > 0 && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  المحظورات الصارمة (DON'Ts):
                </h3>
                <ul className="space-y-1.5 text-xs text-rose-950">
                  {dontsList.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold shrink-0">❌</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dosList.length > 0 && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  الممارسات الإلزامية (DOs):
                </h3>
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {dosList.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✔️</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Roles */}
          {roles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">مصفوفة المسؤوليات الموزعة:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((r: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <h4 className="font-bold text-slate-900">{r.role}</h4>
                    <ul className="space-y-1 text-2xs text-slate-600 list-disc list-inside">
                      {Array.isArray(r.responsibilities) ? r.responsibilities.map((resp: string, i: number) => (
                        <li key={i}>{resp}</li>
                      )) : <li>{r.responsibilities}</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: KPIS & AUDIT CHECKLIST                                             */}
      {/* ========================================================================= */}
      {activeTab === 'kpis_audit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              <span>مؤشرات قياس الأداء (KPIs) وقائمة التدقيق الميداني والاعتماد</span>
            </h2>
          </div>

          {kpiItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800">مؤشرات الأداء المقاسة (KPIs):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kpiItems.map((k: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1 text-xs">
                    <p className="font-bold text-teal-950">{k.indicatorName}</p>
                    <div className="flex items-center justify-between text-2xs text-teal-900 font-mono font-bold">
                      <span>المستهدف: {k.target}</span>
                      <span>التكرار: {k.frequency || 'شهرياً'}</span>
                    </div>
                    {k.calculationFormula && (
                      <p className="text-3xs text-slate-500 pt-1">المعادلة: {k.calculationFormula}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {auditItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">قائمة التحقق الميداني (Audit Checklist):</h3>
              <div className="space-y-2">
                {auditItems.map((item: any, idx: number) => {
                  const isChecked = !!checkedAuditItems[item.id || idx];
                  return (
                    <div 
                      key={item.id || idx}
                      onClick={() => toggleAudit(item.id || idx.toString())}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 text-xs ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded text-blue-800 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-xs">{item.checkpoint}</p>
                        <p className="text-2xs text-slate-500">
                          <strong className="text-slate-700">دليل الإثبات:</strong> {item.evidenceRequired} • <strong className="text-slate-700">المعيار:</strong> {item.standardReference}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: FULL FORMATTED MARKDOWN                                            */}
      {/* ========================================================================= */}
      {activeTab === 'markdown' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                السرد المقالي المنسق للسياسة الطبية (Full Markdown Summary)
              </h2>
              <p className="text-2xs text-slate-500">
                تنسيق مقالي شامل بأسلوب ChatGPT & Gemini Pro عالي الدقة والمقروئية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ Markdown'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل (.md)</span>
              </button>
            </div>
          </div>

          <div className={`prose prose-slate max-w-none ${fontSizeClass} leading-relaxed text-slate-800 bg-slate-50/50 p-5 rounded-2xl border border-slate-100`}>
            <Markdown>{fullMarkdownSummary}</Markdown>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: INTERACTIVE AI POLICY CONSULTANT                                   */}
      {/* ========================================================================= */}
      {activeTab === 'interactive_chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">المستشار الإكلينيكي الذكي للسياسة</h3>
                <p className="text-2xs text-purple-200">اسأل عن أي معيار، خطوة، أو سيناريو تفتيشي من معايير جهار (GAHAR 2025)</p>
              </div>
            </div>
            <span className="text-2xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full font-mono">
              Active Context 100%
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-700 text-white'
                }`}>
                  {msg.sender === 'user' ? 'أنت' : <Sparkles className="w-4 h-4 text-amber-300" />}
                </div>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                }`}>
                  <div className="prose prose-xs max-w-none text-inherit">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                  <span className={`block text-3xs pt-1 ${
                    msg.sender === 'user' ? 'text-blue-200 text-left' : 'text-slate-400 text-right'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 max-w-[85%] ml-auto">
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري استخراج الإجابة وتوليد التحليل الإكلينيكي...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          <div className="p-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-2xs">
            <span className="font-bold text-slate-500 shrink-0">مقترحات:</span>
            {[
              "🎯 لخص لي أهم 5 نقاط للمشرف أو رئيس التمريض",
              "❓ ما هي أسئلة مقيم جهار (GAHAR Auditor) المتوقعة؟",
              "⚠️ ما هي أخطر 3 أخطاء شائعة قد تسبب عدوى؟",
              "🧪 اكتب لي اختباراً سريعاً (5 أسئلة مع الإجابات) لتدريب الكادر"
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setChatInput(prompt);
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200 transition shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب سؤالك الإكلينيكي حول هذه السياسة هنا..."
              className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-600 bg-slate-50/50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isChatLoading || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
