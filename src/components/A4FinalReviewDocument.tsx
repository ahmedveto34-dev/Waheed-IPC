import React from 'react';
import { PolicyAnalysisResult } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  CheckSquare, 
  Award, 
  Building2, 
  Calendar, 
  Clock, 
  Flame, 
  Sparkles,
  Printer
} from 'lucide-react';

interface A4FinalReviewDocumentProps {
  data: PolicyAnalysisResult;
  isPrintOnly?: boolean;
}

export const A4FinalReviewDocument: React.FC<A4FinalReviewDocumentProps> = ({ data, isPrintOnly = false }) => {
  const card = data.policyCard || ({} as any);
  const purpose = data.purposeAndScope || ({} as any);
  const roles = Array.isArray(data.rolesAndResponsibilities) ? data.rolesAndResponsibilities : [];
  const sop = data.sopPhases || ({} as any);
  const safety = data.safetyWarningsAndCriticalSteps || ({} as any);
  const kpisData = data.complianceAndKPIs || ({} as any);

  // Extract safe arrays
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
    : 'في حال حدوث وخز إبرة أو تعرض مهني: غسل الموضع فوراً بالماء والصابون دون عصر، إبلاغ مشرف السلامة ومكافحة العدوى فوراً وبدء الإجراءات الوقائية.';

  const auditItems = Array.isArray(kpisData?.auditChecklist) ? kpisData.auditChecklist : [];
  const kpiItems = Array.isArray(kpisData?.kpis) ? kpisData.kpis : [];

  return (
    <div 
      className={`${isPrintOnly ? 'print-only hidden' : 'a4-paper-sheet'} text-slate-900 font-sans leading-relaxed text-right`} 
      dir="rtl"
    >
      {/* ================= HEADER ================= */}
      <header className="border-b-2 border-slate-900 pb-3 mb-4 flex items-start justify-between gap-4 avoid-break">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-base font-mono border border-slate-700 shrink-0">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-black text-slate-950 tracking-tight leading-tight">
                  وثيقة المراجعة النهائية والملخص التنفيذي للسياسة (Final Review Brief)
                </h1>
                <span className="px-2 py-0.5 rounded bg-blue-900 text-white text-[7pt] font-bold font-mono">
                  ISO / GAHAR / CBAHI
                </span>
              </div>
              <p className="text-[7.5pt] text-slate-600 font-semibold">
                منظومة الرعاية الصحية ومكافحة العدوى والسلامة الإكلينيكية وضمان الجودة والاعتماد
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[7pt] font-semibold text-emerald-900 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>مطابقة للمعايير الإلزامية:</span>
            <span className="font-bold">معايير جهار (GAHAR 2025)</span>
            <span>•</span>
            <span className="font-bold">الدليل القومي لمكافحة العدوى 2020</span>
            <span>•</span>
            <span className="font-bold">CBAHI</span>
            <span>•</span>
            <span className="font-bold">JCI</span>
            <span>•</span>
            <span className="font-bold">CDC Guidelines</span>
          </div>
        </div>

        {/* Policy Quick Meta Box */}
        <div className="text-left font-mono text-[7.5pt] border border-slate-300 p-2 rounded bg-slate-50 space-y-0.5 min-w-[175px] shrink-0">
          <div>كود الوثيقة: <strong className="text-blue-950 font-bold">{card.policyCode || 'IPC-POL-01'}</strong></div>
          <div>تاريخ التفعيل: <strong>{card.effectiveDate || '2025/05/15'}</strong></div>
          <div>دورة المراجعة: <strong>{card.reviewCycle || 'سنوياً'}</strong></div>
          <div className="text-emerald-700 font-bold">الحالة: معتمدة للتطبيق الإلزامي</div>
        </div>
      </header>

      {/* ================= 1. EXECUTIVE SUMMARY & GOLDEN RULES ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
        <div className="bg-slate-900 text-white px-3 py-1.5 font-bold text-[8.5pt] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1. الملخص التنفيذي المركز والنقاط الذهبية للمراجعة السريعة (Executive Review)</span>
          </div>
          <span className="text-[7pt] text-slate-300 font-normal">جاهز للتفتيش الميداني والتقييم</span>
        </div>
        
        <div className="p-3 space-y-2 text-[8pt]">
          <p className="leading-relaxed text-slate-800 text-justify bg-slate-50 p-2.5 rounded border border-slate-200">
            {data.executiveSummarySnippet || 'تم تلخيص وتدقيق محاور هذه السياسة لتتوافق مع معايير جهار 2025 والدليل القومي المصري لمكافحة العدوى، مع التركيز على السلامة الإكلينيكية وحماية متلقي الخدمة ومقدميها.'}
          </p>

          {/* Golden Rules Callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[7.5pt]">
            <div className="bg-blue-50/70 p-2 rounded border border-blue-200 space-y-0.5">
              <strong className="text-blue-950 font-bold block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-700" />
                الهدف الاستراتيجي الأساسي:
              </strong>
              <p className="text-blue-900 leading-snug">{purpose.mainObjective || 'الحد من انتقال العدوى المكتسبة داخل المنشأة وضمان بيئة علاجية آمنة.'}</p>
            </div>

            <div className="bg-amber-50/70 p-2 rounded border border-amber-200 space-y-0.5">
              <strong className="text-amber-950 font-bold block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                المبرر الإكلينيكي الحرج:
              </strong>
              <p className="text-amber-900 leading-snug">{purpose.clinicalRationale || 'خفض معدلات العدوى المرتبطة بالقساطر والتداخلات الجراحية والميكروبات المقاومة.'}</p>
            </div>

            <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200 space-y-0.5">
              <strong className="text-emerald-950 font-bold block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                النطاق والفئات الملزمة:
              </strong>
              <p className="text-emerald-900 leading-snug">
                {Array.isArray(purpose.scope) && purpose.scope.length > 0 ? purpose.scope.join('، ') : 'كافة الكوادر الطبية والتمريضية'}
              </p>
              {Array.isArray(purpose.exclusions) && purpose.exclusions.length > 0 && (
                <div className="text-[6.5pt] text-rose-800 pt-0.5 border-t border-emerald-200/60 mt-1">
                  <strong>الاستثناءات: </strong> {purpose.exclusions.join('، ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. POLICY FACTS & STANDARDS TABLE ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <span>2. بطاقة تعريف السياسة والاعتماد المرجعي (Policy Card & Standards)</span>
          <span className="text-[7pt] text-slate-300 font-mono">Domain: {card.domain || 'Infection Prevention'}</span>
        </div>
        <table className="w-full border-collapse text-[7.5pt]">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-100 w-1/4 border-l border-slate-200">اسم السياسة المعتمد:</td>
              <td className="p-1.5 font-bold text-slate-950">
                {card.titleArabic} {card.titleEnglish ? `— (${card.titleEnglish})` : ''}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-100 border-l border-slate-200">الأقسام المعنية بالتطبيق:</td>
              <td className="p-1.5">{Array.isArray(card.departments) ? card.departments.join('، ') : 'جميع الأقسام الإكلينيكية والتمريض'}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold bg-slate-100 border-l border-slate-200">المعايير المرجعية ذات الصلة:</td>
              <td className="p-1.5">
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(card.alignedStandards) && card.alignedStandards.length > 0 ? (
                    card.alignedStandards.map((s: any, idx: number) => (
                      <span key={idx} className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-[7pt]">
                        <strong className="text-slate-900">{s.standardBody}</strong> {s.clauseNumber ? `[${s.clauseNumber}]` : ''}: {s.description}
                      </span>
                    ))
                  ) : (
                    <span>معايير جهار 2025 والدليل القومي لمكافحة العدوى 2020</span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ================= 2.5 ROLES & RESPONSIBILITIES ================= */}
      {roles.length > 0 && (
        <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
            <span>مصفوفة الأدوار والمسؤوليات الإكلينيكية والتنفيذية (Roles & Responsibilities)</span>
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

      {/* ================= 3. STEP-BY-STEP SOP TABLE ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <span>3. خطوات وإجراءات العمل القياسية والتنفيذية (SOP Protocol)</span>
          <span className="text-[7pt] text-slate-300">مراحل التنفيذ الثلاثية الإلزامية</span>
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
                      {s.assignedTo && <span className="text-[6.5pt] text-slate-500 font-mono mr-1">[{s.assignedTo}]</span>}
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
                المرحلة الثانية: التنفيذ الفعلي والأسلوب المانع للتلوث (Direct Clinical Execution):
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
                      {s.assignedTo && <span className="text-[6.5pt] text-slate-500 font-mono mr-1">[{s.assignedTo}]</span>}
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
                المرحلة الثالثة: ما بعد الإجراء والتطهير والتخلص الآمن والتوثيق (Post-Procedure & Disposal):
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
                      {s.assignedTo && <span className="text-[6.5pt] text-slate-500 font-mono mr-1">[{s.assignedTo}]</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 4. CRITICAL DO's & DONT's MATRIX ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <span>4. مصفوفة الممارسات الإلزامية والمحظورات الصارمة (DOs & DON'Ts Matrix)</span>
          <span className="text-[7pt] text-slate-300">نقاط التقييم والملاحظة المباشرة</span>
        </div>

        <div className="p-2.5 space-y-2 text-[7.5pt]">
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

          {/* Critical Control Points & Emergency Response */}
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

      {/* Page break marker for multipage printed reports */}
      <div className="page-break" />

      {/* ================= 5. AUDIT CHECKLIST FOR INSPECTIONS ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <span>5. قائمة المراجعة والتدقيق الميداني للاعتماد (Audit Checklist & GAHAR Survey)</span>
          <span className="text-[7pt] text-slate-300">أداة المقيّم والمفتش الصحي</span>
        </div>

        <div className="p-2.5 text-[7.5pt]">
          <table className="w-full border-collapse border border-slate-300 text-[7pt]">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="border border-slate-300 p-1 text-center w-6">م</th>
                <th className="border border-slate-300 p-1 text-right">عنصر التدقيق والملاحظة</th>
                <th className="border border-slate-300 p-1 text-right w-24">المعيار المرجعي</th>
                <th className="border border-slate-300 p-1 text-right">دليل الإثبات والتوثيق المطلوب</th>
                <th className="border border-slate-300 p-1 text-center w-12">الدورية</th>
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

      {/* ================= 6. KEY PERFORMANCE INDICATORS (KPIs) ================= */}
      <section className="avoid-break mb-3.5 border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1 font-bold text-[8pt] flex items-center justify-between">
          <span>6. مؤشرات الأداء الرئيسية المقاسة (Key Performance Indicators - KPIs)</span>
          <span className="text-[7pt] text-slate-300">معدلات الجودة والامتثال</span>
        </div>

        <div className="p-2.5 text-[7.5pt]">
          <table className="w-full border-collapse border border-slate-300 text-[7pt]">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="border border-slate-300 p-1 text-right">المؤشر المقاس</th>
                <th className="border border-slate-300 p-1 text-right">طريقة الحساب / المعادلة الإحصائية</th>
                <th className="border border-slate-300 p-1 text-center w-16">المستهدف</th>
                <th className="border border-slate-300 p-1 text-center w-12">الدورية</th>
                <th className="border border-slate-300 p-1 text-right w-20">المسؤول</th>
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
        </div>
      </section>

      {/* ================= 7. OFFICIAL SIGN-OFF AND APPROVALS ================= */}
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
