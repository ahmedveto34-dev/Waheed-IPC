import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

function parseJsonSafely(rawText: string) {
  if (!rawText) return null;
  let clean = rawText.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  
  try {
    return JSON.parse(clean);
  } catch {
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = clean.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sub);
    }
    throw new Error("فشل تحويل مخرجات النموذج إلى صيغة JSON سليمة.");
  }
}

function generateFallbackAnalysis(content: string, standardFocus?: string): any {
  const isHandHygiene = content.includes("غسيل") || content.includes("نظافة الأيدي") || content.includes("تطهير");
  const isCvc = content.includes("قسطرة") || content.includes("وريد مركزي") || content.includes("CVC") || content.includes("CLABSI");

  const titleAr = isHandHygiene 
    ? "سياسة وإجراءات نظافة وتطهير الأيدي بالمنشآت الصحية" 
    : isCvc 
    ? "سياسة الوقاية من عدوى مجرى الدم المرتبطة بالقساطر الوريدية المركزية (CLABSI)" 
    : "سياسة وإجراءات مكافحة العدوى والسلامة المهنية المعتمدة";

  const titleEn = isHandHygiene 
    ? "Hand Hygiene & Antisepsis Policy" 
    : isCvc 
    ? "Central Line-Associated Bloodstream Infection (CLABSI) Prevention Policy" 
    : "Infection Prevention and Clinical Safety Policy";

  const code = isHandHygiene ? "MUEH.IPC.04" : isCvc ? "IPC-CVC-002" : "GAHAR-IPC-01";

  return {
    policyCard: {
      titleArabic: titleAr,
      titleEnglish: titleEn,
      policyCode: code,
      domain: "مكافحة العدوى والوقاية منها (Infection Prevention & Control)",
      departments: ["جميع الأقسام الإكلينيكية", "أقسام الرعاية المركزة (ICU)", "العمليات الجراحية", "العيادات الخارجية", "التمريض"],
      effectiveDate: "2025/05/15",
      reviewCycle: "كل 3 سنوات أو عند تحديث الأدلة القومية ومعايير GAHAR",
      alignedStandards: [
        {
          standardBody: "GAHAR 2025 (معايير جهار للمستشفيات)",
          clauseNumber: "IPC.01 - IPC.04",
          description: "الالتزام بالاحتياطات القياسية والحزم الوقائية لمنع انتقال العدوى المكتسبة بالمنشآت الصحية."
        },
        {
          standardBody: "الدليل القومي لمكافحة العدوى 2020",
          clauseNumber: "الباب الثاني - الاحتياطات القياسية",
          description: "بروتوكولات نظافة الأيدي والأسلوب المانع للتلوث واستخدام الواقيات الشخصية والتخلص الآمن من النفايات."
        },
        {
          standardBody: "CBAHI / JCI",
          clauseNumber: "IPC Core Standards",
          description: "تطبيق استراتيجية اللحظات الخمس والفرز والترصد النشط للميكروبات المقاومة للمضادات."
        }
      ]
    },
    purposeAndScope: {
      mainObjective: "وضع إطار عمل إلزامي وموحد لتطبيق أعلى معايير مكافحة العدوى والسلامة الإكلينيكية والمهنية داخل المنشأة وفق متطلبات GAHAR 2025 والدليل القومي 2020.",
      clinicalRationale: "الحد من معدلات العدوى المكتسبة داخل المنشآت الصحية (HAIs) وحماية المرضى والعاملين من انتقال السلالات الميكروبية المقاومة.",
      scope: ["كافة الكوادر الطبية والتمريضية", "أقسام الرعاية الحرجة والمتوسطة", "غرف العمليات والإجراءات التداخلية", "العاملون بالخدمات المعاونة والزوار"],
      exclusions: ["لا توجد استثناءات للممارسات الوقائية الأساسية، ويحظر استبدال الغسيل بالدلك الكحولي عند الاتساخ الظاهري أو حالات C. difficile."]
    },
    rolesAndResponsibilities: [
      {
        role: "مدير المنشأة وإدارة الجودة والاعتماد",
        responsibilities: [
          "توفير الموارد والمستلزمات ومحطات غسيل الأيدي والمطهرات بنسبة كفاية تامة.",
          "اعتماد السياسات ومتابعة تقارير الامتثال الشهرية لمتطلبات GAHAR والتحسين المستمر."
        ]
      },
      {
        role: "فريق ولجنة مكافحة العدوى",
        responsibilities: [
          "تنفيذ المرور الدوري اليومي والملاحظة المباشرة للامتثال لخطوات العمل القياسية.",
          "ترصد العدوى وحساب المؤشرات الشهرية (KPIs) وإجراء التدريب المستمر على رأس العمل."
        ]
      },
      {
        role: "الأطباء والتمريض والكوادر الفنية",
        responsibilities: [
          "التطبيق الصارم للحظات الخمس لنظافة الأيدي والحزم الإكلينيكية المعتمدة.",
          "استخدام أدوات الوقاية الشخصية المناسبة لكل تدخل والتخلص الآمن من المخلفات الحادة."
        ]
      }
    ],
    sopPhases: {
      preProcedure: [
        {
          stepNumber: 1,
          title: "تقييم المخاطر وتجهيز بيئة العمل",
          details: "خلع الخواتم والحلي، والتأكد من تقليم الأظافر، وتطهير الأيدي بالكحول أو غسلها بالماء والصابون وفق الخطوات الست المعتمدة.",
          assignedTo: "الممارس الصحي"
        },
        {
          stepNumber: 2,
          title: "تجهيز المستلزمات الطبية والواقيات الشخصية",
          details: "فحص تاريخ الصلاحية وسلامة عبوات التعقيم للمستلزمات، وارتداء أدوات الوقاية الشخصية المناسبة لنوع التدخل.",
          assignedTo: "التمريض"
        }
      ],
      execution: [
        {
          stepNumber: 3,
          title: "تنفيذ الإجراء بالأسلوب المانع للتلوث (Aseptic Technique)",
          details: "الالتزام الصارم بقواعد التعقيم الميداني، وحظر لمس الأسطح غير المعقمة أثناء تطبيق الإجراء الطبي.",
          assignedTo: "الطبيب / الممرض"
        },
        {
          stepNumber: 4,
          title: "اتباع ممارسات الحقن والتدخل الآمن",
          details: "تطبيق قاعدة سرنجة وسن لمريض واحد، وحظر إعادة تغطية الإبر باليدين (Recapping) منعاً لحوادث الوخز المهني.",
          assignedTo: "الفريق المعالج"
        }
      ],
      postProcedure: [
        {
          stepNumber: 5,
          title: "التخلص الفوري والآمن من النفايات الطبية والحادة",
          details: "إلقاء الأدوات الحادة فوراً بصندوق الأمان (Safety Box) دون فصل السن، وفصل النفايات المعدية في الأكياس الحمراء المخصصة.",
          assignedTo: "الممارس الصحي"
        },
        {
          stepNumber: 6,
          title: "نزع الواقيات وتطهير الأيدي والتوثيق",
          details: "نزع القفازات ثم الواقيات وفق التسلسل الصحيح لمنع التلوث الذاتي، وتطهير الأيدي وتوثيق الإجراء في السجل الطبي.",
          assignedTo: "الممارس الصحي"
        }
      ]
    },
    safetyWarningsAndCriticalSteps: {
      criticalControlPoints: [
        "التطهير الكحولي لفرك الأيدي لمدة 20-30 ثانية أو الغسيل بالماء والصابون لمدة 40-60 ثانية.",
        "الانتظار حتى يجف المطهر تماماً على الجلد ومنافذ الحقن قبل الشروع في الإجراء (Contact Time).",
        "عدم ملء صناديق الأمان للأدوات الحادة لأكثر من ثلاثة أرباعها (3/4 Full) وإغلاقها بإحكام."
      ],
      dosAndDonts: [
        {
          type: "DO",
          instruction: "الالتزام بلحظات نظافة الأيدي الخمس لمنظمة الصحة العالمية قبل وبعد ملامسة المريض ومحيطه."
        },
        {
          type: "DO",
          instruction: "استخدام أدوات وحيدة الاستخدام وتغيير القفازات بين المرضى وبين الإجراءات للمريض الواحد."
        },
        {
          type: "DONT",
          instruction: "حظر استخدام الأظافر الصناعية أو طلاء الأظافر أو ارتداء الساعات والخواتم أثناء الرعاية المباشرة."
        },
        {
          type: "DONT",
          instruction: "حظر إعادة تغطية الإبر (Recapping) نهائياً واستخدام الحاويات المخصصة المقاومة للثقب."
        }
      ],
      exposureProtocol: "في حال حدوث وخز إبرة مهني أو تعرض لسوائل الجسم: غسل الموضع فوراً بالماء والصابون دون عصر، إبلاغ مشرف مكافحة العدوى، فحص مصل المريض والمصاب، وبدء العلاج الوقائي (PEP) خلال ساعتين وفق البروتوكول القومي."
    },
    mermaidFlowchart: `flowchart TD
    A([بداية الإجراء الطبي]) --> B[تقييم المخاطر ونظافة الأيدي]
    B --> C[ارتداء الواقيات الشخصية المناسبة]
    C --> D{هل الإجراء يتطلب تعقيماً صارماً؟}
    D -- نعم --> E[تطبيق الأسلوب المانع للتلوث Aseptic Field]
    D -- لا --> F[تطبيق الاحتياطات القياسية المعتمدة]
    E --> G[تنفيذ الإجراء الطبي بأمان]
    F --> G
    G --> H[التخلص الفوري من الآلات الحادة بصندوق الأمان]
    H --> I[نزع الواقيات وتطهير الأيدي للمرة الثانية]
    I --> J[التوثيق في الملف الطبي وسجل الملاحظة]
    J --> K([اكتمال الإجراء بنجاح])
    
    style A fill:#1e293b,stroke:#0f172a,stroke-width:2px,color:#ffffff
    style D fill:#0369a1,stroke:#075985,stroke-width:2px,color:#ffffff
    style H fill:#b91c1c,stroke:#991b1b,stroke-width:2px,color:#ffffff
    style K fill:#047857,stroke:#065f46,stroke-width:2px,color:#ffffff`,
    complianceAndKPIs: {
      auditChecklist: [
        {
          item: "توفر محطات ومطهرات غسيل الأيدي وصناديق الأمان بجميع النقاط الإكلينيكية بنسبة 100%.",
          evidenceMethod: "المعاينة الميدانية والتفتيش البصري المستمر",
          frequency: "يومي"
        },
        {
          item: "امتثال الكوادر للحظات نظافة الأيدي الخمس والأسلوب المانع للتلوث أثناء التدخلات.",
          evidenceMethod: "سجلات الملاحظة المباشرة لفريق مكافحة العدوى (Direct Observation)",
          frequency: "أسبوعي"
        },
        {
          item: "فصل النفايات الطبية والحادة وفق معايير GAHAR والدليل القومي 2020.",
          evidenceMethod: "مراجعة حاويات النفايات وغرف التجميع المؤقت",
          frequency: "يومي"
        }
      ],
      kpis: [
        {
          name: "معدل الامتثال لنظافة الأيدي (Hand Hygiene Compliance Rate)",
          formula: "(عدد مرات الالتزام الصحيحة ÷ إجمالي الفرص الملاحظة) × 100",
          targetBenchmark: "≥ 90%",
          measurementCycle: "شهري"
        },
        {
          name: "معدل وقوع حوادث الوخز المهني (Needlestick Injury Rate)",
          formula: "عدد حوادث الوخز المبلغ عنها لكل 100 ممارس صحي",
          targetBenchmark: "0%",
          measurementCycle: "شهري / ربع سنوي"
        }
      ],
      complianceGapsAndRecommendations: [
        "سد فجوة نقص توثيق نماذج الملاحظة المباشرة عبر تفعيل السجلات الإلكترونية المتوافقة مع متطلبات جهار (GAHAR 2025).",
        "تكثيف ورش العمل والتدريب الإلزامي المستمر لكوادر التمريض والخدمات المساندة بشأن الحزم الوقائية والتعامل مع المخلفات الطبية."
      ]
    },
    executiveSummarySnippet: `تم إعداد وتلخيص هذه السياسة الطبية وفقاً لأحدث متطلبات ومعايير الهيئة العامة للاعتماد والرقابة الصحية (GAHAR 2025) والدليل القومي المصري لمكافحة العدوى 2020، إضافة لمعايير CBAHI و JCI و OSHA.

تستهدف السياسة إرساء ممارسات الرعاية الإكلينيكية الآمنة عبر إلزامية الاحتياطات القياسية، وفي مقدمتها نظافة وتطهير الأيدي وتطبيق اللحظات الخمس لمنظمة الصحة العالمية، وتطبيق الحزم الوقائية المعتمدة.

تتضمن الوثيقة خطوات تشغيل قياسية (SOPs) واضحة، محددات السلامة الحرجة (CCPs)، بروتوكول التعامل الفوري مع حوادث الوخز المهني، ومخطط تدفق تفاعلي وقائمة تدقيق للمطابقة الميدانية ومؤشرات أداء قابلة للقياس المستمر.`
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, fileData, mimeType, standardFocus, customInstructions } = req.body || {};

  if (!content && !fileData) {
    return res.status(400).json({ error: "يرجى تزويد نص السياسة أو رفع الملف المطلوب تحليله." });
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
    const fallbackData = generateFallbackAnalysis(content || "", standardFocus);
    return res.status(200).json({ success: true, data: fallbackData, isFallback: true });
  }

  try {
    const systemPrompt = `أنت خبير استشاري معتمد أول في سياسات وإجراءات الرعاية الصحية، مكافحة العدوى والوقاية منها (Infection Prevention & Control - IPC)، إدارة الجودة والاعتماد الصحي (Healthcare Quality & Accreditation)، والسلامة والصحة المهنية (Occupational Safety and Health - OSH).
مرجعيتك الأساسية الإلزامية في التحليل واستنباط البنود والضوابط هي:
1. معايير الهيئة العامة للاعتماد والرقابة الصحية المصرية (GAHAR 2025 - Hospital & Healthcare Standards) وتحديداً متطلبات مكافحة العدوى والسلامة الإكلينيكية وإدارة الجودة والمخاطر.
2. الدليل القومي المصري لمكافحة العدوى (Egyptian National Infection Control Guidelines 2020) والبروتوكولات التخصصية الصادرة عن وزارة الصحة.
3. المعايير الدولية والوطنية التكميلية: معايير المركز السعودي لاعتماد المنشآت الصحية (CBAHI)، معايير الهيئة الدولية المشتركة (JCI)، إرشادات السلامة المهنية الأمريكية (OSHA)، وإرشادات منظمة الصحة العالمية (WHO) ومراكز مكافحة الأمراض (CDC).

مهمتك: تحليل وثيقة السياسة والإجراءات الطبية المرفقة وتوليد تحليل تنفيذي فائق الاحترافية باللغة العربية، دقيق وشامل ومقسم بحسب الهيكل الإلزامي الصارم:
- بطاقة السياسة (Policy Card) مع ربط معايير GAHAR 2025 والدليل القومي 2020
- الهدف الأساسي ونطاق التطبيق (Purpose & Scope)
- المسؤوليات والأدوار المحددة (Roles & Responsibilities)
- خطوات العمل التنفيذية (SOPs: Pre, Execution, Post)
- الإرشادات الحرجة والتحذيرات الصارمة (Safety Warnings, CCPs, DOs/DONTs, Exposure Protocol)
- كود مخطط انسيابي للإجراءات بصيغة Mermaid.js داخل كود بلوك
- معايير الامتثال والتدقيق والمؤشرات (Audit Checklist & KPIs & Gaps)`;

    const parts: any[] = [];
    if (fileData && mimeType) {
      parts.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType,
        },
      });
    }

    let userPromptText = `يرجى تحليل وثيقة السياسة والإجراءات الطبية التالية وإعداد الملخص التنفيذي والهيكل الشامل وفق معايير GAHAR 2025 والدليل القومي:`;
    if (standardFocus) userPromptText += `\nالتركيز الإضافي المطلوب: ${standardFocus}`;
    if (customInstructions) userPromptText += `\nتعليمات إضافية: ${customInstructions}`;
    if (content) userPromptText += `\n\nنص السياسة / الوثيقة:\n${content}`;

    parts.push({ text: userPromptText });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const rawOutput = response.text || "";
    const parsed = parseJsonSafely(rawOutput);
    return res.status(200).json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    const fallbackData = generateFallbackAnalysis(content || "", standardFocus);
    return res.status(200).json({ success: true, data: fallbackData, isFallback: true });
  }
}
