import React from 'react';
import { PolicyAnalysisResult } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Sparkles,
  BookOpen,
  FlaskConical,
  Clock,
  Droplets,
  Layers,
  HeartPulse,
  Activity,
  CheckSquare
} from 'lucide-react';

interface A4FinalReviewDocumentProps {
  data: PolicyAnalysisResult;
  isPrintOnly?: boolean;
}

export const A4FinalReviewDocument: React.FC<A4FinalReviewDocumentProps> = ({ data, isPrintOnly = false }) => {
  const card = data.policyCard || ({} as any);
  const purpose = data.purposeAndScope || ({} as any);
  const definitions = Array.isArray(data.scientificDefinitions) ? data.scientificDefinitions : [];
  const techSpecs = Array.isArray(data.technicalSpecifications) ? data.technicalSpecifications : [];
  const fiveMoments = Array.isArray((data as any).fiveMomentsDetail) 
    ? (data as any).fiveMomentsDetail 
    : Array.isArray(data.fiveMomentsDetails) 
    ? data.fiveMomentsDetails 
    : [];
  const skinCare = data.skinAndGloveCare || ({} as any);
  const infra = data.infrastructureRequirements || ({} as any);
  const roles = Array.isArray(data.rolesAndResponsibilities) ? data.rolesAndResponsibilities : [];
  const sop = data.sopPhases || ({} as any);
  const safety = data.safetyWarningsAndCriticalSteps || ({} as any);
  const kpisData = data.complianceAndKPIs || ({} as any);

  // Extract safe arrays for safety
  const criticalPoints: string[] = Array.isArray(safety?.criticalControlPoints)
    ? safety.criticalControlPoints.map((item: any) => typeof item === 'string' ? item : item?.text || JSON.stringify(item))
    : [];

  let dosList: string[] = [];
  if (Array.isArray(safety?.dos)) {
    dosList = safety.dos.map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  } else if (Array.isArray(safety?.dosAndDonts)) {
    dosList = safety.dosAndDonts
      .filter((item: any) => item?.type === 'DO' || (typeof item === 'string' && !item.toLowerCase().startsWith("don't")))
      .map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  }

  let dontsList: string[] = [];
  if (Array.isArray(safety?.donts)) {
    dontsList = safety.donts.map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  } else if (Array.isArray(safety?.dosAndDonts)) {
    dontsList = safety.dosAndDonts
      .filter((item: any) => item?.type === 'DONT' || item?.type === "DON'T" || (typeof item === 'string' && item.toLowerCase().startsWith("don't")))
      .map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  }

  const emergencyProtocol = typeof safety?.emergencyIncidentProtocol === 'string'
    ? safety.emergencyIncidentProtocol
    : typeof safety?.exposureProtocol === 'string'
    ? safety.exposureProtocol
    : 'في حال حدوث وخز إبرة أو تعرض مهني: غسل الموضع فوراً بالماء والصابون دون عصر، إبلاغ مشرف السلامة ومكافحة العدوى فوراً وبدء التقييم والوقاية بعد التعرض (PEP).';

  const auditItems = Array.isArray(kpisData?.auditChecklist) ? kpisData.auditChecklist : [];
  const kpiItems = Array.isArray(kpisData?.kpis) ? kpisData.kpis : [];
  const recommendations = Array.isArray(kpisData?.gapAnalysisAndRecommendations) ? kpisData.gapAnalysisAndRecommendations : [];

  return (
    <div 
      className={`${isPrintOnly ? 'print-only hidden' : 'a4-paper-sheet'} text-slate-900 font-sans leading-relaxed text-right`} 
      dir="rtl"
    >
      {/* ================= HEADER ================= */}
      <header className="border-b-2 border-slate-900 pb-3 mb-4 flex items-start justify-between gap-4 avoid-break">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-slate-950 text-amber-400 flex flex-col items-center justify-center font-black text-xs font-mono border border-slate-700 shrink-0 shadow-sm">
              <span className="text-[10pt] leading-none text-white">⭐</span>
              <span className="text-[6pt] text-amber-300 font-bold uppercase tracking-wider">REV</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm md:text-base font-black text-slate-950 tracking-tight leading-tight">
                  مذكرة المراجعة النهائية المركزة والملخص التنفيذي للسياسة الإكلينيكية
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[7pt] font-black tracking-wide uppercase shadow-2xs">
                  ⚡ كبسولة ليلة الاعتماد والتقييم
                </span>
              </div>
              <p className="text-[7.5pt] text-slate-600 font-bold flex items-center gap-1.5 mt-0.5">
                <span>الدليل الميداني الشامل للمراجعة السريعة ومطابقة المعايير:</span>
                <span className="text-blue-900 font-extrabold">GAHAR 2025 • CBAHI • JCI • WHO</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[7pt] font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
            <span className="text-amber-700">📌 تصنيف الوثيقة:</span>
            <span className="font-extrabold text-blue-950">مذكرة مراجعة إكلينيكية موجزة وشاملة (High-Yield Master Cram Sheet)</span>
            <span>•</span>
            <span className="text-emerald-800 font-bold">جاهزة للاختبارات، التدقيق الميداني، ومطابقة الاعتماد</span>
          </div>
        </div>

        {/* Policy Quick Meta Box */}
        <div className="text-left font-mono text-[7.5pt] border-2 border-slate-900 p-2 rounded-lg bg-amber-50/50 space-y-0.5 min-w-[195px] shrink-0 shadow-2xs">
          <div className="flex justify-between items-center border-b border-amber-200 pb-0.5">
            <span className="font-bold text-slate-700">كود السياسة:</span>
            <strong className="text-blue-950 font-black text-[8pt]">{card.policyCode || 'GAHAR-IPC-01'}</strong>
          </div>
          <div className="flex justify-between items-center text-[7pt]">
            <span className="text-slate-600">تاريخ الاعتماد:</span>
            <strong>{card.effectiveDate || '2026/01/01'}</strong>
          </div>
          <div className="flex justify-between items-center text-[7pt]">
            <span className="text-slate-600">دورة المراجعة:</span>
            <strong>{card.reviewCycle || 'سنوياً'}</strong>
          </div>
          <div className="text-center font-bold text-emerald-800 text-[6.5pt] bg-emerald-100/80 px-1 py-0.5 rounded border border-emerald-300 mt-1">
            ✓ معتمدة للتطبيق الإلزامي
          </div>
        </div>
      </header>

      {/* ================= 1. EXECUTIVE SUMMARY & CLINICAL OBJECTIVES ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
        <div className="bg-slate-900 text-white px-3 py-1.5 font-bold text-[8.5pt] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1. الملخص التنفيذي والكبسولة الذهبية للمراجعة (Executive Cram Capsule)</span>
          </div>
          <span className="text-[7pt] text-amber-300 font-bold">مراجعة سريعة قبل التقييم</span>
        </div>
        
        <div className="p-3 space-y-2.5 text-[8pt]">
          <div className="leading-relaxed text-slate-800 text-justify bg-slate-50 p-2.5 rounded-lg border border-slate-200 whitespace-pre-line">
            {data.executiveSummarySnippet || 'تم إعداد وتلخيص وثيقة السياسة بدقة علمية ومنهجية تامة لتتوافق مع معايير جهار 2025 والدليل القومي المصري لمكافحة العدوى والمعايير الدولية.'}
          </div>

          {/* 4 Golden Revision Capsules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[7pt]">
            <div className="bg-amber-50/90 border border-amber-300 p-2 rounded-lg space-y-1">
              <strong className="text-amber-950 font-black block flex items-center gap-1 text-[7.5pt]">
                <span>⭐</span> الهدف الإكلينيكي:
              </strong>
              <p className="text-amber-900 leading-snug font-medium">
                {purpose.mainObjective || 'الحد من انتقال العدوى المكتسبة وضمان سلامة المرضى والكوادر.'}
              </p>
            </div>

            <div className="bg-blue-50/90 border border-blue-300 p-2 rounded-lg space-y-1">
              <strong className="text-blue-950 font-black block flex items-center gap-1 text-[7.5pt]">
                <span>⏱️</span> أزمنة وكميات ذهبية:
              </strong>
              <p className="text-blue-900 leading-snug font-medium">
                فرك كحولي: <strong>20-30 ثانية</strong> (3-5 مل) • غسيل مائي: <strong>40-60 ثانية</strong>.
              </p>
            </div>

            <div className="bg-rose-50/90 border border-rose-300 p-2 rounded-lg space-y-1">
              <strong className="text-rose-950 font-black block flex items-center gap-1 text-[7.5pt]">
                <span>🚫</span> خط أحمر قطعي:
              </strong>
              <p className="text-rose-900 leading-snug font-medium">
                حظر تزويد العبوات <strong>(Zero Top-up)</strong>، والقفازات لا تغني عن تطهير اليدين.
              </p>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-300 p-2 rounded-lg space-y-1">
              <strong className="text-emerald-950 font-black block flex items-center gap-1 text-[7.5pt]">
                <span>🎯</span> مستهدف الامتثال:
              </strong>
              <p className="text-emerald-900 leading-snug font-medium">
                تحقيق نسبة امتثال <strong>≥ 90%</strong> في جولات التفتيش والملاحظة المباشرة.
              </p>
            </div>
          </div>

          {/* Core Scope and Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[7.5pt]">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <strong className="text-slate-900 font-bold block mb-0.5">النطاق والفئات الملزمة بالتطبيق:</strong>
              <p className="text-slate-700">
                {Array.isArray(purpose.scope) && purpose.scope.length > 0 ? purpose.scope.join('، ') : 'كافة الكوادر الطبية والتمريضية والمساندة والفنية'}
              </p>
            </div>
            {Array.isArray(purpose.exclusions) && purpose.exclusions.length > 0 && (
              <div className="bg-rose-50/60 p-2 rounded border border-rose-200">
                <strong className="text-rose-950 font-bold block mb-0.5">الاستثناءات والمحددات:</strong>
                <p className="text-rose-900">{purpose.exclusions.join('، ')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 2. SCIENTIFIC DEFINITIONS (If available) ================= */}
      {definitions.length > 0 && (
        <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>2. المفاهيم والمصطلحات العلمية والأسس الميكروبيولوجية (Scientific Terminology)</span>
            </div>
            <span className="text-[7pt] text-slate-300">المرجع العلمي</span>
          </div>
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[7.5pt] bg-slate-50/50">
            {definitions.map((def: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 p-2 rounded shadow-2xs space-y-1">
                <strong className="text-blue-950 font-bold block text-[8pt] border-b border-slate-100 pb-0.5">
                  {def.term}
                </strong>
                <p className="text-slate-700 leading-snug">{def.definition}</p>
                {def.clinicalSignificance && (
                  <div className="text-[6.5pt] text-emerald-800 bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-100">
                    <strong>الأهمية السريرية: </strong> {def.clinicalSignificance}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= 3. TECHNICAL SPECIFICATIONS & FORMULATIONS ================= */}
      {techSpecs.length > 0 && (
        <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
              <span>3. جدول المقارنة والمواصفات الفنية للتقنيات والمطهرات (Technical Specifications)</span>
            </div>
            <span className="text-[7pt] text-slate-300">التركيزات وأزمنة التلامس والكميات</span>
          </div>
          <div className="p-2 text-[7pt]">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-300 p-1.5 text-right w-1/4">التقنية ونوع الإجراء</th>
                  <th className="border border-slate-300 p-1.5 text-right">المادة والمستحضر الفعال</th>
                  <th className="border border-slate-300 p-1.5 text-center w-20">الحجم المطلوب</th>
                  <th className="border border-slate-300 p-1.5 text-center w-20">زمن التلامس</th>
                  <th className="border border-slate-300 p-1.5 text-right">دواعي الاستخدام الرئيسية والموانع</th>
                </tr>
              </thead>
              <tbody>
                {techSpecs.map((spec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="border border-slate-300 p-1.5 font-bold text-slate-950 align-top">
                      {spec.techniqueName}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-slate-800 align-top">
                      {spec.agentAndConcentration}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center font-mono font-bold text-blue-900 align-top">
                      {spec.requiredVolume || '—'}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center font-mono font-bold text-emerald-800 align-top">
                      {spec.contactTime}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-slate-700 align-top space-y-1">
                      <div>
                        <strong className="text-emerald-900">الدواعي: </strong>
                        {Array.isArray(spec.indications) ? spec.indications.join(' • ') : spec.indications}
                      </div>
                      {Array.isArray(spec.contraindicationsOrLimitations) && spec.contraindicationsOrLimitations.length > 0 && (
                        <div className="text-rose-900 bg-rose-50/70 p-1 rounded border border-rose-100">
                          <strong>الموانع / المحاذير: </strong>
                          {spec.contraindicationsOrLimitations.join(' • ')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= 4. WHO 5 MOMENTS & CLINICAL SCENARIOS ================= */}
      {fiveMoments.length > 0 && (
        <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>4. اللحظات الخمس لنظافة الأيدي والسيناريوهات الإكلينيكية (WHO 5 Moments)</span>
            </div>
            <span className="text-[7pt] text-slate-300">أداة الملاحظة والتقييم السريري</span>
          </div>
          <div className="p-2 grid grid-cols-1 md:grid-cols-5 gap-1.5 text-[7pt]">
            {fiveMoments.map((m: any, idx: number) => (
              <div key={idx} className="bg-blue-50/50 border border-blue-200 p-2 rounded space-y-1">
                <div className="flex items-center gap-1 border-b border-blue-200 pb-1">
                  <span className="w-4 h-4 rounded-full bg-blue-800 text-white font-mono font-bold text-[6.5pt] flex items-center justify-center shrink-0">
                    {m.momentNumber || idx + 1}
                  </span>
                  <strong className="text-blue-950 font-bold leading-tight text-[7pt]">
                    {m.momentName}
                  </strong>
                </div>
                <p className="text-slate-700 text-[6.5pt] leading-tight">
                  <strong>التوقيت: </strong>{m.timing}
                </p>
                {Array.isArray(m.clinicalExamples) && m.clinicalExamples.length > 0 && (
                  <div className="text-[6.5pt] text-slate-600 bg-white p-1 rounded border border-blue-100">
                    <strong>أمثلة: </strong>{m.clinicalExamples.join('، ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= 5. SKIN, GLOVE INTEGRITY & INFRASTRUCTURE ================= */}
      {(skinCare.gloveProtocols || infra.sinkSpecifications) && (
        <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-300" />
              <span>5. اشتراطات حماية الجلد، القفازات، والبنية التحتية ونقاط تقديم الرعاية</span>
            </div>
            <span className="text-[7pt] text-slate-300">Bare Below the Elbows & Point of Care</span>
          </div>
          <div className="p-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[7.5pt]">
            {/* Skin & Glove Protocols */}
            <div className="bg-slate-50 border border-slate-200 p-2 rounded space-y-1.5">
              <strong className="text-slate-950 font-bold block text-[8pt] border-b border-slate-200 pb-0.5 flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-rose-600" />
                ضوابط القفازات وخلو الساعدين (Bare Below the Elbows):
              </strong>
              <ul className="space-y-1 text-slate-700 text-[7pt]">
                {Array.isArray(skinCare.gloveProtocols) && skinCare.gloveProtocols.map((g: string, i: number) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-blue-700 font-bold">•</span>
                    <span className="leading-snug">{g}</span>
                  </li>
                ))}
                {Array.isArray(skinCare.jewelryAndNailRegulations) && skinCare.jewelryAndNailRegulations.map((j: string, i: number) => (
                  <li key={i} className="flex items-start gap-1 text-amber-900 font-semibold">
                    <span className="text-amber-700 font-bold">•</span>
                    <span className="leading-snug">{j}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Infrastructure & Sinks */}
            <div className="bg-slate-50 border border-slate-200 p-2 rounded space-y-1.5">
              <strong className="text-slate-950 font-bold block text-[8pt] border-b border-slate-200 pb-0.5 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-600" />
                اشتراطات الأحواض، الموزعات، وحظر خلط العبوات (Zero Top-Up):
              </strong>
              <ul className="space-y-1 text-slate-700 text-[7pt]">
                {Array.isArray(infra.sinkSpecifications) && infra.sinkSpecifications.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span className="leading-snug">{s}</span>
                  </li>
                ))}
                {Array.isArray(infra.dispenserAndConsumables) && infra.dispenserAndConsumables.map((d: string, i: number) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span className="leading-snug">{d}</span>
                  </li>
                ))}
                {Array.isArray(infra.maintenanceAndRefillRules) && infra.maintenanceAndRefillRules.map((m: string, i: number) => (
                  <li key={i} className="flex items-start gap-1 text-rose-900 font-semibold">
                    <span className="text-rose-700 font-bold">✕</span>
                    <span className="leading-snug">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ================= 6. ROLES & RESPONSIBILITIES ================= */}
      {roles.length > 0 && (
        <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
            <span>6. مصفوفة الأدوار والمسؤوليات الإكلينيكية والإدارية (Roles & Responsibilities)</span>
            <span className="text-[7pt] text-slate-300">المساءلة وتوزيع المهام</span>
          </div>
          <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-[7.5pt]">
            {roles.map((r: any, idx: number) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded">
                <strong className="text-slate-950 font-bold block mb-1 text-[8pt] pb-1 border-b border-slate-200">
                  {r.role}
                </strong>
                <ul className="space-y-1 text-slate-700">
                  {Array.isArray(r.responsibilities) && r.responsibilities.map((resp: string, rIdx: number) => (
                    <li key={rIdx} className="flex items-start gap-1">
                      <span className="text-blue-700 font-bold font-mono text-[7pt]">•</span>
                      <span className="leading-snug">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= 7. STEP-BY-STEP SOP PROTOCOL ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <span>7. خطوات وإجراءات العمل القياسية والتنفيذية (SOP Protocol)</span>
          <span className="text-[7pt] text-slate-300">مراحل التنفيذ الثلاثية الإلزامية ونقاط الأمان</span>
        </div>

        <div className="p-2 space-y-2 text-[7.5pt]">
          {/* Phase 1: Pre-procedure */}
          {Array.isArray(sop?.preProcedure) && sop.preProcedure.length > 0 && (
            <div className="border-r-3 border-amber-600 pr-2 bg-amber-50/30 p-1.5 rounded-l">
              <strong className="font-bold text-[8pt] text-amber-950 block mb-1">
                المرحلة الأولى: ما قبل الإجراء والتجهيز ونظافة الأيدي (Pre-Procedure Preparation):
              </strong>
              <div className="space-y-1">
                {sop.preProcedure.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold font-mono text-[6.5pt] flex items-center justify-center shrink-0">
                      {s.stepNumber || i + 1}
                    </span>
                    <div className="leading-tight">
                      <strong className="text-slate-900">{s.title}: </strong>
                      <span className="text-slate-700">{s.details}</span>
                      {s.keySafetyPoint && (
                        <span className="text-[6.5pt] text-amber-900 font-semibold mr-1 bg-amber-100/70 px-1 py-0.2 rounded">
                          [نقطة أمان: {s.keySafetyPoint}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 2: Execution */}
          {Array.isArray(sop?.execution) && sop.execution.length > 0 && (
            <div className="border-r-3 border-emerald-600 pr-2 bg-emerald-50/30 p-1.5 rounded-l">
              <strong className="font-bold text-[8pt] text-emerald-950 block mb-1">
                المرحلة الثانية: خطوات التنفيذ السريري والفرك الميكانيكي الست (Clinical Execution & Steps):
              </strong>
              <div className="space-y-1">
                {sop.execution.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 font-bold font-mono text-[6.5pt] flex items-center justify-center shrink-0">
                      {s.stepNumber || i + 1}
                    </span>
                    <div className="leading-tight">
                      <strong className="text-slate-900">{s.title}: </strong>
                      <span className="text-slate-700">{s.details}</span>
                      {s.keySafetyPoint && (
                        <span className="text-[6.5pt] text-emerald-900 font-semibold mr-1 bg-emerald-100/70 px-1 py-0.2 rounded">
                          [نقطة أمان: {s.keySafetyPoint}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 3: Post-procedure */}
          {Array.isArray(sop?.postProcedure) && sop.postProcedure.length > 0 && (
            <div className="border-r-3 border-blue-600 pr-2 bg-blue-50/30 p-1.5 rounded-l">
              <strong className="font-bold text-[8pt] text-blue-950 block mb-1">
                المرحلة الثالثة: ما بعد الإجراء والجفاف والتخلص الآمن والتوثيق (Post-Procedure & Safety):
              </strong>
              <div className="space-y-1">
                {sop.postProcedure.map((s: any, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-900 font-bold font-mono text-[6.5pt] flex items-center justify-center shrink-0">
                      {s.stepNumber || i + 1}
                    </span>
                    <div className="leading-tight">
                      <strong className="text-slate-900">{s.title}: </strong>
                      <span className="text-slate-700">{s.details}</span>
                      {s.keySafetyPoint && (
                        <span className="text-[6.5pt] text-blue-900 font-semibold mr-1 bg-blue-100/70 px-1 py-0.2 rounded">
                          [نقطة أمان: {s.keySafetyPoint}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Illustrated 6 Steps Quick Matrix with SVG Vector Art */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg mt-2">
            <div className="flex items-center justify-between mb-2">
              <strong className="text-[7.5pt] font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>المخطط الإيضاحي المصور لتقنيات وخطوات الفرك والتطهير الإكلينيكي (Illustrated Clinical Motions):</span>
              </strong>
              <span className="text-[6.5pt] font-mono text-blue-950 font-bold bg-blue-100/80 px-2 py-0.5 rounded">
                WHO Standard Technique
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[6.5pt]">
              {/* Step 1 Illustration */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
                <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M7 11V7a2 2 0 0 1 4 0v4" />
                    <path d="M11 11V6a2 2 0 0 1 4 0v5" />
                    <path d="M15 11V8a2 2 0 0 1 4 0v6a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3a2 2 0 0 1 4 0v2" />
                  </svg>
                </div>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-900 text-white font-bold text-[6pt] leading-none py-0.5">1</span>
                <strong className="block text-slate-950 font-bold leading-tight">باطن بالباطن</strong>
                <span className="text-slate-500 text-[5.5pt] block">Palm to Palm</span>
              </div>

              {/* Step 2 Illustration */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
                <div className="w-8 h-8 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
                    <path d="M14 10V4a2 2 0 0 0-4 0v7" />
                    <path d="M10 10.5V6a2 2 0 0 0-4 0v8a5 5 0 0 0 5 5h3a6 6 0 0 0 6-6v-4a2 2 0 0 0-4 0v2" />
                  </svg>
                </div>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-900 text-white font-bold text-[6pt] leading-none py-0.5">2</span>
                <strong className="block text-slate-950 font-bold leading-tight">ظهر اليد متداخلاً</strong>
                <span className="text-slate-500 text-[5.5pt] block">Dorsum Interlaced</span>
              </div>

              {/* Step 3 Illustration */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
                <div className="w-8 h-8 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M8 13V5a2 2 0 0 1 4 0v6" />
                    <path d="M12 11V4a2 2 0 0 1 4 0v7" />
                    <path d="M16 12V7a2 2 0 0 1 4 0v6a6 6 0 0 1-6 6H9a5 5 0 0 1-5-5V9a2 2 0 0 1 4 0v5" />
                  </svg>
                </div>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-900 text-white font-bold text-[6pt] leading-none py-0.5">3</span>
                <strong className="block text-slate-950 font-bold leading-tight">تشابك الأصابع</strong>
                <span className="text-slate-500 text-[5.5pt] block">Fingers Interlaced</span>
              </div>

              {/* Step 4 Illustration */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
                <div className="w-8 h-8 mx-auto rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="6" width="16" height="12" rx="3" />
                    <path d="M9 10v4" />
                    <path d="M15 10v4" />
                  </svg>
                </div>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-900 text-white font-bold text-[6pt] leading-none py-0.5">4</span>
                <strong className="block text-slate-950 font-bold leading-tight">ظهر الأصابع بالقبضة</strong>
                <span className="text-slate-500 text-[5.5pt] block">Back of Fingers</span>
              </div>

              {/* Step 5 Illustration */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
                    <path d="M16 14a6 6 0 0 1-8 0" />
                  </svg>
                </div>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-900 text-white font-bold text-[6pt] leading-none py-0.5">5</span>
                <strong className="block text-slate-950 font-bold leading-tight">دلك الإبهامين دائرياً</strong>
                <span className="text-slate-500 text-[5.5pt] block">Rotational Thumbs</span>
              </div>

              {/* Step 6 Illustration */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1 hover:border-blue-300 transition">
                <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m10 15 5-3-5-3v6Z" />
                  </svg>
                </div>
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-900 text-white font-bold text-[6pt] leading-none py-0.5">6</span>
                <strong className="block text-slate-950 font-bold leading-tight">فرك أطراف الأصابع</strong>
                <span className="text-slate-500 text-[5.5pt] block">Fingertips & Nails</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page break marker for multipage printed reports */}
      <div className="page-break" />

      {/* ================= 8. CRITICAL DO's & DONT's MATRIX + PITFALLS COMPARISON ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>8. مصفوفة المحظورات الصارمة ومقارنة الأخطاء الشائعة بالصواب (Pitfalls vs Golden Standard)</span>
          </div>
          <span className="text-[7pt] text-amber-300 font-bold">الخطوط الحمراء</span>
        </div>

        <div className="p-2.5 space-y-2 text-[7.5pt]">
          {/* Quick Pitfalls vs Golden Standard Matrix */}
          <div className="border border-slate-300 rounded-md overflow-hidden">
            <table className="w-full border-collapse text-[7pt]">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-1.5 text-right w-1/2 text-rose-300">❌ الخطأ الإكلينيكي الشائع المحظور (Pitfall)</th>
                  <th className="p-1.5 text-right w-1/2 text-emerald-300">✅ الصواب والمعيار الذهبي الإلزامي (Standard)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-rose-50/30">
                  <td className="p-1.5 text-rose-950 font-medium">تجفيف اليدين بالمناشف أو التلويح بعد الفرك الكحولي لتسريعه.</td>
                  <td className="p-1.5 text-emerald-950 font-bold bg-emerald-50/40">ترك الكحول يجف ذاتياً بالهواء (20-30 ثانية) حتى اكتمال التبخر والقتل الميكروبي.</td>
                </tr>
                <tr className="bg-rose-50/30">
                  <td className="p-1.5 text-rose-950 font-medium">استخدام الكحول عند اتساخ اليدين بالدم أو الإفرازات أو مع جراثيم C. diff.</td>
                  <td className="p-1.5 text-emerald-950 font-bold bg-emerald-50/40">الغسيل الإجباري بالماء الجاري والصابون (40-60 ثانية) لإزالة الأبواغ والاتساخ العضوي.</td>
                </tr>
                <tr className="bg-rose-50/30">
                  <td className="p-1.5 text-rose-950 font-medium">تزويد أو سكب محلول جديد فوق المتبقي في العبوة (Top-up).</td>
                  <td className="p-1.5 text-emerald-950 font-bold bg-emerald-50/40">تفريغ العبوة بالكامل، ثم غسلها وتطهيرها وتجفيفها قبل الملء، أو استبدالها بعبوة جاهزة.</td>
                </tr>
                <tr className="bg-rose-50/30">
                  <td className="p-1.5 text-rose-950 font-medium">ارتداء القفازات كبديل عن تطهير اليدين أو الانتقال بها بين المرضى.</td>
                  <td className="p-1.5 text-emerald-950 font-bold bg-emerald-50/40">القفازات لا تغني عن نظافة الأيدي مطلقاً؛ تطهير اليدين قبل الارتداء وفور النزع.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* DO's */}
            <div className="border border-emerald-300 p-2 rounded bg-emerald-50/40">
              <strong className="text-emerald-950 font-bold mb-1 flex items-center gap-1 text-[8pt]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                الممارسات الإلزامية وأفضل التطبيقات (DO's):
              </strong>
              <ul className="space-y-1 text-emerald-950">
                {dosList.length > 0 ? (
                  dosList.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold font-mono">✓</span>
                      <span className="leading-snug">{d}</span>
                    </li>
                  ))
                ) : (
                  <li>الالتزام الكامل باحتياطات مكافحة العدوى القياسية ونظافة الأيدي.</li>
                )}
              </ul>
            </div>

            {/* DON'Ts */}
            <div className="border border-rose-300 p-2 rounded bg-rose-50/40">
              <strong className="text-rose-950 font-bold mb-1 flex items-center gap-1 text-[8pt]">
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                المحظورات والأخطاء الحرجة الممنوعة (DON'Ts):
              </strong>
              <ul className="space-y-1 text-rose-950">
                {dontsList.length > 0 ? (
                  dontsList.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-700 font-bold font-mono">✕</span>
                      <span className="leading-snug">{d}</span>
                    </li>
                  ))
                ) : (
                  <li>يحظر مخالفة إجراءات العزل أو إعادة استخدام المستلزمات وحيدة الاستخدام.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Critical Control Points */}
          {criticalPoints.length > 0 && (
            <div className="bg-amber-50/80 p-2 rounded border border-amber-300 text-[7pt]">
              <strong className="text-amber-950 font-bold block mb-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                نقاط التوقف والمراقبة الحرجة (Critical Control Points - CCPs):
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-amber-900">
                {criticalPoints.map((ccp, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                    <span>{ccp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Incident Protocol */}
          {emergencyProtocol && (
            <div className="bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 text-[7pt] leading-relaxed">
              <strong className="text-rose-400 font-bold">بروتوكول الطوارئ والاستجابة الفورية عند حدوث خلل أو تعرض مهني: </strong>
              <span className="text-slate-200">{emergencyProtocol}</span>
            </div>
          )}
        </div>
      </section>

      {/* ================= 9. RAPID Q&A REVIEW BANK (سؤال وجواب المراجعة النهائية) ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-slate-900 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-black text-[9pt]">❓</span>
            <span>9. بنك أسئلة وأجوبة المراجعة السريعة للاختبارات والتفتيش (Rapid Q&A Review Bank)</span>
          </div>
          <span className="text-[7pt] text-amber-300 font-bold">سؤال وجواب للمراجعة الفورية</span>
        </div>

        <div className="p-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[7pt] bg-slate-50/40">
          <div className="bg-white border border-slate-200 p-2 rounded-lg space-y-1 shadow-2xs">
            <strong className="text-blue-950 font-bold block text-[7.5pt] flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[6pt] flex items-center justify-center font-bold">س1</span>
              متى يكون غسيل الأيدي بالماء والصابون إجبارياً بدلاً من الفرك الكحولي؟
            </strong>
            <p className="text-slate-700 leading-snug bg-slate-50 p-1.5 rounded border border-slate-100">
              <strong className="text-emerald-800">الجواب: </strong>
              عند وجود اتساخ مرئي بالدم أو سوائل الجسم، أو بعد استخدام المرحاض، أو بعد التعامل مع حالات العدوى المتبوغة مثل <em>Clostridioides difficile</em> والروتافيروس لأن الكحول غير فعال ضد الأبواغ.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded-lg space-y-1 shadow-2xs">
            <strong className="text-blue-950 font-bold block text-[7.5pt] flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[6pt] flex items-center justify-center font-bold">س2</span>
              ما هو الحجم المناسب وزمن الفرك الكحولي الفعال؟
            </strong>
            <p className="text-slate-700 leading-snug bg-slate-50 p-1.5 rounded border border-slate-100">
              <strong className="text-emerald-800">الجواب: </strong>
              استخدام 3 إلى 5 مل من المستحضر الكحولي (ملء راحة اليد المقعرة)، والفرك المستمر لمدة <strong>20 إلى 30 ثانية</strong> وتغطية كافة أسطح اليدين حتى الجفاف التام بالهواء.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded-lg space-y-1 shadow-2xs">
            <strong className="text-blue-950 font-bold block text-[7.5pt] flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[6pt] flex items-center justify-center font-bold">س3</span>
              ما هي سياسة تفريغ وتعبئة الموزعات (Zero Top-up Policy)؟
            </strong>
            <p className="text-slate-700 leading-snug bg-slate-50 p-1.5 rounded border border-slate-100">
              <strong className="text-emerald-800">الجواب: </strong>
              يُحظر تماماً إضافة أو صب مطهر فوق المتبقي بالعبوة. يجب استهلاك العبوة حتى النهاية، ثم غسلها وتطهيرها وتجفيفها بالكامل قبل إعادة التعبئة، ويفضل استخدام العبوات وحيدة الاستخدام ذات الخراطيش المقفلة.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-2 rounded-lg space-y-1 shadow-2xs">
            <strong className="text-blue-950 font-bold block text-[7.5pt] flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[6pt] flex items-center justify-center font-bold">س4</span>
              هل يغني ارتداء القفازات الطبية عن إجراء نظافة الأيدي؟
            </strong>
            <p className="text-slate-700 leading-snug bg-slate-50 p-1.5 rounded border border-slate-100">
              <strong className="text-emerald-800">الجواب: </strong>
              قطعياً لا. يجب تطهير الأيدي فوراً قبل ارتداء القفازات، وفور نزعها، مع تغيير القفازات فوراً بين كل مريض وآخر وعدم غسل القفازات أو فركها بالكحول.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 10. AUDIT CHECKLIST FOR INSPECTIONS ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-teal-300" />
            <span>10. قائمة المراجعة والتدقيق الميداني للاعتماد (Audit Checklist & Survey)</span>
          </div>
          <span className="text-[7pt] text-slate-300">أداة المقيّم والمفتش الصحي</span>
        </div>

        <div className="p-2.5 text-[7.5pt]">
          <table className="w-full border-collapse border border-slate-300 text-[7pt]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold">
                <th className="border border-slate-300 p-1 text-center w-6">م</th>
                <th className="border border-slate-300 p-1 text-right">عنصر التدقيق والملاحظة</th>
                <th className="border border-slate-300 p-1 text-right w-28">المعيار المرجعي</th>
                <th className="border border-slate-300 p-1 text-right">دليل الإثبات والتوثيق المطلوب</th>
                <th className="border border-slate-300 p-1 text-center w-14">الدورية</th>
                <th className="border border-slate-300 p-1 text-center w-14">الامتثال</th>
              </tr>
            </thead>
            <tbody>
              {auditItems.length > 0 ? (
                auditItems.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1 text-center font-bold font-mono">{i + 1}</td>
                    <td className="border border-slate-300 p-1 font-semibold text-slate-900">{c.checkpoint}</td>
                    <td className="border border-slate-300 p-1 text-slate-600 font-mono text-[6.5pt]">{c.standardReference}</td>
                    <td className="border border-slate-300 p-1 text-slate-700">{c.evidenceRequired}</td>
                    <td className="border border-slate-300 p-1 text-center font-medium">{c.frequency}</td>
                    <td className="border border-slate-300 p-1 text-center">
                      <span className="inline-block w-4 h-3.5 border border-slate-400 rounded-2xs bg-white" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-2 text-slate-500">
                    يتم التدقيق اليومي والشهري على الالتزام بنظافة الأيدي وتطبيق الاحتياطات القياسية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= 11. KEY PERFORMANCE INDICATORS (KPIs) ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-300" />
            <span>11. مؤشرات الأداء الرئيسية المقاسة والمستهدفات (Key Performance Indicators - KPIs)</span>
          </div>
          <span className="text-[7pt] text-slate-300">معدلات الجودة ومستهدفات GAHAR</span>
        </div>

        <div className="p-2.5 text-[7.5pt]">
          <table className="w-full border-collapse border border-slate-300 text-[7pt]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold">
                <th className="border border-slate-300 p-1 text-right">المؤشر المقاس</th>
                <th className="border border-slate-300 p-1 text-right">طريقة الحساب / المعادلة الإحصائية</th>
                <th className="border border-slate-300 p-1 text-center w-20">المستهدف</th>
                <th className="border border-slate-300 p-1 text-center w-14">الدورية</th>
                <th className="border border-slate-300 p-1 text-right w-24">المسؤول</th>
              </tr>
            </thead>
            <tbody>
              {kpiItems.length > 0 ? (
                kpiItems.map((k: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1 font-bold text-slate-900">{k.name}</td>
                    <td className="border border-slate-300 p-1 font-mono text-[6.5pt] text-slate-700">{k.formula}</td>
                    <td className="border border-slate-300 p-1 text-center font-bold text-emerald-800 font-mono">{k.target}</td>
                    <td className="border border-slate-300 p-1 text-center">{k.frequency}</td>
                    <td className="border border-slate-300 p-1">{k.responsiblePerson || 'فريق مكافحة العدوى'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-2 text-slate-500">
                    مؤشر الامتثال لنظافة الأيدي ومعدلات العدوى المكتسبة (HAIs).
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {recommendations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-[7pt]">
              <strong className="text-blue-950 font-bold block mb-1">توصيات التحسين وتجاوز الفجوات (Gap Analysis & Recommendations):</strong>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-slate-700">
                {recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-blue-700 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ================= 11. OFFICIAL SIGN-OFF AND APPROVALS ================= */}
      <footer className="avoid-break pt-3 border-t-2 border-slate-900 grid grid-cols-3 gap-3 text-[7pt] text-center">
        <div className="space-y-2 border border-slate-200 p-2 rounded bg-slate-50/50">
          <p className="font-bold text-slate-900">إعداد: منسق مكافحة العدوى والسلامة</p>
          <div className="h-4 border-b border-dashed border-slate-400"></div>
          <p className="text-slate-500 font-mono text-[6.5pt]">التاريخ: ____ / ____ / 2026م</p>
        </div>

        <div className="space-y-2 border border-slate-200 p-2 rounded bg-slate-50/50">
          <p className="font-bold text-slate-900">مراجعة: مدير إدارة الجودة والاعتماد</p>
          <div className="h-4 border-b border-dashed border-slate-400"></div>
          <p className="text-slate-500 font-mono text-[6.5pt]">التاريخ: ____ / ____ / 2026م</p>
        </div>

        <div className="space-y-2 border border-slate-200 p-2 rounded bg-slate-50/50">
          <p className="font-bold text-slate-900">اعتماد: المدير الطبي / مدير عام المنشأة</p>
          <div className="h-4 border-b border-dashed border-slate-400"></div>
          <p className="text-slate-500 font-mono text-[6.5pt]">الختم والاعتماد الرسمي</p>
        </div>
      </footer>
    </div>
  );
};
