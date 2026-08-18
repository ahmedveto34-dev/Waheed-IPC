import React from 'react';
import { SafetyWarnings } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  LifeBuoy, 
  Flame
} from 'lucide-react';

interface SafetyWarningsSectionProps {
  warnings?: any;
}

export const SafetyWarningsSection: React.FC<SafetyWarningsSectionProps> = ({ warnings = {} }) => {
  const w: any = warnings || {};

  // Extract critical points safely
  const criticalPoints: string[] = Array.isArray(w.criticalControlPoints)
    ? w.criticalControlPoints.map((item: any) => typeof item === 'string' ? item : item?.text || item?.point || JSON.stringify(item))
    : [];

  // Extract DOs safely from dos, dosAndDonts, or doList
  let dosList: string[] = [];
  if (Array.isArray(w.dos)) {
    dosList = w.dos.map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  } else if (Array.isArray(w.dosAndDonts)) {
    dosList = w.dosAndDonts
      .filter((item: any) => item?.type === 'DO' || item?.action === 'DO' || (typeof item === 'string' && !item.toLowerCase().startsWith("don't")))
      .map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  }

  // Extract DONTs safely from donts, dosAndDonts, or dontList
  let dontsList: string[] = [];
  if (Array.isArray(w.donts)) {
    dontsList = w.donts.map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  } else if (Array.isArray(w.dosAndDonts)) {
    dontsList = w.dosAndDonts
      .filter((item: any) => item?.type === 'DONT' || item?.type === "DON'T" || item?.action === 'DONT' || (typeof item === 'string' && item.toLowerCase().startsWith("don't")))
      .map((item: any) => typeof item === 'string' ? item : item?.instruction || item?.text || JSON.stringify(item));
  }

  // Emergency Protocol string
  const emergencyProtocol = typeof w.emergencyIncidentProtocol === 'string' 
    ? w.emergencyIncidentProtocol 
    : typeof w.exposureProtocol === 'string'
    ? w.exposureProtocol
    : w.emergencyIncidentProtocol 
    ? JSON.stringify(w.emergencyIncidentProtocol)
    : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-amber-800 border-r-4 border-amber-800 pr-2 uppercase tracking-wide">
          5. الإرشادات والتحذيرات الحرجة (Safety Warnings & Critical Points)
        </h2>
        <span className="text-xs text-slate-500 hidden sm:inline">
          نقاط التوقف الصارمة والمحظورات وبروتوكول الطوارئ
        </span>
      </div>

      {/* Critical Control Points Banner */}
      {criticalPoints.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>نقاط التوقف والمراقبة الحرجة (Critical Control Points - CCP):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {criticalPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs bg-white/90 p-2.5 rounded-lg border border-amber-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed font-medium text-slate-800">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Do's & Don'ts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DO's */}
        <div className="space-y-2.5 p-4 rounded-xl bg-emerald-50/40 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>إجراءات إلزامية وأفضل الممارسات (DO's):</span>
          </div>
          <ul className="space-y-1.5">
            {dosList.length > 0 ? (
              dosList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-2xs font-bold font-mono">
                    ✓
                  </span>
                  <span className="leading-relaxed font-medium">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic p-2">الالتزام بالاحتياطات القياسية المعتمدة.</li>
            )}
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="space-y-2.5 p-4 rounded-xl bg-rose-50/40 border border-rose-200">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>محظورات ومخاطر حرجة (DON'Ts):</span>
          </div>
          <ul className="space-y-1.5">
            {dontsList.length > 0 ? (
              dontsList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-rose-100 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-2xs font-bold font-mono">
                    ✕
                  </span>
                  <span className="leading-relaxed font-medium">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic p-2">يحظر مخالفة تعليمات مكافحة العدوى وإعادة استخدام الأدوات وحيدة الاستخدام.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Immediate Emergency & Incident Protocol */}
      {emergencyProtocol && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <LifeBuoy className="w-4 h-4" />
            <span>بروتوكول الاستجابة الفورية عند حدوث خلل أو تعرض طارئ (Immediate Incident Protocol):</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {emergencyProtocol}
          </p>
        </div>
      )}
    </div>
  );
};
