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
  Sparkles
} from 'lucide-react';

import { PolicyAnalysisResult } from './types';
import { PrintableReport } from './components/PrintableReport';
import { A4FinalReviewDocument } from './components/A4FinalReviewDocument';
import { LoginPage } from './components/LoginPage';

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
  const [copySuccess, setCopySuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [analysisResult]);

  // File Upload Handler (PDF, Word, Images, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

          {/* File Upload Box */}
          {uploadedFile ? (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-blue-950">
                    {uploadedFile.name}
                  </p>
                  <p className="text-2xs text-blue-700">
                    {(uploadedFile.size / 1024).toFixed(1)} كيلوبايت — جاهز للتحليل والتلخيص المباشر
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-800"
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
              className="w-full py-3.5 px-6 rounded-xl bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري تلخيص السياسة وتنسيق ورقة المراجعة النهائية A4...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>تلخيص السياسة وتوليد ورقة المراجعة النهائية (A4)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section: Direct Formatted A4 Final Review Document */}
        {analysisResult && (
          <div ref={resultsRef} className="space-y-4 pt-2">
            {/* Minimal Clean Toolbar for A4 Document */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      ورقة المراجعة النهائية المنسقة (A4 Executive Review)
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-2xs font-bold border border-emerald-200">
                      جاهزة للاعتماد والطباعة
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 font-mono">
                    كود الوثيقة: {analysisResult.policyCard.policyCode || 'IPC-POL-01'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm hover:shadow active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة / حفظ PDF (A4)</span>
                </button>
              </div>
            </div>

            {/* Direct A4 Paper Sheet Display */}
            <div className="bg-slate-200/90 p-3 sm:p-8 rounded-2xl border border-slate-300 shadow-inner flex justify-center overflow-x-auto no-print">
              <A4FinalReviewDocument data={analysisResult} isPrintOnly={false} />
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
