// src/ai/aiEmbeddings.js

export async function getEmbeddings(items) {
  const HF_API_KEY = process.env.REACT_APP_HF_API_KEY;

  if (!HF_API_KEY) {
    console.warn(
      "Missing REACT_APP_HF_API_KEY; embeddings requests will be skipped."
    );
    return [];
  }

  try {
    // تحويل المنتجات إلى نصوص جاهزة للـ Embeddings
    const promptTexts = items.map(
      (item) => `${item.name ?? ""} ${item.description ?? ""}`
    );

    // استدعاء API
    const res = await fetch("https://api.openrouter.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`, // ضع مفتاحك هنا
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: promptTexts,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // تحقق إذا في data
    if (!data.data) {
      throw new Error("No embeddings returned from API");
    }

    return data.data; // array of embeddings
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    return []; // ارجع array فارغ بدل ما تقع التطبيق
  }
}
