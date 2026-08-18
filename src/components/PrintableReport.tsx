import React from 'react';
import { PolicyAnalysisResult } from '../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, CheckSquare, Award } from 'lucide-react';

interface PrintableReportProps {
  data: PolicyAnalysisResult;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ data }) => {
  return (
    <div id="printable-a4-document" className="print-only hidden bg-white text-slate-900 font-sans w-full max-w-[210mm] mx-auto text-[10pt] leading-normal">
      {/* ================= Header (Page 1) ================= */}
      <header className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-sm font-mono border border-slate-700">
              W
            </div>
            <div>
              <h1 className="text-base font-black text-slate-950 leading-tight font-mono">
                Waheed IPC — منظومة الرعاية الصحية ومكافحة العدوى
              </h1>
              <p className="text-[8pt] text-slate-700 font-semibold">
                إدارة مكافحة العدوى والسلامة والصحة المهنية وضمان الجودة والاعتماد
              </p>
            </div>
          </div>
          <p className="text-[7.5pt] text-emerald-800 font-bold">
            وثيقة معتمدة ومطابقة لـ: معايير جهار (GAHAR 2025) • الدليل القومي لمكافحة العدوى 2020 • CBAHI • JCI • CDC
          </p>
        </div>

        <div className="text-left font-mono text-[8pt] border border-slate-300 p-2 rounded bg-slate-50 space-y-0.5 min-w-[170px]">
          <div>كود الوثيقة: <strong>{data.policyCard.policyCode || 'IPC-SOP-01'}</strong></div>
          <div>تاريخ التفعيل: {data.policyCard.effectiveDate || '2025/05/15'}</div>
          <div>دورة المراجعة: {data.policyCard.reviewCycle || 'كل 3 سنوات'}</div>
          <div className="text-emerald-700 font-bold">الحالة: معتمدة للتطبيق الإلزامي</div>
        </div>
      </header>

      {/* ================= Executive Summary Box ================= */}
      <section className="avoid-break mb-4 p-3 bg-slate-50 border-r-4 border-slate-800 border-t border-b border-l border-slate-200 rounded">
        <h2 className="font-bold text-[10.5pt] text-slate-900 mb-1 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-800" />
          الملخص التنفيذي والإجرائي للسياسة:
        </h2>
        <p className="text-[8.5pt] leading-relaxed text-slate-800 text-justify">
          {data.executiveSummarySnippet}
        </p>
      </section>

      {/* ================= 1. Policy Card Section ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt] flex items-center justify-between">
          <span>1. بطاقة تعريف السياسة والاعتماد المرجعي (Policy Card)</span>
          <span className="text-[7.5pt] text-slate-200 font-normal">Standard: {data.policyCard.domain}</span>
        </div>
        <table className="w-full border-collapse text-[8pt]">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-100 w-1/4 border-l border-slate-200">اسم السياسة:</td>
              <td className="p-1.5 font-bold text-slate-900">{data.policyCard.titleArabic} ({data.policyCard.titleEnglish})</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-100 border-l border-slate-200">المجال الإكلينيكي / التصنيف:</td>
              <td className="p-1.5">{data.policyCard.domain}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-1.5 font-bold bg-slate-100 border-l border-slate-200">الأقسام المطبقة والمعنية:</td>
              <td className="p-1.5">{data.policyCard.departments.join('، ')}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold bg-slate-100 border-l border-slate-200">المعايير المرجعية ذات الصلة:</td>
              <td className="p-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {data.policyCard.alignedStandards.map((s, idx) => (
                    <span key={idx} className="inline-block bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-[7.5pt]">
                      <strong>{s.standardBody}</strong> {s.clauseNumber ? `(${s.clauseNumber})` : ''}: {s.description}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ================= 2. Purpose and Scope ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt]">
          2. الهدف ونطاق التطبيق (Purpose & Scope)
        </div>
        <div className="p-3 text-[8pt] space-y-2">
          <div>
            <strong className="text-slate-900 block font-bold">الهدف الاستراتيجي والمبرر الإكلينيكي:</strong>
            <p className="text-slate-700 leading-relaxed">{data.purposeAndScope.mainObjective} — {data.purposeAndScope.clinicalRationale}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <strong className="text-slate-900 block font-bold">الفئات المستهدفة والنطاق:</strong>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                {data.purposeAndScope.scope.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-rose-900 block font-bold">الاستثناءات والحدود الصارمة:</strong>
              <ul className="list-disc list-inside text-rose-800 space-y-0.5">
                {data.purposeAndScope.exclusions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. Roles and Responsibilities ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt]">
          3. مصفوفة المسؤوليات والأدوار (Roles & Responsibilities)
        </div>
        <div className="p-2 grid grid-cols-3 gap-2 text-[7.5pt]">
          {data.rolesAndResponsibilities.map((r, idx) => (
            <div key={idx} className="border border-slate-200 p-2 rounded bg-slate-50/50">
              <strong className="block font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1">
                {r.role}
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                {r.responsibilities.map((resp, rIdx) => (
                  <li key={rIdx}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="page-break" />

      {/* ================= 4. Standard Operating Procedures (SOP) ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt] flex items-center justify-between">
          <span>4. خطوات وإجراءات العمل القياسية والتنفيذية (SOPs)</span>
          <span className="text-[7.5pt] text-slate-200">تسلسل تنفيذي ثلاثي المراحل</span>
        </div>
        
        <div className="p-3 text-[8pt] space-y-3">
          {/* Phase 1: Pre-procedure */}
          <div className="border-r-2 border-amber-600 pr-2">
            <h4 className="font-bold text-[8.5pt] text-amber-950 mb-1">
              المرحلة الأولى: ما قبل الإجراء والتجهيز (Pre-Procedure Preparation)
            </h4>
            <div className="space-y-1">
              {data.sopPhases.preProcedure.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0">{s.stepNumber}. {s.title}:</span>
                  <span className="text-slate-700">{s.details}</span>
                  {s.assignedTo && <span className="text-[7pt] text-slate-500 font-mono">[{s.assignedTo}]</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2: Execution */}
          <div className="border-r-2 border-emerald-600 pr-2">
            <h4 className="font-bold text-[8.5pt] text-emerald-950 mb-1">
              المرحلة الثانية: التنفيذ المباشر والأسلوب المانع للتلوث (Direct Execution & Asepsis)
            </h4>
            <div className="space-y-1">
              {data.sopPhases.execution.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0">{s.stepNumber}. {s.title}:</span>
                  <span className="text-slate-700">{s.details}</span>
                  {s.assignedTo && <span className="text-[7pt] text-slate-500 font-mono">[{s.assignedTo}]</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3: Post-procedure */}
          <div className="border-r-2 border-blue-600 pr-2">
            <h4 className="font-bold text-[8.5pt] text-blue-950 mb-1">
              المرحلة الثالثة: ما بعد الإجراء والتطهير والتوثيق (Post-Procedure & Waste Management)
            </h4>
            <div className="space-y-1">
              {data.sopPhases.postProcedure.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0">{s.stepNumber}. {s.title}:</span>
                  <span className="text-slate-700">{s.details}</span>
                  {s.assignedTo && <span className="text-[7pt] text-slate-500 font-mono">[{s.assignedTo}]</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. Critical Control Points & DOs / DONTs ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt]">
          5. الإرشادات الحرجة ونقاط التحكم ومصفوفة الممارسات (Critical Points & Matrix)
        </div>
        <div className="p-3 text-[8pt] space-y-2.5">
          {/* Critical Control Points */}
          {Array.isArray(data.safetyWarningsAndCriticalSteps?.criticalControlPoints) && data.safetyWarningsAndCriticalSteps.criticalControlPoints.length > 0 && (
            <div className="bg-amber-50/60 p-2 rounded border border-amber-200">
              <strong className="text-amber-950 font-bold block mb-1">نقاط التحكم والمراقبة الحرجة (Critical Control Points - CCPs):</strong>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900 text-[7.5pt]">
                {data.safetyWarningsAndCriticalSteps.criticalControlPoints.map((ccp: any, i: number) => (
                  <li key={i}>{typeof ccp === 'string' ? ccp : ccp?.text || JSON.stringify(ccp)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* DO's & DON'Ts Grid */}
          <div className="grid grid-cols-2 gap-2 text-[7.5pt]">
            <div className="border border-emerald-300 p-2 rounded bg-emerald-50/40">
              <strong className="text-emerald-900 font-bold mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                الممارسات الإلزامية (DO's):
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-950">
                {Array.isArray(data.safetyWarningsAndCriticalSteps?.dos) ? (
                  data.safetyWarningsAndCriticalSteps.dos.map((d: any, i: number) => (
                    <li key={i}>{typeof d === 'string' ? d : d?.instruction || d?.text || JSON.stringify(d)}</li>
                  ))
                ) : Array.isArray((data.safetyWarningsAndCriticalSteps as any)?.dosAndDonts) ? (
                  (data.safetyWarningsAndCriticalSteps as any).dosAndDonts
                    .filter((item: any) => item?.type === 'DO' || (typeof item === 'string' && !item.toLowerCase().startsWith("don't")))
                    .map((d: any, i: number) => (
                      <li key={i}>{typeof d === 'string' ? d : d?.instruction || d?.text || JSON.stringify(d)}</li>
                    ))
                ) : (
                  <li>الالتزام بالاحتياطات القياسية المعتمدة.</li>
                )}
              </ul>
            </div>
            <div className="border border-rose-300 p-2 rounded bg-rose-50/40">
              <strong className="text-rose-900 font-bold mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-600" />
                المحظورات الصارمة (DON'Ts):
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-rose-950">
                {Array.isArray(data.safetyWarningsAndCriticalSteps?.donts) ? (
                  data.safetyWarningsAndCriticalSteps.donts.map((d: any, i: number) => (
                    <li key={i}>{typeof d === 'string' ? d : d?.instruction || d?.text || JSON.stringify(d)}</li>
                  ))
                ) : Array.isArray((data.safetyWarningsAndCriticalSteps as any)?.dosAndDonts) ? (
                  (data.safetyWarningsAndCriticalSteps as any).dosAndDonts
                    .filter((item: any) => item?.type === 'DONT' || item?.type === "DON'T" || (typeof item === 'string' && item.toLowerCase().startsWith("don't")))
                    .map((d: any, i: number) => (
                      <li key={i}>{typeof d === 'string' ? d : d?.instruction || d?.text || JSON.stringify(d)}</li>
                    ))
                ) : (
                  <li>يحظر مخالفة تعليمات مكافحة العدوى والسلامة.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Emergency Incident Protocol */}
          {(data.safetyWarningsAndCriticalSteps?.emergencyIncidentProtocol || (data.safetyWarningsAndCriticalSteps as any)?.exposureProtocol) && (
            <div className="bg-slate-100 p-2 rounded border border-slate-300 text-[7.5pt]">
              <strong className="text-slate-900 font-bold">بروتوكول الطوارئ والاستجابة الفورية عند التعرض أو الخلل: </strong>
              <span className="text-slate-800">
                {typeof data.safetyWarningsAndCriticalSteps?.emergencyIncidentProtocol === 'string'
                  ? data.safetyWarningsAndCriticalSteps.emergencyIncidentProtocol
                  : (data.safetyWarningsAndCriticalSteps as any)?.exposureProtocol || ''}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ================= 6. Flowchart Summary ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt]">
          6. مسار ومخطط سير العمل الانسيابي (Workflow Logic)
        </div>
        <div className="p-3 text-[8pt] space-y-1.5 bg-slate-50 font-mono">
          <p className="text-[7.5pt] text-slate-600 font-sans">
            {data.mermaidFlowchart.description}
          </p>
          <pre className="text-[7pt] bg-white p-2 rounded border border-slate-300 whitespace-pre-wrap leading-tight text-slate-800">
            {data.mermaidFlowchart.code}
          </pre>
        </div>
      </section>

      {/* ================= 7. Audit Checklist & KPIs ================= */}
      <section className="avoid-break mb-4 border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[9pt]">
          7. معايير التدقيق الميداني ومؤشرات الأداء المقاسة (Audit & KPIs)
        </div>
        <div className="p-3 text-[8pt] space-y-3">
          {/* Audit Checklist Table */}
          <div>
            <h4 className="font-bold text-[8pt] text-slate-900 mb-1">قائمة التحقق الميداني للتدقيق (Audit Checklist):</h4>
            <table className="w-full border-collapse border border-slate-300 text-[7.5pt]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-1 text-center w-8">م</th>
                  <th className="border border-slate-300 p-1 text-right">عنصر التدقيق</th>
                  <th className="border border-slate-300 p-1 text-right">المعيار المرجعي</th>
                  <th className="border border-slate-300 p-1 text-right">دليل الإثبات والامتثال</th>
                  <th className="border border-slate-300 p-1 text-center w-14">الدورية</th>
                </tr>
              </thead>
              <tbody>
                {data.complianceAndKPIs.auditChecklist.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1 text-center font-bold">{i + 1}</td>
                    <td className="border border-slate-300 p-1 font-semibold">{c.checkpoint}</td>
                    <td className="border border-slate-300 p-1 text-slate-600">{c.standardReference}</td>
                    <td className="border border-slate-300 p-1">{c.evidenceRequired}</td>
                    <td className="border border-slate-300 p-1 text-center">{c.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KPIs Table */}
          <div>
            <h4 className="font-bold text-[8pt] text-slate-900 mb-1">مؤشرات الأداء الرئيسية (Key Performance Indicators):</h4>
            <table className="w-full border-collapse border border-slate-300 text-[7.5pt]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-1 text-right">المؤشر</th>
                  <th className="border border-slate-300 p-1 text-right">طريقة الحساب / المعادلة</th>
                  <th className="border border-slate-300 p-1 text-center w-20">المستهدف</th>
                  <th className="border border-slate-300 p-1 text-center w-14">الدورية</th>
                  <th className="border border-slate-300 p-1 text-right w-24">المسؤول</th>
                </tr>
              </thead>
              <tbody>
                {data.complianceAndKPIs.kpis.map((k, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1 font-bold text-slate-900">{k.name}</td>
                    <td className="border border-slate-300 p-1 font-mono text-[7pt] text-slate-700">{k.formula}</td>
                    <td className="border border-slate-300 p-1 text-center font-bold text-emerald-800">{k.target}</td>
                    <td className="border border-slate-300 p-1 text-center">{k.frequency}</td>
                    <td className="border border-slate-300 p-1">{k.responsiblePerson || 'فريق الجودة'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= Official Signatures and Footer ================= */}
      <footer className="avoid-break pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-[7.5pt] text-center">
        <div className="space-y-3">
          <p className="font-bold text-slate-900">إعداد: منسق مكافحة العدوى</p>
          <div className="h-6 border-b border-dashed border-slate-300"></div>
          <p className="text-slate-500 font-mono">التاريخ والتوقيع</p>
        </div>
        <div className="space-y-3">
          <p className="font-bold text-slate-900">مراجعة: مدير إدارة الجودة والاعتماد</p>
          <div className="h-6 border-b border-dashed border-slate-300"></div>
          <p className="text-slate-500 font-mono">التاريخ والتوقيع</p>
        </div>
        <div className="space-y-3">
          <p className="font-bold text-slate-900">اعتماد: المدير الطبي / مدير عام المنشأة</p>
          <div className="h-6 border-b border-dashed border-slate-300"></div>
          <p className="text-slate-500 font-mono">الختم والاعتماد النهائي</p>
        </div>
      </footer>
    </div>
  );
};
