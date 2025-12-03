/**
 * API service for analysis requests
 * Handles communication with the analysis worker
 */

const WORKER_URL = "http://127.0.0.1:8787/";

/**
 * Send analysis request to the worker
 * @param {Object} payload - Request payload with prompt
 * @param {string} payload.prompt - The analysis prompt
 * @returns {Promise<Object>} Analysis response data
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
