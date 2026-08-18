import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  ShieldAlert, 
  ShieldCheck, 
  HeartPulse, 
  Flame, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  X
} from 'lucide-react';

interface HandHygieneVisualIllustrationsProps {
  isCompact?: boolean;
}

export const HandHygieneVisualIllustrations: React.FC<HandHygieneVisualIllustrationsProps> = ({ isCompact = false }) => {
  const [activeStepTab, setActiveStepTab] = useState<'soap' | 'alcohol' | 'surgical' | 'five_moments' | 'bare_below_elbows'>('five_moments');
  const [selectedMoment, setSelectedMoment] = useState<number | null>(null);

  // Core 6 Hand Motions Data with SVG visual icons
  const handMotions = [
    {
      step: 1,
      title: 'فرك باطن بالباطن',
      titleEn: 'Palm to Palm',
      time: '5 ثوانٍ',
      details: 'فرك باطن اليدين مواجهين بحركات دائرية مستمرة لتوزيع الصابون أو الكحول بالتساوي.',
      iconType: 'palm_to_palm'
    },
    {
      step: 2,
      title: 'فرك ظهر اليد مع تداخل الأصابع',
      titleEn: 'Right palm over left dorsum',
      time: '5 ثوانٍ',
      details: 'فرك باطن اليد اليمنى فوق ظهر اليد اليسرى مع تداخل الأصابع، ثم عكس الوضع لليد الأخرى.',
      iconType: 'dorsum_interlaced'
    },
    {
      step: 3,
      title: 'فرك باطن اليدين مع تشابك الأصابع',
      titleEn: 'Palm to palm with fingers interlaced',
      time: '5 ثوانٍ',
      details: 'دلك باطن اليدين مواجهين مع تداخل وتشابك الأصابع لتطهير الفراغات بين الأصابع.',
      iconType: 'interlaced'
    },
    {
      step: 4,
      title: 'دلك ظهر الأصابع بقبضة اليد المعاكسة',
      titleEn: 'Back of fingers to opposing palms',
      time: '5 ثوانٍ',
      details: 'ضم الأصابع في قبضة ودلك ظهر الأصابع مع باطن اليد المعاكسة بحركة متداخلة.',
      iconType: 'clasped_fingers'
    },
    {
      step: 5,
      title: 'الدلك الدائري للإبهامين',
      titleEn: 'Rotational rubbing of thumb',
      time: '5 ثوانٍ',
      details: 'الإمساك بإبهام اليد اليسرى بقبضة اليد اليمنى والدلك الدائري الشامل، ثم عكس اليد.',
      iconType: 'thumb_rotation'
    },
    {
      step: 6,
      title: 'فرك أطراف الأصابع والأظافر',
      titleEn: 'Rotational rubbing of fingertips',
      time: '5 ثوانٍ',
      details: 'ضم أطراف أصابع اليد اليمنى وفركها بحركة دائرية في باطن اليد اليسرى للقضاء على الجراثيم تحت الأظافر.',
      iconType: 'fingertips_nails'
    },
    {
      step: 7,
      title: 'فرك الرسغين بحركة دائرية',
      titleEn: 'Wrists rotational rubbing',
      time: '5 ثوانٍ',
      details: 'الدلك الدائري لرسغ اليد اليمنى باليد اليسرى ثم العكس لضمان شمول التطهير لمحيط المعصم.',
      iconType: 'wrists'
    },
    {
      step: 8,
      title: 'الشطف والتجفيف وإغلاق الصنبور بالمنديل',
      titleEn: 'Rinse, Dry & Turn off faucet with towel',
      time: '10 ثوانٍ',
      details: 'شطف اليدين بالماء الجاري، التجفيف بمنشفة ورقية وحيدة الاستخدام، وإغلاق الصنبور بالمنديل قبل التخلص منه.',
      iconType: 'rinse_dry'
    }
  ];

  // WHO 5 Moments Interactive Data
  const momentsData = [
    {
      id: 1,
      name: 'قبل ملامسة المريض',
      nameEn: 'Before touching a patient',
      zone: 'عند الدخول إلى محيط المريض وقبل لمسه',
      why: 'لحماية المريض من الجراثيم الضارة التي قد يحملها مقدم الرعاية على يديه.',
      examples: ['المصافحة بالأيدي', 'مساعدة المريض على الجلوس أو الحركة', 'قياس النبض وضغط الدم', 'الفحص السريري العام'],
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-300',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white'
    },
    {
      id: 2,
      name: 'قبل الإجراءات النظيفة والمعقمة',
      nameEn: 'Before clean / aseptic procedure',
      zone: 'مباشرة قبل أي إجراء تداخلي أو اختراقي',
      why: 'لحماية المريض من دخول الجراثيم الضارة إلى جسده (بما فيها جراثيم المريض نفسه).',
      examples: ['إعطاء قطرة للعين', 'الحقن الوريدي والعضلي', 'تركيب القساطر الوريدية والبولية', 'الغيار على الجروح', 'تحضير الأدوية'],
      color: 'from-emerald-600 to-teal-800',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white'
    },
    {
      id: 3,
      name: 'بعد احتمالية التعرض لسوائل الجسم',
      nameEn: 'After body fluid exposure risk',
      zone: 'مباشرة بعد ملامسة السوائل وبعد خلع القفازات',
      why: 'لحماية مقدم الرعاية الصحية وبيئة المنشأة من استيطان الجراثيم الضارة.',
      examples: ['سحب عينات الدم', 'التعامل مع الإفرازات والبول والبراز', 'شفط الإفرازات التنفسية', 'تنظيف الأدوات الملوثة', 'بعد خلع القفازات'],
      color: 'from-amber-600 to-orange-800',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-600',
      badgeText: 'text-white'
    },
    {
      id: 4,
      name: 'بعد ملامسة المريض',
      nameEn: 'After touching a patient',
      zone: 'عند الانتهاء من رعاية المريض وقبل مغادرة محيطه',
      why: 'لحماية نفسك وباقي المرضى من الجراثيم التي قد تكون انتقلت من المريض.',
      examples: ['بعد الفحص السريري', 'بعد تعديل وضعية المريض', 'بعد المصافحة', 'بعد الاستماع لنبضات القلب'],
      color: 'from-indigo-600 to-purple-800',
      borderColor: 'border-indigo-300',
      badgeBg: 'bg-indigo-600',
      badgeText: 'text-white'
    },
    {
      id: 5,
      name: 'بعد ملامسة محيط وبيئة المريض',
      nameEn: 'After touching patient surroundings',
      zone: 'بعد لمس أي سطح أو جهاز في محيط المريض حتى لو لم يُلمس المريض',
      why: 'لحماية مقدم الرعاية والبيئة، فالأسطح المحيطة بالمريض ملوثة بميكروباته.',
      examples: ['تغيير أغطية السرير', 'ضبط سرعة المحاليل أو أجهزة التنفس', 'لمس السرير أو الكومودينو', 'لمس شاشات المراقبة (Monitors)'],
      color: 'from-slate-700 to-slate-900',
      borderColor: 'border-slate-400',
      badgeBg: 'bg-slate-700',
      badgeText: 'text-white'
    }
  ];

  // Helper to render vector SVG hand motion icon
  const renderMotionSvg = (type: string) => {
    switch (type) {
      case 'palm_to_palm':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-blue-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="25" y="30" width="22" height="40" rx="10" className="fill-blue-50 stroke-blue-600" />
            <rect x="53" y="30" width="22" height="40" rx="10" className="fill-blue-100 stroke-blue-700" />
            <path d="M 36 20 L 36 30" strokeDasharray="3 3" />
            <path d="M 64 20 L 64 30" strokeDasharray="3 3" />
            {/* Motion Circular Arrows */}
            <path d="M 30 78 A 20 20 0 0 0 70 78" className="stroke-amber-500" strokeWidth="3" markerEnd="url(#arrow)" />
            <path d="M 70 22 A 20 20 0 0 0 30 22" className="stroke-amber-500" strokeWidth="3" />
          </svg>
        );
      case 'dorsum_interlaced':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-indigo-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 30 35 C 30 25, 45 20, 50 35 C 55 20, 70 25, 70 35 L 65 75 C 65 80, 35 80, 35 75 Z" className="fill-indigo-50 stroke-indigo-600" />
            <path d="M 40 40 L 40 65" />
            <path d="M 50 38 L 50 65" />
            <path d="M 60 40 L 60 65" />
            {/* Sliding Arrows */}
            <path d="M 20 45 L 20 65" className="stroke-emerald-500" strokeWidth="3" />
            <path d="M 80 65 L 80 45" className="stroke-emerald-500" strokeWidth="3" />
          </svg>
        );
      case 'interlaced':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-blue-700 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 32 30 L 32 60" />
            <path d="M 44 25 L 44 65" />
            <path d="M 56 25 L 56 65" />
            <path d="M 68 30 L 68 60" />
            <circle cx="50" cy="50" r="28" className="fill-blue-50/50 stroke-blue-400 stroke-dashed" />
            <path d="M 25 80 Q 50 88 75 80" className="stroke-amber-500" strokeWidth="3" />
          </svg>
        );
      case 'clasped_fingers':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-purple-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="30" y="35" width="40" height="30" rx="8" className="fill-purple-50 stroke-purple-600" />
            <path d="M 30 45 L 70 45" />
            <path d="M 30 55 L 70 55" />
            <path d="M 15 50 L 25 50" className="stroke-emerald-500" strokeWidth="3" />
            <path d="M 85 50 L 75 50" className="stroke-emerald-500" strokeWidth="3" />
          </svg>
        );
      case 'thumb_rotation':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-teal-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="42" y="25" width="16" height="50" rx="8" className="fill-teal-50 stroke-teal-600" />
            {/* Rotation Arrow */}
            <path d="M 30 50 A 20 20 0 1 1 70 50" className="stroke-amber-500" strokeWidth="3" />
            <path d="M 70 45 L 73 53 L 65 52" className="fill-amber-500 stroke-amber-500" />
          </svg>
        );
      case 'fingertips_nails':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-rose-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="50" cy="65" rx="30" ry="18" className="fill-rose-50 stroke-rose-400" />
            <circle cx="50" cy="38" r="14" className="fill-rose-100 stroke-rose-600" />
            <path d="M 45 32 L 45 42" />
            <path d="M 50 30 L 50 44" />
            <path d="M 55 32 L 55 42" />
            {/* Circular Friction Orbit */}
            <circle cx="50" cy="65" r="10" strokeDasharray="3 3" className="stroke-amber-600" />
          </svg>
        );
      case 'wrists':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-700 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="35" y="20" width="30" height="60" rx="4" className="fill-cyan-50 stroke-cyan-600" />
            <path d="M 25 50 A 25 25 0 1 1 75 50" className="stroke-cyan-500" strokeWidth="3" />
            <path d="M 75 45 L 78 53 L 70 52" className="fill-cyan-500 stroke-cyan-500" />
          </svg>
        );
      case 'rinse_dry':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-emerald-600 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Water Drops */}
            <path d="M 50 15 C 50 15, 42 28, 42 35 A 8 8 0 0 0 58 35 C 58 28, 50 15, 50 15 Z" className="fill-blue-400 stroke-blue-500" />
            <path d="M 32 30 C 32 30, 27 38, 27 42 A 5 5 0 0 0 37 42 C 37 38, 32 30, 32 30 Z" className="fill-blue-300 stroke-blue-400" />
            {/* Towel */}
            <rect x="30" y="55" width="40" height="30" rx="4" className="fill-emerald-100 stroke-emerald-600" />
            <path d="M 30 65 L 70 65" strokeDasharray="3 3" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-inner ring-2 ring-blue-400/30">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  المخططات التوضيحية والرسوم الإكلينيكية المصورة للسياسة
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-2xs px-2 py-0.5 rounded-full font-mono font-bold">
                  Clinical Infographics & Visuals
                </span>
              </div>
              <p className="text-2xs text-slate-300 mt-0.5">
                مخطط اللحظات الخمس (WHO 5 Moments)، خطوات الغسيل والدلك الست المصورة، الغسل الجراحي، ومصفوفة خلو الساعدين
              </p>
            </div>
          </div>

          {/* Visual Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-2xs">
            <button
              onClick={() => setActiveStepTab('five_moments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'five_moments' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🖐️ اللحظات الخمس (WHO)</span>
            </button>

            <button
              onClick={() => setActiveStepTab('soap')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'soap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🧼 خطوات الغسيل (40-60 ث)</span>
            </button>

            <button
              onClick={() => setActiveStepTab('alcohol')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'alcohol' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🧴 الدلك بالكحول (20-30 ث)</span>
            </button>

            <button
              onClick={() => setActiveStepTab('surgical')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'surgical' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🏥 التطهير الجراحي (3-5 د)</span>
            </button>

            <button
              onClick={() => setActiveStepTab('bare_below_elbows')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'bare_below_elbows' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🚫 خلو الساعدين والمحظورات</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* ========================================================================= */}
        {/* VIEW 1: WHO 5 MOMENTS ILLUSTRATED INTERACTIVE ZONE CHART                  */}
        {/* ========================================================================= */}
        {activeStepTab === 'five_moments' && (
          <div className="space-y-6">
            {/* Visual Zone Schematic */}
            <div className="bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/70 p-5 rounded-2xl border border-blue-200 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      مخطط بيئة الرعاية واللحظات الخمس لنظافة الأيدي (WHO 5 Moments Infographic)
                    </h4>
                    <p className="text-2xs text-slate-600">
                      التفاعل البصري بين محيط المريض (Patient Zone) ومحيط الرعاية الصحية (Health-care Zone)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-2xs">
                  <span className="flex items-center gap-1 text-blue-900 font-bold bg-blue-100 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    قبل التدخل
                  </span>
                  <span className="flex items-center gap-1 text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    بعد التعرض
                  </span>
                </div>
              </div>

              {/* Graphical Patient Room Visual Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Visual Hospital Bed Area */}
                <div className="lg:col-span-7 bg-white p-4 rounded-xl border-2 border-dashed border-blue-300 shadow-inner relative space-y-3">
                  <div className="flex justify-between items-center text-2xs font-bold text-blue-900 border-b border-slate-100 pb-1.5">
                    <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-md">
                      🛏️ محيط المريض المباشر (Patient Zone)
                    </span>
                    <span className="text-slate-500 font-mono text-3xs">Zone of Flora Exchange</span>
                  </div>

                  {/* Visual Layout inside Patient Zone */}
                  <div className="grid grid-cols-3 gap-2 text-center text-2xs">
                    {/* Moment 1 */}
                    <div 
                      onClick={() => setSelectedMoment(1)}
                      className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                        selectedMoment === 1 ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-xs">
                        1
                      </span>
                      <strong className="block text-slate-900 text-3xs font-bold">قبل ملامسة المريض</strong>
                      <span className="text-3xs text-blue-800">حماية المريض</span>
                    </div>

                    {/* Patient Core Icon */}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 mb-1">
                        <HeartPulse className="w-6 h-6" />
                      </div>
                      <strong className="text-slate-800 text-3xs font-bold">المريض وسريره</strong>
                      <span className="text-3xs text-slate-500">منطقة العدوى المستوطنة</span>
                    </div>

                    {/* Moment 2 */}
                    <div 
                      onClick={() => setSelectedMoment(2)}
                      className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                        selectedMoment === 2 ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-300' : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-xs">
                        2
                      </span>
                      <strong className="block text-slate-900 text-3xs font-bold">قبل الإجراء المعقم</strong>
                      <span className="text-3xs text-emerald-800">منع العدوى الاختراقية</span>
                    </div>
                  </div>

                  {/* Lower Row of Patient Zone */}
                  <div className="grid grid-cols-3 gap-2 text-center text-2xs pt-1">
                    {/* Moment 3 */}
                    <div 
                      onClick={() => setSelectedMoment(3)}
                      className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                        selectedMoment === 3 ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-300' : 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-xs">
                        3
                      </span>
                      <strong className="block text-slate-900 text-3xs font-bold">بعد سوائل الجسم</strong>
                      <span className="text-3xs text-amber-800">حماية نفسك والبيئة</span>
                    </div>

                    {/* Moment 4 */}
                    <div 
                      onClick={() => setSelectedMoment(4)}
                      className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                        selectedMoment === 4 ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-300' : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-xs">
                        4
                      </span>
                      <strong className="block text-slate-900 text-3xs font-bold">بعد ملامسة المريض</strong>
                      <span className="text-3xs text-indigo-800">حماية محيط الرعاية</span>
                    </div>

                    {/* Moment 5 */}
                    <div 
                      onClick={() => setSelectedMoment(5)}
                      className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                        selectedMoment === 5 ? 'border-slate-700 bg-slate-100 ring-2 ring-slate-400' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-xs">
                        5
                      </span>
                      <strong className="block text-slate-900 text-3xs font-bold">بعد ملامسة المحيط</strong>
                      <span className="text-3xs text-slate-700">لمس السرير/الأجهزة</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Selected Moment Explanatory Card */}
                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-2">
                  {selectedMoment ? (
                    (() => {
                      const m = momentsData.find(x => x.id === selectedMoment)!;
                      return (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-lg ${m.badgeBg} ${m.badgeText} font-bold text-xs flex items-center justify-center shrink-0`}>
                              {m.id}
                            </span>
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">{m.name}</h5>
                              <p className="text-3xs text-slate-500 font-mono">{m.nameEn}</p>
                            </div>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg text-2xs text-slate-700">
                            <strong>التوقيت والموضع: </strong>{m.zone}
                          </div>
                          <div className="p-2 bg-emerald-50 text-emerald-950 rounded-lg text-2xs border border-emerald-200">
                            <strong>الهدف السريري: </strong>{m.why}
                          </div>
                          <div className="text-2xs text-slate-700">
                            <strong className="text-slate-900 block mb-1">أمثلة تطبيقية واقعية:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-3xs">
                              {m.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                            </ul>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-6 text-slate-500 space-y-2">
                      <Info className="w-8 h-8 text-blue-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">انقر على أي من اللحظات الخمس (1-5)</p>
                      <p className="text-2xs">لعرض التوقيت السريري، المبرر العلمي، والأمثلة الإكلينيكية الحية</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comprehensive Grid of All 5 Moments */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {momentsData.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setSelectedMoment(m.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 flex flex-col justify-between ${
                    selectedMoment === m.id ? 'border-blue-600 bg-blue-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`w-6 h-6 rounded-lg ${m.badgeBg} ${m.badgeText} font-bold text-xs flex items-center justify-center shadow-xs`}>
                        {m.id}
                      </span>
                      <span className="text-3xs text-slate-400 font-mono">Moment #{m.id}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-2xs leading-snug">{m.name}</h5>
                    <p className="text-3xs text-slate-600 line-clamp-2">{m.why}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-3xs text-blue-700 font-semibold">
                    {m.examples[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: 8-STEP ILLUSTRATED HANDWASHING & RUBBING MOTIONS                  */}
        {/* ========================================================================= */}
        {(activeStepTab === 'soap' || activeStepTab === 'alcohol') && (
          <div className="space-y-6">
            {/* Mode Banner */}
            <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              activeStepTab === 'soap' ? 'bg-blue-50 border-blue-200 text-blue-950' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
                  activeStepTab === 'soap' ? 'bg-blue-700' : 'bg-indigo-700'
                }`}>
                  {activeStepTab === 'soap' ? '🧼' : '🧴'}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {activeStepTab === 'soap' ? 'خطوات غسيل اليدين بالماء والصابون (40 - 60 ثانية)' : 'خطوات تدليك اليدين بالكحول 70% (20 - 30 ثانية)'}
                  </h4>
                  <p className="text-2xs text-slate-600">
                    {activeStepTab === 'soap' 
                      ? 'إلزامي عند الاتساخ الظاهري أو التلوث بالدم وسوائل الجسم وبعد دورة المياه' 
                      : 'الخيار الأول والأسرع في كافة اللحظات الخمس طالما الأيدي غير متسخة ظاهرياً'}
                  </p>
                </div>
              </div>
              <div className="text-2xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
                {activeStepTab === 'soap' ? 'الزمن المطلوب: 40-60 ثانية' : 'الحجم: 3-5 مل | الزمن: 20-30 ثانية'}
              </div>
            </div>

            {/* 8 Core Hand Motions Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {handMotions.map((motion) => (
                <div key={motion.step} className="bg-slate-50 hover:bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs transition flex flex-col justify-between space-y-2 group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-2xs flex items-center justify-center shadow-2xs">
                        {motion.step}
                      </span>
                      <span className="text-3xs text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {motion.time}
                      </span>
                    </div>

                    {/* Vector Graphic */}
                    <div className="py-2 bg-white rounded-lg border border-slate-100 mb-2 group-hover:border-blue-200 transition">
                      {renderMotionSvg(motion.iconType)}
                    </div>

                    <h5 className="font-bold text-slate-900 text-2xs leading-snug">{motion.title}</h5>
                    <p className="text-3xs text-slate-500 font-mono mb-1">{motion.titleEn}</p>
                    <p className="text-3xs text-slate-600 leading-relaxed">{motion.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SURGICAL HAND SCRUB & ANTISEPSIS ILLUSTRATED PROTOCOL             */}
        {/* ========================================================================= */}
        {activeStepTab === 'surgical' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-purple-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🏥
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    بروتوكول الغسل والتدليك الجراحي لليدين والساعدين (Surgical Hand Antisepsis)
                  </h4>
                  <p className="text-2xs text-purple-800">
                    قبل العمليات الجراحية، القسطرة الوريدية المركزية، والإجراءات التداخلية المعقمة
                  </p>
                </div>
              </div>
              <span className="text-2xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-purple-200 text-purple-900">
                العمق: حتى 5 سم فوق المرفقين
              </span>
            </div>

            {/* Anatomical Depth Visual Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h5 className="font-bold text-slate-900 text-xs">الغسل بالبيتادين 7.5% الرغوي</h5>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  • بلل اليدين والساعدين حتى 5 سم فوق المرفق.<br/>
                  • تنظيف ما تحت الأظافر بمبرد أو فرشاة معقمة.<br/>
                  • فرك دائري مستمر لمدة <strong>3 إلى 5 دقائق</strong>.<br/>
                  • الشطف بدءاً من أطراف الأصابع مع رفع الأيدي أعلى من مستوى المرفق.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h5 className="font-bold text-slate-900 text-xs">الدلك بالكلورهيكسيدين 2%-4% الكحولي</h5>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  • غسل وتجفيف اليدين روتينياً أولاً.<br/>
                  • وضع 5 مل مطهر في راحة اليد وغمر أطراف الأصابع لمدة 5 ثوانٍ.<br/>
                  • تدليك كل ذراع حتى 5 سم فوق المرفق لمدة <strong>15 ثانية لكل ذراع</strong>.<br/>
                  • الفرك حتى الجفاف التام في الهواء دون ملامسة أي سطح.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h5 className="font-bold text-slate-900 text-xs">التجفيف وارتداء الرداء والقفازات</h5>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  • التجفيف بمنشفة معقمة (جانب لكل يد/ذراع).<br/>
                  • إبقاء الأيدي مرفوعة فوق مستوى الخصر دائماً.<br/>
                  • ارتداء الرداء المعقم (Surgical Gown) والقفازات المعقمة بالطريقة المغلقة (Closed Gloving).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: BARE BELOW ELBOWS & STRICT PROHIBITIONS ILLUSTRATED MATRIX        */}
        {/* ========================================================================= */}
        {activeStepTab === 'bare_below_elbows' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prohibitions Card */}
              <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs border-b border-rose-200 pb-2">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>المحظورات الصارمة في المنشأة (Strict Prohibitions):</span>
                </div>
                <div className="space-y-2 text-2xs text-rose-950">
                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="text-base">💍</span>
                    <div>
                      <strong className="text-rose-900 block">حظر الخواتم والمجوهرات والساعات:</strong>
                      <span>تمنع وصول الماء والمطهر لمناطق التلامس وتسبب تمزق القفازات.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="text-base">💅</span>
                    <div>
                      <strong className="text-rose-900 block">حظر الأظافر الصناعية وطلاء الأظافر:</strong>
                      <span>تأوي الميكروبات تحت الأظافر وتمنع الرؤية المباشرة لنظافة أسفل الظفر.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="text-base">💨</span>
                    <div>
                      <strong className="text-rose-900 block">حظر مجففات الهواء الساخن:</strong>
                      <span>تنشر الرذاذ الملوث في الهواء ولا تضمن التجفيف الكامل مقارنة بالمناديل الورقية.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="text-base">🧴</span>
                    <div>
                      <strong className="text-rose-900 block">حظر إعادة ملء العبوات (Zero Top-up Ban):</strong>
                      <span>يحظر خلط أو تزويد الصابون والكحول في عبوات قديمة دون تفريغها وتطهيرها وتجفيفها وتدوين التاريخ.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory Standards Card */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs border-b border-emerald-200 pb-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>الممارسات والاشتراطات الإلزامية (Mandatory Rules):</span>
                </div>
                <div className="space-y-2 text-2xs text-emerald-950">
                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-base">✂️</span>
                    <div>
                      <strong className="text-emerald-900 block">تقليم الأظافر قصيرة ودائرية:</strong>
                      <span>بحيث لا تتجاوز طرف الإصبع وتكون خالية من الالتهابات الجلدية.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-base">🚰</span>
                    <div>
                      <strong className="text-emerald-900 block">حوض لكل 4 أسرة:</strong>
                      <span>مخصص لغسيل الأيدي فقط (حظر سكب السوائل والمحاليل فيه) مع ماء وصابون ومناشف ورقية.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-base">🧻</span>
                    <div>
                      <strong className="text-emerald-900 block">المناديل الورقية وحيدة الاستخدام:</strong>
                      <span>التجفيف بالتربيت وإغلاق الصنبور بالمنديل قبل إلقائه في سلة المهملات.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-base">🧤</span>
                    <div>
                      <strong className="text-emerald-900 block">القاعدة الذهبية للقفازات:</strong>
                      <span>ارتداء القفاز لا يغني بأي حال من الأحوال عن غسيل الأيدي والعكس.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
