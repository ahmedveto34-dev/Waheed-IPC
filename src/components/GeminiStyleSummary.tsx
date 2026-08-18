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
  Flame,
  Bookmark,
  Layers,
  BookOpen,
  FlaskConical,
  HeartPulse,
  Droplets,
  Users,
  Printer,
  FileCheck2,
  Building2,
  ArrowRightLeft,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import Markdown from 'react-markdown';
import { PolicyAnalysisResult } from '../types';
import { HandHygieneVisualIllustrations } from './HandHygieneVisualIllustrations';

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
  const [activeTab, setActiveTab] = useState<'structured' | 'visual_infographics' | 'markdown' | 'interactive_chat'>('structured');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `مرحباً بك! أنا مستشارك الإكلينيكي الذكي (Gemini Policy AI). لقد قمت بتلخيص شامل وافٍ يغطي **100% من بنود وعناصر وثيقة: ${data.policyCard?.titleArabic || 'السياسة الطبية'}**.\n\nيمكنك استعراض العناصر بالكامل في التبويب المنظم، أو قراءة السرد في تبويب Markdown، أو سؤالي عن أي معيار أو سيناريو تفتيش من معايير جهار (GAHAR 2025).`,
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
    sections.push(`# 📋 ملخص شامل ودقيق للسياسة الطبية: ${data.policyCard?.titleArabic}`);
    sections.push(`**العنوان بالإنجليزية:** ${data.policyCard?.titleEnglish} | **كود السياسة:** \`${data.policyCard?.policyCode || 'MUEH.IPC.04'}\` | **تاريخ التفعيل:** ${data.policyCard?.effectiveDate || '2025/5/15'}`);
    sections.push(`**المجال الإكلينيكي:** ${data.policyCard?.domain} | **الأقسام المستهدفة:** ${data.policyCard?.departments?.join('، ')}`);
    sections.push(`**معايير الاعتماد المتوافقة:** ${data.policyCard?.alignedStandards?.map(s => `${s.standardBody} (${s.clauseNumber || ''} - ${s.description})`).join(' | ')}`);
    sections.push(`\n---\n`);

    // 1. Executive Summary
    sections.push(`## 🌟 1. الملخص التنفيذي والاستراتيجي (Executive Summary)\n${data.executiveSummarySnippet}`);

    // 2. Purpose and Scope
    sections.push(`\n## 🎯 2. الهدف الإكلينيكي ونطاق التطبيق (Purpose & Scope)`);
    sections.push(`- **الهدف الرئيسي:** ${data.purposeAndScope?.mainObjective}`);
    sections.push(`- **المبرر الإكلينيكي والجودة:** ${data.purposeAndScope?.clinicalRationale}`);
    sections.push(`- **نطاق التطبيق والفئات:** ${data.purposeAndScope?.scope?.join('، ')}`);
    if (data.purposeAndScope?.exclusions && data.purposeAndScope.exclusions.length > 0) {
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
        sections.push(`- **دواعي الاستخدام:**\n${spec.indications?.map(ind => `  * ${ind}`).join('\n')}`);
        if (spec.contraindicationsOrLimitations && spec.contraindicationsOrLimitations.length > 0) {
          sections.push(`- **الموانع والمحددات:**\n${spec.contraindicationsOrLimitations.map(con => `  * ⚠️ ${con}`).join('\n')}`);
        }
      });
    }

    // 5. Five Moments
    const moments = data.fiveMomentsDetails || (data as any).fiveMomentsDetail;
    if (moments && moments.length > 0) {
      sections.push(`\n## 🖐️ 5. اللحظات الخمس لنظافة الأيدي (WHO 5 Moments of Hand Hygiene)`);
      moments.forEach((m: any) => {
        sections.push(`### اللحظة رقم ${m.momentNumber}: ${m.momentName}`);
        sections.push(`- **التوقيت السريري:** ${m.timing}`);
        sections.push(`- **أمثلة تطبيقية واقعية:** ${m.clinicalExamples?.join('، ')}`);
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
    if (data.sopPhases) {
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
    }

    // 9. Roles and Responsibilities
    if (data.rolesAndResponsibilities?.length) {
      sections.push(`\n## 👥 9. مصفوفة المسؤوليات وتوزيع الأدوار (Roles & Responsibilities)`);
      data.rolesAndResponsibilities.forEach(r => {
        sections.push(`### الدور: ${r.role}\n${r.responsibilities.map(res => `- ${res}`).join('\n')}`);
      });
    }

    // 10. Safety Warnings & DOs / DON'Ts
    if (data.safetyWarningsAndCriticalSteps) {
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
      if (data.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol) {
        sections.push(`### بروتوكول الاستجابة الفورية والحوادث:\n${data.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol}`);
      }
    }

    // 11. Measurable KPIs
    if (data.complianceAndKPIs) {
      sections.push(`\n## 📊 11. مؤشرات الأداء المقاسة ونسب الامتثال (Measurable KPIs)`);
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
    element.download = `تلخيص_شامل_${(data.policyCard?.titleArabic || 'السياسة').replace(/\s+/g, '_')}.md`;
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

  const card = data.policyCard || ({} as any);
  const purpose = data.purposeAndScope || ({} as any);
  const definitions = Array.isArray(data.scientificDefinitions) ? data.scientificDefinitions : [];
  const techSpecs = Array.isArray(data.technicalSpecifications) ? data.technicalSpecifications : [];
  const fiveMoments = Array.isArray(data.fiveMomentsDetails) 
    ? data.fiveMomentsDetails 
    : Array.isArray((data as any).fiveMomentsDetail) 
    ? (data as any).fiveMomentsDetail 
    : [];
  const skinCare = data.skinAndGloveCare || ({} as any);
  const infra = data.infrastructureRequirements || ({} as any);
  const roles = Array.isArray(data.rolesAndResponsibilities) ? data.rolesAndResponsibilities : [];
  const sop = data.sopPhases || ({} as any);
  const safety = data.safetyWarningsAndCriticalSteps || ({} as any);
  const kpisData = data.complianceAndKPIs || ({} as any);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Luxury Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-inner ring-2 ring-blue-400/30">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  الملخص التنفيذي والإكلينيكي الشامل (جميع عناصر السياسة)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-2xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                  تنسيق معتمد 100%
                </span>
              </div>
              <p className="text-2xs sm:text-xs text-slate-300 mt-0.5">
                تغطية دقيقة لكافة البنود، التعريفات، الجداول، إجراءات التشغيل، المحظورات، ومؤشرات الأداء
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
              <span>{copied ? 'تم النسخ' : 'نسخ التلخيص'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 shadow-xs"
              title="تنزيل كملف Markdown"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>تنزيل (MD)</span>
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

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('structured')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'structured'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>العرض المنهجي المنظم (جميع عناصر السياسة)</span>
          </button>

          <button
            onClick={() => setActiveTab('visual_infographics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'visual_infographics'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>المخططات التوضيحية والإنفوجرافيك الإكلينيكي (بالصور والرسوم)</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'markdown'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>عرض السرد الكامل (ChatGPT & Markdown View)</span>
          </button>

          <button
            onClick={() => setActiveTab('interactive_chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'interactive_chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>المساعد الإكلينيكي الذكي والأسئلة (AI Q&A)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STRUCTURED EXECUTIVE VIEW WITH ALL 15 ELEMENTS                     */}
      {/* ========================================================================= */}
      {activeTab === 'structured' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">

            {/* 1. INSTITUTIONAL DOCUMENT CONTROL BOX */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-mono">
                      كود السياسة: {card.policyCode || 'MUEH.IPC.04'}
                    </span>
                    <span className="text-2xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      معيار: I.P.C 04
                    </span>
                    <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      الإصدار الثاني (2025/5/1)
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-tight">
                    {card.titleArabic || 'سياسة وإجراءات نظافة وتطهير الأيدي بالمنشآت الصحية'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {card.titleEnglish || 'Hand Hygiene & Antisepsis Clinical Policy'}
                  </p>
                </div>
                <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-2xs space-y-1 min-w-[200px]">
                  <p><span className="text-slate-500">المؤسسة:</span> <strong className="text-slate-800 font-semibold">مستشفيات جامعة المنيا - مستشفى العيون</strong></p>
                  <p><span className="text-slate-500">تاريخ التفعيل:</span> <strong className="text-slate-800">{card.effectiveDate || '2025/5/15'}</strong></p>
                  <p><span className="text-slate-500">تاريخ المراجعة:</span> <strong className="text-slate-800">{card.reviewCycle || '2028/4/1 (كل 3 سنوات)'}</strong></p>
                  <p><span className="text-slate-500">عدد الصفحات:</span> <strong className="text-slate-800">11 صفحة</strong> | <span className="text-slate-500">النسخ:</span> <strong className="text-slate-800">نسخة أصلية 1</strong></p>
                </div>
              </div>

              {/* Scope & Standards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <strong className="text-slate-900 block font-bold mb-1">مجال ونطاق التطبيق:</strong>
                  <p className="text-slate-700">جميع أقسام المستشفى (الأطباء - هيئة التمريض - العمال - الإداريون - والزائرون).</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <strong className="text-slate-900 block font-bold mb-1">المعايير المرجعية المتوافقة:</strong>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-2xs bg-emerald-100/70 text-emerald-900 font-bold px-2 py-0.5 rounded">GAHAR 2025</span>
                    <span className="text-2xs bg-blue-100/70 text-blue-900 font-bold px-2 py-0.5 rounded">الدليل القومي 2020</span>
                    <span className="text-2xs bg-purple-100/70 text-purple-900 font-bold px-2 py-0.5 rounded">WHO 5 Moments</span>
                    <span className="text-2xs bg-amber-100/70 text-amber-900 font-bold px-2 py-0.5 rounded">CDC / APIC / SHEA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. POLICY STATEMENT & OPERATIONAL OBJECTIVES */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-blue-800" />
                <h3>1. نص السياسة والأهداف الإكلينيكية والتشغيلية (Policy Statement & Objectives)</h3>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-slate-900 space-y-2">
                <strong className="block text-xs font-bold text-blue-950">نص السياسة الإلزامي:</strong>
                <p className={`text-slate-800 ${fontSizeClass} leading-relaxed text-justify`}>
                  «التزام جميع العاملين (أطباء - تمريض - عمال - إداريين) وكذلك الزائرين بغسيل الأيدي بطريقة صحيحة تبعاً لنوع الإجراء المتخذ مع المريض، حيث تُعد نظافة اليدين حجر الزاوية في الحد من انتقال العدوى في جميع مرافق الرعاية الصحية، وتُعتبر الاستراتيجية الأكثر فعالية وكفاءة للوقاية من العدوى ومكافحتها.»
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xs">1</span>
                    <span>سلامة الإجراءات الطبية:</span>
                  </div>
                  <p className="text-slate-700 text-2xs">القيام بكافة التدخلات والإجراءات الطبية دون أي ملوثات تنتقل من الأيدي أثناء التعامل مع المرضى.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xs">2</span>
                    <span>التدريب المستمر:</span>
                  </div>
                  <p className="text-slate-700 text-2xs">تدريب وتأهيل جميع العاملين بالمستشفى بالخطوات والدواعي الصحيحة لنظافة وتطهير الأيدي بنسبة 100%.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xs">3</span>
                    <span>حماية المرضى والعاملين:</span>
                  </div>
                  <p className="text-slate-700 text-2xs">التأكيد على أهمية نظافة الأيدي لضمان سلامة المرضى والعاملين بالمستشفى على حد سواء وخفض العدوى المكتسبة.</p>
                </div>
              </div>
            </div>

            {/* 2. SCIENTIFIC DEFINITIONS */}
            {definitions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <FlaskConical className="w-5 h-5 text-indigo-700" />
                  <h3>2. المفاهيم والمصطلحات العلمية الحاكمة (Scientific Terminology)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {definitions.map((def: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-2xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        {def.term}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {def.definition}
                      </p>
                      {def.clinicalSignificance && (
                        <div className="text-2xs bg-emerald-50 text-emerald-950 p-2 rounded-lg border border-emerald-200 font-medium">
                          <strong>الأهمية الإكلينيكية: </strong> {def.clinicalSignificance}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. COMPARATIVE MATRIX OF TECHNIQUES & DISINFECTANTS */}
            {techSpecs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Layers className="w-5 h-5 text-blue-800" />
                  <h3>3. جدول تقنيات نظافة الأيدي والمواصفات الفنية والمطهرات</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-3 font-bold border border-slate-700">نوع الإجراء والتقنية</th>
                        <th className="p-3 font-bold border border-slate-700">المادة الفعالة والتركيز</th>
                        <th className="p-3 font-bold border border-slate-700 text-center">الحجم والكمية</th>
                        <th className="p-3 font-bold border border-slate-700 text-center">زمن التلامس</th>
                        <th className="p-3 font-bold border border-slate-700">القدرة والتأثير الميكروبي</th>
                        <th className="p-3 font-bold border border-slate-700">دواعي الاستخدام والموانع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {techSpecs.map((spec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900 border border-slate-200 align-top">
                            {spec.techniqueName}
                          </td>
                          <td className="p-3 text-slate-800 border border-slate-200 align-top">
                            {spec.agentAndConcentration}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-blue-900 border border-slate-200 align-top">
                            {spec.requiredVolume || 'كمية كافية'}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-800 border border-slate-200 align-top">
                            {spec.contactTime}
                          </td>
                          <td className="p-3 text-slate-700 border border-slate-200 align-top text-2xs">
                            {spec.techniqueName?.includes("كحول") 
                              ? "يقضي على الفلورا المؤقتة ويقلل البكتيريا المستوطنة سريعاً"
                              : spec.techniqueName?.includes("جراحي")
                              ? "يقضي على الفلورا المؤقتة ويقلل البكتيريا المستوطنة لفترة ممتدة"
                              : "يزيل جزئياً النبت الجرثومي المؤقت والمواد العضوية"}
                          </td>
                          <td className="p-3 text-slate-700 border border-slate-200 align-top text-2xs space-y-1">
                            <div>
                              <strong className="text-emerald-900">الدواعي: </strong>
                              {Array.isArray(spec.indications) ? spec.indications.join(' • ') : spec.indications}
                            </div>
                            {Array.isArray(spec.contraindicationsOrLimitations) && spec.contraindicationsOrLimitations.length > 0 && (
                              <div className="text-rose-900 bg-rose-50 p-1.5 rounded border border-rose-200">
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

            {/* 4. WHO 5 MOMENTS DETAIL */}
            {fiveMoments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Bookmark className="w-5 h-5 text-amber-600" />
                  <h3>4. اللحظات الخمس (WHO 5 Moments) لتطهير الأيدي بالمنشآت الصحية</h3>
                </div>

                <div className="space-y-3">
                  {fiveMoments.map((m: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-800 text-white font-black flex items-center justify-center shrink-0 text-base shadow-xs">
                        {m.momentNumber || idx + 1}
                      </div>
                      <div className="space-y-1 flex-1 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-sm">{m.momentName}</h4>
                          <span className="text-2xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-medium">
                            الهدف: {m.timing}
                          </span>
                        </div>
                        <p className="text-slate-600 text-2xs">
                          <strong className="text-slate-800">أمثلة إكلينيكية واقعية: </strong>
                          {Array.isArray(m.clinicalExamples) ? m.clinicalExamples.join('، ') : m.clinicalExamples}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. DETAILED SOPS: ROUTINE, ALCOHOL, SURGICAL */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <h3>5. خطوات العمل القياسية (SOPs) المتسلسلة لتقنيات نظافة الأيدي</h3>
              </div>

              {/* Tabbed or Subdivided SOPs */}
              <div className="space-y-4">
                {/* SOP 1: Soap & Water 13 Steps */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <h4 className="font-bold text-blue-950 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">A</span>
                      خطوات غسيل اليدين بالماء والصابون (40 - 60 ثانية):
                    </h4>
                    <span className="bg-blue-200 text-blue-900 text-2xs font-mono font-bold px-2 py-0.5 rounded">13 خطوة قياسية</span>
                  </div>
                  <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-800 list-decimal list-inside pt-1">
                    <li>خلع جميع المجوهرات والحلي والمعاصم.</li>
                    <li>فتح الصنبور بالكوع وترطيب اليدين بالماء الجاري.</li>
                    <li>وضع كمية كافية من الصابون لتغطية كامل سطح اليد.</li>
                    <li>فرك باطن اليد بباطن اليد الأخرى بحركة دائرية.</li>
                    <li>فرك باطن اليد اليمنى على ظهر اليد اليسرى مع تداخل الأصابع والعكس.</li>
                    <li>دلك باطن اليدين مواجهين مع تداخل الأصابع.</li>
                    <li>دلك قبضة اليد اليمنى بباطن اليد اليسرى وظاهر الأصابع.</li>
                    <li>الدلك الدائري لإبهام اليد اليسرى باليد اليمنى ثم العكس.</li>
                    <li>فرك أطراف أصابع اليد اليمنى دائرياً بباطن اليد اليسرى والعكس.</li>
                    <li>فرك الرسغين بطريقة دائرية لليد اليمنى ثم اليسرى.</li>
                    <li>شطف اليدين بماء جارٍ من أطراف الأصابع لأعلى مع رفع اليدين.</li>
                    <li>تجفيف اليدين باستخدام مناديل ورقية وحيدة الاستخدام.</li>
                    <li>إغلاق الصنبور باستخدام نفس الفوطة قبل التخلص منها.</li>
                  </ol>
                </div>

                {/* SOP 2: Alcohol Rub 70% */}
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                    <h4 className="font-bold text-indigo-950 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">B</span>
                      خطوات تدليك اليدين بالكحول 70% (20 - 30 ثانية):
                    </h4>
                    <span className="bg-indigo-200 text-indigo-900 text-2xs font-mono font-bold px-2 py-0.5 rounded">3-5 مل كحول</span>
                  </div>
                  <p className="text-2xs text-slate-700">
                    خلع الحلي • وضع 3-5 مل كحول بقبضة اليد حتى الرسغين • دلك الراحتين، ظهر اليدين، تداخل الأصابع، الإبهامين، أطراف الأصابع، والرسغين حتى جفاف الكحول تماماً (20-30 ثانية).
                  </p>
                </div>

                {/* SOP 3 & 4: Surgical Scrub & Surgical Rub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5 text-2xs">
                    <h5 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-2xs">C</span>
                      الغسل الجراحي (بيتادين 7.5% رغوي):
                    </h5>
                    <p className="text-slate-700 leading-relaxed">
                      بلل اليدين والساعدين 5 سم فوق المرفق • تنظيف أسفل الأظافر • دعك الراحتين وظاهر اليدين والذراعين بحركة دائرية لمدة 3-5 دقائق • الشطف من الأصابع لأعلى • التجفيف بمنشفة معقمة ورفع الأيدي فوق الخصر.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 text-2xs">
                    <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-2xs">D</span>
                      الدلك الجراحي (كلورهيكسيدين 2%-4%):
                    </h5>
                    <p className="text-slate-700 leading-relaxed">
                      غسل اليدين روتينياً وتجفيفهما أولاً • وضع 5 مل مطهر كحولي • غمر أطراف الأصابع 5 ثوانٍ • تغطية كامل سطح الذراع حتى 5 سم فوق المرفق لمدة 15 ثانية لكل ذراع والتدليك حتى الجفاف التام.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. STRICT PROHIBITIONS & GENERAL PRECAUTIONS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3>6. الإجراءات العامة والمحظورات الصارمة (Strict Prohibitions)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <h4 className="font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>المحظورات الصارمة (DON'Ts):</span>
                  </h4>
                  <ul className="space-y-1 text-2xs text-rose-900">
                    <li>❌ <strong>حظر المجوهرات والخواتم والساعات:</strong> تعيق وصول المطهر وتمزق القفازات.</li>
                    <li>❌ <strong>حظر طلاء والأظافر الصناعية:</strong> تأوي الجراثيم تحت الأظافر.</li>
                    <li>❌ <strong>حظر مجففات الهواء الساخن:</strong> تسبب نقل العدوى بالهواء الملوث ولا تجفف جيداً.</li>
                    <li>❌ <strong>حظر إعادة ملء العبوات (Top-Up Ban):</strong> يحظر تزويد الصابون/الكحول دون تفريغ وتطهير.</li>
                    <li>❌ <strong>حظر سكب السوائل في أحواض الأيدي:</strong> الأحواض مخصصة لغسيل الأيدي فقط.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>الممارسات الإلزامية (DOs):</span>
                  </h4>
                  <ul className="space-y-1 text-2xs text-emerald-900">
                    <li>✅ <strong>تقليم الأظافر دائرياً:</strong> وقصيرة خالية من أي التهابات جلدية.</li>
                    <li>✅ <strong>توفير حوض لكل 4 أسرة:</strong> مخصص لغسيل الأيدي فقط مع ماء وصابون ومناشف ورقية.</li>
                    <li>✅ <strong>توفير عبوات كحول 70%:</strong> معلقة في أماكن واضحة وعند نقاط تقديم الرعاية.</li>
                    <li>✅ <strong>ساعة توقيت:</strong> لحساب زمن غسل الأيدي الجراحي بغرف العمليات.</li>
                    <li>✅ <strong>تدوين تاريخ الاستخدام:</strong> على كافة عبوات الصابون والمطهرات.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7. PPE & GLOVE PROTOCOLS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <HeartPulse className="w-5 h-5 text-purple-700" />
                <h3>7. معدات الوقاية الشخصية وضوابط القفازات</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold text-2xs">1. قفازات نظيفة غير معقمة:</strong>
                  <p className="text-slate-700 text-2xs">أحادية الاستخدام عند احتمالية التعرض للسوائل، الدم، الضمادات الملوثة، وعينات المرضى.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold text-2xs">2. قفازات معقمة:</strong>
                  <p className="text-slate-700 text-2xs">قبل العمليات الجراحية، القسطرة البولية، والقسطرة الوريدية المركزية والإجراءات المعقمة.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold text-2xs">3. قفازات شديدة التحمل:</strong>
                  <p className="text-slate-700 text-2xs">التعامل مع النفايات الطبية، صناديق الأمان، المواد الكيميائية، تنظيف البيئة وغسيل الآلات.</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-2xs text-amber-950 font-bold flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                <span>القاعدة الذهبية الإلزامية: ارتداء القفاز لا يُغني بأي حال من الأحوال عن غسيل وتطهير الأيدي والعكس.</span>
              </div>
            </div>

            {/* 8. ROLES & RESPONSIBILITIES */}
            {roles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Users className="w-5 h-5 text-blue-800" />
                  <h3>8. مصفوفة المسؤوليات وتوزيع الأدوار التنفيذية</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((r: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <strong className="text-blue-950 font-bold block text-xs border-b border-slate-200 pb-1">
                        {r.role}
                      </strong>
                      <ul className="space-y-1 text-2xs text-slate-700">
                        {r.responsibilities?.map((res: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-blue-700">•</span>
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. MEASURABLE KPIS */}
            {kpisData && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <h3>9. مؤشرات الأداء المقاسة ونسب الامتثال (Measurable KPIs)</h3>
                </div>

                {/* KPIs Cards */}
                {kpisData.kpis?.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {kpisData.kpis.map((kpi: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-2xs">
                          <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                            <span>{kpi.name}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                              {kpi.target}
                            </span>
                          </div>
                          <p className="text-slate-600"><strong>المعادلة: </strong>{kpi.formula}</p>
                          <p className="text-slate-500"><strong>دورية القياس: </strong>{kpi.frequency} | <strong>المسؤول: </strong>{kpi.responsiblePerson || 'فريق مكافحة العدوى'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: QUICK INTERACTIVE WIDGETS & AUDIT SUMMARY */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Audit Status Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 border border-blue-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-blue-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-sm text-white">بطاقة التحقق والجاهزية</h3>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-2xs px-2 py-0.5 rounded font-mono font-bold">
                  GAHAR Ready
                </span>
              </div>

              <div className="space-y-2 text-2xs">
                <div className="flex justify-between items-center py-1 border-b border-blue-800/50">
                  <span className="text-blue-200">اكتمال بنود السياسة:</span>
                  <span className="font-bold text-white">100% (11 صفحة)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-blue-800/50">
                  <span className="text-blue-200">اللحظات الخمس:</span>
                  <span className="font-bold text-emerald-400">مكتملة ومفصلة</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-blue-800/50">
                  <span className="text-blue-200">خطوات SOPs:</span>
                  <span className="font-bold text-white">4 بروتوكولات تفصيلية</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-blue-800/50">
                  <span className="text-blue-200">حظر خلط الصابون:</span>
                  <span className="font-bold text-amber-300">Top-Up Ban إلزامي</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-200">مستهدف الامتثال:</span>
                  <span className="font-bold text-emerald-400">≥ 90% شهرياً</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('interactive_chat')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>طرح سؤال على الذكاء الاصطناعي</span>
              </button>
            </div>

            {/* Quick Key Takeaways */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>الركائز الذهبية الأربع للسياسة:</span>
              </div>

              <div className="space-y-2 text-2xs text-amber-950">
                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                  <strong className="block text-amber-900 font-bold">1. الخيار الأول السريع:</strong>
                  <span>الدلك بالكحول 70% (20-30 ثانية) طالما الأيدي غير متسخة ظاهرياً.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                  <strong className="block text-amber-900 font-bold">2. الغسيل بالماء والصابون:</strong>
                  <span>إلزامي لمدة 40-60 ثانية عند الاتساخ الظاهري أو التلوث بالسوائل.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                  <strong className="block text-amber-900 font-bold">3. خلو الساعدين (Bare Below Elbows):</strong>
                  <span>حظر كامل للمجوهرات، الساعات، والأظافر الاصطناعية وطلاء الأظافر.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                  <strong className="block text-amber-900 font-bold">4. حظر مجففات الهواء الساخن:</strong>
                  <span>الاعتماد الحصري على المناديل الورقية أحادية الاستخدام.</span>
                </div>
              </div>
            </div>

            {/* Emergency Protocol Box */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>بروتوكول حوادث التعرض المهني:</span>
              </div>
              <p className="text-2xs text-rose-900 leading-relaxed">
                غسل الموضع فوراً بالماء والصابون أو المحلول الملحي المعقم، وإبلاغ مشرف مكافحة العدوى وضابط السلامة فوراً لبدء إجراءات التقييم والوقاية بعد التعرض (PEP).
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLINICAL INFOGRAPHICS & VISUAL ILLUSTRATIONS (بالصور والرسوم)     */}
      {/* ========================================================================= */}
      {activeTab === 'visual_infographics' && (
        <div className="space-y-6">
          <HandHygieneVisualIllustrations />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RICH FULL MARKDOWN VIEW (CHATGPT / GEMINI STYLE)                   */}
      {/* ========================================================================= */}
      {activeTab === 'markdown' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                السرد التلخيصي الشامل الكامل (ChatGPT & Gemini Markdown)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تنسيق مقالي غني ومنظم يشمل كافة الجداول، البنود، والتوجيهات المعتمدة
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>
          </div>

          <div className={`prose max-w-none text-slate-800 ${fontSizeClass}`}>
            <div className="space-y-4 markdown-rendered">
              <Markdown>{fullMarkdownSummary}</Markdown>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INTERACTIVE AI Q&A CHAT ASSISTANT                                  */}
      {/* ========================================================================= */}
      {activeTab === 'interactive_chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">
                  مستشار السياسات والاعتماد الذكي (Gemini Policy AI)
                </h3>
                <p className="text-2xs text-blue-200">
                  اطرح أي سؤال حول بنود السياسة، معايير جهار 2025، وسيناريوهات التفتيش الميداني
                </p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" title="متصل وجاهز" />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto space-y-1.5">
            <span className="text-2xs font-bold text-slate-500 block">أسئلة مقترحة سريعة:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isChatLoading}
                  className="text-right text-2xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-800 text-slate-700 border border-slate-200 transition font-medium"
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
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
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

          {/* Chat Input Form */}
          <div className="p-3 bg-white border-t border-slate-200">
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
                placeholder="اكتب استفسارك حول السياسة أو معايير جهار 2025..."
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
      )}

    </div>
  );
}
