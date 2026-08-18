import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Download, 
  MessageSquare, 
  Send, 
  FileText, 
  ShieldAlert, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  Flame,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  ZoomIn,
  ZoomOut,
  Layers,
  BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';
import { PolicyAnalysisResult } from '../types';

interface GeminiStyleSummaryProps {
  data: PolicyAnalysisResult;
  onSwitchToA4?: () => void;
  onSwitchToDashboard?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export function GeminiStyleSummary({ data, onSwitchToA4, onSwitchToDashboard }: GeminiStyleSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [activeSection, setActiveSection] = useState<string>('all');
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `مرحباً بك! أنا مساعد الذكاء الاصطناعي الإكلينيكي (Gemini Policy AI). لقد قمت بتحليل وتلخيص وثيقة **${data.policyCard.titleArabic}** بدقة متناهية وفق معايير جهار 2025 والدليل القومي.\n\nيمكنك قراءة التلخيص الشامل أدناه، أو طرح أي سؤال مخصص حول بنود السياسة، سيناريوهات العمل، أو أسئلة المقيمين وسأجيبك فوراً!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested Prompts for Quick AI interaction
  const suggestedPrompts = [
    "🎯 لخص لي أهم 5 نقاط للمشرف أو رئيس التمريض",
    "❓ ما هي أسئلة مقيم جهار (GAHAR Auditor) المتوقعة حول هذه السياسة؟",
    "⚠️ ما هي أخطر 3 أخطاء شائعة قد تسبب عدوى أو فشل اعتماد؟",
    "🧪 اكتب لي اختباراً سريعاً (5 أسئلة مع الإجابات) لتدريب الكادر",
    "📋 خطة تدريب وتطبيق عملية للسياسة في 30 يوماً"
  ];

  // Helper to generate full rich markdown text
  const fullMarkdownSummary = useMemo(() => {
    if (data.markdownSummary) return data.markdownSummary;

    const sections: string[] = [];

    // Title
    sections.push(`# 📋 ملخص شامل ودقيق للسياسة الطبية: ${data.policyCard.titleArabic}`);
    sections.push(`**العنوان بالإنجليزية:** ${data.policyCard.titleEnglish} | **كود السياسة:** \`${data.policyCard.policyCode || 'IPC-POL-01'}\` | **تاريخ التفعيل:** ${data.policyCard.effectiveDate || '2025/2026'}`);
    sections.push(`**المجال الإكلينيكي:** ${data.policyCard.domain} | **الأقسام المستهدفة:** ${data.policyCard.departments.join('، ')}`);
    sections.push(`**معايير الاعتماد المتوافقة:** ${data.policyCard.alignedStandards.map(s => `${s.standardBody} (${s.clauseNumber || ''} - ${s.description})`).join(' | ')}`);
    sections.push(`\n---\n`);

    // 1. Executive Summary
    sections.push(`## 🌟 1. الملخص التنفيذي والاستراتيجي (Executive Summary)\n${data.executiveSummarySnippet}`);

    // 2. Purpose and Scope
    sections.push(`\n## 🎯 2. الهدف الإكلينيكي ونطاق التطبيق (Purpose & Scope)`);
    sections.push(`- **الهدف الرئيسي:** ${data.purposeAndScope.mainObjective}`);
    sections.push(`- **المبرر الإكلينيكي والجودة:** ${data.purposeAndScope.clinicalRationale}`);
    sections.push(`- **نطاق التطبيق والفئات:** ${data.purposeAndScope.scope.join('، ')}`);
    if (data.purposeAndScope.exclusions && data.purposeAndScope.exclusions.length > 0) {
      sections.push(`- **الاستثناءات:** ${data.purposeAndScope.exclusions.join('، ')}`);
    }

    // 3. Scientific Definitions
    if (data.scientificDefinitions && data.scientificDefinitions.length > 0) {
      sections.push(`\n## 🔬 3. المفاهيم والمصطلحات العلمية الحاكمة (Scientific Concepts)`);
      data.scientificDefinitions.forEach((def, i) => {
        sections.push(`### ${i + 1}. ${def.term}`);
        sections.push(`- **التعريف العلمي:** ${def.definition}`);
        if (def.clinicalSignificance) {
          sections.push(`- **الأهمية الإكلينيكية:** ${def.clinicalSignificance}`);
        }
      });
    }

    // 4. Technical Specifications
    if (data.technicalSpecifications && data.technicalSpecifications.length > 0) {
      sections.push(`\n## 🧪 4. المواصفات الفنية للمطهرات والتقنيات (Technical Specifications)`);
      data.technicalSpecifications.forEach((spec, i) => {
        sections.push(`### تقنية (${i + 1}): ${spec.techniqueName}`);
        sections.push(`- **المادة الفعالة والتركيز:** ${spec.agentAndConcentration}`);
        if (spec.requiredVolume) sections.push(`- **الكمية / الحجم المطلوب:** ${spec.requiredVolume}`);
        sections.push(`- **زمن التلامس الفعال (Contact Time):** \`${spec.contactTime}\``);
        sections.push(`- **دواعي الاستخدام:**\n${spec.indications.map(ind => `  * ${ind}`).join('\n')}`);
        if (spec.contraindicationsOrLimitations && spec.contraindicationsOrLimitations.length > 0) {
          sections.push(`- **الموانع والمحددات:**\n${spec.contraindicationsOrLimitations.map(con => `  * ⚠️ ${con}`).join('\n')}`);
        }
      });
    }

    // 5. Five Moments
    if (data.fiveMomentsDetails && data.fiveMomentsDetails.length > 0) {
      sections.push(`\n## 🖐️ 5. اللحظات الخمس لنظافة الأيدي (WHO 5 Moments of Hand Hygiene)`);
      data.fiveMomentsDetails.forEach(m => {
        sections.push(`### اللحظة رقم ${m.momentNumber}: ${m.momentName}`);
        sections.push(`- **التوقيت السريري:** ${m.timing}`);
        sections.push(`- **أمثلة تطبيقية واقعية:** ${m.clinicalExamples.join('، ')}`);
      });
    }

    // 6. Skin and Gloves
    if (data.skinAndGloveCare) {
      sections.push(`\n## 🧤 6. ضوابط القفازات، حماية الجلد، وخلو الساعدين (Skin & Glove Care)`);
      if (data.skinAndGloveCare.gloveProtocols?.length) {
        sections.push(`### بروتوكول استخدام القفازات:\n${data.skinAndGloveCare.gloveProtocols.map(g => `- ${g}`).join('\n')}`);
      }
      if (data.skinAndGloveCare.skinProtectionAndDermatitis?.length) {
        sections.push(`### حماية الجلد والوقاية من التهاب الجلد التماسي:\n${data.skinAndGloveCare.skinProtectionAndDermatitis.map(s => `- ${s}`).join('\n')}`);
      }
      if (data.skinAndGloveCare.jewelryAndNailRegulations?.length) {
        sections.push(`### ضوابط الأظافر، الحلي، والمجوهرات (Bare Below Elbows):\n${data.skinAndGloveCare.jewelryAndNailRegulations.map(j => `- ${j}`).join('\n')}`);
      }
    }

    // 7. Infrastructure
    if (data.infrastructureRequirements) {
      sections.push(`\n## 🏢 7. اشتراطات البنية التحتية والمستلزمات (Infrastructure & Equipment)`);
      if (data.infrastructureRequirements.sinkSpecifications?.length) {
        sections.push(`### مواصفات الأحواض:\n${data.infrastructureRequirements.sinkSpecifications.map(s => `- ${s}`).join('\n')}`);
      }
      if (data.infrastructureRequirements.dispenserAndConsumables?.length) {
        sections.push(`### الموزعات والمستهلكات:\n${data.infrastructureRequirements.dispenserAndConsumables.map(d => `- ${d}`).join('\n')}`);
      }
      if (data.infrastructureRequirements.maintenanceAndRefillRules?.length) {
        sections.push(`### قواعد الصيانة وحظر إعادة الملء (Zero Top-up):\n${data.infrastructureRequirements.maintenanceAndRefillRules.map(r => `- ${r}`).join('\n')}`);
      }
    }

    // 8. SOPs
    sections.push(`\n## 📝 8. خطوات التشغيل القياسية المتسلسلة (Standard Operating Procedures)`);
    if (data.sopPhases.preProcedure?.length) {
      sections.push(`### أولاً: مرحلة ما قبل الإجراء (Pre-Procedure)`);
      data.sopPhases.preProcedure.forEach(s => {
        sections.push(`**${s.stepNumber}. ${s.title}** (${s.assignedTo || 'الممارس الصحي'})\n- التفاصيل: ${s.details}${s.keySafetyPoint ? `\n- 🛡️ نقطة أمان حرجة: **${s.keySafetyPoint}**` : ''}`);
      });
    }
    if (data.sopPhases.execution?.length) {
      sections.push(`\n### ثانياً: مرحلة التنفيذ الإكلينيكي (Execution Phase)`);
      data.sopPhases.execution.forEach(s => {
        sections.push(`**${s.stepNumber}. ${s.title}** (${s.assignedTo || 'الممارس الصحي'})\n- التفاصيل: ${s.details}${s.keySafetyPoint ? `\n- 🛡️ نقطة أمان حرجة: **${s.keySafetyPoint}**` : ''}`);
      });
    }
    if (data.sopPhases.postProcedure?.length) {
      sections.push(`\n### ثالثاً: مرحلة ما بعد الإجراء والتطهير (Post-Procedure)`);
      data.sopPhases.postProcedure.forEach(s => {
        sections.push(`**${s.stepNumber}. ${s.title}** (${s.assignedTo || 'الممارس الصحي'})\n- التفاصيل: ${s.details}${s.keySafetyPoint ? `\n- 🛡️ نقطة أمان حرجة: **${s.keySafetyPoint}**` : ''}`);
      });
    }

    // 9. Roles and Responsibilities
    if (data.rolesAndResponsibilities?.length) {
      sections.push(`\n## 👥 9. مصفوفة المسؤوليات وتوزيع الأدوار (Roles & Responsibilities)`);
      data.rolesAndResponsibilities.forEach(r => {
        sections.push(`### الدور: ${r.role}\n${r.responsibilities.map(res => `- ${res}`).join('\n')}`);
      });
    }

    // 10. Safety Warnings & DOs / DON'Ts
    sections.push(`\n## ⚠️ 10. مصفوفة المحظورات والإلزاميات ونقاط التحكم الحرجة`);
    if (data.safetyWarningsAndCriticalSteps.criticalControlPoints?.length) {
      sections.push(`### نقاط التحكم الحرجة (Critical Control Points):\n${data.safetyWarningsAndCriticalSteps.criticalControlPoints.map(c => `- 🔴 ${c}`).join('\n')}`);
    }
    if (data.safetyWarningsAndCriticalSteps.dos?.length) {
      sections.push(`### الممارسات الإلزامية (DOs):\n${data.safetyWarningsAndCriticalSteps.dos.map(d => `- ✅ ${d}`).join('\n')}`);
    }
    if (data.safetyWarningsAndCriticalSteps.donts?.length) {
      sections.push(`### المحظورات الصارمة (DON'Ts):\n${data.safetyWarningsAndCriticalSteps.donts.map(d => `- ❌ ${d}`).join('\n')}`);
    }
    sections.push(`### بروتوكول الاستجابة الفورية والحوادث:\n${data.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol}`);

    // 11. Audit and KPIs
    if (data.complianceAndKPIs) {
      sections.push(`\n## 📊 11. معايير التدقيق ومؤشرات الأداء المقاسة (Audit & KPIs)`);
      if (data.complianceAndKPIs.auditChecklist?.length) {
        sections.push(`### بنود التفتيش الميداني:\n${data.complianceAndKPIs.auditChecklist.map(item => `- [${item.id}] **${item.checkpoint}** (المرجع: ${item.standardReference} | الدليل: ${item.evidenceRequired})`).join('\n')}`);
      }
      if (data.complianceAndKPIs.kpis?.length) {
        sections.push(`### مؤشرات الأداء (KPIs):\n${data.complianceAndKPIs.kpis.map(kpi => `- **${kpi.name}**: المعادلة: \`${kpi.formula}\` | المستهدف: **${kpi.target}** (${kpi.frequency})`).join('\n')}`);
      }
      if (data.complianceAndKPIs.gapAnalysisAndRecommendations?.length) {
        sections.push(`### التوصيات وفرص التحسين:\n${data.complianceAndKPIs.gapAnalysisAndRecommendations.map(gap => `- 💡 ${gap}`).join('\n')}`);
      }
    }

    return sections.join('\n');
  }, [data]);

  // Copy Markdown or Formatted text
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMarkdownSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  // Download text / markdown
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fullMarkdownSummary], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `تلخيص_${data.policyCard.titleArabic.replace(/\s+/g, '_')}_Gemini.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Send question to AI assistant
  const handleSendMessage = async (customText?: string) => {
    const questionToSend = customText || chatInput;
    if (!questionToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: questionToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsChatLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const response = await fetch('/api/ask-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyData: data,
          question: questionToSend.trim()
        })
      });

      if (!response.ok) throw new Error('فشل الحصول على رد من الذكاء الاصطناعي');
      const result = await response.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: result.answer || 'تمت معالجة استفسارك وفق المعايير المعتمدة.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: `عذراً، حدث خطأ أثناء الاستجابة: ${err.message || 'يرجى إعادة المحاولة'}. بناءً على السياسة، يجب الالتزام الصارم بالإجراءات القياسية المعتمدة.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const fontSizeClass = {
    normal: 'text-sm leading-relaxed',
    large: 'text-base leading-relaxed',
    xlarge: 'text-lg leading-loose'
  }[fontSize];

  return (
    <div className="space-y-6">
      {/* Top Gemini/ChatGPT Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-inner ring-2 ring-blue-400/30">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ملخص الذكاء الاصطناعي الشامل (ChatGPT & Gemini Pro)
              </h2>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-2xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                Gemini 3.7 Flash Engine
              </span>
            </div>
            <p className="text-2xs sm:text-xs text-slate-300 mt-0.5">
              تحليل وتلخيص إكلينيكي مفصل وشامل 100% يغطي جميع بنود السياسة مع إمكانية المحادثة التفاعلية
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Controls */}
          <div className="bg-slate-800/80 rounded-xl p-1 border border-slate-700 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-2xs font-bold transition ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              title="خط عادي"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              title="خط متوسط"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded-lg text-sm font-bold transition ${fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              title="خط كبير"
            >
              A++
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 shadow-xs"
            title="نسخ النص الكامل للملخص"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ بنجاح' : 'نسخ التلخيص'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 shadow-xs"
            title="تنزيل كملف Markdown"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>تنزيل (Markdown)</span>
          </button>

          {onSwitchToA4 && (
            <button
              onClick={onSwitchToA4}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              title="الانتقال إلى ورقة المراجعة النهائية المعتمدة A4"
            >
              <FileText className="w-4 h-4" />
              <span>وثيقة A4 المعتمدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: Rich Summary Document + Interactive AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Main Column: Rich Gemini Markdown Summary (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Quick Key Takeaways Card */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>أبرز الركائز الذهبية للسياسة (Key Takeaways):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-2xs">1</span>
                <div>
                  <strong className="block font-bold text-amber-900">المطهر الذهبي الأول:</strong>
                  <span>الدلك الكحولي (ABHR 70-80%) لمدة 20-30 ثانية لكافة اللحظات الخمس طالما اليد غير متسخة.</span>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-2xs">2</span>
                <div>
                  <strong className="block font-bold text-amber-900">الغسيل بالماء والصابون:</strong>
                  <span>إلزامي لمدة 40-60 ثانية عند الاتساخ الظاهري وحالات C. difficile والنوروفيروس.</span>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-2xs">3</span>
                <div>
                  <strong className="block font-bold text-amber-900">قاعدة خلو الساعدين:</strong>
                  <span>حظر كامل للمجوهرات، الساعات، والأظافر الاصطناعية (Bare Below the Elbows).</span>
                </div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-2xs">4</span>
                <div>
                  <strong className="block font-bold text-amber-900">حظر خلط وإعادة الملء:</strong>
                  <span>حظر إعادة ملء عبوات الصابون أو الكحول القديمة (Zero Soap Top-Up Ban).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Overview & Metadata Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-2xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-mono">
                  {data.policyCard.policyCode || 'IPC-POL-01'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {data.policyCard.titleArabic}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {data.policyCard.titleEnglish}
                </p>
              </div>
              <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-2xs space-y-1">
                <p><span className="text-slate-400">تاريخ التفعيل:</span> <strong className="text-slate-800">{data.policyCard.effectiveDate || '2025/2026'}</strong></p>
                <p><span className="text-slate-400">المجال:</span> <strong className="text-slate-800">{data.policyCard.domain}</strong></p>
                <p><span className="text-slate-400">دورة المراجعة:</span> <strong className="text-slate-800">{data.policyCard.reviewCycle || 'سنوياً'}</strong></p>
              </div>
            </div>

            {/* Aligned Standards Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-2xs font-bold text-slate-500">معايير الاعتماد المتوافقة:</span>
              {data.policyCard.alignedStandards.map((std, idx) => (
                <span key={idx} className="text-2xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                  ✓ {std.standardBody} {std.clauseNumber ? `(${std.clauseNumber})` : ''} - {std.description}
                </span>
              ))}
            </div>
          </div>

          {/* Section 1: Executive Summary & Rationale */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <h3>1. الملخص الإكلينيكي والاستراتيجي الشامل</h3>
            </div>
            <div className={`text-slate-800 ${fontSizeClass} whitespace-pre-line text-justify`}>
              {data.executiveSummarySnippet}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/70 text-xs">
                <strong className="block text-blue-950 font-bold mb-1">🎯 الهدف الرئيسي:</strong>
                <p className="text-blue-900">{data.purposeAndScope.mainObjective}</p>
              </div>
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200/70 text-xs">
                <strong className="block text-indigo-950 font-bold mb-1">🔬 المبرر الإكلينيكي وجودة الرعاية:</strong>
                <p className="text-indigo-900">{data.purposeAndScope.clinicalRationale}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Scientific Definitions & Concepts */}
          {data.scientificDefinitions && data.scientificDefinitions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3>2. المفاهيم والمصطلحات العلمية الحاكمة</h3>
              </div>
              <div className="space-y-3">
                {data.scientificDefinitions.map((def, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {def.term}
                      </h4>
                    </div>
                    <p className={`text-slate-700 ${fontSizeClass}`}>
                      {def.definition}
                    </p>
                    {def.clinicalSignificance && (
                      <div className="text-2xs bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 font-medium">
                        <strong>الأهمية السريرية والميكروبيولوجية:</strong> {def.clinicalSignificance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Technical Specs & Disinfectant Matrix */}
          {data.technicalSpecifications && data.technicalSpecifications.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Layers className="w-5 h-5 text-blue-700" />
                <h3>3. المواصفات الفنية للتقنيات والمطهرات وأزمنة التلامس</h3>
              </div>
              <div className="space-y-4">
                {data.technicalSpecifications.map((spec, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-sm text-blue-950">
                        {spec.techniqueName}
                      </h4>
                      <span className="bg-blue-100 text-blue-900 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                        ⏱️ زمن التلامس: {spec.contactTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">المادة والتركيز:</span>
                        <strong className="text-slate-800">{spec.agentAndConcentration}</strong>
                      </div>
                      {spec.requiredVolume && (
                        <div>
                          <span className="text-slate-500 block">الحجم / الجرعة المطلوبة:</span>
                          <strong className="text-slate-800">{spec.requiredVolume}</strong>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-2xs font-bold text-emerald-800 block">دواعي الاستخدام:</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        {spec.indications.map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    </div>

                    {spec.contraindicationsOrLimitations && spec.contraindicationsOrLimitations.length > 0 && (
                      <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900">
                        <span className="font-bold block mb-1">⚠️ الموانع والمحددات الهامة:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-2xs">
                          {spec.contraindicationsOrLimitations.map((con, i) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: WHO 5 Moments */}
          {data.fiveMomentsDetails && data.fiveMomentsDetails.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Bookmark className="w-5 h-5 text-amber-600" />
                <h3>4. اللحظات الخمس لنظافة الأيدي (WHO 5 Moments)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {data.fiveMomentsDetails.map((m) => (
                  <div key={m.momentNumber} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-xs">
                      {m.momentNumber}
                    </div>
                    <div className="space-y-1 flex-1 text-xs">
                      <h4 className="font-bold text-slate-900 text-sm">{m.momentName}</h4>
                      <p className="text-slate-700"><strong>التوقيت:</strong> {m.timing}</p>
                      <p className="text-slate-600 text-2xs"><strong>أمثلة إكلينيكية:</strong> {m.clinicalExamples.join('، ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Standard Operating Procedures (SOPs) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
              <h3>5. خطوات التشغيل القياسية المتسلسلة (SOPs) ونقاط الأمان</h3>
            </div>

            {/* Pre-procedure */}
            {data.sopPhases.preProcedure?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 inline-block">
                  المرحلة الأولى: ما قبل الإجراء (Pre-Procedure)
                </h4>
                <div className="space-y-2">
                  {data.sopPhases.preProcedure.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{s.stepNumber}. {s.title}</span>
                        <span className="text-2xs text-slate-500">المسؤول: {s.assignedTo || 'الممارس الصحي'}</span>
                      </div>
                      <p className="text-slate-700">{s.details}</p>
                      {s.keySafetyPoint && (
                        <p className="text-2xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-semibold">
                          🛡️ نقطة أمان: {s.keySafetyPoint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execution */}
            {data.sopPhases.execution?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 inline-block">
                  المرحلة الثانية: مرحلة التنفيذ (Execution Phase)
                </h4>
                <div className="space-y-2">
                  {data.sopPhases.execution.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{s.stepNumber}. {s.title}</span>
                        <span className="text-2xs text-slate-500">المسؤول: {s.assignedTo || 'الممارس الصحي'}</span>
                      </div>
                      <p className="text-slate-700">{s.details}</p>
                      {s.keySafetyPoint && (
                        <p className="text-2xs text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 font-semibold">
                          🛡️ نقطة أمان: {s.keySafetyPoint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post-procedure */}
            {data.sopPhases.postProcedure?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-block">
                  المرحلة الثالثة: ما بعد الإجراء والتطهير (Post-Procedure)
                </h4>
                <div className="space-y-2">
                  {data.sopPhases.postProcedure.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{s.stepNumber}. {s.title}</span>
                        <span className="text-2xs text-slate-500">المسؤول: {s.assignedTo || 'الممارس الصحي'}</span>
                      </div>
                      <p className="text-slate-700">{s.details}</p>
                      {s.keySafetyPoint && (
                        <p className="text-2xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-semibold">
                          🛡️ نقطة أمان: {s.keySafetyPoint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 6: DOs & DON'Ts + Emergency Incident Protocol */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3>6. مصفوفة المحظورات الصارمة والممارسات الإلزامية</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DOs */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>الممارسات الإلزامية (DOs):</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {data.safetyWarningsAndCriticalSteps.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DON'Ts */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <h4 className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>المحظورات الصارمة (DON'Ts):</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-900">
                  {data.safetyWarningsAndCriticalSteps.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-700 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Emergency Protocol */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <strong className="block text-amber-950 font-bold">🚨 بروتوكول الاستجابة الفورية لحوادث التعرض المهني:</strong>
              <p className="text-amber-900 leading-relaxed">
                {data.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol}
              </p>
            </div>
          </div>

          {/* Section 7: Audit Checklist & KPIs */}
          {data.complianceAndKPIs && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Bookmark className="w-5 h-5 text-blue-700" />
                <h3>7. متطلبات التدقيق التفتيشي ومؤشرات الأداء (KPIs)</h3>
              </div>

              {/* KPIs */}
              {data.complianceAndKPIs.kpis?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">مؤشرات الأداء المقاسة (KPIs):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.complianceAndKPIs.kpis.map((kpi, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{kpi.name}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-2xs px-2 py-0.5 rounded font-mono font-bold">
                            {kpi.target}
                          </span>
                        </div>
                        <p className="text-slate-600 text-2xs"><strong>المعادلة:</strong> {kpi.formula}</p>
                        <p className="text-slate-500 text-2xs"><strong>دورية القياس:</strong> {kpi.frequency} | {kpi.responsiblePerson || 'فريق مكافحة العدوى'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Interactive Gemini AI Chat Assistant (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px] sticky top-20">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">
                    اسأل الذكاء الاصطناعي (Gemini AI)
                  </h3>
                  <p className="text-2xs text-blue-200">
                    محادثة تفاعلية فورية ومستمرة حول السياسة
                  </p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" title="متصل وجاهز" />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto space-y-1.5">
              <span className="text-2xs font-bold text-slate-500 block">أسئلة سريعة مقترحة:</span>
              <div className="flex flex-col gap-1.5">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isChatLoading}
                    className="text-right text-2xs p-1.5 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-800 text-slate-700 border border-slate-200 transition font-medium truncate"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-100/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-800 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                    }`}
                  >
                    {msg.sender === 'gemini' ? (
                      <div className="space-y-1.5 leading-relaxed">
                        <div className="flex items-center gap-1.5 text-2xs text-blue-700 font-bold mb-1 pb-1 border-b border-slate-100">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Gemini Policy Advisor:</span>
                        </div>
                        <div className="whitespace-pre-line text-xs">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line text-xs">{msg.text}</p>
                    )}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-start gap-2">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 rounded-bl-none text-slate-500 text-xs flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>جاري صياغة الإجابة الإكلينيكية من Gemini...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب سؤالك عن السياسة أو سيناريو طبي..."
                  disabled={isChatLoading}
                  className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-100 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 disabled:opacity-40 text-white transition shadow-xs"
                  title="إرسال السؤال"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
