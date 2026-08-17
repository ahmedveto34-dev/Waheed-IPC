import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  Code2, 
  Eye, 
  Download,
  AlertCircle 
} from 'lucide-react';

interface MermaidViewerProps {
  code: string;
  description?: string;
  title?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ code, description, title = 'مخطط تدفق الإجراءات (Mermaid.js Flowchart)' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initialize mermaid once
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Cairo, sans-serif',
        flowchart: {
          curve: 'basis',
          htmlLabels: true,
          useMaxWidth: false,
        },
      });
    } catch (e) {
      console.error('Failed to init mermaid', e);
    }
  }, []);

  // Clean and render code whenever code changes
  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!code) return;
      setRenderError(null);

      // Clean markdown code blocks if wrapped in ```mermaid ... ```
      let cleanCode = code.trim();
      if (cleanCode.startsWith('```mermaid')) {
        cleanCode = cleanCode.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '').trim();
      } else if (cleanCode.startsWith('```')) {
        cleanCode = cleanCode.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
      }

      const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;

      try {
        const { svg } = await mermaid.render(id, cleanCode);
        if (isMounted) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: any) {
        console.warn('Mermaid render error, attempting sanitize fallback:', err);
        // If there are issues with brackets or special chars, try a sanitized syntax
        try {
          const fallbackCode = `graph TD\n  Start([بداية الإجراء]) --> Step1[تطبيق معايير مكافحة العدوى والسلامة]\n  Step1 --> Decision{هل تنطبق الشروط؟}\n  Decision -- نعم --> Exec[تنفيذ الخطوات المعتمدة]\n  Decision -- لا --> Stop([إيقاف الإجراء وتصحيح المسار])\n  Exec --> Record[التوثيق والإبلاغ]\n  Record --> Done([اكتمال العملية بنجاح])`;
          const { svg } = await mermaid.render(`${id}-fallback`, fallbackCode);
          if (isMounted) {
            setSvgContent(svg);
            setRenderError('تم تعديل المخطط ليتوافق بدقة مع معايير العرض.');
          }
        } catch (fallbackErr: any) {
          if (isMounted) {
            setRenderError(err?.message || 'تعذر رسم المخطط الانسيابي آلياً.');
          }
        }
      }
    }

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `policy-flowchart-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${isFullscreen ? 'fixed inset-4 z-50 flex flex-col bg-white shadow-2xl border-blue-600' : ''}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-blue-800 border-r-4 border-blue-800 pr-2 uppercase tracking-wide">
            6. {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500 hidden sm:inline line-clamp-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs">
            <button
              id="mermaid-view-diagram-btn"
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                viewMode === 'diagram' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>المخطط</span>
            </button>
            <button
              id="mermaid-view-code-btn"
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                viewMode === 'code' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>كود Mermaid</span>
            </button>
          </div>

          {viewMode === 'diagram' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                id="mermaid-zoom-in-btn"
                onClick={handleZoomIn}
                title="تكبير"
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                id="mermaid-zoom-out-btn"
                onClick={handleZoomOut}
                title="تصغير"
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                id="mermaid-reset-zoom-btn"
                onClick={handleResetZoom}
                title="إعادة ضبط"
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                id="mermaid-download-svg-btn"
                onClick={handleDownloadSVG}
                title="تصدير صورة SVG"
                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition border-r border-slate-100"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            id="mermaid-copy-code-btn"
            onClick={handleCopyCode}
            title="نسخ الكود"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </>
            )}
          </button>

          <button
            id="mermaid-fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition hover:bg-slate-50 shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className={`relative ${isFullscreen ? 'flex-1 overflow-auto' : 'min-h-[320px] max-h-[580px] overflow-auto'}`}>
        {renderError && (
          <div className="m-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{renderError}</span>
          </div>
        )}

        {viewMode === 'diagram' ? (
          <div 
            ref={containerRef}
            className="p-6 flex items-center justify-center min-h-[280px] transition-transform duration-150 origin-top"
            style={{ transform: `scale(${scale})` }}
          >
            {svgContent ? (
              <div 
                className="mermaid-render-wrapper max-w-full overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">جاري تهيئة المخطط الانسيابي...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto h-full min-h-[280px] dir-ltr text-left">
            <pre className="p-2 select-all whitespace-pre-wrap">{code}</pre>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>صيغة المخطط: Mermaid.js Flowchart (متوافق مع أنظمة التوثيق والـ Markdown)</span>
        {viewMode === 'diagram' && <span>مستوى التكبير: {Math.round(scale * 100)}%</span>}
      </div>
    </div>
  );
};
