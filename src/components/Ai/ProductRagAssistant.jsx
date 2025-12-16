import React, { useState } from "react";
import useProductRAG from "../../hooks/useProductRAG";

export default function ProductRagAssistant() {
  const { loading, error, results, recommendations, buildIndex, ask } = useProductRAG();
  const [query, setQuery] = useState("");

  const onBuild = async () => {
    try {
      await buildIndex();
      alert("RAG index built successfully");
    } catch (e) {
      alert("Failed to build index: " + (e?.message || e));
    }
  };

  const onAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      await ask(query.trim());
    } catch (e) {
      // handled in hook
    }
  };

  return (
    <div className="p-4 border rounded-2xl">
      <div className="flex gap-2 mb-3">
        <button onClick={onBuild} disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">
          {loading ? "Working..." : "Build RAG Index"}
        </button>
      </div>
      <form onSubmit={onAsk} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="اسأل عن منتج (مثال: مبيد للمن على القطن)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>Ask</button>
      </form>

      {error && (
        <div className="mt-3 text-red-600 text-sm">{error.message || String(error)}</div>
      )}

      {results?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Top matches from database</h3>
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.product.id} className="border rounded p-2">
                <div className="text-sm">Score: {r.score.toFixed(3)}</div>
                <div className="font-medium">{r.product.title || r.product.name}</div>
                {r.product.price != null && <div className="text-sm">Price: {r.product.price}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">AI Suggestions</h3>
          <pre className="p-3 bg-slate-100 rounded text-sm overflow-auto">{JSON.stringify(recommendations, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
