// Product RAG Index service: builds and queries a semantic index for products stored in Firestore.
// Uses OpenRouter (VITE_OR_KEY) for embeddings and chat completions.

import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const OPENROUTER_EMBED_URL = "https://api.openrouter.ai/v1/embeddings";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_CHAT = "google/gemma-2b-it";
const MODEL_EMBED = "text-embedding-3-small"; // OpenAI-compatible name supported by OpenRouter

const getOrKey = () => {
  const key = import.meta.env.VITE_OR_KEY;
  if (!key) throw new Error("Missing OpenRouter key VITE_OR_KEY");
  return key;
};

const HEADERS = (key) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`,
  "HTTP-Referer": "http://localhost",
  "X-Title": "Farm-Vet-E-Shop",
});

const cosineSim = (a = [], b = []) => {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
};

const toText = (product) => {
  const title = product.title || product.name || "";
  const desc = product.description || product.details || "";
  const tags = Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "";
  const category = product.category || product.type || "";
  return [title, desc, tags, category].filter(Boolean).join("\n");
};

export const buildProductIndex = async ({ productsCollection = "products", vectorsCollection = "products_vectors" } = {}) => {
  const apiKey = getOrKey();
  // Fetch all products
  const snap = await getDocs(collection(db, productsCollection));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Generate embeddings in small batches to be gentle on rate limits
  const BATCH = 16;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    const inputs = batch.map((p) => toText(p));

    const res = await fetch(OPENROUTER_EMBED_URL, {
      method: "POST",
      headers: HEADERS(apiKey),
      body: JSON.stringify({
        model: MODEL_EMBED,
        input: inputs,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => res.statusText);
      throw new Error(`Embedding request failed: ${t}`);
    }
    const data = await res.json();
    const vectors = data.data?.map((e) => e.embedding) || [];

    // Persist vectors with product metadata
    await Promise.all(
      batch.map((p, idx) =>
        setDoc(doc(db, vectorsCollection, p.id), {
          productId: p.id,
          vector: vectors[idx] || [],
          title: p.title || p.name || "",
          tags: p.tags || [],
          updatedAt: Date.now(),
        })
      )
    );
  }

  return { count: items.length };
};

export const upsertProductVector = async (productId, { productsCollection = "products", vectorsCollection = "products_vectors" } = {}) => {
  const apiKey = getOrKey();
  const ref = doc(db, productsCollection, productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Product not found");
  const product = { id: snap.id, ...snap.data() };
  const text = toText(product);

  const res = await fetch(OPENROUTER_EMBED_URL, {
    method: "POST",
    headers: HEADERS(apiKey),
    body: JSON.stringify({ model: MODEL_EMBED, input: text }),
  });
  if (!res.ok) throw new Error("Embedding request failed");
  const data = await res.json();
  const vector = data.data?.[0]?.embedding || [];

  await setDoc(doc(db, vectorsCollection, product.id), {
    productId: product.id,
    vector,
    title: product.title || product.name || "",
    tags: product.tags || [],
    updatedAt: Date.now(),
  });

  return { productId };
};

export const querySimilarProducts = async (query, { k = 6, productsCollection = "products", vectorsCollection = "products_vectors" } = {}) => {
  const apiKey = getOrKey();
  const embedRes = await fetch(OPENROUTER_EMBED_URL, {
    method: "POST",
    headers: HEADERS(apiKey),
    body: JSON.stringify({ model: MODEL_EMBED, input: query }),
  });
  if (!embedRes.ok) throw new Error("Embedding request failed");
  const embedData = await embedRes.json();
  const qVec = embedData.data?.[0]?.embedding || [];

  // Load all vectors (for medium datasets). If large, replace by server-side ANN or chunked scanning.
  const vecSnap = await getDocs(collection(db, vectorsCollection));
  const vecs = vecSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Score by cosine similarity
  const ranked = vecs
    .map((v) => ({ ...v, score: cosineSim(qVec, v.vector || []) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  // Fetch product docs for top matches
  const results = [];
  for (const r of ranked) {
    const pSnap = await getDoc(doc(db, productsCollection, r.productId));
    if (pSnap.exists()) {
      const pdata = { id: pSnap.id, ...pSnap.data() };
      results.push({ score: r.score, product: pdata });
    }
  }

  return results;
};

export const generateSuggestions = async (userQuery, similarProducts = []) => {
  const apiKey = getOrKey();
  // Constrain the model to only reference the provided products
  const catalog = similarProducts.map(({ score, product }) => ({
    score: Number(score.toFixed(4)),
    id: product.id,
    title: product.title || product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
  }));

  const system = `You are a helpful agritech assistant. ONLY recommend from the provided product list. If nothing fits, respond with an apology and suggest contacting support.`;
  const user = `User request: ${userQuery}\n\nAvailable products (JSON):\n${JSON.stringify(catalog, null, 2)}\n\nInstructions:\n- Recommend up to 5 items with: id, title, short_reason.\n- Never fabricate products or data.\n- If no match, reply with { recommendations: [] , note: "no suitable products" }`;

  const res = await fetch(OPENROUTER_CHAT_URL, {
    method: "POST",
    headers: HEADERS(apiKey),
    body: JSON.stringify({
      model: MODEL_CHAT,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(`Suggestion generation failed: ${t}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Robust JSON extraction
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    return { recommendations: [], note: "parse-failed" };
  }
};
