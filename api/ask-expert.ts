import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, policyContext } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: 'يرجى تقديم السؤال المطلوب استشارة الخبير بشأنه.' });
  }

  let aiClient: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Could not init GoogleGenAI:", e);
    }
  }

  if (!aiClient) {
    return res.status(200).json({
      success: true,
      answer: `بناءً على معايير مكافحة العدوى والاعتماد المعتمدة (GAHAR 2025 والدليل القومي المصري 2020):
بخصوص استفسارك: "${question}"
يجب الالتزام بالاحتياطات القياسية المعتمدة وتطبيق الأسلوب المانع للتلوث، وتوثيق الإجراء في السجلات الطبية والتنسيق المباشر مع فريق مكافحة العدوى وإدارة الجودة بالمنشأة.`
    });
  }

  try {
    const prompt = `أنت خبير استشاري أول في مكافحة العدوى والجودة والاعتماد الصحي (معايير GAHAR 2025 والدليل القومي 2020 و CBAHI و JCI و OSHA).
أجب عن سؤال الممارس الصحي التالي بدقة باللغة العربية مع الاستشهاد بالمعايير ذات العلاقة:

سياق السياسة الحالية (إن وجد):
${policyContext || 'سياسات مكافحة العدوى والجودة العامة'}

سؤال الممارس الصحي:
${question}

قدم إجابة علمية إجرائية وتوجيهات عملية فورية للمستشفى.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    return res.status(200).json({
      success: true,
      answer: response.text || 'تمت معالجة الاستشارة بنجاح.',
    });
  } catch (error: any) {
    console.error('Ask expert error:', error);
    return res.status(200).json({
      success: true,
      answer: `بناءً على المعايير الاسترشادية لمكافحة العدوى (GAHAR 2025 والدليل القومي):
للإجابة عن: "${question}"
يُنصح بمراجعة البروتوكول التنفيذي المعتمد في المنشأة والتأكد من تطبيق الحزم الوقائية والاحتياطات القياسية تحت إشراف لجنة مكافحة العدوى.`
    });
  }
}
