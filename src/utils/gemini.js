// src/utils/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("REDACTED");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // غيّر لـ "gemini-1.5-pro-latest" لو عايز قوة أكبر (لسه مجاني)
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  },
});

export const analyzeWithGemini = async (firebaseData, customPrompt = null) => {
  const defaultPrompt = `
أنت خبير تحليل بيانات محترف وبتتكلم عربي ممتاز.

البيانات دي جاية من Firebase دلوقتي:
${JSON.stringify(firebaseData, null, 2)}

اعمل تحليل شامل بالعربي الفصحى أو العامية المصري حسب اللي شايفه مناسب، ويكون فيه:

1. ملخص سريع في 3-5 جمل بس
2. إحصائيات دقيقة (عدد العناصر، المجاميع، المتوسطات، الأعلى والأقل، التوزيع لو موجود)
3. أي أنماط أو مشاكل واضحة في البيانات
4. 3 توصيات عملية قابلة للتنفيذ فوراً
5. استخدم جداول Markdown للأرقام الكتير عشان تكون واضحة

رد بصيغة جميلة ومنسقة وسهلة القراءة.
`;

  try {
    const result = await model.generateContent(customPrompt || defaultPrompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("خطأ في Gemini:", error);

    
    return `عذراً، حصل مشكلة في الاتصال بالذكاء الاصطناعي.\nالتفاصيل: ${error.message}\n\nجرب تاني بعد شوية أو تأكد إن النت شغال كويس.`;
  }
};

// اختبار سريع (اختياري - امسح السطر ده لو مش عايزه)
// console.log("Gemini جاهز للتحليل يا وحش!");
