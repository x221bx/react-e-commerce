// src/hooks/useArticle.js
import { useEffect, useState, useRef } from "react";
import {
  subscribeToArticle,
  fetchArticleBySlug,
} from "../services/articlesService";

export const useArticle = (slugOrId) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // نحل المشكلة باستخدام useRef للمتغيرات اللي بنعدلها في cleanup
  const isMounted = useRef(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Reset state
    setLoading(true);
    setNotFound(false);
    setArticle(null);

    // Cleanup السابق لو موجود
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!slugOrId) {
      setLoading(false);
      return;
    }

    // جلب المقالة أول مرة
    fetchArticleBySlug(slugOrId)
      .then((doc) => {
        if (!isMounted.current) return;

        if (!doc?.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const id = doc.id;

        // الاشتراك في التحديثات الحية
        unsubscribeRef.current = subscribeToArticle(id, (snap) => {
          if (!isMounted.current) return;

          if (!snap.exists()) {
            setNotFound(true);
            setArticle(null);
          } else {
            setArticle({ id: snap.id, ...snap.data() });
          }
          setLoading(false);
        });

        // لو الـ snapshot الأولى موجودة (نادرًا بيحصل إنه يجي متأخر)
        if (!unsubscribeRef.current) {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching article:", error);
        if (isMounted.current) {
          setNotFound(true);
          setLoading(false);
        }
      });

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [slugOrId]);

  return { article, loading, notFound };
};
