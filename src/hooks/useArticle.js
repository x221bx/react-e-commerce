import { useEffect, useState } from "react";
import { subscribeToArticle } from "../services/articlesService";

export const useArticle = (articleId) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      setLoading(false);
      return () => {};
    }
    const unsubscribe = subscribeToArticle(articleId, (snapshot) => {
      if (!snapshot.exists()) {
        setArticle(null);
      } else {
        setArticle({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [articleId]);

  return { article, loading };
};

export default useArticle;
