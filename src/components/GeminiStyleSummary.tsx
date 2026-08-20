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
  Bookmark,
  ShieldCheck,
  Type,
  RotateCcw
} from 'lucide-react';
import { PolicyAnalysisResult } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';

interface GeminiStyleSummaryProps {
  data: PolicyAnalysisResult;
  onSwitchToA4?: () => void;
  onReset?: () => void;
}

export function GeminiStyleSummary({ data, onSwitchToA4, onReset }: GeminiStyleSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const printContainerRef = useRef<HTMLDivElement>(null);

  const card = data.policyCard || ({} as any);

  // Generate clean unified markdown content if markdownSummary is not directly provided
  const formattedContent = useMemo(() => {
    if (data.markdownSummary && data.markdownSummary.trim().length > 0) {
      return data.markdownSummary;
    }

    // Build standard clean markdown summary from structured attributes
    let md = `# ${card.titleArabic || 'ملخص السياسة والإجراءات'}\n\n`;
    if (card.titleEnglish) {
      md += `*${card.titleEnglish}*\n\n`;
    }
    md += `**كود السياسة:** ${card.policyCode || 'POL-001'} | **تاريخ الاعتماد:** ${card.effectiveDate || '2025/2026'}\n\n---\n\n`;

    if (data.executiveSummarySnippet) {
      md += `## 1. الملخص التنفيذي\n\n${data.executiveSummarySnippet}\n\n`;
    }

    if (data.purposeAndScope?.mainObjective) {
      md += `## 2. الغرض والمبرر الإكلينيكي\n\n- **الهدف الأساسي:** ${data.purposeAndScope.mainObjective}\n`;
      if (data.purposeAndScope.clinicalRationale) {
        md += `- **المبرر الإكلينيكي:** ${data.purposeAndScope.clinicalRationale}\n`;
      }
      if (data.purposeAndScope.scope?.length) {
        md += `- **نطاق التطبيق:** ${data.purposeAndScope.scope.join('، ')}\n`;
      }
      md += `\n`;
    }

    if (data.scientificDefinitions?.length) {
      md += `## 3. التعريفات والمصطلحات الأساسية\n\n`;
      data.scientificDefinitions.forEach(def => {
        md += `- **${def.term}:** ${def.definition}\n`;
      });
      md += `\n`;
    }

    if (data.sopPhases?.execution?.length) {
      md += `## 4. خطوات العمل القياسية (SOPs)\n\n`;
      data.sopPhases.execution.forEach((step, idx) => {
        md += `${idx + 1}. **${step.title}:** ${step.details}\n`;
      });
      md += `\n`;
    }

    const safetyObj = (data.safetyWarningsAndCriticalSteps || {}) as any;
    const dontsList = safetyObj.donts || safetyObj.strictProhibitionsDonts || [];
    if (dontsList.length) {
      md += `## 5. المحظورات والخطوط الحمراء\n\n`;
      dontsList.forEach((dont: string) => {
        md += `- ⛔ ${dont}\n`;
      });
      md += `\n`;
    }

    if (data.complianceAndKPIs?.kpis?.length) {
      md += `## 6. مؤشرات الأداء والامتثال (KPIs)\n\n`;
      data.complianceAndKPIs.kpis.forEach(kpi => {
        md += `- **${kpi.name}:** المستهدف: ${kpi.target} (دورية القياس: ${kpi.frequency})\n`;
      });
      md += `\n`;
    }

    return md;
  }, [data, card]);

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
      
      {/* Action and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {card.titleArabic || 'ملخص السياسة المعتمد'}
            </h2>
            {card.policyCode && (
              <span className="text-2xs font-mono text-slate-500">
                كود: {card.policyCode}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size Adjuster */}
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

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
            title="نسخ ملخص السياسة"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الملخص'}</span>
          </button>

          <button
            onClick={handleDirectPdfDownload}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-900 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            title="طباعة"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
              title="تحليل سياسة جديدة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>سياسة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Organized Summary Document */}
      <div 
        ref={printContainerRef}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-slate-900"
      >
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
    </div>
  );
}
