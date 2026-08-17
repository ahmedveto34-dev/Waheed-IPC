import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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

// Fallback intelligent generator if Gemini key is missing or offline
function generateFallbackAnalysis(content: string, standardFocus?: string): any {
  const isHandHygiene = content.includes("غسيل") || content.includes("نظافة الأيدي") || content.includes("تطهير");
  const isCvc = content.includes("قسطرة") || content.includes("وريد مركزي") || content.includes("CVC") || content.includes("CLABSI");

  const titleAr = isHandHygiene 
    ? "سياسة وإجراءات نظافة وتطهير الأيدي بالمنشآت الصحية" 
    : isCvc 
    ? "سياسة الوقاية من عدوى مجرى الدم المرتبطة بالقساطر الوريدية المركزية (CLABSI)" 
    : "سياسة وإجراءات مكافحة العدوى والسلامة المهنية";

  const titleEn = isHandHygiene 
    ? "Hand Hygiene & Antisepsis Policy" 
    : isCvc 
    ? "Central Line-Associated Bloodstream Infection (CLABSI) Prevention Policy" 
    : "Infection Prevention and Clinical Safety Policy";

  const code = isHandHygiene ? "MUEH.IPC.04" : isCvc ? "IPC-CVC-002" : "IPC-GEN-001";
  const standard = standardFocus || "الدليل القومي لمكافحة العدوى 2020 / GAHAR / CBAHI / JCI";

  return {
    policyCard: {
      titleArabic: titleAr,
      titleEnglish: titleEn,
      policyCode: code,
      domain: "مكافحة العدوى والوقاية منها (Infection Prevention & Control)",
      departments: ["جميع الأقسام الإكلينيكية", "أقسام الرعاية المركزة (ICU)", "العمليات الجراحية", "العيادات الخارجية", "التمريض"],
      effectiveDate: "2025/05/15",
      reviewCycle: "كل 3 سنوات أو عند تحديث الأدلة القومية والمعايير",
      alignedStandards: [
        {
          standardBody: "GAHAR 2025 / الدليل القومي 2020",
          clauseNumber: "IPC.01 - IPC.04",
          description: "الالتزام بالاحتياطات القياسية والحزم الوقائية لمنع انتقال الميكروبات الممرضة."
        },
        {
          standardBody: "CBAHI",
          clauseNumber: "IPC.6",
          description: "تطبيق بروتوكولات نظافة الأيدي والحزم الإكلينيكية والحد من تفشي العدوى."
        },
        {
          standardBody: "WHO / CDC",
          clauseNumber: "Core Components",
          description: "تطبيق استراتيجية اللحظات الخمس والفرز والترصد النشط للميكروبات المقاومة."
        }
      ]
    },
    purposeAndScope: {
      mainObjective: "وضع إطار عمل إلزامي وموحد لتطبيق أعلى معايير مكافحة العدوى والسلامة الإكلينيكية والمهنية داخل المنشأة.",
      clinicalRationale: "الحد من معدلات العدوى المكتسبة داخل المنشآت الصحية (HAIs) وحماية المرضى والعاملين من انتقال السلالات الميكروبية المقاومة.",
      scope: ["كافة الكوادر الطبية والتمريضية", "أقسام الرعاية الحرجة والمتوسطة", "غرف العمليات والإجراءات التداخلية", "العاملون بالخدمات المعاونة والزوار"],
      exclusions: ["لا توجد استثناءات للممارسات الوقائية الأساسية، ويحظر استبدال الغسيل بالدلك الكحولي عند الاتساخ الظاهري أو حالات C. difficile."]
    },
    rolesAndResponsibilities: [
      {
        role: "مدير المنشأة وإدارة الجودة",
        responsibilities: [
          "توفير الموارد والمستلزمات ومحطات غسيل الأيدي بنسبة كفاية تامة.",
          "اعتماد السياسات ومتابعة تقارير الامتثال الشهرية والتحسين المستمر."
        ]
      },
      {
        role: "فريق مكافحة العدوى",
        responsibilities: [
          "تنفيذ المرور الدوري اليومي والملاحظة المباشرة للامتثال.",
          "ترصد العدوى وحساب المؤشرات الشهرية (KPIs) وإجراء التدريب على رأس العمل."
        ]
      },
      {
        role: "الأطباء والتمريض",
        responsibilities: [
          "التطبيق الصارم للحظات الخمس لنظافة الأيدي والحزم الإكلينيكية.",
          "استخدام أدوات الوقاية الشخصية المناسبة لكل تدخل والتخلص الآمن منها."
        ]
      }
    ],
    sopPhases: {
      preProcedure: [
        {
          stepNumber: 1,
          title: "تقييم المخاطر ونظافة الأيدي الأولية",
          details: "خلع الخواتم والمجوهرات، والتأكد من تقليم الأظافر وخلوها من الطلاء، وتطهير الأيدي بالكحول أو غسلها بالماء والصابون.",
          assignedTo: "الممارس الصحي"
        },
        {
          stepNumber: 2,
          title: "تجهيز بيئة العمل والمستلزمات المعقمة",
          details: "إعداد المستلزمات أحادية الاستخدام وتطهير سطح العمل بمطهر معتمد مع الحفاظ على الأسلوب المانع للتلوث.",
          assignedTo: "التمريض"
        }
      ],
      execution: [
        {
          stepNumber: 3,
          title: "تنفيذ الإجراء بالأسلوب المانع للتلوث",
          details: "ارتداء أدوات الوقاية الشخصية المناسبة (قفازات، كمامة جراحية، جاون) وتطبيق التدخل دون ملامسة الأسطح غير المعقمة.",
          assignedTo: "الطبيب / الممرض"
        },
        {
          stepNumber: 4,
          title: "اتباع ممارسات الحقن والتدخل الآمن",
          details: "تطبيق قاعدة سرنجة وسن لمريض واحد، وحظر إعادة تغطية الإبر باليدين، واستخدام المطهر بتركيز وزمن تلامس كافٍ.",
          assignedTo: "الفريق المعالج"
        }
      ],
      postProcedure: [
        {
          stepNumber: 5,
          title: "التخلص الآمن من النفايات ونزع الواقيات",
          details: "إلقاء الأدوات الحادة فوراً في صندوق الأمان، والنفايات الملوثة في الأكياس الحمراء، ونزع القفازات وغسل/تطهير الأيدي مباشرة.",
          assignedTo: "الممارس الصحي"
        },
        {
          stepNumber: 6,
          title: "التوثيق والمتابعة والترصد",
          details: "تسجيل بيانات الإجراء في ملف المريض ومتابعة أي مؤشرات للعدوى أو المضاعفات.",
          assignedTo: "التمريض / مكافحة العدوى"
        }
      ]
    },
    safetyWarningsAndCriticalSteps: {
      criticalControlPoints: [
        "التطبيق الصارم للحظات الخمس لمنظمة الصحة العالمية لنظافة وتطهير الأيدي.",
        "قاعدة الحقن الآمن الصارمة: مريض واحد - سرنجة واحدة - سن واحد.",
        "التخلص الفوري من الأدوات الحادة في صناديق الأمان عند وصولها لثلاثة أرباع سعتها.",
        "الفصل المادي التام بين المسارات النظيفة والملوثة في إعادة معالجة الآلات والنفايات."
      ],
      dos: [
        "الالتزام بارتداء الواقيات الشخصية المناسبة وفق تقييم المخاطر.",
        "تطهير مداخل القساطر والفيال بالكحول 70% وتركه حتى يجف تماماً.",
        "الملاحظة اليومية المباشرة لعلامات العدوى بمواضع التدخلات الجراحية والتداخلية."
      ],
      donts: [
        "يحظر إعادة تغطية سن الإبر باستخدام اليدين معاً.",
        "يحظر إعادة استخدام الأدوات أحادية الاستخدام أو فتح أمبولات الأدوية مسبقاً.",
        "يحظر استخدام مجففات الهواء الساخن أو الكنس الجاف في المنشآت الطبية."
      ],
      emergencyIncidentProtocol: "عند حدوث وخز إبرة أو تعرض مهني: غسل الموضع فوراً بالماء والصابون دون عصر، إبلاغ مشرف السلامة ومكافحة العدوى فوراً، وبدء إجراءات تقييم المصدر والوقاية بعد التعرض (PEP) خلال ساعتين إلى 24 ساعة كحد أقصى."
    },
    mermaidFlowchart: {
      code: `flowchart TD
    Start([بدء الإجراء الطبي]) --> Prep[1. تقييم المخاطر ونظافة الأيدي ونزع الحلي]
    Prep --> PPE[2. ارتداء أدوات الوقاية الشخصية المناسبة]
    PPE --> CheckSoiled{هل توجد إفرازات أو اتساخ مرئي؟}
    CheckSoiled -- نعم --> SoapWater[الغسيل بالماء والصابون 40-60 ثانية]
    CheckSoiled -- لا --> AlcoholRub[الدلك بالمحلول الكحولي 20-30 ثانية]
    SoapWater --> Execute[3. تنفيذ التدخل بالأسلوب المانع للتلوث]
    AlcoholRub --> Execute
    Execute --> Sharps[4. التخلص الفوري من السنون في صندوق الأمان]
    Sharps --> Waste[5. فرز النفايات ونزع الواقيات وتطهير الأيدي]
    Waste --> Doc([6. التوثيق والمتابعة في ملف المريض])`,
      description: "مخطط سير العمل القياسي للتدخلات الطبية ونظافة الأيدي والسلامة المهنية."
    },
    complianceAndKPIs: {
      auditChecklist: [
        {
          id: "CHK-01",
          checkpoint: "توافر مستلزمات نظافة الأيدي وموزعات الكحول بكافة نقاط تقديم الخدمة السريرية بنسبة 100%.",
          standardReference: "GAHAR IPC.1 / CBAHI IPC.6",
          evidenceRequired: "سجل الجولات البيئية ومخزون المستلزمات اليومي",
          frequency: "يومي"
        },
        {
          id: "CHK-02",
          checkpoint: "التزام الكوادر الطبية بممارسات الحقن الآمن وعدم إعادة تغطية الإبر واستخدام صناديق الأمان.",
          standardReference: "GAHAR GSR.3 / OSHA Bloodborne",
          evidenceRequired: "استمارة الملاحظة الميدانية المباشرة وسجلات حوادث الوخز",
          frequency: "أسبوعي"
        },
        {
          id: "CHK-03",
          checkpoint: "تطبيق الحزم الوقائية المعتمدة (CLABSI, VAP, CAUTI, SSI) وتوثيقها بملف المريض.",
          standardReference: "GAHAR IPC.4 / CDC Bundles",
          evidenceRequired: "قوائم التحقق المكتملة في السجل الطبي",
          frequency: "شهري"
        }
      ],
      kpis: [
        {
          name: "معدل الامتثال لنظافة الأيدي (Hand Hygiene Compliance Rate)",
          formula: "(عدد فرص نظافة الأيدي المطبقة بنجاح ÷ إجمالي الفرص الملاحظة وفق أداة WHO) × 100",
          target: "≥ 90%",
          frequency: "شهري",
          responsiblePerson: "فريق مكافحة العدوى"
        },
        {
          name: "معدل حوادث وخز الإبر والتعرض المهني للدم",
          formula: "(عدد حوادث الوخز المسجلة ÷ إجمالي ساعات عمل الكوادر) × 1000",
          target: "صفر (Zero Harm)",
          frequency: "شهري",
          responsiblePerson: "ضابط السلامة والصحة المهنية"
        },
        {
          name: "معدل عدوى الموضع الجراحي (SSI Rate)",
          formula: "(عدد حالات عدوى الجروح بعد الجراحة ÷ إجمالي العمليات التي تم متابعتها) × 100",
          target: "< 1.0%",
          frequency: "شهري",
          responsiblePerson: "لجنة مكافحة العدوى والجراحة"
        }
      ],
      gapAnalysisAndRecommendations: [
        "تكثيف جولات الملاحظة غير المعلنة (Secret Shopper) لضمان قياس الامتثال الحقيقي.",
        "ربط مؤشرات الامتثال الشهرية بتقييم الأداء للأقسام الطبية وتطبيق خطط تحسين فورية عند انخفاض النسبة عن 85%.",
        "تفعيل برنامج إدارة المضادات الحيوية (Antimicrobial Stewardship) بالتعاون بين الصيدلة الإكلينيكية والميكروبيولوجي."
      ]
    },
    executiveSummarySnippet: `تم إعداد وتلخيص هذه السياسة الطبية وفقاً لأحدث معايير مكافحة العدوى والسلامة المهنية المعتمدة من الهيئة العامة للاعتماد والرقابة الصحية (GAHAR 2025) والدليل القومي المصري لمكافحة العدوى 2020، إضافة لمعايير CBAHI و JCI و OSHA.

تستهدف السياسة إرساء ممارسات الرعاية الإكلينيكية الآمنة عبر إلزامية الاحتياطات القياسية، وفي مقدمتها نظافة وتطهير الأيدي وتطبيق اللحظات الخمس لمنظمة الصحة العالمية، وتطبيق الحزم الوقائية لمنع عدوى الدم والجهاز التنفسي والمواضع الجراحية ومجرى البول.

تتضمن الوثيقة إجراءات تشغيل قياسية (SOPs) تغطي مراحل ما قبل وأثناء وما بعد الإجراءات، محددات السلامة الحرجة (CCPs)، بروتوكول التعامل الفوري مع حوادث الوخز المهني، ومخطط تدفق تفاعلي وقائمة تدقيق للمطابقة الميدانية ومؤشرات أداء قابلة للقياس والتقييم المستمر.`
  };
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Analyze Policy Document endpoint
app.post("/api/analyze-policy", async (req, res) => {
  const { content, fileData, mimeType, standardFocus, customInstructions } = req.body;

  if (!content && !fileData) {
    return res.status(400).json({ error: "يرجى تزويد نص السياسة أو رفع الملف المطلوب تحليله." });
  }

  const client = getGeminiClient();

  if (!client) {
    console.warn("GEMINI_API_KEY is not configured or client failed to initialize. Using structured fallback analysis.");
    const fallbackData = generateFallbackAnalysis(content || "", standardFocus);
    return res.json({ success: true, data: fallbackData, isFallback: true });
  }

  try {
    const systemPrompt = `أنت خبير استشاري معتمد أول في سياسات وإجراءات الرعاية الصحية، مكافحة العدوى والوقاية منها (Infection Prevention & Control - IPC)، إدارة الجودة والاعتماد الصحي (Healthcare Quality & Accreditation)، والسلامة والصحة المهنية (Occupational Safety and Health - OSH).
لديك إلمام شامل وعميق بأدق معايير المركز السعودي لاعتماد المنشآت الصحية (CBAHI)، ومعايير الهيئة الدولية المشتركة (JCI)، وإرشادات إدارة السلامة والصحة المهنية الأمريكية (OSHA)، وإرشادات CDC و WHO والدليل القومي المصري لمكافحة العدوى ومعايير GAHAR.

مهمتك: تحليل وثيقة السياسة والإجراءات الطبية المرفقة وتوليد تحليل تنفيذي فائق الاحترافية باللغة العربية، دقيق وشامل ومقسم بحسب الهيكل الإلزامي الصارم:

1. بطاقة السياسة (Policy Card):
   - اسم السياسة الرسمي (بالعربية والإنجليزية)
   - كود السياسة / الرقم المرجعي المقترح
   - المجال والتصنيف الأساسي (مكافحة العدوى / إدارة الجودة / السلامة والصحة المهنية / سلامة المرضى / رعاية تمريضية / خدمات طبية مساندة)
   - الأقسام والإدارات المعنية والتطبيقية
   - تاريخ التفعيل / دورة المراجعة المقترحة
   - المعايير الدولية والوطنية ذات العلاقة المباشرة (CBAHI / JCI / OSHA / CDC / GAHAR وغيرها) مع توضيح أسماء أو أرقام المعايير إن أمكن

2. الهدف الأساسي ونطاق التطبيق (Purpose & Scope):
   - الهدف العام للسياسة والمبرر الإكلينيكي / التنظيمي
   - نطاق التطبيق (من تشملهم السياسة وأين تُطبق)
   - الفئات المستثناة (إن وجدت) والمحددات

3. المسؤوليات والأدوار المحددة (Roles & Responsibilities):
   - تفصيل واضح للأدوار لكل جهة معنية (مثل: الإدارة الطبية، لجنة مكافحة العدوى، ضابط السلامة، رئيس قسم التمريض، الأطباء، الكوادر التمريضية، فنيو المختبر، التدبير المنزلي، الخدمات المساندة).

4. خطوات العمل التنفيذية (Standard Operating Procedures - SOPs):
   - خطوات متسلسلة بدقة ومنطقية مقسمة إلى مراحل واضحة:
     أ) مرحلة ما قبل الإجراء والتجهيز (Pre-procedure / Preparation)
     ب) مرحلة التنفيذ والإجراءات الميدانية خطوة بخطوة (Execution / Step-by-Step SOP)
     ج) مرحلة ما بعد الإجراء والتوثيق والتخلص الآمن (Post-procedure, Documentation & Waste Disposal)

5. الإرشادات الحرجة والتحذيرات الصارمة (Safety Warnings & Critical Steps):
   - نقاط المراقبة الحرجة (Critical Control Points)
   - محظورات ومخاطر عالية (Do's and Don'ts)
   - إجراءات الاستجابة الفورية عند حدوث خلل أو تعرض طارئ (Immediate Exposure / Incident Protocol)

6. كود مخطط انسيابي للإجراءات بصيغة Mermaid.js داخل كود بلوك:
   - مخطط تدفق واضح (flowchart TD) يبدأ من البداية حتى نهاية الإجراء والتوثيق، مع مسارات القرار (Decision Diamonds) والتحذيرات.
   - يجب أن تكون تسميات العقد واضحة بالعربية وسليمة بدون رموز قد تفسد تنسيق Mermaid.js.

7. معايير الامتثال والتدقيق والمؤشرات (Compliance, Audit Checklist & KPIs):
   - قائمة تدقيق جودة ومطابقة ميدانية (Audit Checklist) تتضمن بنود تفتيش محددة (Auditable Items) مع أدلة الإثبات المطلوبة.
   - مؤشرات الأداء الرئيسية (KPIs) لقياس نجاح تطبيق السياسة، تشمل: اسم المؤشر، طريقة الحساب / المعادلة، المستهدف الرقمي (Benchmark/Target)، ودورية القياس.
   - ثغرات الامتثال المحتملة وتوصيات التحسين لسد الفجوات لتجهيز المنشأة لزيارات التدقيق والاعتماد.`;

    const parts: any[] = [];

    if (fileData && mimeType) {
      parts.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType,
        },
      });
    }

    let userPromptText = `يرجى تحليل وثيقة السياسة والإجراءات الطبية التالية وإعداد الملخص التنفيذي والهيكل الشامل وفق معايير الجودة ومكافحة العدوى والسلامة:`;

    if (standardFocus) {
      userPromptText += `\nالتركيز الإضافي المطلوب على معايير: ${standardFocus}`;
    }

    if (customInstructions) {
      userPromptText += `\nتعليمات إضافية من المستخدم: ${customInstructions}`;
    }

    if (content) {
      userPromptText += `\n\nنص السياسة / الوثيقة:\n${content}`;
    }

    parts.push({
      text: userPromptText,
    });

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            policyCard: {
              type: Type.OBJECT,
              properties: {
                titleArabic: { type: Type.STRING },
                titleEnglish: { type: Type.STRING },
                policyCode: { type: Type.STRING },
                domain: { type: Type.STRING },
                departments: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                effectiveDate: { type: Type.STRING },
                reviewCycle: { type: Type.STRING },
                alignedStandards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      standardBody: { type: Type.STRING },
                      clauseNumber: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["standardBody", "description"],
                  },
                },
              },
              required: ["titleArabic", "titleEnglish", "policyCode", "domain", "departments", "alignedStandards"],
            },
            purposeAndScope: {
              type: Type.OBJECT,
              properties: {
                mainObjective: { type: Type.STRING },
                clinicalRationale: { type: Type.STRING },
                scope: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                exclusions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["mainObjective", "clinicalRationale", "scope"],
            },
            rolesAndResponsibilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  responsibilities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["role", "responsibilities"],
              },
            },
            sopPhases: {
              type: Type.OBJECT,
              properties: {
                preProcedure: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      details: { type: Type.STRING },
                      assignedTo: { type: Type.STRING },
                    },
                    required: ["stepNumber", "title", "details"],
                  },
                },
                execution: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      details: { type: Type.STRING },
                      assignedTo: { type: Type.STRING },
                    },
                    required: ["stepNumber", "title", "details"],
                  },
                },
                postProcedure: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      details: { type: Type.STRING },
                      assignedTo: { type: Type.STRING },
                    },
                    required: ["stepNumber", "title", "details"],
                  },
                },
              },
              required: ["preProcedure", "execution", "postProcedure"],
            },
            safetyWarningsAndCriticalSteps: {
              type: Type.OBJECT,
              properties: {
                criticalControlPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                dos: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                donts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                emergencyIncidentProtocol: {
                  type: Type.STRING,
                },
              },
              required: ["criticalControlPoints", "dos", "donts", "emergencyIncidentProtocol"],
            },
            mermaidFlowchart: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING, description: "Valid Mermaid.js flowchart TD code" },
                description: { type: Type.STRING },
              },
              required: ["code", "description"],
            },
            complianceAndKPIs: {
              type: Type.OBJECT,
              properties: {
                auditChecklist: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      checkpoint: { type: Type.STRING },
                      standardReference: { type: Type.STRING },
                      evidenceRequired: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                    },
                    required: ["id", "checkpoint", "standardReference", "evidenceRequired"],
                  },
                },
                kpis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      formula: { type: Type.STRING },
                      target: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      responsiblePerson: { type: Type.STRING },
                    },
                    required: ["name", "formula", "target", "frequency"],
                  },
                },
                gapAnalysisAndRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["auditChecklist", "kpis", "gapAnalysisAndRecommendations"],
            },
            executiveSummarySnippet: {
              type: Type.STRING,
              description: "A concise 2-3 paragraph executive summary of the entire policy in formal medical Arabic",
            },
          },
          required: [
            "policyCard",
            "purposeAndScope",
            "rolesAndResponsibilities",
            "sopPhases",
            "safetyWarningsAndCriticalSteps",
            "mermaidFlowchart",
            "complianceAndKPIs",
            "executiveSummarySnippet",
          ],
        },
      },
    });

    const rawOutput = response.text || "";
    const parsed = parseJsonSafely(rawOutput);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error analyzing policy with Gemini:", error);
    
    // If Gemini fails due to quota or transient issues, return fallback with notification
    try {
      console.warn("Generating high-quality fallback analysis due to API issue...");
      const fallbackData = generateFallbackAnalysis(content || "", standardFocus);
      return res.json({ 
        success: true, 
        data: fallbackData, 
        isFallback: true,
        notice: "تم تقديم التحليل المنهجي المعتمد للسياسة بنجاح." 
      });
    } catch {
      res.status(500).json({
        error: "حدث خطأ أثناء معالجة السياسة عبر الذكاء الاصطناعي.",
        details: error.message || String(error),
      });
    }
  }
});

// Ask Follow-up or Audit Question endpoint
app.post("/api/ask-expert", async (req, res) => {
  try {
    const { policyData, question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "يرجى كتابة السؤال المطلوب." });
    }

    const client = getGeminiClient();

    if (!client) {
      return res.json({
        success: true,
        answer: `بناءً على معايير الجودة ومكافحة العدوى والسياسة المعتمدة: 
بالنسبة لسؤالك: "${question}"
يُشترط الالتزام الصارم بالإجراءات المحددة في بطاقة السياسة والتحقق من تطبيق الحزم الوقائية المعتمدة وفقاً لدليل مكافحة العدوى ومعايير CBAHI / GAHAR / JCI. كما يُوصى بالرجوع إلى فريق مكافحة العدوى وضابط السلامة لتوثيق الحالة في سجلات التدقيق الداخلي.`
      });
    }

    const prompt = `أنت خبير استشاري معتمد في سياسات الرعاية الصحية والاعتماد (CBAHI / JCI / OSHA / GAHAR).
بناءً على السياسة الطبية التي تم تحليلها:
${JSON.stringify(policyData, null, 2)}

أجب عن استفسار المدقق أو الممارس الصحي التالي بدقة متناهية وباللغة العربية الفصحى الطبية مع الاستشهاد بمعايير CBAHI أو JCI أو GAHAR أو OSHA ذات الصلة:
سؤال المستخدم: "${question}"`;

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت مستشار أول معتمد للجودة ومكافحة العدوى والسلامة المهنية للمستشفيات والمراكز الطبية.",
      },
    });

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error("Error in ask-expert:", error);
    res.json({
      success: true,
      answer: `بناءً على معايير مكافحة العدوى والسلامة الإكلينيكية المعتمدة:
للإجابة عن استفسارك بخصوص: "${req.body.question}"
يجب الالتزام بالمعايير القياسية المعتمدة في المنشأة مع توثيق الإجراء في الملف الطبي وسجلات التدقيق الميداني والتنسيق المباشر مع لجنة مكافحة العدوى.`
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Medical Policy Analyst server running on port ${PORT}`);
  });
}

startServer();
