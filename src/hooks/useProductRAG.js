import { useState, useCallback } from "react";
import { buildProductIndex, querySimilarProducts, generateSuggestions } from "../services/productRagIndex";

export default function useProductRAG() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  const buildIndex = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buildProductIndex();
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const ask = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const similar = await querySimilarProducts(query, { k: 6 });
      setResults(similar);
      const rec = await generateSuggestions(query, similar);
      setRecommendations(rec);
      return { similar, rec };
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, results, recommendations, buildIndex, ask };
}
