import React, { useState } from 'react';
import { PolicyAnalysisResult } from '../types';
import { A4FinalReviewDocument } from './A4FinalReviewDocument';
import { 
  X, 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';

interface A4PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PolicyAnalysisResult;
}

export const A4PreviewModal: React.FC<A4PreviewModalProps> = ({ isOpen, onClose, data }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isCopied, setIsCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const text = `
ملخص المراجعة النهائية للسياسة الطبية
=====================================
اسم السياسة: ${data.policyCard.titleArabic}
كود السياسة: ${data.policyCard.policyCode}
المجال: ${data.policyCard.domain}
تاريخ التفعيل: ${data.policyCard.effectiveDate}

1. الملخص التنفيذي والنقاط الذهبية:
${data.executiveSummarySnippet}

2. الهدف ونطاق التطبيق:
الهدف: ${data.purposeAndScope.mainObjective}
المبرر: ${data.purposeAndScope.clinicalRationale}
النطاق: ${data.purposeAndScope.scope.join('، ')}

3. المحظورات والممارسات الإلزامية:
- الممارسات الإلزامية (DOs):
${(data.safetyWarningsAndCriticalSteps.dos || []).map((d: any) => `  * ${d}`).join('\n')}
- المحظورات الصارمة (DON'Ts):
${(data.safetyWarningsAndCriticalSteps.donts || []).map((d: any) => `  * ${d}`).join('\n')}

4. بروتوكول الطوارئ:
${data.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol || 'الالتزام ببروتوكول السلامة المعتمد.'}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 no-print animate-fade-in" dir="rtl">
      <div 
        className={`bg-slate-100 rounded-2xl border border-slate-700 shadow-2xl flex flex-col w-full transition-all duration-200 overflow-hidden ${
          isMaximized ? 'fixed inset-2 z-50 h-[calc(100vh-1rem)]' : 'max-w-5xl max-h-[92vh]'
        }`}
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  ورقة المراجعة النهائية A4 (Executive Review & Audit Sheet)
                </h3>
                <span className="text-2xs bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-700/60 hidden sm:inline">
                  جاهزة للطباعة والاعتماد
                </span>
              </div>
              <p className="text-2xs text-slate-400">
                تنسيق معياري متوافق مع مقاسات الطباعة المعتمدة A4 Portrait
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setZoom((prev) => Math.max(prev - 10, 60))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300"
                title="تصغير"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-2xs font-bold text-slate-200">{zoom}%</span>
              <button
                onClick={() => setZoom((prev) => Math.min(prev + 10, 150))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300"
                title="تكبير"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
                title="إعادة ضبط الحجم"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>

            {/* Maximize / Minimize */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hidden sm:inline"
              title={isMaximized ? 'استعادة الحجم' : 'تكبير الشاشة'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80 flex justify-center">
          <div 
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-[210mm] transition-all"
          >
            <A4FinalReviewDocument data={data} isPrintOnly={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
