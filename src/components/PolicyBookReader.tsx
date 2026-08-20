import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Printer, 
  FileDown, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  ListOrdered, 
  Eye, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  FlaskConical, 
  CheckCheck, 
  HelpCircle, 
  CheckSquare, 
  Activity, 
  RotateCcw,
  Send,
  Loader2,
  Share2,
  Maximize2,
  Minimize2,
  Sliders,
  Type
} from 'lucide-react';
import { PolicyAnalysisResult } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';

interface PolicyBookReaderProps {
  data: PolicyAnalysisResult;
  onSwitchView?: () => void;
}

type BookTheme = 'classic-cream' | 'clean-white' | 'royal-dark';

export function PolicyBookReader({ data, onSwitchView }: PolicyBookReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [viewStyle, setViewStyle] = useState<'paged' | 'continuous'>('paged');
  const [bookTheme, setBookTheme] = useState<BookTheme>('classic-cream');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2); // 1 to 4
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [showTocModal, setShowTocModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [checkedAuditItems, setCheckedAuditItems] = useState<Record<string, boolean>>({});

  // Mini advisor chat state
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorMessages, setAdvisorMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `أهلاً بك في الملحق التفاعلي لكتاب **«${data.policyCard?.titleArabic || 'السياسة الطبية'}»**. يمكنك سؤالي عن أي فصل أو معيار في هذا الكتاب.`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  const bookContainerRef = useRef<HTMLDivElement>(null);
  const continuousBookRef = useRef<HTMLDivElement>(null);

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
  const roles = Array.isArray(data.rolesAndResponsibilities) ? data.rolesAndResponsibilities : [];
  const sop = data.sopPhases || ({} as any);
  const safety = data.safetyWarningsAndCriticalSteps || ({} as any);
  const kpisData = data.complianceAndKPIs || ({} as any);

  const dosList: string[] = Array.isArray(safety?.mandatoryPracticesDos)
    ? safety.mandatoryPracticesDos
    : (Array.isArray(safety?.dos) ? safety.dos : []);
  const dontsList: string[] = Array.isArray(safety?.strictProhibitionsDonts)
    ? safety.strictProhibitionsDonts
    : (Array.isArray(safety?.donts) ? safety.donts : []);

  const kpiItems = Array.isArray(kpisData?.keyPerformanceIndicators)
    ? kpisData.keyPerformanceIndicators
    : (Array.isArray(kpisData?.kpis) ? kpisData.kpis : []);
  const auditItems = Array.isArray(kpisData?.auditChecklist)
    ? kpisData.auditChecklist
    : [];

  // Book Chapters Definition (أبواب وفصول الكتاب)
  const chapters = [
    { id: 0, title: 'الغلاف الرسمي والتقديم', subtitle: 'بطاقة السياسة والاعتمادات الدولية', icon: '📖' },
    { id: 1, title: 'الفصل الأول: الملخص والكبسولات الذهبية', subtitle: 'خلاصة السياسة والأرقام الحرجة', icon: '⭐' },
    { id: 2, title: 'الفصل الثاني: الأهداف ونطاق التطبيق', subtitle: 'المبرر الإكلينيكي والمسؤوليات', icon: '🎯' },
    { id: 3, title: 'الفصل الثالث: معجم المصطلحات العلمية', subtitle: 'التعريفات الحاكمة والأهمية السريرية', icon: '🔬' },
    { id: 4, title: 'الفصل الرابع: المواصفات الفنية والمطهرات', subtitle: 'مصفوفة التركيزات، المقادير وأزمنة التلامس', icon: '🧪' },
    { id: 5, title: 'الفصل الخامس: اللحظات الخمس (WHO 5 Moments)', subtitle: 'محطات التدخل الإلزامي وأمثلة إكلينيكية', icon: '✋' },
    { id: 6, title: 'الفصل السادس: خطوات العمل القياسية (SOPs)', subtitle: 'المراحل الثلاث: التحضير، التنفيذ، والإنهاء', icon: '📋' },
    { id: 7, title: 'الفصل السابع: مصفوفة المحظورات والأخطاء الشائعة', subtitle: 'الخطوط الحمراء ومقارنة الخطأ بالصواب', icon: '🚫' },
    { id: 8, title: 'الفصل الثامن: بنك أسئلة وأجوبة المرور الميداني', subtitle: 'أسئلة مقيمي الاعتماد والإجابات النموذجية', icon: '❓' },
    { id: 9, title: 'الفصل التاسع: التدقيق الميداني ومؤشرات الأداء', subtitle: 'قائمة المطابقة التفاعلية ونسب الامتثال المستهدفة', icon: '📊' },
    { id: 10, title: 'الملحق التفاعلي: المستشار وصندوق الاعتماد', subtitle: 'التوقيعات الرسمية والمستشار الذكي', icon: '✍️' },
  ];

  const totalPages = chapters.length;

  const toggleBookmark = (pageNum: number) => {
    setBookmarkedPages(prev => 
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum]
    );
  };

  const toggleAudit = (id: string) => {
    setCheckedAuditItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        handleNextPage(); // In RTL, Left is forward
      } else if (e.key === 'ArrowRight') {
        handlePrevPage(); // In RTL, Right is backward
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const handleExportBookPdf = async () => {
    const targetElement = continuousBookRef.current || bookContainerRef.current;
    if (!targetElement || isExportingPdf) return;
    setIsExportingPdf(true);
    setExportProgress('جاري تنسيق كتاب السياسة كاملاً للتحميل كـ PDF عالي الدقة...');

    try {
      const code = card.policyCode || 'Policy_Book';
      const cleanTitle = (card.titleArabic || 'Medical_Policy_Book')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .slice(0, 40);
      const filename = `${code}_${cleanTitle}_Official_Book.pdf`;

      await exportElementToPdf(targetElement, {
        filename,
        title: card.titleArabic,
        onProgress: (msg) => setExportProgress(msg)
      });
    } catch (err) {
      console.error('Book PDF export failed:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  const handleCopyBookSummary = () => {
    const content = `كتاب السياسة الإكلينيكية المعتمد: ${card.titleArabic || 'السياسة الطبية'}\nكود الوثيقة: ${card.policyCode || 'IPC-POL-001'}\n\n1. الهدف:\n${purpose.mainObjective || ''}\n\n2. خطوات العمل القياسية (SOPs):\n${sop.execution?.map((s: any) => `- ${s.title}: ${s.details}`).join('\n') || ''}\n\n3. المحظورات:\n${dontsList.map(d => `- ${d}`).join('\n') || ''}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendAdvisorQuery = async () => {
    if (!advisorInput.trim() || isAdvisorLoading) return;
    const text = advisorInput.trim();
    setAdvisorInput('');

    const newMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setAdvisorMessages(prev => [...prev, newMsg]);
    setIsAdvisorLoading(true);

    try {
      await new Promise(r => setTimeout(r, 600));
      let reply = `استناداً إلى كتاب **«${card.titleArabic || 'السياسة الطبية'}»**:\n\n`;
      if (text.includes('هدف') || text.includes('مبرر')) {
        reply += `• **الهدف السريري:** ${purpose.mainObjective || 'حماية المرضى والممارسين الصحيين ومنع انتشار العدوى'}.\n• **المبرر:** ${purpose.clinicalRationale || 'الالتزام بأحدث معايير الجودة والسلامة'}.`;
      } else if (text.includes('محظور') || text.includes('خطأ') || text.includes('ممنوع')) {
        reply += `• **أبرز المحظورات الواردة بالفصل السابع:**\n${dontsList.slice(0, 3).map(d => `  - ${d}`).join('\n')}`;
      } else if (text.includes('وقت') || text.includes('زمن') || text.includes('ثانية') || text.includes('كحول')) {
        reply += `• **الأزمنة والمقادير:**\n  - الفرك الكحولي: 20-30 ثانية بحجم 3-5 مل.\n  - الغسيل المائي: 40-60 ثانية بالماء والصابون.`;
      } else {
        reply += `• تم توثيق هذه الجزئية في فصول الكتاب المعتمدة وفق معايير ${card.alignedStandards?.[0]?.standardBody || 'GAHAR 2025'}.\n• يمكنك تصفح الفصل الخاص بها عبر الفهرس.`;
      }

      setAdvisorMessages(prev => [...prev, {
        sender: 'bot' as const,
        text: reply,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Font size classes
  const fontSizes = [
    'text-xs leading-relaxed',
    'text-sm leading-relaxed',
    'text-base leading-loose',
    'text-lg leading-loose'
  ];
  const currentFontClass = fontSizes[fontSizeLevel - 1] || fontSizes[1];

  // Theme styles
  const themeClasses = {
    'classic-cream': 'bg-[#FAF8F5] text-slate-900 border-[#E8E2D9]',
    'clean-white': 'bg-white text-slate-900 border-slate-200',
    'royal-dark': 'bg-[#181C24] text-slate-100 border-slate-800'
  };

  const themePaperClasses = {
    'classic-cream': 'bg-[#FFFDF9] text-slate-900 border-[#EBE3D5] shadow-xl',
    'clean-white': 'bg-white text-slate-900 border-slate-200 shadow-xl',
    'royal-dark': 'bg-[#1E232F] text-slate-100 border-slate-700 shadow-2xl'
  };

  return (
    <div className="w-full text-right font-sans space-y-4" dir="rtl">
      
      {/* ========================================================================= */}
      {/* 📚 BOOK READER TOP CONTROLS & UTILITIES (شريط تحكم الكتاب المكتبي)          */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 no-print">
        
        {/* Left: Book Branding & Current Chapter Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                كتاب السياسة المعتمد
              </span>
              <span className="text-2xs text-slate-400">
                {viewStyle === 'paged' ? `صفحة ${currentPage + 1} من ${totalPages}` : 'وضع القراءة المستمرة'}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">
              {chapters[currentPage]?.title}
            </h3>
          </div>
        </div>

        {/* Right: Tools & Customization Bar */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Table of Contents Button */}
          <button
            onClick={() => setShowTocModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
            title="فهرس محتويات الكتاب"
          >
            <ListOrdered className="w-4 h-4" />
            <span>فهرس الكتاب</span>
          </button>

          {/* View Mode Toggle: Paged Book vs Continuous Book */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewStyle('paged')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${viewStyle === 'paged' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="نمط تصفح صفحات الكتاب"
            >
              صفحات
            </button>
            <button
              onClick={() => setViewStyle('continuous')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${viewStyle === 'continuous' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              title="نمط قراءة الكتاب كاملاً"
            >
              الكتاب كاملاً
            </button>
          </div>

          {/* Theme Selector (Paper Color) */}
          <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
            <button
              onClick={() => setBookTheme('classic-cream')}
              className={`w-5 h-5 rounded-full bg-[#FAF6EE] border transition ${bookTheme === 'classic-cream' ? 'ring-2 ring-amber-400 scale-110' : 'border-slate-600 opacity-60'}`}
              title="ورق كلاسيكي فاخر"
            />
            <button
              onClick={() => setBookTheme('clean-white')}
              className={`w-5 h-5 rounded-full bg-white border transition ${bookTheme === 'clean-white' ? 'ring-2 ring-blue-400 scale-110' : 'border-slate-600 opacity-60'}`}
              title="أبيض ناصع"
            />
            <button
              onClick={() => setBookTheme('royal-dark')}
              className={`w-5 h-5 rounded-full bg-slate-800 border transition ${bookTheme === 'royal-dark' ? 'ring-2 ring-purple-400 scale-110' : 'border-slate-600 opacity-60'}`}
              title="ليلي مكتبي"
            />
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 gap-1 text-2xs">
            <button
              onClick={() => setFontSizeLevel(prev => Math.max(1, prev - 1))}
              disabled={fontSizeLevel <= 1}
              className="text-slate-300 hover:text-white disabled:opacity-30 px-1 font-bold"
            >
              -A
            </button>
            <span className="text-slate-400 text-3xs font-mono">{fontSizeLevel}</span>
            <button
              onClick={() => setFontSizeLevel(prev => Math.min(4, prev + 1))}
              disabled={fontSizeLevel >= 4}
              className="text-slate-300 hover:text-white disabled:opacity-30 px-1 font-bold"
            >
              +A
            </button>
          </div>

          {/* Export Book as PDF */}
          <button
            onClick={handleExportBookPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="تصدير الكتاب كاملاً كملف PDF عالي الجودة"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري التصدير...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>تصدير ككتاب PDF</span>
              </>
            )}
          </button>

          {/* Copy Summary */}
          <button
            onClick={handleCopyBookSummary}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 cursor-pointer"
            title="نسخ نص الكتاب"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Reading Progress Indicator Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden no-print">
        <div 
          className="bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-500 h-full transition-all duration-300"
          style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 📖 BOOK CONTENT RENDERING (عرض محتوى الكتاب: صفحات أو مستمر)                 */}
      {/* ========================================================================= */}
      {viewStyle === 'paged' ? (
        
        /* ------------------------------------------------------------- */
        /* MODE A: PAGED INTERACTIVE BOOK READER (تصفح صفحة بصفحة)       */
        /* ------------------------------------------------------------- */
        <div 
          ref={bookContainerRef}
          className={`relative rounded-3xl border transition-colors duration-200 ${themePaperClasses[bookTheme]} min-h-[680px] flex flex-col justify-between overflow-hidden`}
        >
          {/* Top Running Header of the Book Page */}
          <div className="px-6 sm:px-10 pt-6 pb-4 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-serif italic font-bold text-amber-700 text-xs">
                {card.titleArabic || 'دليل السياسات الإكلينيكية المعتمد'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-3xs text-slate-400">
                {card.policyCode || 'IPC-POL'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark(currentPage)}
                className={`flex items-center gap-1 text-2xs transition ${bookmarkedPages.includes(currentPage) ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="حفظ الصفحة كعلامة مرجعية"
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarkedPages.includes(currentPage) ? 'fill-amber-500 text-amber-600' : ''}`} />
                <span>{bookmarkedPages.includes(currentPage) ? 'محفوظة' : 'علامة مرجعية'}</span>
              </button>

              <span className="bg-slate-100 text-slate-700 text-3xs font-mono px-2 py-0.5 rounded-full border border-slate-200">
                صفحة {currentPage + 1} / {totalPages}
              </span>
            </div>
          </div>

          {/* Book Page Spine / Center Fold Visual Effect */}
          <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-l from-black/10 to-transparent pointer-events-none opacity-40" />

          {/* Book Page Main Body */}
          <div className={`p-6 sm:p-12 flex-1 ${currentFontClass}`}>
            {renderBookPage(currentPage)}
          </div>

          {/* Bottom Running Footer & Page Navigation Controls */}
          <div className="px-6 sm:px-10 py-4 bg-slate-50/70 border-t border-slate-200/60 flex items-center justify-between gap-3 text-xs no-print">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-800 font-bold border border-slate-200 shadow-2xs transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الصفحة السابقة</span>
            </button>

            {/* Quick chapter pills dots */}
            <div className="hidden md:flex items-center gap-1.5">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-6 h-6 rounded-lg text-3xs font-bold transition flex items-center justify-center ${currentPage === idx ? 'bg-amber-500 text-slate-950 font-black shadow-xs scale-110' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                  title={ch.title}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-30 disabled:hover:bg-blue-900 text-white font-bold shadow-xs transition cursor-pointer"
            >
              <span>الصفحة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      ) : (

        /* ------------------------------------------------------------- */
        /* MODE B: CONTINUOUS SCROLL FULL BOOK (عرض الكتاب كاملاً)       */
        /* ------------------------------------------------------------- */
        <div 
          ref={continuousBookRef}
          className={`rounded-3xl border ${themePaperClasses[bookTheme]} p-6 sm:p-12 space-y-12 divide-y divide-slate-200`}
        >
          {chapters.map((ch, idx) => (
            <div key={ch.id} id={`book-chap-${idx}`} className={idx > 0 ? 'pt-10 space-y-6' : 'space-y-6'}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-400">
                <span className="font-mono">{ch.icon} {ch.title}</span>
                <span className="font-mono">صفحة {idx + 1} من {totalPages}</span>
              </div>
              <div className={currentFontClass}>
                {renderBookPage(idx)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📑 TABLE OF CONTENTS MODAL (نافذة فهرس محتويات الكتاب)                      */}
      {/* ========================================================================= */}
      {showTocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-bold">
                <ListOrdered className="w-5 h-5 text-amber-400" />
                <span>فهرس أبواب وفصول الكتاب (Table of Contents)</span>
              </div>
              <button
                onClick={() => setShowTocModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Chapters List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {chapters.map((ch, index) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setCurrentPage(index);
                    setShowTocModal(false);
                    if (viewStyle === 'continuous') {
                      const el = document.getElementById(`book-chap-${index}`);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-right p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${currentPage === index ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                      {ch.icon}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">{ch.title}</p>
                      <p className="text-2xs text-slate-500">{ch.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-2xs font-mono font-bold bg-white text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                    صـ {index + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>إجمالي فصول الكتاب: {totalPages} أبواب</span>
              <button
                onClick={() => setShowTocModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق الفهرس
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // 📖 RENDER INDIVIDUAL BOOK PAGES (دوال رسم صفحات الكتاب بدقة وأناقة)
  // =========================================================================
  function renderBookPage(pageIndex: number) {
    switch (pageIndex) {
      
      // -------------------------------------------------------------
      // PAGE 0: OFFICIAL BOOK HARDCOVER (غلاف الكتاب الرسمي والتقديم)
      // -------------------------------------------------------------
      case 0:
        return (
          <div className="space-y-8 text-center py-4">
            {/* Book Spine Badge & Accreditation Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-mono font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                كود الكتاب: {card.policyCode || 'IPC-POL-001'}
              </span>
              <span className="bg-slate-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                الإصدار المعتمد 2025/2026
              </span>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                معايير GAHAR 2025 / CBAHI / JCI
              </span>
            </div>

            {/* Book Title & Cover Typography */}
            <div className="max-w-2xl mx-auto space-y-4 pt-4 pb-6 border-y-2 border-amber-500/40">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
                الدليل الإكلينيكي والمرجعي المعتمد
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                {card.titleArabic || 'كتاب السياسة الطبية الموحدة'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                {card.titleEnglish || 'Master Clinical Policy Reference & Operational SOP Guide'}
              </p>
            </div>

            {/* Book Metadata & Publishing Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-right bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-3xs font-bold">الجهة المعتمدة:</span>
                <strong className="text-slate-900 font-bold">{card.issuingAuthority || 'لجنة مكافحة العدوى والجودة'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-3xs font-bold">المجال التخصصي:</span>
                <strong className="text-slate-900 font-bold">{card.domain || 'السياسات الإكلينيكية ومكافحة العدوى'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-3xs font-bold">تاريخ التفعيل:</span>
                <strong className="text-slate-900 font-bold">{card.effectiveDate || '2025/2026'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-3xs font-bold">دورة المراجعة:</span>
                <strong className="text-slate-900 font-bold">{card.reviewCycle || 'كل 3 سنوات'}</strong>
              </div>
            </div>

            {/* Action to Start Reading */}
            <div className="pt-2">
              <button
                onClick={handleNextPage}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition transform active:scale-95 cursor-pointer"
              >
                <span>فتح وتصفح فصول الكتاب</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 1: CHAPTER 1 - EXECUTIVE SUMMARY & GOLDEN CRAM CAPSULES
      // -------------------------------------------------------------
      case 1:
        return (
          <div className="space-y-6">
            <div className="border-b border-amber-300 pb-3">
              <span className="text-2xs font-bold text-amber-700 uppercase tracking-wider block">الفصل الأول</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">الملخص التنفيذي والكبسولات الذهبية</h2>
            </div>

            {data.executiveSummarySnippet && (
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-slate-800 text-justify leading-relaxed shadow-2xs">
                <h4 className="font-bold text-amber-950 text-xs mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>الخلاصة التنفيذية للسياسة:</span>
                </h4>
                <p>{data.executiveSummarySnippet}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                <strong className="text-blue-950 font-bold text-xs flex items-center gap-1.5">
                  <span>🎯</span> الهدف الإكلينيكي الحرج:
                </strong>
                <p className="text-slate-800 text-xs">
                  {purpose.mainObjective || 'الحد من انتقال العدوى المكتسبة وضمان بيئة استشفاء آمنة وخالية من الميكروبات المقاومة.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                <strong className="text-emerald-950 font-bold text-xs flex items-center gap-1.5">
                  <span>⏱️</span> الأزمنة والمقادير الحتمية:
                </strong>
                <p className="text-slate-800 text-xs">
                  • فرك كحولي: <strong>20 - 30 ثانية</strong> بحجم 3-5 مل.<br />
                  • غسيل مائي: <strong>40 - 60 ثانية</strong> بالماء والصابون.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                <strong className="text-rose-950 font-bold text-xs flex items-center gap-1.5">
                  <span>🚫</span> الخطوط الحمراء الصارمة:
                </strong>
                <p className="text-slate-800 text-xs">
                  • حظر تزويد العبوات (Zero Top-up) قطعياً.<br />
                  • القفازات لا تغني عن تطهير اليدين إطلاقاً.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1.5">
                <strong className="text-purple-950 font-bold text-xs flex items-center gap-1.5">
                  <span>📊</span> مستهدفات الامتثال:
                </strong>
                <p className="text-slate-800 text-xs">
                  • معدل الامتثال العام المستهدف: <strong>≥ 90%</strong>.<br />
                  • معدل استهلاك الكحول: <strong>≥ 20 لتر / 1000 يوم مريض</strong>.
                </p>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 2: CHAPTER 2 - PURPOSE, RATIONALE & RESPONSIBILITIES
      // -------------------------------------------------------------
      case 2:
        return (
          <div className="space-y-6">
            <div className="border-b border-blue-300 pb-3">
              <span className="text-2xs font-bold text-blue-700 uppercase tracking-wider block">الفصل الثاني</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">الأهداف، المبرر الإكلينيكي ونطاق المسؤوليات</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h4 className="font-bold text-blue-900 text-xs sm:text-sm">1. الهدف الإكلينيكي العام والمبرر:</h4>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {purpose.clinicalRationale || 'الارتقاء بمستوى الأمان السريري، وحماية المرضى والممارسين الصحيين من المخاطر البيولوجية والعدوى المتقاطعة وفق أعلى معايير الجودة العالمية.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">2. نطاق التطبيق والفئات المستهدفة:</h4>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {purpose.scope?.length > 0 ? purpose.scope.join(' • ') : card.departments?.join(' • ') || 'كافة الكوادر الطبية والتمريضية والفنية والمساندة في جميع الأقسام السريرية.'}
                </p>
              </div>
            </div>

            {/* Roles Matrix */}
            {roles.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">مصفوفة توزيع الأدوار والمسؤوليات:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <strong className="text-blue-950 font-bold block">{r.role}</strong>
                      <ul className="text-slate-600 text-2xs space-y-0.5 list-disc list-inside">
                        {r.responsibilities.slice(0, 3).map((res, j) => (
                          <li key={j}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 3: CHAPTER 3 - SCIENTIFIC DEFINITIONS & TERMINOLOGY
      // -------------------------------------------------------------
      case 3:
        return (
          <div className="space-y-6">
            <div className="border-b border-purple-300 pb-3">
              <span className="text-2xs font-bold text-purple-700 uppercase tracking-wider block">الفصل الثالث</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">معجم المصطلحات والمفاهيم العلمية الحاكمة</h2>
            </div>

            {definitions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {definitions.map((def, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{def.term}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{def.definition}</p>
                    {def.clinicalSignificance && (
                      <div className="text-2xs bg-purple-50 text-purple-950 p-2 rounded-xl border border-purple-100 font-medium">
                        <strong>الأثر الإكلينيكي: </strong>{def.clinicalSignificance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">تم تضمين المصطلحات القياسية في سياق خطوات العمل والمواصفات الفنية.</p>
            )}
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 4: CHAPTER 4 - TECHNICAL SPECIFICATIONS & ANTISEPTICS
      // -------------------------------------------------------------
      case 4:
        return (
          <div className="space-y-6">
            <div className="border-b border-blue-300 pb-3">
              <span className="text-2xs font-bold text-blue-700 uppercase tracking-wider block">الفصل الرابع</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">المواصفات الفنية والمصفوفة الإجرائية للمطهرات</h2>
            </div>

            {techSpecs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-3 font-bold border border-slate-700">الإجراء / التقنية</th>
                      <th className="p-3 font-bold border border-slate-700">المادة والتركيز</th>
                      <th className="p-3 font-bold border border-slate-700 text-center">الحجم</th>
                      <th className="p-3 font-bold border border-slate-700 text-center">زمن التلامس</th>
                      <th className="p-3 font-bold border border-slate-700">الدواعي والمحاذير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {techSpecs.map((spec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900 border border-slate-200">{spec.techniqueName}</td>
                        <td className="p-3 text-slate-800 border border-slate-200">{spec.agentAndConcentration}</td>
                        <td className="p-3 text-center font-bold text-blue-900 border border-slate-200">{spec.requiredVolume || '3-5 مل'}</td>
                        <td className="p-3 text-center font-bold text-emerald-800 border border-slate-200">{spec.contactTime}</td>
                        <td className="p-3 text-2xs text-slate-700 border border-slate-200">
                          {Array.isArray(spec.indications) ? spec.indications.slice(0, 2).join(' • ') : spec.indications}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500">المواصفات الفنية تتبع الدليل القومي لمكافحة العدوى ومعايير منظمة الصحة العالمية.</p>
            )}
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 5: CHAPTER 5 - WHO 5 MOMENTS FOR HAND HYGIENE
      // -------------------------------------------------------------
      case 5:
        return (
          <div className="space-y-6">
            <div className="border-b border-amber-300 pb-3">
              <span className="text-2xs font-bold text-amber-700 uppercase tracking-wider block">الفصل الخامس</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">اللحظات الإكلينيكية الخمس (WHO 5 Moments)</h2>
            </div>

            {fiveMoments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {fiveMoments.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-900 text-white font-black flex items-center justify-center text-xs">
                        {m.momentNumber || idx + 1}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{m.momentName}</h4>
                    </div>
                    {m.timing && (
                      <span className="inline-block text-3xs font-semibold bg-blue-50 text-blue-900 px-2 py-0.5 rounded">
                        التوقيت: {m.timing}
                      </span>
                    )}
                    {m.clinicalExamples && (
                      <p className="text-slate-600 text-2xs leading-relaxed">
                        <strong className="text-slate-800">أمثلة: </strong>
                        {Array.isArray(m.clinicalExamples) ? m.clinicalExamples.join('، ') : m.clinicalExamples}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">اللحظات الخمس وفق منظمة الصحة العالمية مطبقة إلزامياً في كافة الإجراءات.</p>
            )}
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 6: CHAPTER 6 - SOPs STANDARD OPERATING PROCEDURES
      // -------------------------------------------------------------
      case 6:
        return (
          <div className="space-y-6">
            <div className="border-b border-emerald-300 pb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-wider block">الفصل السادس</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">خطوات العمل القياسية المتسلسلة (SOPs)</h2>
            </div>

            <div className="space-y-4">
              {/* Phase 1 */}
              {sop.preProcedure && sop.preProcedure.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <h4 className="font-bold text-blue-950 text-xs sm:text-sm">المرحلة الأولى: التحضير والتجهيز (Pre-Procedure):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                    {sop.preProcedure.map((s: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-blue-100 space-y-0.5">
                        <p className="font-bold text-blue-900">{s.title}</p>
                        <p className="text-slate-600">{s.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 2 */}
              {sop.execution && sop.execution.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <h4 className="font-bold text-indigo-950 text-xs sm:text-sm">المرحلة الثانية: خطوات التنفيذ السريري (Execution):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                    {sop.execution.map((s: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-indigo-100 space-y-0.5">
                        <p className="font-bold text-indigo-900">{s.title}</p>
                        <p className="text-slate-600">{s.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 3 */}
              {sop.postProcedure && sop.postProcedure.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">المرحلة الثالثة: إنهاء الإجراء والتوثيق (Post-Procedure):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                    {sop.postProcedure.map((s: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                        <p className="font-bold text-emerald-900">{s.title}</p>
                        <p className="text-slate-600">{s.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 7: CHAPTER 7 - SAFETY, PROHIBITIONS & PITFALLS MATRIX
      // -------------------------------------------------------------
      case 7:
        return (
          <div className="space-y-6">
            <div className="border-b border-rose-300 pb-3">
              <span className="text-2xs font-bold text-rose-700 uppercase tracking-wider block">الفصل السابع</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">مصفوفة المحظورات الصارمة ومقارنة الأخطاء بالصواب</h2>
            </div>

            {/* Pitfalls Table */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-2xs bg-white">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 text-right w-1/2 text-rose-300">❌ الخطأ الشائع المحظور</th>
                    <th className="p-3 text-right w-1/2 text-emerald-300">✅ المعيار الذهبي الإلزامي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-rose-50/30">
                    <td className="p-3 text-rose-950 font-medium">تجفيف اليدين بالمناديل بعد الفرك الكحولي لتسريع التبخر.</td>
                    <td className="p-3 text-emerald-950 font-bold bg-emerald-50/40">ترك الكحول يجف ذاتياً بالهواء (20-30 ثانية) لاكتمال القتل الميكروبي.</td>
                  </tr>
                  <tr className="bg-rose-50/30">
                    <td className="p-3 text-rose-950 font-medium">استخدام الكحول عند وجود اتساخ مرئي أو مع C. difficile.</td>
                    <td className="p-3 text-emerald-950 font-bold bg-emerald-50/40">الغسيل الإجباري بالماء والصابون (40-60 ثانية) لإزالة الأبواغ ميكانيكياً.</td>
                  </tr>
                  <tr className="bg-rose-50/30">
                    <td className="p-3 text-rose-950 font-medium">تزويد أو سكب محلول مطهر جديد فوق المتبقي بالعبوة (Top-up).</td>
                    <td className="p-3 text-emerald-950 font-bold bg-emerald-50/40">تفريغ العبوة بالكامل وغسلها وتطهيرها أو استبدالها بعبوة مقفلة جديدة.</td>
                  </tr>
                  <tr className="bg-rose-50/30">
                    <td className="p-3 text-rose-950 font-medium">ارتداء القفازات كبديل عن تطهير اليدين أو التنقل بها بين المرضى.</td>
                    <td className="p-3 text-emerald-950 font-bold bg-emerald-50/40">القفازات لا تغني عن نظافة الأيدي؛ تطهير اليدين قبل الارتداء وفور النزع.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Strict DOs and DON'Ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {dontsList.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                  <h4 className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>المحظورات الصارمة (DON'Ts):</span>
                  </h4>
                  <ul className="text-2xs text-rose-950 space-y-1 list-disc list-inside">
                    {dontsList.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              {dosList.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                  <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>الممارسات الإلزامية (DOs):</span>
                  </h4>
                  <ul className="text-2xs text-emerald-950 space-y-1 list-disc list-inside">
                    {dosList.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 8: CHAPTER 8 - RAPID Q&A REVIEW BANK & AUDIT CHECKLIST
      // -------------------------------------------------------------
      case 8:
        return (
          <div className="space-y-6">
            <div className="border-b border-blue-300 pb-3">
              <span className="text-2xs font-bold text-blue-700 uppercase tracking-wider block">الفصل الثامن</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">بنك أسئلة وأجوبة المرور الميداني والتفتيش (Q&A)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs">س1</span>
                  <span>متى يكون غسيل الأيدي بالماء والصابون إجبارياً بدلاً من الكحول؟</span>
                </div>
                <p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 leading-relaxed border border-slate-100">
                  <strong className="text-emerald-800">الجواب: </strong>
                  عند وجود اتساخ مرئي بالدم أو سوائل الجسم، أو بعد استخدام المرحاض، أو عند التعامل مع بكتيريا <em>C. difficile</em> والروتافيروس لأن الكحول لا يقتل الأبواغ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs">س2</span>
                  <span>ما هي المدة والكمية الصحيحة للفرك الكحولي للأيدي؟</span>
                </div>
                <p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 leading-relaxed border border-slate-100">
                  <strong className="text-emerald-800">الجواب: </strong>
                  استخدام 3 إلى 5 مل من المحلول الكحولي والفرك المستمر لمدة 20 - 30 ثانية حتى تجف اليدان تماماً بالهواء.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs">س3</span>
                  <span>هل يغني ارتداء القفازات الطبية عن تطهير اليدين؟</span>
                </div>
                <p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 leading-relaxed border border-slate-100">
                  <strong className="text-emerald-800">الجواب: </strong>
                  قطعياً لا. يجب تطهير اليدين قبل ارتداء القفازات وفور نزعها، مع تبديلها فوراً بين مريض وآخر.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xs">س4</span>
                  <span>ما هي اللحظات الخمس لنظافة الأيدي (WHO 5 Moments)؟</span>
                </div>
                <p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 leading-relaxed border border-slate-100">
                  <strong className="text-emerald-800">الجواب: </strong>
                  1. قبل لمس المريض • 2. قبل الإجراء النظيف • 3. بعد خطر التعرض للسوائل • 4. بعد لمس المريض • 5. بعد لمس محيط المريض.
                </p>
              </div>
            </div>
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 9: CHAPTER 9 - AUDIT CHECKLIST & KPIS
      // -------------------------------------------------------------
      case 9:
        return (
          <div className="space-y-6">
            <div className="border-b border-emerald-300 pb-3">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-wider block">الفصل التاسع</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">دليل التدقيق الميداني ومؤشرات الأداء (KPIs)</h2>
            </div>

            {/* KPIs */}
            {kpiItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">مؤشرات الأداء الرئيسية المستهدفة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {kpiItems.map((kpi, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-slate-900 block">{kpi.name || (kpi as any).indicatorName}</strong>
                        <span className="text-2xs text-slate-500">{kpi.frequency}</span>
                      </div>
                      <span className="font-mono font-black text-xs bg-emerald-100 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-300 shrink-0">
                        {kpi.target}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Checklist */}
            {auditItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">قائمة التحقق الميداني التفاعلية:</h4>
                <div className="space-y-2">
                  {auditItems.slice(0, 5).map((item, idx) => {
                    const isChecked = !!checkedAuditItems[item.id || idx.toString()];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleAudit(item.id || idx.toString())}
                        className={`p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${isChecked ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="text-xs flex-1">
                          <p className="font-bold">{item.checkpoint}</p>
                          <p className="text-2xs text-slate-500">{item.evidenceRequired}</p>
                        </div>
                        <span className="text-3xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {item.standardReference}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      // -------------------------------------------------------------
      // PAGE 10: APPENDIX - AI ADVISOR & OFFICIAL SIGN-OFF BOX
      // -------------------------------------------------------------
      case 10:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-3">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">الملحق والخاتمة</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">صندوق الاعتماد الرسمي والمستشار الذكي للكتاب</h2>
            </div>

            {/* Sign-off Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-2">
                صندوق الاعتماد والتوقيعات الرسمية:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-2xs text-slate-400 font-bold block">إعداد وتنسيق:</span>
                  <strong className="text-slate-900">فريق مكافحة العدوى والجودة</strong>
                  <div className="h-6 border-b border-dashed border-slate-300" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-2xs text-slate-400 font-bold block">مراجعة وتدقيق:</span>
                  <strong className="text-slate-900">رئيس قسم الجودة والاعتماد</strong>
                  <div className="h-6 border-b border-dashed border-slate-300" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-2xs text-slate-400 font-bold block">اعتماد وتفويض:</span>
                  <strong className="text-slate-900">المدير الطبي / المدير التنفيذي</strong>
                  <div className="h-6 border-b border-dashed border-slate-300" />
                </div>
              </div>
            </div>

            {/* Mini Book Advisor Chat */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>المستشار الذكي لكتاب السياسة (AI Book Advisor)</span>
                </div>
                <span className="text-3xs text-slate-400">إجابات إكلينيكية فورية</span>
              </div>

              {/* Chat Log */}
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs pr-1">
                {advisorMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-blue-700 text-white ml-6' : 'bg-slate-800 text-slate-200 mr-6 border border-slate-700'}`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span className="text-3xs text-slate-400 block text-left mt-1">{msg.time}</span>
                  </div>
                ))}
                {isAdvisorLoading && (
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400 flex items-center gap-2 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>جاري مراجعة فصول الكتاب والإجابة...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={advisorInput}
                  onChange={(e) => setAdvisorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorQuery()}
                  placeholder="اسأل المستشار عن أي بند أو معيار في هذا الكتاب..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSendAdvisorQuery}
                  disabled={isAdvisorLoading || !advisorInput.trim()}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}
