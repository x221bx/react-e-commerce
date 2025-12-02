// src/hooks/useAIChat.js
import { useState } from "react";
import { aiSearchProducts } from "./useAIProductSearch";

const MAX_CONTEXT_MESSAGES = 20;

/* ------------------------------ Normalization ------------------------------ */
function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "")
    .replace(/[^a-z\u0600-\u06FF0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------ Toxic Filter ------------------------------ */
const TOXIC = [
  "انتحار",
  "اقتل",
  "قتل نفسي",
  "قتل",
  "مخدرات",
  "تفجير",
  "قنبله",
  "سلاح",
  "كراهية",
  "عنصريه",
  "fuck",
  "shit",
  "suicide",
  "kill myself",
];

function isToxic(text = "") {
  const t = normalize(text);
  return TOXIC.some((w) => t.includes(w));
}

function safeJson(str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/* -------------------------- هل المستخدم طلب بدائل؟ ------------------------- */
function wantsAlternatives(message = "") {
  const norm = normalize(message);
  const altWords = [
    "بدائل",
    "اختيارات",
    "اختيارين",
    "اختيارين",
    "اختيار تاني",
    "منتجات تانيه",
    "منتج تاني",
    "اكثر من",
    "بديل",
    "ثلاثه",
    "ثلاثة",
    "٣ منتجات",
    "3 منتجات",
    "كم اختيار",
    "كذا اختيار",
  ];

  return altWords.some((w) => norm.includes(normalize(w)));
}

/* -------------------------------------------------------------------------- */
/*                          ⭐ useAIChat — Main Hook ⭐                         */
/* -------------------------------------------------------------------------- */

export function useAIChat() {
  const [messages, setMessages] = useState([]);
  const API_KEY = import.meta.env.VITE_OPENAI_KEY;

  /* ------------------------- 1) فهم نية المستخدم -------------------------- */
  async function understandIntent(message) {
    if (!API_KEY) return {};

    try {
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: `
حلّل الجملة التالية واستخرج نية المستخدم بالتفصيل.

اخرج JSON فقط بدون أي شرح إضافي:

{
  "crop": "",
  "problem": "",
  "product_type": "",
  "budget": "",
  "goal": "",
  "search_query": "",
  "should_recommend_product": "",
  "area_value": "",
  "area_unit": "",
  "trees_count": "",
  "wants_alternatives": ""
}

/*
- crop: المحصول إن وجد (قمح، ذره، بطاطس، طماطم...)
- problem: المشكلة (اصفرار، حشائش، حشرات، مرض فطري، ضعف نمو...)
- product_type: استنتج نوع المنتج (سماد، سماد ورقي، مغذي نباتي، مبيد حشري، مبيد حشائش، منظم نمو، منشط جذور...)
- budget: استخرج رقم الميزانية فقط بالجنيه (بدون كلمة جنيه)
- goal: الهدف (زيادة الإنتاج، علاج الاصفرار، تقوية الجذور...)
- search_query: كوييري عربي قصير يمثل أفضل وصف لما يحتاجه المستخدم
- should_recommend_product: "yes" لو الهدف شراء منتج أو ترشيح، "no" لو السؤال نظري بحت
- area_value: لو المستخدم ذكر مساحة (1 فدان، 5 قيراط، 200 متر...) استخرج الرقم فقط
- area_unit: "فدان" أو "قيراط" أو "متر" أو "شجرة" أو "خط" أو "سطور" حسب ما تفهم من الجملة
- trees_count: لو تكلم عن عدد أشجار (مثلاً 20 شجرة مانجا) استخرج العدد هنا
- wants_alternatives: "yes" لو الجملة فيها معنى "بدائل" أو "اختيارات" أو "أكتر من منتج"، وإلا "no"
*/

الجملة:
"${message}"
`,
        }),
      });

      const data = await res.json();

      const raw =
        data.output_text ||
        data.output?.[0]?.content?.[0]?.text?.value ||
        "{}";

      return safeJson(raw, {});
    } catch (err) {
      console.log("Intent Error:", err);
      return {};
    }
  }

  /* ------------------------- 2) Streaming للرد -------------------------- */
  async function streamAIReply({ userMessage, context, intent, onToken }) {
    if (!API_KEY) {
      const msg = "⚠️ مفتاح OpenAI (VITE_OPENAI_KEY) غير موجود.";
      onToken(msg);
      return msg;
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          {
            role: "system",
            content: `
أنت مستشار زراعي محترف + مساعد عام مثل ChatGPT.

قدراتك:
- تفهم تفاصيل المحصول، المشكلة، المرحلة، الميزانية، الهدف.
- تفهم المساحات: فدان، قيراط، متر، عدد الأشجار... وتقدّر الجرعات تقريبياً.
- تقترح برامج تسميد وري ورش مناسبة لكل حالة.
- تذكر الجرعات بصيغة آمنة إرشادية (مثلاً: من 200-300 سم لكل 100 لتر، أو 1 لتر للفدان تقريباً).
- تضيف تحذيرات السلامة (لبس واقي، تجنب الرش في الحر الشديد...).
- في الأسئلة العامة (غير زراعية) ترد بشكل عادي مثل ChatGPT.

مهم جداً:
- لا تذكر أسماء منتجات بعينها (المنتجات ستُضاف لاحقاً تلقائياً).
- لا تكتب أي كود HTML أو React أو productCard.
- ركّز على الشرح العلمي + الخلاصة العملية.
- استخدم عربية بسيطة (فصحى سهلة أو لهجة مصرية خفيفة).
- لو ذكر المستخدم مساحة أو فدان أو عدد أشجار، حاول تقدير جرعات تقريبية بوضوح.
- أكّد دائماً أن الجرعات استرشادية وأن يراعي نشرات المنتج على العبوة.
`,
          },
          ...context,
          {
            role: "user",
            content: `
سؤال المستخدم:
${userMessage}

فهم نية المستخدم (intent):
${JSON.stringify(intent || {}, null, 2)}
`,
          },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      const msg = text || "⚠️ خطأ في الاتصال بالمساعد الذكي.";
      onToken(msg);
      return msg;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let done = false;
    let fullText = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (done || !value) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter((l) => l.trim().startsWith("data:"));

      for (const line of lines) {
        const txt = line.replace("data:", "").trim();
        if (!txt || txt === "[DONE]") continue;

        try {
          const json = JSON.parse(txt);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onToken(delta);
          }
        } catch {
          // ignore malformed chunks
        }
      }
    }

    if (!fullText) {
      const msg = "⚠️ لم أستطع توليد رد مناسب الآن.";
      onToken(msg);
      return msg;
    }

    return fullText;
  }

  /* ------------------------- بناء كوييريات البحث ------------------------- */
  function buildQueries(message, intent = {}) {
    const q = new Set();

    const normMsg = normalize(message);
    if (normMsg) q.add(normMsg);

    if (intent.crop) q.add(normalize(intent.crop));
    if (intent.product_type) q.add(normalize(intent.product_type));
    if (intent.problem) q.add(normalize(intent.problem));
    if (intent.goal) q.add(normalize(intent.goal));
    if (intent.search_query) q.add(normalize(intent.search_query));

    normMsg
      .split(" ")
      .filter((w) => w.length > 2)
      .forEach((w) => q.add(w));

    return Array.from(q);
  }

  /* ---------------------- البحث عن منتجات + Ranking ---------------------- */
  async function findProductsForMessage(message, intent, maxCount) {
    if (intent?.should_recommend_product === "no") return [];

    const queries = buildQueries(message, intent);

    const collected = [];
    for (const q of queries) {
      const found = await aiSearchProducts({ keyword: q, intent });
      if (found.length) {
        for (const p of found) {
          if (!collected.find((x) => x.id === p.id)) {
            collected.push(p);
          }
        }
      }
      if (collected.length >= maxCount * 3) break;
    }

    if (!collected.length) return [];

    // فلترة بالميزانية
    if (intent?.budget) {
      const b = Number(intent.budget);
      if (!isNaN(b) && b > 0) {
        const within = collected.filter((p) => Number(p.price) <= b);

        if (within.length > 0) {
          return {
            type: "normal",
            items: within.slice(0, maxCount),
          };
        }

        // مفيش منتج في الميزانية → أقرب حاجات
        return {
          type: "lowBudget",
          items: collected.slice(0, maxCount),
        };
      }
    }

    // الوضع العادي
    return {
      type: "normal",
      items: collected.slice(0, maxCount),
    };
  }

  /* ------------------------------ sendMessage ------------------------------ */
  async function sendMessage(userMessage) {
    const trimmed = userMessage.trim();
    if (!trimmed) return;

    // فلتر محتوى مسيء/خطير
    if (isToxic(trimmed)) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content:
            "أنا هنا للمساعدة في الأسئلة الزراعية والمعلومات المفيدة فقط 🌿\n" +
            "لو عندك أي استشارة عن المحاصيل، الأسمدة، المبيدات أو برامج التسميد والري، اسألني براحتك.",
        },
      ]);
      return;
    }

    // أضف رسالة المستخدم
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    // سياق المحادثة
    const baseContext = [...messages, { role: "user", content: trimmed }];
    const contextSnapshot = baseContext.slice(-MAX_CONTEXT_MESSAGES);

    // هنضيف رسالة فاضية للمساعد علشان الـ streaming
    const assistantId = Date.now() + Math.random();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    // نفهم النية بالتوازي
    const intentPromise = understandIntent(trimmed);

    // نعرف هل المستخدم طلب بدائل ولا لأ (من نصه + intent)
    const localAlt = wantsAlternatives(trimmed);
    let intent = {};
    try {
      intent = await intentPromise;
    } catch {
      intent = {};
    }

    const wantsAltFromIntent = intent?.wants_alternatives === "yes";
    const maxProducts = localAlt || wantsAltFromIntent ? 3 : 1;

    // نبدأ Streaming للرد مع تمرير intent للسياق
    let finalAIText = "";
    try {
      finalAIText = await streamAIReply({
        userMessage: trimmed,
        context: contextSnapshot,
        intent,
        onToken: (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((m) => m.id === assistantId);
            if (index === -1) return prev;

            updated[index] = {
              ...updated[index],
              content: (updated[index].content || "") + token,
            };
            return updated;
          });
        },
      });
    } catch (err) {
      console.error("Streaming error:", err);
      finalAIText =
        "⚠️ حصل خطأ أثناء الاتصال بالمساعد الذكي، حاول مرة تانية بعد شوية.";
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((m) => m.id === assistantId);
        if (index === -1)
          return [...prev, { role: "assistant", content: finalAIText }];

        updated[index] = {
          ...updated[index],
          content: finalAIText,
        };
        return updated;
      });
      return;
    }

    // بحث عن منتجات مناسبة
    const productResult = await findProductsForMessage(
      trimmed,
      intent,
      maxProducts
    );

    // مفيش منتجات خالص
    if (!productResult || !productResult.items || productResult.items.length === 0) {
      const extra =
        "\n\n❌ لم أجد منتجات مناسبة لسؤالك حاليًا من الكتالوج.\n" +
        "تقدر تتصفح كل المنتجات المتاحة من هنا:\n" +
        "/products";

      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((m) => m.id === assistantId);
        if (index === -1) {
          return [
            ...prev,
            { role: "assistant", content: (finalAIText || "") + extra },
          ];
        }
        updated[index] = {
          ...updated[index],
          content: (updated[index].content || finalAIText || "") + extra,
        };
        return updated;
      });

      return;
    }

    const { type, items } = productResult;

    let extra = "";

    if (type === "lowBudget") {
      extra +=
        "\n\n⚠️ الميزانية أقل من سعر أي منتج متاح لنفس الاستخدام.\n" +
        "دي أقرب منتجات ممكن تناسبك حاليًا:\n\n";
    } else {
      if (items.length === 1) {
        extra += "\n\n🛒 أنسب منتج لحالتك من متجرنا:\n\n";
      } else {
        extra += "\n\n🛒 ترشيحات مناسبة لحالتك (أكثر من اختيار):\n\n";
      }
    }

    items.forEach((p) => {
      extra += `<productCard id="${p.id}"></productCard>\n\n`;
    });

    // دمج الكروت مع الرد
    setMessages((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((m) => m.id === assistantId);

      if (index === -1) {
        return [
          ...prev,
          { role: "assistant", content: (finalAIText || "") + extra },
        ];
      }

      updated[index] = {
        ...updated[index],
        content: (updated[index].content || finalAIText || "") + extra,
      };
      return updated;
    });
  }

  return { messages, sendMessage, setMessages };
}
