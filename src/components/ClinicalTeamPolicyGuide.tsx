import React, { useState } from 'react';
import { 
  Stethoscope, 
  HeartPulse, 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  ShieldAlert, 
  Layers, 
  Printer, 
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  CheckCheck
} from 'lucide-react';
import { PolicyAnalysisResult } from '../types';

interface ClinicalTeamPolicyGuideProps {
  data: PolicyAnalysisResult;
}

export function ClinicalTeamPolicyGuide({ data }: ClinicalTeamPolicyGuideProps) {
  const [selectedRole, setSelectedRole] = useState<'all' | 'physicians' | 'nurses' | 'technicians' | 'support'>('all');
  const [selectedDecision, setSelectedDecision] = useState<'soap' | 'alcohol' | 'surgical'>('alcohol');
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);

  const clinicalScenarios = [
    {
      id: 1,
      title: 'قياس العلامات الحيوية لمريض مستقر (ضغط، نبض، حرارة)',
      category: 'الرعاية الروتينية اليومية',
      correctAction: 'دلك كحولي 70% لمدة 20-30 ثانية قبل ملامسة المريض، ودلك كحولي فور الانتهاء بعد ملامسته.',
      moment: 'لحظة 1 (قبل ملامسة المريض) ولحظة 4 (بعد ملامسة المريض)',
      glovesNeeded: 'لا يلزم ارتداء قفازات إذا لم يكن هناك تعرض لسوائل أو إفرازات أو جلد غير سليم.',
      commonMistake: 'ارتداء قفازات دون تطهير الأيدي بالكحول قبلها، أو الانتقال لمريض آخر بنفس القفازات!'
    },
    {
      id: 2,
      title: 'تركيب كانيولا وريدية أو إعطاء حقنة وريدية مباشرة (IV Access)',
      category: 'إجراءات نظيفة / معقمة (Aseptic Procedure)',
      correctAction: 'دلك كحولي أو غسيل بالماء والصابون + ارتداء قفازات نظيفة + تطهير موضع الجلد بالكحول 70% وتركه يجف + تطهير الأيدي فور خلع القفاز.',
      moment: 'لحظة 2 (قبل الإجراءات المعقمة والنظيفة) ولحظة 3 (بعد التعرض لسوائل الجسم)',
      glovesNeeded: 'قفازات نظيفة مفردة الاستخدام (Clean Non-Sterile Gloves).',
      commonMistake: 'لمس موضع الحقن بعد تطهيره بالجلد (Re-palpating vein) بأصبع غير معقم!'
    },
    {
      id: 3,
      title: 'التعامل مع مريض مصاب بإسهال حاد أو اشتباه كلوستريديوم (C. difficile)',
      category: 'العدوى المكونة للأبواغ (Spore-forming)',
      correctAction: 'غسيل إلزامي بالماء والصابون لمدة 40-60 ثانية حصراً. المطهر الكحولي غير فعال ضد أبواغ البكتيريا.',
      moment: 'لحظة 3 ولحظة 4 بعد الخروج من بيئة المريض',
      glovesNeeded: 'قفازات نظيفة ومريول واقٍ أحادي الاستخدام يتم التخلص منهما داخل الغرفة.',
      commonMistake: 'الاعتماد على الكحول فقط بعد مريض الكلوستريديوم (أبواغ البكتيريا لا تُقتل بالكحول وتتطلب الإزالة الميكانيكية بالماء والصابون).'
    },
    {
      id: 4,
      title: 'تركيب قسطرة وريدية مركزية (CVC) أو قسطرة بولية معقمة',
      category: 'إجراءات جراحية وتداخلية معقمة',
      correctAction: 'غسيل روتيني ثم تدليك جراحي بالكحول/كلورهيكسيدين + تدابير الحاجز المعقم الأقصى + قفازات معقمة مع جاون وغطاء رأس وماسك.',
      moment: 'لحظة 2 (قبل الإجراء المعقم الفائق)',
      glovesNeeded: 'قفازات معقمة جراحياً (Sterile Surgical Gloves).',
      commonMistake: 'فتح العبوات المعقمة أو لمس محيط المريض بأيدي غير مطهرة قبل ارتداء القفاز المعقم.'
    },
    {
      id: 5,
      title: 'تفريغ كيس جمع البول أو التعامل مع أنبوب تصريف الجروح (Drains)',
      category: 'التعرض لسوائل الجسم وإفرازات الجروح',
      correctAction: 'ارتداء قفازات نظيفة + تفريغ الكيس دون ملامسة الصمام للوعاء + خلع القفاز ورميه في كيس النفايات الطبية الحمراء + تطهير فوري بالأيدي.',
      moment: 'لحظة 3 (بعد التعرض لسوائل الجسم ومخاطرها)',
      glovesNeeded: 'قفازات نظيفة غير معقمة مع واقي عيون إذا كان هناك خطر تناثر الرذاذ.',
      commonMistake: 'لمس ملف المريض أو سرير المريض بالقفاز الملوث قبل خلعه وتطهير الأيدي!'
    },
    {
      id: 6,
      title: 'لمس طاولة المريض أو جهاز المونيتور أو محيط السرير فقط دون لمس المريض',
      category: 'بيئة المريض المحيطة (Patient Surroundings)',
      correctAction: 'دلك كحولي للأيدي لمدة 20-30 ثانية فور مغادرة محيط السرير، حتى لو لم يتم لمس المريض شخصياً.',
      moment: 'لحظة 5 (بعد ملامسة بيئة ومحيط المريض)',
      glovesNeeded: 'لا يلزم قفاز.',
      commonMistake: 'الاعتقاد بأن لمس السرير أو المونيتور لا ينقل الجراثيم، بينما بيئة المريض تكون محملة بالبكتيريا المقاومة للمضادات.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="bg-blue-500/30 text-blue-200 text-2xs px-2.5 py-0.5 rounded-full font-bold border border-blue-400/30">
                الدليل الإكلينيكي التشغيلي للفريق الطبي
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                مرجع ومراجعة الممارسات الإكلينيكية اليومية للكوادر الطبية
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الدليل السريري</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-blue-150 max-w-3xl leading-relaxed">
          دليل تنفيذي سريع ومكثف مصمم للأطباء وهيئة التمريض وفنيي الرعاية الصحية لمراجعة سيناريوهات الممارسة السريرية، شجرة اتخاذ القرار السريع، وضوابط الامتثال لمعايير جهار (GAHAR 2025).
        </p>
      </div>

      {/* 1. CLINICAL DECISION FLOW CHART (Interative Decision Pathway) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Droplets className="w-5 h-5 text-blue-800" />
            <h3>1. مصفوفة وشجرة اتخاذ القرار الإكلينيكي الفوري (Clinical Decision Pathway)</h3>
          </div>
          <span className="text-2xs bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded-md">
            ما الإجراء الصحيح الآن؟
          </span>
        </div>

        {/* Pathway Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedDecision('alcohol')}
            className={`p-4 rounded-xl border text-right transition flex flex-col justify-between space-y-2 ${
              selectedDecision === 'alcohol'
                ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-blue-950">🧴 الدلك الكحولي (ABHR 70%)</span>
              <span className="text-2xs bg-blue-200 text-blue-900 font-mono font-bold px-2 py-0.5 rounded">20-30 ثانية</span>
            </div>
            <p className="text-2xs text-slate-600">
              الخيار الذهبي الأول لمعظم الممارسات السريرية الروتينية عندما تكون الأيدي غير متسخة ظاهرياً.
            </p>
          </button>

          <button
            onClick={() => setSelectedDecision('soap')}
            className={`p-4 rounded-xl border text-right transition flex flex-col justify-between space-y-2 ${
              selectedDecision === 'soap'
                ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-indigo-950">🧼 غسيل بالماء والصابون</span>
              <span className="text-2xs bg-indigo-200 text-indigo-900 font-mono font-bold px-2 py-0.5 rounded">40-60 ثانية</span>
            </div>
            <p className="text-2xs text-slate-600">
              إلزامي عند تلوث اليدين المرئي بالدم أو الإفرازات، بعد المرحاض، أو بعد حالات الكلوستريديوم ديفيسيل (C. diff).
            </p>
          </button>

          <button
            onClick={() => setSelectedDecision('surgical')}
            className={`p-4 rounded-xl border text-right transition flex flex-col justify-between space-y-2 ${
              selectedDecision === 'surgical'
                ? 'bg-purple-50/80 border-purple-600 shadow-xs ring-2 ring-purple-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-purple-950">🏥 التطهير الجراحي (Scrub / Rub)</span>
              <span className="text-2xs bg-purple-200 text-purple-900 font-mono font-bold px-2 py-0.5 rounded">3-5 دقائق</span>
            </div>
            <p className="text-2xs text-slate-600">
              قبل العمليات الجراحية، قسطرة القلب، أو التداخلات المعقمة الكبرى في غرف العمليات والعنايات.
            </p>
          </button>
        </div>

        {/* Detailed Box for Selected Pathway */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          {selectedDecision === 'alcohol' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>بروتوكول الدلك الكحولي السريع (Alcohol Rub Protocol):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">متى يجب استخدام الكحول؟</strong>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>قبل فحص المريض ولمسه.</li>
                    <li>قبل إعطاء حقنة، قياس سكر، أو تركيب محاليل.</li>
                    <li>بعد لمس المريض أو قياس العلامات الحيوية.</li>
                    <li>بعد لمس طاولة المريض أو جهاز المونيتور.</li>
                    <li>قبل ارتداء القفازات وفور نزعها مباشرة.</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">القواعد الإلزامية للكحول:</strong>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>الجرعة: 3 إلى 5 مل (ضغطة كاملة لتغطية كلتا اليدين).</li>
                    <li>الفرك بكافة الاتجاهات (الراحتين، الظاهر، الأصابع، الإبهام، الرسغ).</li>
                    <li>الاستمرار في الفرك حتى جفاف الكحول تماماً (20-30 ثانية).</li>
                    <li>يحظر مسح الكحول بالمناديل قبل جفافه الذاتي.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedDecision === 'soap' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-indigo-700" />
                <span>بروتوكول الغسيل بالماء والصابون (Soap & Water Protocol):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">الحالات الإلزامية للماء والصابون:</strong>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>الأيدي متسخة ظاهرياً بالدم، الصديد، الإفرازات، أو البول.</li>
                    <li>بعد استخدام دورة المياه.</li>
                    <li>بعد التعامل مع مريض مصاب أو مشتبه بإصابته بـ C. difficile أو الجمرة الخبيثة.</li>
                    <li>في بداية ونهاية الوردية السريرية.</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">القواعد الإلزامية لغسيل اليدين:</strong>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>المدة: من 40 إلى 60 ثانية كاملة.</li>
                    <li>اتباع الخطوات الـ 13 لفرك باطن وظاهر اليد وتخليل الأصابع.</li>
                    <li>التجفيف بمنشفة ورقية وحيدة الاستخدام.</li>
                    <li>استخدام نفس المنشفة لإغلاق الصنبور لمنع إعادة التلوث.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedDecision === 'surgical' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-purple-700" />
                <span>بروتوكول التطهير الجراحي (Surgical Scrub & Rub Protocol):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">الغسل الجراحي الرغوي (بيتادين 7.5%):</strong>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>المدة: 3 إلى 5 دقائق باستخدام ساعة توقيت العمليات.</li>
                    <li>غسل اليدين والساعدين حتى 5 سم فوق المرفق.</li>
                    <li>تنظيف تحت الأظافر بمبرد بلاستيكي أحادي الاستخدام.</li>
                    <li>الشطف من أطراف الأصابع نحو الكوع مع إبقاء اليدين مرفوعتين.</li>
                    <li>التجفيف بمنشفة معقمة ورفع الأيدي فوق مستوى الخصر دائماً.</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">التدليك الجراحي الكحولي (كلورهيكسيدين 2-4%):</strong>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    <li>غسل اليدين روتينياً بالصابون والماء وتجفيفهما أولاً.</li>
                    <li>وضع 5 مل مطهر كحولي وغمر أطراف الأصابع 5 ثوانٍ.</li>
                    <li>فرك كامل الساعد حتى 5 سم فوق الكوع لمدة 15 ثانية لكل ساعد.</li>
                    <li>فرك اليدين حتى الجفاف التام قبل ارتداء القفاز المعقم.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ROLE-BASED QUICK ACTION CARDS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Award className="w-5 h-5 text-indigo-700" />
            <h3>2. بطاقات المسؤولية الإكلينيكية المباشرة حسب التخصص الطبي</h3>
          </div>
          
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                selectedRole === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedRole('physicians')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                selectedRole === 'physicians' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأطباء والجراحون
            </button>
            <button
              onClick={() => setSelectedRole('nurses')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                selectedRole === 'nurses' ? 'bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              هيئة التمريض
            </button>
            <button
              onClick={() => setSelectedRole('technicians')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                selectedRole === 'technicians' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الفنيون والمعامل
            </button>
            <button
              onClick={() => setSelectedRole('support')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition ${
                selectedRole === 'support' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الخدمات المعاونة
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Physicians */}
          {(selectedRole === 'all' || selectedRole === 'physicians') && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
                <Stethoscope className="w-5 h-5 text-blue-800" />
                <h4 className="font-bold text-sm text-blue-950">الأطباء والاستشاريون والجراحون</h4>
              </div>
              <ul className="space-y-1.5 text-2xs text-slate-800">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>المرور السريري اليومي:</strong> دلك كحولي إلزامي قبل وبعد فحص كل مريض، وقبل لمس السماعة الطبية أو أدوات الفحص.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>قاعدة خلو الساعدين (Bare Below Elbows):</strong> خلع الساعات والخواتم وحلي المعصم تماماً ورفع أكمام البالطو الطبي.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>غرف العمليات:</strong> الغسل الجراحي الصارم لمدة 3-5 دقائق بساعة التوقيت، وارتداء القفاز المعقم فوق الكوع.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>القدوة الإكلينيكية:</strong> توجيه الأطباء المقيمين والامتياز للالتزام باللحظات الخمس بنسبة 100%.</span>
                </li>
              </ul>
            </div>
          )}

          {/* Card 2: Nurses */}
          {(selectedRole === 'all' || selectedRole === 'nurses') && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-indigo-200 pb-2">
                <HeartPulse className="w-5 h-5 text-indigo-800" />
                <h4 className="font-bold text-sm text-indigo-950">هيئة التمريض (الأقسام الداخلية والعنايات)</h4>
              </div>
              <ul className="space-y-1.5 text-2xs text-slate-800">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                  <span><strong>تغيير القفازات:</strong> يُحظر تماماً الانتقال من مريض لآخر أو من إجراء لآخر بنفس القفازات، ويجب تطهير الأيدي فور خلع القفاز.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                  <span><strong>حقن المحاليل والأدوية:</strong> تطهير الأيدي قبل تحضير الأدوية، وقبل ملامسة القساطر الوريدية (Scrub the Hub).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                  <span><strong>جاهزية نقطة الرعاية (Point of Care):</strong> التأكد المستمر من امتلاء موزعات الكحول المعلقة بجانب كل سرير مريض.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                  <span><strong>حظر الأظافر الاصطناعية:</strong> الالتزام بقص الأظافر طبيعياً وأقل من 0.5 سم دون طلاء أو تركيبات.</span>
                </li>
              </ul>
            </div>
          )}

          {/* Card 3: Technicians */}
          {(selectedRole === 'all' || selectedRole === 'technicians') && (
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-purple-200 pb-2">
                <FlaskConical className="w-5 h-5 text-purple-800" />
                <h4 className="font-bold text-sm text-purple-950">فنيو المختبرات والأشعة والتخدير</h4>
              </div>
              <ul className="space-y-1.5 text-2xs text-slate-800">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span><strong>سحب العينات المخبرية:</strong> تطهير الأيدي قبل ارتداء القفازات، واستخدام قفاز جديد لكل مريض على حدة.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span><strong>أجهزة الأشعة والمجسات:</strong> تطهير الأيدي قبل وبعد لمس مجسات السونار والأشعة المتنقلة بين المرضى.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span><strong>التخلص الآمن:</strong> إلقاء الإبر وأدوات السحب فوراً في صندوق الأمان (Sharps Box) دون تغطية الإبرة (No Recapping).</span>
                </li>
              </ul>
            </div>
          )}

          {/* Card 4: Support Staff */}
          {(selectedRole === 'all' || selectedRole === 'support') && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-emerald-200 pb-2">
                <CheckCheck className="w-5 h-5 text-emerald-800" />
                <h4 className="font-bold text-sm text-emerald-950">الخدمات المعاونة وعمال النظافة</h4>
              </div>
              <ul className="space-y-1.5 text-2xs text-slate-800">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>حظر إعادة ملء العبوات (Top-Up Ban):</strong> يُحظر تماماً إضافة صابون أو مطهر فوق عبوات قديمة دون تفريغ وتطهير كامل.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>حماية أحواض الأيدي:</strong> أحواض غسيل الأيدي مخصصة لغسيل الأيدي فقط، ويُمنع سكب سوائل التنظيف أو الشاي فيها.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>القفازات شديدة التحمل (Heavy Duty):</strong> ارتداء قفازات التنظيف السميكة أثناء التعامل مع النفايات والكلور.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 3. DAILY REAL-WORLD CLINICAL SCENARIOS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h3>3. دليل السيناريوهات الإكلينيكية والمواقف السريرية الشائعة</h3>
          </div>
          <span className="text-2xs text-slate-500">انقر على السيناريو لعرض الحل والمحاذير</span>
        </div>

        <div className="space-y-2.5">
          {clinicalScenarios.map((sc) => {
            const isExpanded = expandedScenario === sc.id;
            return (
              <div
                key={sc.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition bg-slate-50/50"
              >
                <button
                  onClick={() => setExpandedScenario(isExpanded ? null : sc.id)}
                  className="w-full p-3.5 text-right flex items-center justify-between gap-3 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-800 text-white font-bold text-2xs flex items-center justify-center shrink-0">
                      {sc.id}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{sc.title}</h4>
                      <span className="text-3xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sc.category}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-200 space-y-2.5 text-2xs">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                      <strong className="text-emerald-950 block font-bold">✅ التصرف الإكلينيكي الصحيح:</strong>
                      <p className="text-emerald-900">{sc.correctAction}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-0.5">لحظة منظمة الصحة العالمية (WHO Moment):</strong>
                        <span>{sc.moment}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-0.5">ضوابط القفازات:</strong>
                        <span>{sc.glovesNeeded}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
                      <strong className="text-rose-950 block font-bold mb-0.5">❌ الخطأ الشائع المحذور:</strong>
                      <span>{sc.commonMistake}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SHIFT-START READINESS CHECKLIST */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <FileCheck2 className="w-5 h-5 text-emerald-700" />
          <h3>4. قائمة التحقق السريع لبداية الوردية (60-Second Shift Huddle Checklist)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-2xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-blue-900 font-bold block">1. خلو الساعدين (BBE):</strong>
            <p className="text-slate-600">لا خواتم، لا ساعات، لا أساور، وأكمام مرفوعة فوق الكوع طوال فترة التواجد بالقسم.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-blue-900 font-bold block">2. فحص الأظافر:</strong>
            <p className="text-slate-600">أظافر طبيعية ومقلمة، بدون طلاء أظافر وبدون أظافر صناعية أو تركيبات.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-blue-900 font-bold block">3. جاهزية موزعات الكحول:</strong>
            <p className="text-slate-600">التأكد من توفر المحلول الكحولي عند مدخل كل غرفة وعند نقطة تقديم الرعاية لكل سرير.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-blue-900 font-bold block">4. توفر المناشف الورقية:</strong>
            <p className="text-slate-600">وجود مناشف أحادية الاستخدام وصابون سائل سليم عند كل حوض غسيل أيدي بالقسم.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-blue-900 font-bold block">5. مخزون القفازات بالمقاسات:</strong>
            <p className="text-slate-600">توفر قفازات نظيفة غير معقمة بجميع المقاسات (S, M, L) عند محطة التمريض والغرف.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-blue-900 font-bold block">6. التزام اللحظات الخمس:</strong>
            <p className="text-slate-600">استحضار اللحظات الخمس لمنظمة الصحة العالمية قبل ملامسة أي مريض أو إعطاء أدوية.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
