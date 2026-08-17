import React, { useState } from 'react';
import { PolicyAnalysisResult } from '../types';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  X, 
  Bot, 
  User, 
  HelpCircle,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface AskExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: PolicyAnalysisResult;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const AskExpertModal: React.FC<AskExpertModalProps> = ({ isOpen, onClose, analysisData }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `مرحباً بك! أنا مستشارك المعتمد لسياسات الجودة ومكافحة العدوى والسلامة (CBAHI / JCI / OSHA). يمكنك سؤالي عن أي بند أو خطوة إجرائية أو كيفية إثبات الامتثال أثناء زيارات التقييم والتدقيق لهذه السياسة: "${analysisData.policyCard.titleArabic}".`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickQuestions = [
    'ما هي الأسئلة المحتملة لمقيمي CBAHI و JCI حول هذه السياسة؟',
    'ما هي المستندات والأدلة الملموسة التي يجب تجهيزها لملف التدقيق؟',
    'ما هي أبرز الأخطاء الشائعة أثناء تطبيق هذه السياسة وكيفية تجنبها؟',
    'ما هو التردد المطلوب لتدريب الكوادر الجديدة على هذه الإجراءات؟',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyData: analysisData,
          question: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        const botMsg: Message = {
          sender: 'bot',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'تعذر الحصول على إجابة');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        sender: 'bot',
        text: 'عذراً، حدث خطأ أثناء معالجة السؤال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl flex flex-col h-[620px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base leading-tight">
                استشر خبير الاعتماد والجودة (CBAHI / JCI / OSHA)
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1">
                استفسارات الامتثال الميداني لـ: {analysisData.policyCard.titleArabic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-800 text-white'
                    : 'bg-blue-100 text-blue-800 font-bold'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-xl text-xs md:text-sm leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-blue-800 text-white'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span
                  className={`text-2xs block text-left ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white text-slate-600 border border-slate-200 p-3 rounded-xl text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-800" />
                <span>الخبير يقوم بتحليل المعايير وتوليد الإجابة...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="text-2xs bg-slate-100 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition shrink-0 whitespace-nowrap font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب سؤالك الإكلينيكي أو الرقابي هنا..."
            className="flex-1 text-xs md:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:bg-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!question.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال</span>
          </button>
        </div>
      </div>
    </div>
  );
};
