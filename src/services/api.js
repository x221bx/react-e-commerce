// src/services/api.js
const WORKER_URL = "http://127.0.0.1:8787/"; // رابط Worker محلي أو Production

/**
 * runAnalysis
 * دالة لإرسال طلب تحليل للـ Worker
 * @param {Object} payload { prompt: "..." }
 */
export async function runAnalysis(payload = {}) {
  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
