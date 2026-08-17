import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.trim() === '2008') {
      localStorage.setItem('waheed_ipc_auth', 'authenticated');
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
      setErrorMessage('الرقم السري غير صحيح. يرجى المحاولة مرة أخرى.');
      setPinCode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner with "Waheed IPC" */}
      <header className="w-full py-6 px-4 text-center border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            W
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 font-mono">
              Waheed IPC
            </h1>
            <p className="text-2xs text-slate-400 font-medium">
              Infection Prevention & Healthcare Quality Platform
            </p>
          </div>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative space-y-6">
          {/* Header Inside Card */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">
              تسجيل الدخول للمنظومة
            </h2>
            <p className="text-xs text-slate-400">
              يرجى إدخال الرقم السري المعتمد للوصول إلى لوحة تحليل وتلخيص السياسات
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="pin-input" 
                className="block text-xs font-bold text-slate-300 text-right"
              >
                الرقم السري (PIN):
              </label>
              
              <div className="relative">
                <input
                  id="pin-input"
                  type="password"
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="أدخل الرقم السري..."
                  autoFocus
                  maxLength={10}
                  className={`w-full py-3.5 px-4 pr-11 rounded-xl bg-slate-950 border ${
                    error 
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20' 
                      : 'border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  } text-white font-mono text-center tracking-widest text-lg outline-none transition placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal placeholder:font-sans`}
                />
                <KeyRound className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition duration-150 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <span>دخول النظام</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Standards Footer Inside Card */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-2xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>معايير GAHAR 2025 • الدليل القومي 2020 • CBAHI • JCI</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-slate-500 text-2xs border-t border-slate-800/80">
        منصة Waheed IPC المتكاملة لمكافحة العدوى والجودة والاعتماد الطبي © {new Date().getFullYear()}
      </footer>
    </div>
  );
};
