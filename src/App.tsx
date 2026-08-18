import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  Sparkles, 
  Printer, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  FileCheck, 
  Filter, 
  Layers, 
  Download, 
  Share2, 
  Copy, 
  ChevronDown,
  Activity,
  HeartPulse,
  Flame,
  Award,
  Trash2,
  Paperclip
} from 'lucide-react';

import { PolicyAnalysisResult } from './types';
import { PolicyCardSection } from './components/PolicyCardSection';
import { PurposeScopeSection } from './components/PurposeScopeSection';
import { RolesSection } from './components/RolesSection';
import { SopSection } from './components/SopSection';
import { SafetyWarningsSection } from './components/SafetyWarningsSection';
import { MermaidViewer } from './components/MermaidViewer';
import { AuditAndKpisSection } from './components/AuditAndKpisSection';
import { AskExpertModal } from './components/AskExpertModal';
import { PrintableReport } from './components/PrintableReport';
import { A4FinalReviewDocument } from './components/A4FinalReviewDocument';
import { A4PreviewModal } from './components/A4PreviewModal';
import { LoginPage } from './components/LoginPage';
import { LogOut } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('waheed_ipc_auth') === 'authenticated';
  });
  const [policyText, setPolicyText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    size: number;
    base64?: string;
  } | null>(null);
  const [standardFocus, setStandardFocus] = useState('معايير جهار 2025 والدليل القومي لمكافحة العدوى 2020 (GAHAR & National IPC Guidelines)');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PolicyAnalysisResult | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [isA4ModalOpen, setIsA4ModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load a default analysis or sample on start for instant discovery
  useEffect(() => {
    const saved = localStorage.getItem('last_analyzed_policy');
    if (saved) {
      try {
        setAnalysisResult(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved policy', e);
      }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPolicyText(text);
        setUploadedFile({
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
        });
      };
      reader.readAsText(file);
    } else {
      // For PDF, images or other binary files, read as Base64 for Gemini multimodal input
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1];
        setUploadedFile({
          name: file.name,
          type: file.type || 'application/pdf',
          size: file.size,
          base64: base64Data,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!policyText.trim() && !uploadedFile?.base64) {
      setErrorMessage('يرجى كتابة أو لصق نص السياسة، أو رفع ملف الوثيقة (PDF / DOC / صور).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        standardFocus,
        customInstructions,
      };

      if (policyText.trim()) {
        payload.content = policyText.trim();
      }

      if (uploadedFile?.base64) {
        payload.fileData = uploadedFile.base64;
        payload.mimeType = uploadedFile.type;
      }

      const response = await fetch('/api/analyze-policy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let resData: any;

      try {
        resData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Non-JSON response received from server:', responseText);
        // If server returned an HTML error (e.g. 413 Payload Too Large or 504 Gateway Timeout or static fallback)
        if (responseText.includes('413') || responseText.toLowerCase().includes('payload too large') || responseText.toLowerCase().includes('entity too large')) {
          throw new Error('حجم الملف المرفوع كبير جداً. يرجى اختيار ملف أصغر حجماً (أقل من 5 ميجابايت) أو نسخ نص السياسة ولصقه في الحقل المخصص.');
        } else if (response.status === 504 || responseText.toLowerCase().includes('timeout') || responseText.toLowerCase().includes('the page')) {
          throw new Error('استغرقت معالجة الوثيقة وقتاً أطول من المعتاد. يرجى محاولة نسخ ولصق النص مباشرة أو تقليل حجم الملف والمحاولة مرة أخرى.');
        } else {
          throw new Error('تعذر معالجة استجابة الخادم. يرجى نسخ نص السياسة ولصقه في المربع أو إعادة المحاولة.');
        }
      }

      if (!response.ok || !resData.success) {
        let errText = 'فشل تحليل السياسة.';
        if (typeof resData?.error === 'string') {
          errText = resData.error;
        } else if (typeof resData?.details === 'string') {
          errText = resData.details;
        } else if (resData?.error?.message) {
          errText = resData.error.message;
        } else if (typeof resData?.error === 'object') {
          errText = JSON.stringify(resData.error);
        }
        throw new Error(errText);
      }

      const raw = resData.data || {};
      const result: PolicyAnalysisResult = {
        policyCard: {
          titleArabic: raw.policyCard?.titleArabic || 'سياسة وإجراءات مكافحة العدوى والسلامة المعتمدة',
          titleEnglish: raw.policyCard?.titleEnglish || 'Infection Prevention & Clinical Safety Policy',
          policyCode: raw.policyCard?.policyCode || 'IPC-POL-001',
          domain: raw.policyCard?.domain || 'مكافحة العدوى والسلامة الإكلينيكية',
          departments: Array.isArray(raw.policyCard?.departments) ? raw.policyCard.departments : ['كافة الأقسام الإكلينيكية والتمريض'],
          effectiveDate: raw.policyCard?.effectiveDate || '2025/2026',
          reviewCycle: raw.policyCard?.reviewCycle || 'سنوياً',
          alignedStandards: Array.isArray(raw.policyCard?.alignedStandards) ? raw.policyCard.alignedStandards : [
            {
              standardBody: 'GAHAR 2025 / الدليل القومي',
              clauseNumber: 'IPC.01',
              description: 'الالتزام بمعايير جهار والدليل القومي لمكافحة العدوى'
            }
          ]
        },
        purposeAndScope: {
          mainObjective: raw.purposeAndScope?.mainObjective || 'توفير بيئة رعاية صحية آمنة ومنع انتقال العدوى وحماية المرضى والعاملين.',
          clinicalRationale: raw.purposeAndScope?.clinicalRationale || 'الحد من العدوى المكتسبة ومقاومة مضادات الميكروبات.',
          scope: Array.isArray(raw.purposeAndScope?.scope) ? raw.purposeAndScope.scope : ['كافة الكوادر الصحية والتمريضية'],
          exclusions: Array.isArray(raw.purposeAndScope?.exclusions) ? raw.purposeAndScope.exclusions : []
        },
        rolesAndResponsibilities: Array.isArray(raw.rolesAndResponsibilities) ? raw.rolesAndResponsibilities : [],
        sopPhases: {
          preProcedure: Array.isArray(raw.sopPhases?.preProcedure) ? raw.sopPhases.preProcedure : [],
          execution: Array.isArray(raw.sopPhases?.execution) ? raw.sopPhases.execution : [],
          postProcedure: Array.isArray(raw.sopPhases?.postProcedure) ? raw.sopPhases.postProcedure : []
        },
        safetyWarningsAndCriticalSteps: {
          criticalControlPoints: Array.isArray(raw.safetyWarningsAndCriticalSteps?.criticalControlPoints)
            ? raw.safetyWarningsAndCriticalSteps.criticalControlPoints
            : [],
          dos: Array.isArray(raw.safetyWarningsAndCriticalSteps?.dos)
            ? raw.safetyWarningsAndCriticalSteps.dos
            : Array.isArray(raw.safetyWarningsAndCriticalSteps?.dosAndDonts)
            ? raw.safetyWarningsAndCriticalSteps.dosAndDonts
                .filter((d: any) => d?.type === 'DO' || (typeof d === 'string' && !d.toLowerCase().startsWith("don't")))
                .map((d: any) => typeof d === 'string' ? d : d?.instruction || d?.text || JSON.stringify(d))
            : [],
          donts: Array.isArray(raw.safetyWarningsAndCriticalSteps?.donts)
            ? raw.safetyWarningsAndCriticalSteps.donts
            : Array.isArray(raw.safetyWarningsAndCriticalSteps?.dosAndDonts)
            ? raw.safetyWarningsAndCriticalSteps.dosAndDonts
                .filter((d: any) => d?.type === 'DONT' || (typeof d === 'string' && d.toLowerCase().startsWith("don't")))
                .map((d: any) => typeof d === 'string' ? d : d?.instruction || d?.text || JSON.stringify(d))
            : [],
          emergencyIncidentProtocol: typeof raw.safetyWarningsAndCriticalSteps?.emergencyIncidentProtocol === 'string'
            ? raw.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol
            : typeof raw.safetyWarningsAndCriticalSteps?.exposureProtocol === 'string'
            ? raw.safetyWarningsAndCriticalSteps.exposureProtocol
            : 'في حال حدوث وخز إبرة أو تعرض مهني: غسل الموضع فوراً بالماء والصابون دون عصر، إبلاغ مشرف السلامة ومكافحة العدوى فوراً وبدء الإجراءات الوقائية.'
        },
        mermaidFlowchart: {
          code: typeof raw.mermaidFlowchart === 'string' 
            ? raw.mermaidFlowchart 
            : raw.mermaidFlowchart?.code || `flowchart TD\n  A([بدء الإجراء]) --> B[تطبيق معايير مكافحة العدوى]\n  B --> C[تنفيذ الخطوات]\n  C --> D([اكتمال الإجراء])`,
          description: raw.mermaidFlowchart?.description || 'مخطط تدفق العمليات والإجراءات التنفيذية'
        },
        complianceAndKPIs: {
          auditChecklist: Array.isArray(raw.complianceAndKPIs?.auditChecklist)
            ? raw.complianceAndKPIs.auditChecklist.map((item: any, i: number) => ({
                id: item.id || `CHK-${i + 1}`,
                checkpoint: item.checkpoint || item.item || 'التحقق من الالتزام بالمعايير',
                standardReference: item.standardReference || 'GAHAR 2025',
                evidenceRequired: item.evidenceRequired || item.evidenceMethod || 'سجلات التدقيق والملاحظة المباشرة',
                frequency: item.frequency || 'شهري'
              }))
            : [],
          kpis: Array.isArray(raw.complianceAndKPIs?.kpis)
            ? raw.complianceAndKPIs.kpis.map((k: any) => ({
                name: k.name || 'مؤشر الامتثال',
                formula: k.formula || '(عدد المرات الملتزمة ÷ إجمالي الفرص) × 100',
                target: k.target || k.targetBenchmark || '≥ 90%',
                frequency: k.frequency || k.measurementCycle || 'شهري',
                responsiblePerson: k.responsiblePerson || 'فريق مكافحة العدوى'
              }))
            : [],
          gapAnalysisAndRecommendations: Array.isArray(raw.complianceAndKPIs?.gapAnalysisAndRecommendations)
            ? raw.complianceAndKPIs.gapAnalysisAndRecommendations
            : Array.isArray(raw.complianceAndKPIs?.complianceGapsAndRecommendations)
            ? raw.complianceAndKPIs.complianceGapsAndRecommendations
            : []
        },
        executiveSummarySnippet: raw.executiveSummarySnippet || 'تم تلخيص واستخراج الهيكل التنفيذي للسياسة بنجاح وفق معايير الاعتماد المعتمدة.',
        analyzedAt: new Date().toISOString(),
      };

      setAnalysisResult(result);
      localStorage.setItem('last_analyzed_policy', JSON.stringify(result));

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      let displayMessage = 'حدث خطأ غير متوقع أثناء معالجة السياسة بالذكاء الاصطناعي.';
      if (typeof err === 'string') {
        displayMessage = err;
      } else if (err?.message && typeof err.message === 'string') {
        displayMessage = err.message;
      } else if (err && typeof err === 'object') {
        displayMessage = err.toString() !== '[object Object]' ? err.toString() : JSON.stringify(err);
      }
      setErrorMessage(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech playback for executive summary
  const handleToggleSpeech = () => {
    if (!analysisResult?.executiveSummarySnippet) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(analysisResult.executiveSummarySnippet);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    if (!analysisResult) return;
    const textToCopy = `
ملخص السياسة الطبية: ${analysisResult.policyCard.titleArabic}
كود السياسة: ${analysisResult.policyCard.policyCode}
المجال: ${analysisResult.policyCard.domain}

${analysisResult.executiveSummarySnippet}

المعايير المرجعية:
${analysisResult.policyCard.alignedStandards.map((s) => `- ${s.standardBody}: ${s.description}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const clearForm = () => {
    setPolicyText('');
    setUploadedFile(null);
    setErrorMessage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('waheed_ipc_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-emerald-700 text-white flex items-center justify-center font-black font-mono shadow-xs">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-950 text-base sm:text-lg font-mono tracking-tight leading-none">
                  Waheed IPC
                </span>
                <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  لوحة التحكم المعتمدة
                </span>
              </div>
              <p className="text-2xs text-slate-500 font-medium mt-0.5">
                محلل السياسات الطبية ومكافحة العدوى | GAHAR 2025 • CBAHI • JCI • OSHA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && (
              <>
                <button
                  id="nav-ask-expert-btn"
                  onClick={() => setIsExpertModalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>استشر الخبير</span>
                </button>

                <button
                  id="nav-print-btn"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                  title="طباعة أو تحميل التقرير بصيغة A4 PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة / حفظ A4 (PDF)</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                clearForm();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تحليل سياسة جديدة</span>
            </button>

            <button
              id="logout-btn"
              onClick={handleLogout}
              title="تسجيل الخروج من المنظومة"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 no-print">
        {/* Hero & Accreditation Bar */}
        <section className="bg-slate-900 rounded-xl p-6 sm:p-7 text-white relative overflow-hidden shadow-sm border border-slate-800">
          <div className="relative z-10 space-y-3.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-900/80 text-blue-200 border border-blue-700/60 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-blue-300" />
                تحليل السياسات والإجراءات الطبية الشامل
              </span>
              <span className="px-2 py-0.5 rounded text-2xs bg-slate-800 text-slate-300 font-mono border border-slate-700">
                AI Clinical Engine v3.7
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight">
              تحليل وتلخيص وثائق السياسات الطبية ومكافحة العدوى والسلامة المهنية
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              توليد ملخصات تنفيذية دقيقة مقسمة إلى بطاقة السياسة، المسؤوليات، مسار خطوات العمل (SOP)، الإرشادات الحرجة، مخطط انسيابي تفاعلي بصيغة Mermaid.js، وقوائم تدقيق الاعتماد ومؤشرات الأداء KPIs وفق متطلبات CBAHI و JCI و OSHA.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-2xs font-semibold text-slate-300">
              <span className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> CBAHI Standards
              </span>
              <span className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-400" /> JCI Accreditation
              </span>
              <span className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> OSHA Safety & Health
              </span>
              <span className="bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-400" /> CDC / WHO Guidelines
              </span>
            </div>
          </div>
        </section>

        {/* Input & Policy Workbench */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-800" />
                <span>إدخال وثيقة السياسة أو رفع الملف الطبي</span>
              </h2>
              <p className="text-xs text-slate-500">
                ارفع وثيقة السياسة الطبية (PDF / Word / صور) أو الصق نص السياسة لتحليله وفق معايير جهار 2025 والدليل القومي
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold transition border border-blue-200 shadow-2xs"
              >
                <Upload className="w-4 h-4 text-blue-800" />
                <span>رفع وثيقة السياسة</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded file prominent display banner */}
          {uploadedFile ? (
            <div className="p-4 rounded-xl bg-blue-50/80 border-2 border-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold uppercase tracking-wider bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                      وثيقة السياسة المرفوعة
                    </span>
                    <span className="text-2xs text-slate-500">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-950 mt-0.5 break-all">
                    {uploadedFile.name}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100 rounded-lg transition"
                >
                  تغيير الملف
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء الملف</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-700 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-800 transition">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-900">
                  اضغط هنا لرفع ملف السياسة (PDF / Word / صور)
                </p>
                <p className="text-2xs text-slate-500 mt-0.5">
                  سيتم قراءة محتوى الوثيقة واستخراج الهيكل والملخص التنفيذي مباشرة
                </p>
              </div>
            </div>
          )}

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label htmlFor="policy-textarea" className="font-bold">
                نص السياسة أو مسودة الإجراء الطبي:
              </label>
              {policyText && (
                <button
                  onClick={clearForm}
                  className="text-slate-400 hover:text-slate-600 text-2xs"
                >
                  مسح النص
                </button>
              )}
            </div>
            <textarea
              id="policy-textarea"
              rows={7}
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="اكتب أو الصق نص وثيقة السياسة، خطوات العمل، أو الإجراءات الطبية هنا..."
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-slate-50/50"
            />
          </div>

          {/* Config Controls (Standard Focus & Custom instructions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-800" />
                <span>التركيز المرجعي ومعايير الاعتماد:</span>
              </label>
              <select
                value={standardFocus}
                onChange={(e) => setStandardFocus(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-800"
              >
                <option value="معايير جهار 2025 والدليل القومي لمكافحة العدوى 2020 (GAHAR & National IPC Guidelines)">
                  ⭐ معايير جهار 2025 والدليل القومي المصري لمكافحة العدوى 2020 (GAHAR & National Guidelines)
                </option>
                <option value="شامل معتمد (GAHAR 2025 + الدليل القومي + CBAHI + JCI + OSHA)">
                  معايير شاملة موحدة (GAHAR 2025 + الدليل القومي + CBAHI + JCI + OSHA)
                </option>
                <option value="معايير المركز السعودي لاعتماد المنشآت الصحية (CBAHI Focused)">
                  معايير المركز السعودي لاعتماد المنشآت الصحية (CBAHI)
                </option>
                <option value="معايير الهيئة الدولية المشتركة (JCI Focused)">
                  معايير الهيئة الدولية المشتركة لاعتماد المستشفيات (JCI)
                </option>
                <option value="السلامة والصحة المهنية وإدارة المرافق (OSHA & FMS Focused)">
                  معايير السلامة والصحة المهنية وإدارة المرافق (OSHA & FMS)
                </option>
                <option value="مكافحة العدوى والترصد الوبائي (CDC / WHO IPC Guidelines)">
                  إرشادات مكافحة العدوى والترصد الوبائي (CDC / WHO IPC)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                توجيهات إضافية للمحلل (اختياري):
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="مثال: ركز على دور التمريض، أو أضف نقاط تفتيش غرف العناية المركزة..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-800"
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit CTA Button */}
          <div className="pt-1">
            <button
              id="analyze-policy-cta-btn"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري تحليل الوثيقة واستخراج الهيكل الإلزامي ومخطط Mermaid...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تحليل وتوليد الملخص التنفيذي ومخطط التدفق (SOP & Mermaid)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {analysisResult && (
          <div ref={resultsRef} className="space-y-6 pt-2">
            {/* Executive Summary Callout Box */}
            <section className="bg-slate-900 rounded-xl p-5 sm:p-6 text-white shadow-sm border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-2xs font-bold bg-blue-900/80 text-blue-200 border border-blue-700/60">
                      ملخص تنفيذي معتمد
                    </span>
                    <span className="text-2xs text-slate-300 font-mono">
                      {analysisResult.policyCard.policyCode}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
                    {analysisResult.policyCard.titleArabic}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleToggleSpeech}
                    title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'قراءة صوتية للملخص'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isSpeaking
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-700'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'إيقاف الصوت' : 'استمع للملخص'}</span>
                  </button>

                  <button
                    onClick={() => setIsA4ModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs"
                    title="معاينة وطباعة ورقة المراجعة النهائية المنسقة A4"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>📄 ورقة المراجعة النهائية A4</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition shadow-xs"
                    title="الطباعة المباشرة لملف A4"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة سريعة</span>
                  </button>

                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
                  >
                    {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? 'تم النسخ' : 'نسخ الملخص'}</span>
                  </button>

                  <button
                    onClick={() => setIsExpertModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>استشر الخبير</span>
                  </button>
                </div>
              </div>

              <div className="pt-3.5">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                  {analysisResult.executiveSummarySnippet}
                </p>
              </div>
            </section>

            {/* Quick Section Anchor Tabs */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'كافة الأقسام' },
                { id: 'a4', label: '📄 ورقة المراجعة النهائية (A4)' },
                { id: 'card', label: '1. بطاقة السياسة' },
                { id: 'scope', label: '2. الهدف والنطاق' },
                { id: 'roles', label: '3. الأدوار والمسؤوليات' },
                { id: 'sop', label: '4. خطوات العمل (SOP)' },
                { id: 'warnings', label: '5. التحذيرات الحرجة' },
                { id: 'flowchart', label: '6. المخطط الانسيابي' },
                { id: 'kpis', label: '7. معايير التدقيق و KPIs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeSection === tab.id
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Structured Sections Output */}
            <div className="space-y-5">
              {/* Dedicated A4 Sheet View */}
              {activeSection === 'a4' && (
                <div className="bg-slate-200 p-4 sm:p-8 rounded-2xl border border-slate-300 shadow-inner flex flex-col items-center gap-4">
                  <div className="w-full max-w-[210mm] flex items-center justify-between gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-300 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>معاينة ورقة المراجعة النهائية للسياسة (Standard A4 Review Document)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة / حفظ PDF</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full flex justify-center overflow-x-auto">
                    <A4FinalReviewDocument data={analysisResult} isPrintOnly={false} />
                  </div>
                </div>
              )}

              {/* Section 1: Policy Card */}
              {(activeSection === 'all' || activeSection === 'card') && (
                <PolicyCardSection card={analysisResult.policyCard} />
              )}

              {/* Section 2: Purpose & Scope */}
              {(activeSection === 'all' || activeSection === 'scope') && (
                <PurposeScopeSection data={analysisResult.purposeAndScope} />
              )}

              {/* Section 3: Roles & Responsibilities */}
              {(activeSection === 'all' || activeSection === 'roles') && (
                <RolesSection roles={analysisResult.rolesAndResponsibilities} />
              )}

              {/* Section 4: SOP Steps */}
              {(activeSection === 'all' || activeSection === 'sop') && (
                <SopSection sop={analysisResult.sopPhases} />
              )}

              {/* Section 5: Safety Warnings & Critical Steps */}
              {(activeSection === 'all' || activeSection === 'warnings') && (
                <SafetyWarningsSection warnings={analysisResult.safetyWarningsAndCriticalSteps} />
              )}

              {/* Section 6: Mermaid Flowchart */}
              {(activeSection === 'all' || activeSection === 'flowchart') && (
                <MermaidViewer
                  code={analysisResult.mermaidFlowchart.code}
                  description={analysisResult.mermaidFlowchart.description}
                  title="6. مخطط تدفق الإجراءات الانسيابي (Mermaid.js Flowchart Code)"
                />
              )}

              {/* Section 7: Audit Checklist & KPIs */}
              {(activeSection === 'all' || activeSection === 'kpis') && (
                <AuditAndKpisSection
                  data={analysisResult.complianceAndKPIs}
                  policyTitle={analysisResult.policyCard.titleArabic}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 mt-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-800" />
            <span>
              نظام تحليل السياسات الطبية ومكافحة العدوى والسلامة المهنية | CBAHI • JCI • OSHA Standards
            </span>
          </div>
          <div>
            <span>منصة متوافقة مع معايير جودة الرعاية الصحية وإدارة المخاطر السريرية</span>
          </div>
        </div>
      </footer>

      {/* A4 Fullscreen / Preview Modal */}
      {analysisResult && (
        <A4PreviewModal
          isOpen={isA4ModalOpen}
          onClose={() => setIsA4ModalOpen(false)}
          data={analysisResult}
        />
      )}

      {/* Ask Expert Consultation Modal */}
      {analysisResult && (
        <AskExpertModal
          isOpen={isExpertModalOpen}
          onClose={() => setIsExpertModalOpen(false)}
          analysisData={analysisResult}
        />
      )}

      {/* Hidden Official Printable Document */}
      {analysisResult && <PrintableReport data={analysisResult} />}
    </div>
  );
}
