import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Filter, 
  Copy, 
  Trash2,
  LogOut,
  Sparkles,
  FileDown,
  Loader2
} from 'lucide-react';

import { PolicyAnalysisResult } from './types';
import { SAMPLE_POLICIES } from './data/samplePolicies';
import { PrintableReport } from './components/PrintableReport';
import { A4FinalReviewDocument } from './components/A4FinalReviewDocument';
import { GeminiStyleSummary } from './components/GeminiStyleSummary';
import { LoginPage } from './components/LoginPage';
import { exportElementToPdf } from './utils/pdfExport';

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
  const [isDragging, setIsDragging] = useState(false);
  const [standardFocus, setStandardFocus] = useState('معايير جهار 2025 والدليل القومي لمكافحة العدوى 2020 (GAHAR & National IPC Guidelines)');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PolicyAnalysisResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'gemini' | 'a4'>('gemini');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const a4ContainerRef = useRef<HTMLDivElement | null>(null);
  const hiddenA4Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [analysisResult]);

  // File processing helper
  const processSelectedFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt|png|jpe?g)$/i)) {
      setErrorMessage('صيغة الملف غير مدعومة. يرجى رفع ملف بصيغة PDF أو Word أو TXT أو صورة واضحة.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('حجم الملف كبير جداً. الحد الأقصى المسموح به هو 25 ميجابايت.');
      return;
    }

    setErrorMessage(null);

    const reader = new FileReader();

    if (file.type === 'text/plain') {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPolicyText(text);
        setUploadedFile({
          name: file.name,
          type: file.type,
          size: file.size,
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const base64Data = (event.target?.result as string).split(',')[1];
        setUploadedFile({
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          base64: base64Data,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // File Upload Handler (PDF, Word, Images, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  const loadSamplePolicy = (sample: typeof SAMPLE_POLICIES[0]) => {
    setPolicyText(sample.content);
    setUploadedFile(null);
    setErrorMessage(null);
  };

  // Direct Policy Summarization Handler
  const handleAnalyze = async () => {
    if (!policyText.trim() && !uploadedFile?.base64) {
      setErrorMessage('يرجى كتابة أو لصق نص السياسة، أو رفع وثيقة السياسة (PDF / Word / صورة) للبدء في التلخيص.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: policyText.trim() || undefined,
          fileData: uploadedFile?.base64 || undefined,
          mimeType: uploadedFile?.type || undefined,
          standardFocus,
          customInstructions: customInstructions.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `فشل الاتصال بالخادم (${response.status})`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error('لم يتم استلام هيكل التلخيص بشكل صحيح.');
      }

      // Resilient data normalization
      const raw = result.data;
      const normalizedResult: PolicyAnalysisResult = {
        policyCard: {
          titleArabic: raw.policyCard?.titleArabic || 'سياسة وإجراءات مكافحة العدوى والسلامة',
          titleEnglish: raw.policyCard?.titleEnglish || 'Infection Prevention and Clinical Safety Policy',
          policyCode: raw.policyCard?.policyCode || 'GAHAR-IPC-01',
          domain: raw.policyCard?.domain || 'مكافحة العدوى والوقاية منها (Infection Prevention & Control)',
          departments: Array.isArray(raw.policyCard?.departments) ? raw.policyCard.departments : ['كافة الأقسام الإكلينيكية والتمريض'],
          effectiveDate: raw.policyCard?.effectiveDate || new Date().toISOString().split('T')[0],
          reviewCycle: raw.policyCard?.reviewCycle || 'سنوياً',
          alignedStandards: Array.isArray(raw.policyCard?.alignedStandards) ? raw.policyCard.alignedStandards : [
            {
              standardBody: 'معايير جهار (GAHAR 2025)',
              clauseNumber: 'IPC.1',
              description: 'تطبيق الاحتياطات القياسية لمكافحة العدوى وسلامة البيئة'
            }
          ]
        },
        purposeAndScope: {
          mainObjective: raw.purposeAndScope?.mainObjective || 'الحد من انتقال العدوى المكتسبة وضمان سلامة المرضى والممارسين الصحيين.',
          clinicalRationale: raw.purposeAndScope?.clinicalRationale || 'خفض معدلات العدوى بالمستشفيات والامتثال لمتطلبات الجودة والاعتماد.',
          scope: Array.isArray(raw.purposeAndScope?.scope) ? raw.purposeAndScope.scope : ['جميع الكوادر الطبية والتمريضية والخدمات المساندة'],
          exclusions: Array.isArray(raw.purposeAndScope?.exclusions) ? raw.purposeAndScope.exclusions : []
        },
        scientificDefinitions: Array.isArray(raw.scientificDefinitions) ? raw.scientificDefinitions : [],
        technicalSpecifications: Array.isArray(raw.technicalSpecifications) ? raw.technicalSpecifications : [],
        fiveMomentsDetails: Array.isArray(raw.fiveMomentsDetail) ? raw.fiveMomentsDetail : Array.isArray(raw.fiveMomentsDetails) ? raw.fiveMomentsDetails : [],
        skinAndGloveCare: raw.skinAndGloveCare || undefined,
        infrastructureRequirements: raw.infrastructureRequirements || undefined,
        rolesAndResponsibilities: Array.isArray(raw.rolesAndResponsibilities) ? raw.rolesAndResponsibilities : [],
        sopPhases: {
          preProcedure: Array.isArray(raw.sopPhases?.preProcedure) ? raw.sopPhases.preProcedure : [],
          execution: Array.isArray(raw.sopPhases?.execution) ? raw.sopPhases.execution : [],
          postProcedure: Array.isArray(raw.sopPhases?.postProcedure) ? raw.sopPhases.postProcedure : []
        },
        safetyWarningsAndCriticalSteps: {
          criticalControlPoints: Array.isArray(raw.safetyWarningsAndCriticalSteps?.criticalControlPoints)
            ? raw.safetyWarningsAndCriticalSteps.criticalControlPoints
            : ['الالتزام بالحركات الخمس لنظافة الأيدي وقواعد الحقن الآمن'],
          dos: Array.isArray(raw.safetyWarningsAndCriticalSteps?.dos)
            ? raw.safetyWarningsAndCriticalSteps.dos
            : ['الالتزام بالواقيات الشخصية وتطهير الأيدي'],
          donts: Array.isArray(raw.safetyWarningsAndCriticalSteps?.donts)
            ? raw.safetyWarningsAndCriticalSteps.donts
            : ['يحظر إعادة تغطية الإبر باليدين أو مخالفة إجراءات العزل'],
          emergencyIncidentProtocol: raw.safetyWarningsAndCriticalSteps?.emergencyIncidentProtocol || 'غسل الموضع فوراً بالماء والصابون وإبلاغ مشرف السلامة ومكافحة العدوى فوراً.'
        },
        mermaidFlowchart: {
          code: raw.mermaidFlowchart?.code || `flowchart TD\nStart([بدء الإجراء]) --> Prep[1. نظافة الأيدي وارتداء الواقيات]\nPrep --> Exec[2. التنفيذ بالأسلوب المانع للتلوث]\nExec --> Waste[3. التخلص الآمن من النفايات]\nWaste --> Doc([4. التوثيق والمتابعة])`,
          description: raw.mermaidFlowchart?.description || 'مخطط سير الإجراءات القياسي'
        },
        complianceAndKPIs: {
          auditChecklist: Array.isArray(raw.complianceAndKPIs?.auditChecklist) ? raw.complianceAndKPIs.auditChecklist : [],
          kpis: Array.isArray(raw.complianceAndKPIs?.kpis) ? raw.complianceAndKPIs.kpis : [],
          gapAnalysisAndRecommendations: Array.isArray(raw.complianceAndKPIs?.gapAnalysisAndRecommendations) ? raw.complianceAndKPIs.gapAnalysisAndRecommendations : []
        },
        executiveSummarySnippet: raw.executiveSummarySnippet || 'تم تلخيص وتدقيق محاور هذه السياسة لتتوافق مع معايير جهار 2025 والدليل القومي المصري لمكافحة العدوى.'
      };

      setAnalysisResult(normalizedResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء تحليل السياسة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDirectPdfDownload = async () => {
    const targetElement = viewMode === 'a4' ? a4ContainerRef.current : hiddenA4Ref.current;
    if (!targetElement || isExportingPdf || !analysisResult) return;

    setIsExportingPdf(true);
    setExportProgress('جاري تحضير وتنسيق عناصر الملخص للتحميل كـ PDF...');

    try {
      const code = analysisResult.policyCard?.policyCode || 'Policy';
      const cleanTitle = (analysisResult.policyCard?.titleArabic || 'Medical_Policy')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .slice(0, 40);
      const filename = `${code}_${cleanTitle}_Executive_Review.pdf`;

      await exportElementToPdf(targetElement, {
        filename,
        title: analysisResult.policyCard?.titleArabic,
        onProgress: (text) => setExportProgress(text)
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  const handleCopySummary = async () => {
    if (!analysisResult) return;
    const text = `
ملخص المراجعة النهائية للسياسة الطبية (A4 Executive Review)
======================================================
اسم السياسة: ${analysisResult.policyCard.titleArabic}
كود السياسة: ${analysisResult.policyCard.policyCode}
تاريخ التفعيل: ${analysisResult.policyCard.effectiveDate}
المجال: ${analysisResult.policyCard.domain}

1. الملخص التنفيذي والنقاط الذهبية:
${analysisResult.executiveSummarySnippet}

2. الهدف ونطاق التطبيق:
الهدف: ${analysisResult.purposeAndScope.mainObjective}
المبرر الإكلينيكي: ${analysisResult.purposeAndScope.clinicalRationale}
النطاق: ${analysisResult.purposeAndScope.scope.join('، ')}

3. مصفوفة المحظورات والإلزاميات:
- الممارسات الإلزامية (DOs):
${(analysisResult.safetyWarningsAndCriticalSteps.dos || []).map((d: any) => `  * ${d}`).join('\n')}
- المحظورات الصارمة (DON'Ts):
${(analysisResult.safetyWarningsAndCriticalSteps.donts || []).map((d: any) => `  * ${d}`).join('\n')}

4. بروتوكول الطوارئ والاستجابة الفورية:
${analysisResult.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const clearForm = () => {
    setPolicyText('');
    setUploadedFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('waheed_ipc_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col" dir="rtl">
      {/* Top Main Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm border border-blue-500">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  Waheed IPC
                </span>
                <span className="text-2xs bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-700/60 hidden sm:inline">
                  GAHAR 2025 • CBAHI • JCI
                </span>
              </div>
              <p className="text-2xs text-slate-400">
                منظومة تلخيص السياسات الطبية ومكافحة العدوى والاعتماد الصحي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                title="طباعة ورقة المراجعة النهائية المنسقة A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة / حفظ (PDF) A4</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 text-xs font-bold transition border border-slate-700"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Input Card Form */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  تلخيص السياسة الطبية وإعداد ورقة المراجعة النهائية (A4)
                </h1>
                <p className="text-2xs sm:text-xs text-slate-500">
                  الصق نص السياسة أو ارفع ملف PDF / Word للتلخيص المباشر وفق معايير جهار والدليل القومي
                </p>
              </div>
            </div>

            {(policyText || uploadedFile || analysisResult) && (
              <button
                onClick={clearForm}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط النموذج</span>
              </button>
            )}
          </div>

          {/* Error Message Callout */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">تنبيه:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,image/*"
            className="hidden"
          />

          {/* File Upload / Drag & Drop Box */}
          {uploadedFile ? (
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-blue-950">
                      {uploadedFile.name}
                    </p>
                    <span className="text-3xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      جاهز للتنسيق الفوري
                    </span>
                  </div>
                  <p className="text-2xs text-blue-700 mt-0.5">
                    الحجم: {(uploadedFile.size / 1024).toFixed(1)} ك.ب • سيتم استخراج الهيكل والبنود كاملة في قالب التنسيق الموحد
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                >
                  تغيير الملف
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء الملف</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 group ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-600 hover:bg-blue-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-800 group-hover:scale-110 transition">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-900">
                  اسحب وأفلت وثيقة السياسة هنا أو اضغط للاختيار من جهازك
                </p>
                <p className="text-2xs text-slate-500 mt-1">
                  ندعم صيغ: PDF ، Word (.docx / .doc) ، المستندات النصية (.txt) ، والصور الممسوحة ضوئياً
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                <span className="text-3xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">PDF</span>
                <span className="text-3xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">Word .docx</span>
                <span className="text-3xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">Scanned Images</span>
                <span className="text-3xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">✨ تنسيق فوري بدون فقدان بنود</span>
              </div>
            </div>
          )}

          {/* Quick Sample Policies Picker */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-2xs text-slate-600 font-bold">
              <span className="flex items-center gap-1.5 text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>أو جرّب التنسيق الفوري بنقرة واحدة على سياسة جاهزة:</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SAMPLE_POLICIES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSamplePolicy(sample)}
                  className="text-right p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-xs space-y-1 shadow-2xs group cursor-pointer"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-900 line-clamp-1">
                    {sample.title}
                  </div>
                  <div className="text-3xs text-slate-500 flex items-center justify-between">
                    <span>{sample.category}</span>
                    <span className="text-blue-700 font-bold group-hover:underline">تحميل ⟵</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label htmlFor="policy-textarea" className="font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-800" />
                <span>نص السياسة أو مسودة الإجراء الطبي (مستخرج أو مكتوب):</span>
              </label>
              {policyText && (
                <button
                  onClick={() => setPolicyText('')}
                  className="text-slate-400 hover:text-rose-600 text-2xs cursor-pointer"
                >
                  مسح النص
                </button>
              )}
            </div>
            <textarea
              id="policy-textarea"
              rows={6}
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="اكتب أو الصق نص وثيقة السياسة، خطوات العمل، أو الإجراءات الطبية هنا..."
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-slate-50/50"
            />
          </div>

          {/* Config Reference Standards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-800" />
                <span>التركيز المرجعي ومعايير الاعتماد:</span>
              </label>
              <select
                value={standardFocus}
                onChange={(e) => setStandardFocus(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-800 cursor-pointer"
              >
                <option value="معايير جهار 2025 والدليل القومي لمكافحة العدوى 2020 (GAHAR & National IPC Guidelines)">
                  ⭐ معايير جهار 2025 والدليل القومي المصري لمكافحة العدوى 2020 (GAHAR & National Guidelines)
                </option>
                <option value="معايير سباهي لمكافحة العدوى (CBAHI Infection Control Standards)">
                  🇸🇦 معايير المركز السعودي للاعتماد (CBAHI IPC Standards)
                </option>
                <option value="معايير الهيئة الدولية المشتركة (JCI Hospital Standards - PCI)">
                  🌐 المعايير الدولية المشتركة (JCI - PCI Standards)
                </option>
                <option value="معايير السلامة والصحة المهنية ومخاطر الدم (OSHA Bloodborne Pathogens)">
                  🛡️ معايير السلامة والصحة المهنية (OSHA Standards)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ملاحظات أو توجيهات خاصة بالمنشأة (اختياري):
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="مثال: التركيز على العناية المركزة، قساطر البول، أو غرف العزل..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-800"
              />
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-1">
            <button
              id="analyze-policy-cta-btn"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-900 hover:from-blue-900 hover:to-indigo-950 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري قراءة السياسة وتنسيقها في القالب الموحد الشامل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>تنسيق وتوليد الملخص الموحد الشامل للسياسة (Professional Formatted Summary)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section: Direct Formatted A4 Final Review Document or Gemini Style Summary */}
        {analysisResult && (
          <div ref={resultsRef} className="space-y-4 pt-2">
            {/* View Mode Switcher Header */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
              {/* Tab Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('gemini')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    viewMode === 'gemini'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ملخص الذكاء الاصطناعي (ChatGPT & Gemini)</span>
                </button>

                <button
                  onClick={() => setViewMode('a4')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    viewMode === 'a4'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>وثيقة المراجعة المعتمدة (A4 Document)</span>
                </button>
              </div>

              {/* Quick Global Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Direct High-Quality PDF Export Button */}
                <button
                  onClick={handleDirectPdfDownload}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-blue-900 text-white font-bold text-xs transition shadow-sm hover:shadow active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                  title="تصدير وتحميل الملخص مباشرة كملف PDF عالي الجودة"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-200" />
                      <span>جاري التصدير...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>تصدير PDF مباشر</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
                  title="نسخ ملخص السياسة"
                >
                  {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'تم النسخ' : 'نسخ الملخص'}</span>
                </button>

                <button
                  onClick={clearForm}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>سياسة جديدة</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm hover:shadow active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة عبر المتصفح</span>
                </button>
              </div>
            </div>

            {/* Export Progress Notification Banner */}
            {isExportingPdf && (
              <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-pulse">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{exportProgress || 'جاري توليد ملف PDF عالي الجودة يضم كافة الجداول والصور والنصوص...'}</span>
                </div>
                <span className="text-2xs bg-blue-700 px-2 py-0.5 rounded font-mono">DPI: 300</span>
              </div>
            )}

            {/* Active View Container */}
            {viewMode === 'gemini' ? (
              <GeminiStyleSummary
                data={analysisResult}
                onSwitchToA4={() => setViewMode('a4')}
              />
            ) : (
              <div className="bg-slate-200/90 p-3 sm:p-8 rounded-2xl border border-slate-300 shadow-inner flex justify-center overflow-x-auto no-print">
                <div ref={a4ContainerRef} className="w-[210mm] bg-white">
                  <A4FinalReviewDocument data={analysisResult} isPrintOnly={false} />
                </div>
              </div>
            )}

            {/* Hidden Offscreen Container for Direct PDF Export from any tab */}
            <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-0" aria-hidden="true">
              <div ref={hiddenA4Ref} className="w-[210mm] bg-white">
                <A4FinalReviewDocument data={analysisResult} isPrintOnly={false} />
              </div>
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
              نظام تلخيص السياسات الطبية ومكافحة العدوى والسلامة المهنية | GAHAR 2025 • CBAHI • JCI • OSHA
            </span>
          </div>
          <div>
            <span>منصة متوافقة مع معايير جودة الرعاية الصحية وإدارة المخاطر السريرية</span>
          </div>
        </div>
      </footer>

      {/* Official Printable Document for window.print() */}
      {analysisResult && <PrintableReport data={analysisResult} />}
    </div>
  );
}
