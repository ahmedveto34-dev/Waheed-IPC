import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('last_analyzed_policy');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100" dir="rtl">
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 text-right">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">تنبيه أثناء عرض البيانات</h2>
                <p className="text-xs text-slate-400">حدث تعارض أثناء معالجة أو عرض بعض عناصر السياسة</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-700/60 rounded-xl text-xs font-mono text-rose-300 overflow-x-auto leading-relaxed max-h-40">
              {this.state.error?.message || 'Unexpected application error'}
            </div>

            <div className="pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة تحميل التطبيق واستعادة الواجهة</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
