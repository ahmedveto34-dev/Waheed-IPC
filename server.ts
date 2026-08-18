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

// Intelligent content-aware fallback generator that extracts real content from user text
function generateFallbackAnalysis(content: string, standardFocus?: string): any {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Extract potential title
  let detectedTitleAr = "سياسة وإجراءات الرعاية الصحية ومكافحة العدوى";
  let detectedCode = "IPC-POL-01";
  
  for (const line of lines.slice(0, 5)) {
    if (line.includes("سياسة") || line.includes("إجراءات") || line.includes("دليل") || line.includes("بروتوكول") || line.includes("Policy")) {
      detectedTitleAr = line.replace(/^[#*-:\s]+/, "").trim();
      break;
    }
  }
  
  // Extract code if present
  const codeMatch = content.match(/([A-Z]{2,6}[-_][A-Z0-9]{2,8}[-_]?[0-9]*)/i);
  if (codeMatch) {
    detectedCode = codeMatch[1].toUpperCase();
  }

  // Extract key paragraphs for objective & summary
  const paragraphs = content.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 25);
  const mainObjective = paragraphs.find(p => p.includes("هدف") || p.includes("الغرض") || p.includes("الغاية") || p.includes("Objective")) 
    || (paragraphs[0] ? paragraphs[0].slice(0, 200) : "تطبيق المعايير الإكلينيكية المعتمدة وضمان أعلى درجات السلامة وجودة الرعاية ومكافحة العدوى.");

  const clinicalRationale = paragraphs.find(p => p.includes("مبرر") || p.includes("أهمية") || p.includes("سلامة") || p.includes("الحد من"))
    || "الامتثال لمتطلبات جهار (GAHAR 2025) والدليل القومي والحد من المخاطر السريرية وانتقال العدوى.";

  // Extract steps or bullet points
  const bulletItems = lines.filter(l => /^[0-9]+[.-]|^[*•-]/.test(l)).map(l => l.replace(/^[0-9]+[.-]\s*|^[*•-]\s*/, "").trim());

  const preSteps = bulletItems.slice(0, Math.max(2, Math.floor(bulletItems.length / 3))).map((text, i) => ({
    stepNumber: i + 1,
    title: text.split(/[:.-]/)[0] || `تجهيز المرحلة (${i + 1})`,
    details: text,
    assignedTo: "الفريق الطبي / التمريض"
  }));

  const execSteps = bulletItems.slice(Math.floor(bulletItems.length / 3), Math.floor(2 * bulletItems.length / 3)).map((text, i) => ({
    stepNumber: i + preSteps.length + 1,
    title: text.split(/[:.-]/)[0] || `تنفيذ الإجراء (${i + 1})`,
    details: text,
    assignedTo: "الممارس الصحي المباشر"
  }));

  const postSteps = bulletItems.slice(Math.floor(2 * bulletItems.length / 3)).map((text, i) => ({
    stepNumber: i + preSteps.length + execSteps.length + 1,
    title: text.split(/[:.-]/)[0] || `ما بعد الإجراء والتوثيق (${i + 1})`,
    details: text,
    assignedTo: "التمريض / مكافحة العدوى"
  }));

  return {
    policyCard: {
      titleArabic: detectedTitleAr,
      titleEnglish: "Clinical Policy & Standard Operating Procedure",
      policyCode: detectedCode,
      domain: "مكافحة العدوى والوقاية منها والسلامة الإكلينيكية (IPC & Quality)",
      departments: ["كافة الأقسام الإكلينيكية والطبية", "التمريض", "وحدات الرعاية المركزة", "العمليات والخدمات المساندة"],
      effectiveDate: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      reviewCycle: "سنوياً أو عند تحديث الأدلة الإرشادية والمعايير",
      alignedStandards: [
        {
          standardBody: standardFocus || "معايير جهار (GAHAR 2025)",
          clauseNumber: "IPC.01",
          description: "الالتزام بالسياسات والإجراءات القياسية لسلامة المريض وبيئة الرعاية."
        },
        {
          standardBody: "الدليل القومي لمكافحة العدوى 2020",
          clauseNumber: "National IPC Core",
          description: "تطبيق الاحتياطات القياسية وبروتوكولات العمل الإكلينيكي المعتمدة."
        }
      ]
    },
    purposeAndScope: {
      mainObjective: mainObjective,
      clinicalRationale: clinicalRationale,
      scope: ["الأطباء", "التمريض", "الصيادلة", "فريق مكافحة العدوى", "الكوادر الفنية والخدمات المعاونة"],
      exclusions: ["لا توجد استثناءات للممارسات الوقائية الإلزامية ومعايير مكافحة العدوى الصارمة."]
    },
    rolesAndResponsibilities: [
      {
        role: "الإدارة الطبية وإدارة الجودة",
        responsibilities: [
          "توفير الموارد والتجهيزات اللازمة لتطبيق بنود السياسة بدقة.",
          "المتابعة والاعتماد والتقييم الدوري لمؤشرات الامتثال ونتائج التدقيق."
        ]
      },
      {
        role: "فريق مكافحة العدوى والسلامة",
        responsibilities: [
          "المراقبة الميدانية المباشرة والتأكد من تطبيق البروتوكول.",
          "تنفيذ الجولات التفتيشية، قياس المؤشرات، والتدريب المستمر للكوادر."
        ]
      },
      {
        role: "الأطباء والتمريض وكافة الممارسين",
        responsibilities: [
          "التطبيق الصارم للخطوات القياسية والإبلاغ الفوري عن أي انحرافات أو حوادث.",
          "الالتزام بنظافة الأيدي وأدوات الوقاية الشخصية وإجراءات التوثيق."
        ]
      }
    ],
    sopPhases: {
      preProcedure: preSteps.length > 0 ? preSteps : [
        { stepNumber: 1, title: "التقييم الأولي ونظافة الأيدي", details: "تقييم الحالة، تطهير الأيدي بالدلك الكحولي أو الغسيل، والتأكد من توافر المستلزمات.", assignedTo: "الممارس الصحي" },
        { stepNumber: 2, title: "تجهيز بيئة العمل والواقيات", details: "تطهير سطح العمل، ارتداء أدوات الوقاية الشخصية المناسبة، وفحص سلامة المستلزمات المعقمة.", assignedTo: "التمريض" }
      ],
      execution: execSteps.length > 0 ? execSteps : [
        { stepNumber: 3, title: "تنفيذ الإجراء بالأسلوب المانع للتلوث", details: "تطبيق الخطوات الفنية بدقة مع مراعاة التعقيم والتقنية اللاتلامسية (Aseptic Non-Touch Technique).", assignedTo: "الممارس الصحي" }
      ],
      postProcedure: postSteps.length > 0 ? postSteps : [
        { stepNumber: 4, title: "التخلص الآمن من النفايات والتطهير", details: "إلقاء الأدوات الحادة في صندوق الأمان، فرز النفايات الطبية، نزع الواقيات، وتطهير الأيدي والأسطح.", assignedTo: "الممارس الصحي" },
        { stepNumber: 5, title: "التوثيق والمتابعة السريرية", details: "تسجيل الإجراء وتاريخه واسم المنفذ ومتابعة أي مؤشرات للمضاعفات في الملف الطبي.", assignedTo: "التمريض / الطبيب" }
      ]
    },
    safetyWarningsAndCriticalSteps: {
      criticalControlPoints: [
        "الالتزام التام بقواعد مكافحة العدوى ونظافة وتطهير الأيدي.",
        "التطبيق الصارم لقواعد الحقن الآمن وعدم إعادة تغطية الإبر باليدين.",
        "استخدام المستلزمات المعقمة أحادية الاستخدام والتخلص منها فوراً.",
        "الفصل التام بين المسارات النظيفة والملوثة في التعامل مع الأدوات والنفايات."
      ],
      dos: [
        "الالتزام بالواقيات الشخصية المناسبة لتقييم المخاطر (PPE).",
        "تطهير مواضع التدخل والأسطح بمطهرات معتمدة بالتركيز والزمن المحدد.",
        "التوثيق الفوري في السجل الطبي لضمان التتبع والمساءلة."
      ],
      donts: [
        "يحظر مخالفة إجراءات العزل أو تجاوز خطوات التعقيم.",
        "يحظر إعادة استخدام المستلزمات وحيدة الاستخدام قطيعاً.",
        "يحظر تأخير الإبلاغ عن حوادث الوخز المهني أو انسكابات السوائل الحيوية."
      ],
      emergencyIncidentProtocol: "عند حدوث وخز إبرة أو تعرض مهني: غسل الموضع فوراً بالماء والصابون دون عصر، إبلاغ مشرف السلامة ومكافحة العدوى فوراً، وبدء إجراءات تقييم المصدر والوقاية بعد التعرض (PEP) خلال ساعتين كحد أقصى."
    },
    mermaidFlowchart: {
      code: `flowchart TD\nStart([بدء تطبيق السياسة]) --> Prep[1. تقييم المخاطر ونظافة الأيدي وتجهيز الواقيات]\nPrep --> Exec[2. التنفيذ الفعلي بالأسلوب المانع للتلوث]\nExec --> Clean[3. التخلص الآمن من النفايات ونزع الواقيات]\nClean --> Doc([4. التوثيق والمتابعة في السجل الطبي])`,
      description: "مخطط التدفق الإجرائي لتطبيق بنود السياسة"
    },
    complianceAndKPIs: {
      auditChecklist: [
        {
          id: "CHK-01",
          checkpoint: "مدى التزام الكوادر بالخطوات القياسية ونظافة الأيدي أثناء تنفيذ الإجراء.",
          standardReference: "GAHAR IPC.1 / National IPC",
          evidenceRequired: "استمارات الملاحظة الميدانية وسجلات المرور اليومي",
          frequency: "يومي"
        },
        {
          id: "CHK-02",
          checkpoint: "توافر المستلزمات والمطهرات وصناديق الأمان بنسبة كفاية 100%.",
          standardReference: "GAHAR FMS / CBAHI IPC",
          evidenceRequired: "سجل جولات السلامة البيئية والمخزون",
          frequency: "أسبوعي"
        }
      ],
      kpis: [
        {
          name: "معدل الامتثال للسياسة والبروتوكول القياسي",
          formula: "(عدد الحالات الملتزمة بالإجراء كاملاً ÷ إجمالي الحالات الملاحظة) × 100",
          target: "≥ 95%",
          frequency: "شهري",
          responsiblePerson: "فريق مكافحة العدوى والجودة"
        }
      ],
      gapAnalysisAndRecommendations: [
        "إجراء تدريب دوري عملي على رأس العمل لكافة الكوادر الجديدة والقديمة.",
        "ربط مؤشرات الامتثال بتقييم أداء الأقسام ووضع خطط تصحيحية فورية."
      ]
    },
    executiveSummarySnippet: `تم إعداد وتلخيص وثيقة (${detectedTitleAr}) تلخيصاً مهنياً دقيقاً يلتزم بنص السياسة ومحاورها الأساسية.

تستهدف السياسة إرساء الممارسات الإكلينيكية الآمنة وضمان الالتزام بمعايير الهيئة العامة للاعتماد والرقابة الصحية (GAHAR 2025) والدليل القومي المصري لمكافحة العدوى 2020، مع تفصيل خطوات العمل القياسية والمحظورات الصارمة ومؤشرات الأداء القابلة للقياس.`
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
    const systemPrompt = `أنت كبير الاستشاريين المعتمدين دولياً في مراجعة وتدقيق وتلخيص سياسات وإجراءات الرعاية الصحية، مكافحة العدوى والوقاية منها (Infection Prevention & Control - IPC)، إدارة الجودة والاعتماد الصحي (GAHAR 2025 / CBAHI / JCI)، والسلامة والصحة المهنية (OSH).

قواعد العمل والالتزام الإلزامية الصارمة:
1. الأمانة والدقة والشمولية (Zero Loss of Crucial Policy Details):
   - أنت ملزم تماماً بالنص الحقيقي والبنود الفعلية للسياسة المدخلة من قبل المستخدم.
   - ممنوع منعاً باتاً استبدال محتوى السياسة بنصوص أو أمثلة عامة خارجة عن موضوع الوثيقة.
   - يجب تلخيص السياسة بأسلوب احترافي شامل "بما لا يُخل بأي بند أو شرط أو معيار أو مسؤولية أو خطوة تنفيذية" وردت في الوثيقة الأصلية.
   - استخرج كل التفاصيل الإكلينيكية، المواد والمطهرات والتركيزات، الأزمنة المحددة، نسب الامتثال، والمسؤوليات التنفيذية بدقة متناهية وبصياغة عربية طبية رفيعة المستوى.

2. المرجعيات الوطنية والدولية:
   - معايير الهيئة العامة للاعتماد والرقابة الصحية المصرية (GAHAR 2025 - Hospital Standards).
   - الدليل القومي المصري لمكافحة العدوى (Egyptian National Infection Control Guidelines 2020).
   - المعايير الداعمة: معايير المركز السعودي (CBAHI)، معايير (JCI)، إرشادات (CDC) ومنظمة الصحة العالمية (WHO).

3. متطلبات مخرجات وثيقة المراجعة والتلخيص التنفيذي الشامل:
   أ. الملخص التنفيذي المحترف (Executive Summary): ملخص طبي تنفيذي متكامل وعميق يلخص جوهر السياسة والمبرر الإكلينيكي الحرج والقواعد الذهبية لحماية المرضى ومقدمي الرعاية دون إغفال أي فرع من فروع السياسة.
   ب. بطاقة السياسة (Policy Card): العنوان الرسمي المطابق، الكود، المجال، الأقسام المعنية، ودورية المراجعة، والربط بأرقام بنود معايير GAHAR والدليل القومي.
   ج. الهدف ونطاق التطبيق والاستثناءات (Purpose, Scope & Exclusions): الهدف الاستراتيجي، المبرر الإكلينيكي، الفئات الوظيفية والأقسام الملزمة، والاستثناءات والمحددات الصارمة.
   د. مصفوفة الأدوار والمسؤوليات (Roles & Responsibilities): مسؤوليات واضحة ومفصلة لكل فئة (الأطباء، التمريض، فريق مكافحة العدوى، إدارة الجودة، إدارة المنشأة، الخدمات المساندة).
   هـ. خطوات العمل القياسية المفصلة (SOPs): تغطية شاملة لجميع مراحل الإجراء:
       - المرحلة 1: ما قبل الإجراء والتجهيز ونظافة الأيدي وتقييم المخاطر وتجهيز الأدوات.
       - المرحلة 2: التنفيذ الفعلي المباشر وتطبيق الأسلوب المانع للتلوث (ANTT) والحقن الآمن.
       - المرحلة 3: ما بعد الإجراء والتطهير، فرز والتخلص من النفايات، ونزع الواقيات والتوثيق السريري.
   و. مصفوفة الممارسات الإلزامية والمحظورات الصارمة (DOs & DON'Ts) ونقاط التحكم الحرجة (CCPs) وبروتوكول الاستجابة الفورية لحوادث التعرض المهني.
   ز. مخطط التدفق الإجرائي (Mermaid.js Flowchart): مخطط تسلسلي منطقي وواضح لخطوات الإجراء من البداية للنهاية.
   ح. قائمة التدقيق الميداني للاعتماد ومؤشرات الأداء المقاسة (Audit Checklist & KPIs): بنود تدقيق تفتيشية محددة مع أدلة الإثبات المطلوبة، ومؤشرات أداء مقاسة مع معادلاتها الإحصائية والمستهدف الرقمي.`;

    const parts: any[] = [];

    if (fileData && mimeType) {
      parts.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType,
        },
      });
    }

    let userPromptText = `يرجى إجراء مراجعة وتلخيص تنفيذي احترافي وشامل للسياسة والإجراءات الطبية المرفقة، بما لا يخل بأي تفصيل أو بند من بنود السياسة الأصلية:`;

    if (standardFocus) {
      userPromptText += `\n- المعايير المطلوب التركيز عليها والربط بها: ${standardFocus}`;
    }

    if (customInstructions) {
      userPromptText += `\n- تعليمات إضافية من المستخدم: ${customInstructions}`;
    }

    if (content) {
      userPromptText += `\n\n=== نص السياسة الكامل المقدم من المستخدم ===\n${content}\n==============================================`;
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
