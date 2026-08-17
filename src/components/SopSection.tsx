import React, { useState } from 'react';
import { SopPhases, SopStep } from '../types';
import { 
  ListOrdered, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Clock, 
  PlayCircle, 
  FileCheck2,
  Sparkles,
  User
} from 'lucide-react';

interface SopSectionProps {
  sop: SopPhases;
}

export const SopSection: React.FC<SopSectionProps> = ({ sop }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pre' | 'exec' | 'post'>('all');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const renderStepList = (steps: SopStep[], phaseKey: string, phaseTitle: string, phaseBadgeColor: string) => {
    if (!steps || steps.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${phaseBadgeColor}`}>
            {phaseTitle} ({steps.length} خطوات)
          </span>
        </div>

        <div className="space-y-2">
          {steps.map((step) => {
            const stepId = `${phaseKey}-${step.stepNumber}`;
            const isDone = !!completedSteps[stepId];

            return (
              <div
                key={stepId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(stepId)}
                    title={isDone ? 'إلغاء التحديد' : 'تحديد كمنجز'}
                    className="mt-0.5 p-1 text-slate-400 hover:text-blue-700 transition shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center font-mono">
                          {step.stepNumber}
                        </span>
                        <h4 className={`text-xs md:text-sm font-bold ${isDone ? 'text-emerald-900 line-through opacity-80' : 'text-slate-900'}`}>
                          {step.title}
                        </h4>
                      </div>

                      {step.assignedTo && (
                        <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>المسؤول: {step.assignedTo}</span>
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed ${isDone ? 'text-slate-600' : 'text-slate-700'}`}>
                      {step.details}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalSteps =
    (sop.preProcedure?.length || 0) +
    (sop.execution?.length || 0) +
    (sop.postProcedure?.length || 0);

  const doneCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-bold text-blue-800 border-r-4 border-blue-800 pr-2 uppercase tracking-wide">
            4. خطوات العمل التنفيذية (SOP)
          </h2>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            {totalSteps} خطوة
          </span>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              activeTab === 'all' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            كافة المراحل ({totalSteps})
          </button>
          <button
            onClick={() => setActiveTab('pre')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              activeTab === 'pre' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. ما قبل الإجراء ({sop.preProcedure?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('exec')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              activeTab === 'exec' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. التنفيذ الفعلي ({sop.execution?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
              activeTab === 'post' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. ما بعد الإجراء ({sop.postProcedure?.length || 0})
          </button>
        </div>
      </div>

      {/* Progress tracker bar */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <span>معدل تدقيق وتطبيق الخطوات الميدانية:</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-bold font-mono text-blue-900">{progressPercent}%</span>
        </div>
      </div>

      {/* Phase content */}
      <div className="space-y-5">
        {(activeTab === 'all' || activeTab === 'pre') &&
          renderStepList(
            sop.preProcedure,
            'pre',
            'المرحلة الأولى: ما قبل الإجراء والتجهيز (Pre-Procedure / Preparation)',
            'bg-slate-100 text-slate-800 border border-slate-200'
          )}

        {(activeTab === 'all' || activeTab === 'exec') &&
          renderStepList(
            sop.execution,
            'exec',
            'المرحلة الثانية: التنفيذ الفعلي والتطبيق السريري المباشر (Execution SOP)',
            'bg-blue-50 text-blue-900 border border-blue-200'
          )}

        {(activeTab === 'all' || activeTab === 'post') &&
          renderStepList(
            sop.postProcedure,
            'post',
            'المرحلة الثالثة: ما بعد الإجراء والتوثيق والتخلص الآمن (Post-Procedure & Disposal)',
            'bg-slate-100 text-slate-800 border border-slate-200'
          )}
      </div>
    </div>
  );
};
