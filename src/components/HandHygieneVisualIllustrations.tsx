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
  const [activeStepTab, setActiveStepTab] = useState<'soap' | 'alcohol' | 'surgical' | 'five_moments' | 'bare_below_elbows' | 'full_policy'>('five_moments');
  const [selectedMoment, setSelectedMoment] = useState<number | null>(null);

  // Complete 13 Standard Steps of Routine Hand Washing with Soap & Water
  const soap13Steps = [
    {
      step: 1,
      title: 'خلع جميع المجوهرات والحلي والمعاصم',
      titleEn: 'Remove all jewelry and wristwatches',
      time: '3 ثوانٍ',
      details: 'خلع الخواتم والأساور والساعات باليدين والمعصمين لضمان وصول الماء والمطهر لكافة مناطق الجلد ومنع تمزق القفازات.',
      iconType: 'wrists'
    },
    {
      step: 2,
      title: 'فتح الصنبور وترطيب اليدين بالماء الجاري',
      titleEn: 'Wet hands with running water',
      time: '3 ثوانٍ',
      details: 'فتح الصنبور بالكوع أو باليد وترطيب كامل أسطح اليدين والرسغين بالماء الجاري النظيف (تجنب غمر اليدين في ماء راكد).',
      iconType: 'rinse_dry'
    },
    {
      step: 3,
      title: 'وضع كمية كافية من الصابون السائل',
      titleEn: 'Apply sufficient soap to cover all surfaces',
      time: '3 ثوانٍ',
      details: 'الضغط على موزع الصابون بالكوع أو اليد لوضع كمية كافية (3-5 مل) تغطي كامل مساحة الراحتين والظاهرين.',
      iconType: 'palm_to_palm'
    },
    {
      step: 4,
      title: 'فرك باطن اليد بباطن اليد الأخرى',
      titleEn: 'Rub hands palm to palm',
      time: '5 ثوانٍ',
      details: 'فرك باطن اليدين مواجهين بحركات دائرية مستمرة لتكوين رغوة صابونية كثيفة وتوزيعها على الراحتين.',
      iconType: 'palm_to_palm'
    },
    {
      step: 5,
      title: 'فرك باطن اليد اليمنى فوق ظهر اليسرى والعكس',
      titleEn: 'Right palm over left dorsum with interlaced fingers',
      time: '5 ثوانٍ',
      details: 'فرك باطن اليد اليمنى على ظهر اليد اليسرى مع تداخل الأصابع، ثم عكس الوضع لليد المعاكسة.',
      iconType: 'dorsum_interlaced'
    },
    {
      step: 6,
      title: 'دلك باطن اليدين مواجهين مع تداخل الأصابع',
      titleEn: 'Palm to palm with fingers interlaced',
      time: '5 ثوانٍ',
      details: 'مواجهة باطن اليدين مع تشابك وتداخل الأصابع والفرك للأعلى والأسفل لتطهير الفراغات بين الأصابع.',
      iconType: 'interlaced'
    },
    {
      step: 7,
      title: 'دلك قبضة اليد بباطن اليد المعاكسة',
      titleEn: 'Backs of fingers to opposing palms with fingers interlocked',
      time: '5 ثوانٍ',
      details: 'ضم الأصابع في شكل قبضة ودلك ظهر الأصابع في راحة اليد المعاكسة مع تحريك الأصابع يمنة ويسرة.',
      iconType: 'clasped_fingers'
    },
    {
      step: 8,
      title: 'الدلك الدائري لإبهام اليد اليسرى باليمنى ثم العكس',
      titleEn: 'Rotational rubbing of left thumb clasped in right palm',
      time: '5 ثوانٍ',
      details: 'الإمساك بالإبهام الأيسر بقبضة اليد اليمنى والدلك الدائري الشامل، ثم تكرار الخطوة للإبهام الأيمن.',
      iconType: 'thumb_rotation'
    },
    {
      step: 9,
      title: 'فرك أطراف الأصابع والأظافر دائرياً بباطن اليد',
      titleEn: 'Rotational rubbing of fingertips in opposite palm',
      time: '5 ثوانٍ',
      details: 'ضم أطراف أصابع اليد اليمنى وفركها بحركة دائرية في باطن اليد اليسرى لإزالة الأوساخ الميكروبية تحت الأظافر، ثم العكس.',
      iconType: 'fingertips_nails'
    },
    {
      step: 10,
      title: 'فرك الرسغين بطريقة دائرية لليدين',
      titleEn: 'Rotational rubbing of both wrists',
      time: '5 ثوانٍ',
      details: 'الدلك الدائري لرسغ اليد اليسرى باليد اليمنى ثم رسغ اليد اليمنى باليسرى لتطهير منطقة المعصم.',
      iconType: 'wrists'
    },
    {
      step: 11,
      title: 'شطف اليدين بماء جارٍ مع رفع اليدين لأعلى',
      titleEn: 'Rinse hands thoroughly with running water',
      time: '8 ثوانٍ',
      details: 'شطف اليدين بماء جارٍ بدءاً من أطراف الأصابع نحو الرسغين مع إبقاء اليدين مرفوعتين حتى إزالة الصابون بالكامل.',
      iconType: 'rinse_dry'
    },
    {
      step: 12,
      title: 'تجفيف اليدين بمنشفة ورقية وحيدة الاستخدام',
      titleEn: 'Dry hands thoroughly with a single-use towel',
      time: '5 ثوانٍ',
      details: 'تجفيف اليدين بالتربيت اللطيف باستخدام منشفة ورقية نظيفة ذات استخدام واحد دون فرك الجلد بعنف.',
      iconType: 'rinse_dry'
    },
    {
      step: 13,
      title: 'إغلاق الصنبور بنفس المنشفة والتخلص منها',
      titleEn: 'Use towel to turn off faucet and discard safely',
      time: '3 ثوانٍ',
      details: 'استخدام نفس المنشفة الورقية لإغلاق مقبض الصنبور لمنع إعادة تلوث الأيدي، ثم إلقاؤها في حاوية النفايات.',
      iconType: 'rinse_dry'
    }
  ];

  // Complete Steps of Alcohol Hand Rub (7 Core Steps)
  const alcoholSteps = [
    {
      step: 1,
      title: 'خلع المجوهرات ووضع الكحول (3-5 مل)',
      titleEn: 'Apply 3-5ml alcohol in palm',
      time: '3 ثوانٍ',
      details: 'وضع كمية كافية من المطهر الكحولي 70% في راحة اليد المقعرة لتغطية كافة أسطح اليدين حتى الرسغين.',
      iconType: 'palm_to_palm'
    },
    {
      step: 2,
      title: 'فرك باطن بالباطن',
      titleEn: 'Palm to palm rubbing',
      time: '4 ثوانٍ',
      details: 'فرك الراحتين مواجهتين لتوزيع الجل أو السائل الكحولي.',
      iconType: 'palm_to_palm'
    },
    {
      step: 3,
      title: 'فرك ظهر اليد مع تداخل الأصابع',
      titleEn: 'Right palm over left dorsum',
      time: '4 ثوانٍ',
      details: 'فرك باطن اليد اليمنى على ظهر اليد اليسرى مع تداخل الأصابع والعكس.',
      iconType: 'dorsum_interlaced'
    },
    {
      step: 4,
      title: 'فرك الراحتين مع تشابك الأصابع',
      titleEn: 'Palm to palm with fingers interlaced',
      time: '4 ثوانٍ',
      details: 'دلك باطن اليدين مواجهين مع تداخل الأصابع لتغطية الفراغات بين الأصابع.',
      iconType: 'interlaced'
    },
    {
      step: 5,
      title: 'دلك ظهر الأصابع بقبضة اليد',
      titleEn: 'Backs of fingers to opposing palms',
      time: '4 ثوانٍ',
      details: 'ضم الأصابع ودلك ظهر الأصابع في راحة اليد المعاكسة.',
      iconType: 'clasped_fingers'
    },
    {
      step: 6,
      title: 'الدلك الدائري للإبهامين وأطراف الأصابع',
      titleEn: 'Rotational rubbing of thumbs and fingertips',
      time: '5 ثوانٍ',
      details: 'الدلك الدائري للإبهامين وفرك أطراف الأصابع في راحة اليد لتطهير ما تحت الأظافر.',
      iconType: 'thumb_rotation'
    },
    {
      step: 7,
      title: 'الاستمرار بالدلك حتى الجفاف التام في الهواء',
      titleEn: 'Rub until completely dry (20-30s)',
      time: '5 ثوانٍ',
      details: 'الاستمرار في فرك اليدين حتى يتبخر الكحول تماماً وتجف الأيدي (يحظر مسح الكحول بأي منديل).',
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
              <span>🧼 غسيل بالماء والصابون (13 خطوة)</span>
            </button>

            <button
              onClick={() => setActiveStepTab('alcohol')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'alcohol' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🧴 الدلك بالكحول (7 خطوات)</span>
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

            <button
              onClick={() => setActiveStepTab('full_policy')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeStepTab === 'full_policy' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>📋 نص السياسة والاعتماد</span>
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
        {/* VIEW 2: 13-STEP ILLUSTRATED ROUTINE HANDWASHING WITH SOAP & WATER          */}
        {/* ========================================================================= */}
        {activeStepTab === 'soap' && (
          <div className="space-y-6">
            {/* Mode Banner */}
            <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  🧼
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    خطوات غسيل اليدين القياسية بالماء والصابون (13 خطوة متسلسلة - 40 إلى 60 ثانية)
                  </h4>
                  <p className="text-2xs text-slate-600">
                    إلزامي عند الاتساخ الظاهري للأيدي، أو التلوث بالدم وسوائل الجسم، وبعد استخدام دورات المياه
                  </p>
                </div>
              </div>
              <div className="text-2xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs text-blue-900">
                الزمن الإلزامي: 40 - 60 ثانية | 13 خطوة تفصيلية
              </div>
            </div>

            {/* 13 Steps Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {soap13Steps.map((motion) => (
                <div key={motion.step} className="bg-slate-50 hover:bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs transition flex flex-col justify-between space-y-2 group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-2xs flex items-center justify-center shadow-2xs">
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
        {/* VIEW 3: 7-STEP ALCOHOL HAND RUB PROTOCOL (20 - 30 SECONDS)                */}
        {/* ========================================================================= */}
        {activeStepTab === 'alcohol' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  🧴
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    خطوات تدليك الأيدي بالمطهر الكحولي 70% (20 إلى 30 ثانية حتى الجفاف التام)
                  </h4>
                  <p className="text-2xs text-slate-600">
                    الخيار الأول والأنسب والأسرع في كافة اللحظات الخمس طالما الأيدي غير متسخة ظاهرياً
                  </p>
                </div>
              </div>
              <div className="text-2xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs text-indigo-900">
                الحجم: 3-5 مل | الزمن: 20-30 ثانية حتى الجفاف
              </div>
            </div>

            {/* Alcohol Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {alcoholSteps.map((motion) => (
                <div key={motion.step} className="bg-slate-50 hover:bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs transition flex flex-col justify-between space-y-2 group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-700 text-white font-bold text-2xs flex items-center justify-center shadow-2xs">
                        {motion.step}
                      </span>
                      <span className="text-3xs text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {motion.time}
                      </span>
                    </div>

                    {/* Vector Graphic */}
                    <div className="py-2 bg-white rounded-lg border border-slate-100 mb-2 group-hover:border-indigo-200 transition">
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
        {/* VIEW 4: SURGICAL HAND SCRUB & ANTISEPSIS ILLUSTRATED PROTOCOL             */}
        {/* ========================================================================= */}
        {activeStepTab === 'surgical' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-purple-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
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
                العمق التشريحي: حتى 5 سم فوق المرفقين
              </span>
            </div>

            {/* Anatomical Depth Visual Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h5 className="font-bold text-slate-900 text-xs">الغسل بالبيتادين 7.5% الرغوي (3-5 دقائق)</h5>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  • خلع كافة الحلي والمعاصم تماماً.<br/>
                  • بلل اليدين والساعدين حتى 5 سم فوق المرفق.<br/>
                  • تنظيف ما تحت كل ظفر بمبرد أو فرشاة معقمة.<br/>
                  • وضع رغوة البيتادين والدعك الدائري المستمر لليدين والأصابع والذراعين لمدة <strong>3 إلى 5 دقائق</strong>.<br/>
                  • الشطف بدءاً من أطراف الأصابع نحو المرفقين مع رفع الأيدي أعلى من مستوى المرفق.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h5 className="font-bold text-slate-900 text-xs">الدلك بالكلورهيكسيدين 2%-4% الكحولي</h5>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  • غسل وتجفيف اليدين روتينياً أولاً والتأكد من جفافهما.<br/>
                  • وضع 5 مل مطهر كحولي في راحة اليد المقعرة.<br/>
                  • غمر أطراف الأصابع لمدة <strong>5 ثوانٍ</strong>.<br/>
                  • تدليك الذراع حتى 5 سم فوق المرفق لمدة <strong>15 ثانية لكل ذراع</strong>.<br/>
                  • الفرك حتى الجفاف التام في الهواء دون ملامسة أي سطح.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h5 className="font-bold text-slate-900 text-xs">التجفيف وارتداء الرداء والقفازات</h5>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  • التجفيف بمنشفة معقمة (استخدام جانب لكل يد/ذراع دون العودة للمناطق المطهرة).<br/>
                  • إبقاء الأيدي مرفوعة فوق مستوى الخصر دائماً وأعلى من المرفقين.<br/>
                  • ارتداء الرداء المعقم (Surgical Gown) والقفازات المعقمة بالطريقة المغلقة (Closed Gloving).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: BARE BELOW ELBOWS & STRICT PROHIBITIONS ILLUSTRATED MATRIX        */}
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
                      <span>تمنع وصول الماء والمطهر لمناطق التلامس وتأوي الجراثيم وتسبب تمزق القفازات.</span>
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
                      <span>تنشر الرذاذ الملوث في الهواء وتسبب الإزعاج ولا تضمن التجفيف الكامل مقارنة بالمناديل الورقية.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="text-base">🧴</span>
                    <div>
                      <strong className="text-rose-900 block">حظر إعادة ملء العبوات (Zero Top-up Ban):</strong>
                      <span>يحظر خلط أو تزويد الصابون والكحول في عبوات قديمة دون تفريغها وتطهيرها وتجفيفها وتدوين التاريخ.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-rose-100">
                    <span className="text-base">🚫</span>
                    <div>
                      <strong className="text-rose-900 block">حظر سكب السوائل في أحواض الأيدي:</strong>
                      <span>الأحواض مخصصة لغسيل الأيدي فقط (حظر سكب المحاليل أو غسيل المتعلقات والآلات فيها).</span>
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
                      <span>مخصص لغسيل الأيدي فقط مع ماء وصابون ومناشف ورقية وسلة مهملات تعمل بالقدم.</span>
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

                  <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="text-base">📅</span>
                    <div>
                      <strong className="text-emerald-900 block">تدوين تاريخ الفتح والاستخدام:</strong>
                      <span>تدوين تاريخ الصلاحية والفتح على كافة عبوات الصابون السائل والمطهرات.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: FULL LITERAL POLICY TEXT & INSTITUTIONAL CONTROL MATRIX          */}
        {/* ========================================================================= */}
        {activeStepTab === 'full_policy' && (
          <div className="space-y-6">
            {/* Header Document Control */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    جامعة المنيا - مستشفيات جامعة المنيا - مستشفى المنيا الجامعي للعيون
                  </h4>
                  <p className="text-2xs text-slate-500">
                    كود السياسة: MUEH.IPC.04 | رقم المعيار: I.P.C 04 | الإصدار الثاني (2025/5/1)
                  </p>
                </div>
                <div className="text-left text-2xs space-y-0.5">
                  <p><span className="text-slate-500">تاريخ التفعيل:</span> <strong>2025/5/15</strong></p>
                  <p><span className="text-slate-500">تاريخ المراجعة:</span> <strong>2028/4/1</strong></p>
                  <p><span className="text-slate-500">عدد الصفحات:</span> <strong>11 صفحة</strong></p>
                </div>
              </div>

              {/* Literal Policy Statement */}
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-1.5">
                <strong className="text-xs font-bold text-blue-950 block">نص السياسة الإلزامي الكامل:</strong>
                <p className="text-2xs text-slate-800 leading-relaxed text-justify">
                  «التزام جميع العاملين (أطباء - تمريض - عمال - إداريين) وكذلك الزائرين بغسيل الأيدي بطريقة صحيحة تبعاً لنوع الإجراء المتخذ مع المريض، حيث تُعد نظافة اليدين حجر الزاوية في الحد من انتقال العدوى في جميع مرافق الرعاية الصحية، وتُعتبر الاستراتيجية الأكثر فعالية وكفاءة للوقاية من العدوى ومكافحتها.»
                </p>
              </div>

              {/* 3 Operational Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-2xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold mb-0.5">1. سلامة التدخلات الطبية:</strong>
                  <p className="text-slate-600">القيام بالإجراءات الطبية دون أي ملوثات تنتقل من الأيدي أثناء التعامل مع المريض.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold mb-0.5">2. التدريب بنسبة 100%:</strong>
                  <p className="text-slate-600">تدريب جميع العاملين بالمستشفى بالخطوات والدواعي الصحيحة لنظافة وتطهير الأيدي.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-900 block font-bold mb-0.5">3. سلامة المرضى والعاملين:</strong>
                  <p className="text-slate-600">التأكيد على أهمية نظافة الأيدي لضمان سلامة المرضى والعاملين على حد سواء.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
