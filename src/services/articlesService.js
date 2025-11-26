import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { localizeArticleRecord, normalizeLocale } from "../data/articles";

const articlesCollection = collection(db, "articles");

const deriveReadTime = (text = "", fallback = "5 min") => {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  if (!words) return fallback;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min`;
};

const withTimestamps = (data) => ({
  ...data,
  updatedAt: serverTimestamp(),
  createdAt: data.createdAt || serverTimestamp(),
});

const cleanTranslations = (rawTranslations = {}) => {
  if (!rawTranslations || typeof rawTranslations !== "object") return {};
  return Object.entries(rawTranslations).reduce((acc, [locale, fields]) => {
    if (!fields || typeof fields !== "object") return acc;
    const trimmed = {
      title: fields.title?.toString().trim(),
      summary: fields.summary?.toString().trim(),
      content: fields.content?.toString().trim(),
    };
    const cleaned = Object.fromEntries(
      Object.entries(trimmed).filter(([, value]) => Boolean(value))
    );
    if (Object.keys(cleaned).length) {
      acc[locale] = cleaned;
    }
    return acc;
  }, {});
};

export const subscribeToArticles = (options = {}, handler = () => {}) => {
  const { featureHome, featureAccount, limit: limitCount } = options;


  // Build query with where clauses for better performance
  let queryConstraints = [];

  // If we have where clauses, we need to be careful with ordering
  // Firebase requires composite indexes for where + orderBy on different fields
  if (featureHome !== undefined || featureAccount !== undefined) {
    // For filtered queries, we'll sort client-side to avoid index requirements
    if (featureHome !== undefined) {
      queryConstraints.push(where("featureHome", "==", featureHome));
    }

    if (featureAccount !== undefined) {
      queryConstraints.push(where("featureAccount", "==", featureAccount));
    }

    // Add orderBy only if no where clauses (to avoid composite index requirement)
    // For filtered queries, we'll sort on the client side
  } else {
    queryConstraints.push(orderBy("createdAt", "desc"));
  }

  if (limitCount && limitCount > 0) {
    queryConstraints.push(limit(limitCount));
  }

  const q = query(articlesCollection, ...queryConstraints);

  return onSnapshot(
    q,
    (snapshot) => {
      let articles = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Sort client-side for filtered queries
      if (featureHome !== undefined || featureAccount !== undefined) {
        articles = articles.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      }

      handler(articles);
    },
    (error) => {
      console.error("subscribeToArticles failed", error);
      handler([]);
    }
  );
};

export const subscribeToArticle = (articleId, handler) => {
  if (!articleId) return () => {};
  const ref = doc(db, "articles", articleId);
  return onSnapshot(ref, handler);
};

export const fetchArticles = async () => {
  const snapshot = await getDocs(query(articlesCollection, orderBy("createdAt", "desc")));
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const fetchArticle = async (articleId) => {
  const snap = await getDoc(doc(db, "articles", articleId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const fetchArticleBySlug = async (slug) => {
  const q = query(articlesCollection, where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export const fetchArticlesByIds = async (ids = [], locale = "en") => {
  if (!ids.length) return [];
  const normalized = normalizeLocale(locale);
  const results = await Promise.all(
    ids.map(async (articleId) => {
      const data = await fetchArticle(articleId);
      if (data && data.status === 'published') {
        return localizeArticleRecord({ id: articleId, ...data }, normalized);
      }
      // Don't return fallback articles for favorites - only return real published articles
      return null;
    })
  );
  return results.filter(Boolean);
};

export const createArticle = async (article) => {
  const { translations: rawTranslations, ...rest } = article;
  const translations = cleanTranslations(rawTranslations);
  const computedReadTime = deriveReadTime(rest.content || rest.summary, rest.readTime);
  const payload = withTimestamps({
    title: rest.title,
    summary: rest.summary,
    tag: rest.tag || "General",
    readTime: computedReadTime,
    heroImage: rest.heroImage || "",
    content: rest.content || "",
    featureHome: !!rest.featureHome,
    featureAccount: rest.featureAccount !== false,
    author: (rest.author || "Vet Clinic Admin").trim(),
    ...(Object.keys(translations).length ? { translations } : {}),
  });

  const ref = await addDoc(articlesCollection, payload);
  return ref.id;
};

export const updateArticle = async (articleId, updates = {}) => {
  const { translations: rawTranslations, ...rest } = updates;
  const translations = cleanTranslations(rawTranslations);
  const ref = doc(db, "articles", articleId);
  const payload = {
    ...rest,
    readTime: deriveReadTime(rest.content || rest.summary, rest.readTime),
    updatedAt: serverTimestamp(),
  };
  if (Object.keys(translations).length) {
    payload.translations = translations;
  }
  await updateDoc(ref, payload);
};

export const deleteArticle = async (articleId) => {
  await deleteDoc(doc(db, "articles", articleId));
};

export const saveArticleFavorite = async (userId, articleId) => {
  if (!userId || !articleId) return;
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    favoriteArticles: arrayUnion(articleId),
    updatedAt: serverTimestamp(),
  });
};

export const removeArticleFavorite = async (userId, articleId) => {
  if (!userId || !articleId) return;
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    favoriteArticles: arrayRemove(articleId),
    updatedAt: serverTimestamp(),
  });
};

// Like/Dislike functionality
export const addArticleLike = async (userId, articleId) => {
  if (!userId || !articleId) return;

  const articleRef = doc(db, "articles", articleId);
  const userRef = doc(db, "users", userId);

  // Add to user's liked articles
  await updateDoc(userRef, {
    likedArticles: arrayUnion(articleId),
    updatedAt: serverTimestamp(),
  });

  // Remove from disliked if exists
  await updateDoc(userRef, {
    dislikedArticles: arrayRemove(articleId),
  });

  // Update article like count
  const articleSnap = await getDoc(articleRef);
  if (articleSnap.exists()) {
    const currentLikes = articleSnap.data().likes || 0;
    const currentDislikes = articleSnap.data().dislikes || 0;
    await updateDoc(articleRef, {
      likes: currentLikes + 1,
      dislikes: Math.max(0, currentDislikes - 1), // Remove dislike if existed
      updatedAt: serverTimestamp(),
    });
  }
};

export const addArticleDislike = async (userId, articleId) => {
  if (!userId || !articleId) return;

  const articleRef = doc(db, "articles", articleId);
  const userRef = doc(db, "users", userId);

  // Add to user's disliked articles
  await updateDoc(userRef, {
    dislikedArticles: arrayUnion(articleId),
    updatedAt: serverTimestamp(),
  });

  // Remove from liked if exists
  await updateDoc(userRef, {
    likedArticles: arrayRemove(articleId),
  });

  // Update article dislike count
  const articleSnap = await getDoc(articleRef);
  if (articleSnap.exists()) {
    const currentDislikes = articleSnap.data().dislikes || 0;
    const currentLikes = articleSnap.data().likes || 0;
    await updateDoc(articleRef, {
      dislikes: currentDislikes + 1,
      likes: Math.max(0, currentLikes - 1), // Remove like if existed
      updatedAt: serverTimestamp(),
    });
  }
};

export const removeArticleLike = async (userId, articleId) => {
  if (!userId || !articleId) return;

  const articleRef = doc(db, "articles", articleId);
  const userRef = doc(db, "users", userId);

  // Remove from user's liked articles
  await updateDoc(userRef, {
    likedArticles: arrayRemove(articleId),
    updatedAt: serverTimestamp(),
  });

  // Update article like count
  const articleSnap = await getDoc(articleRef);
  if (articleSnap.exists()) {
    const currentLikes = articleSnap.data().likes || 0;
    await updateDoc(articleRef, {
      likes: Math.max(0, currentLikes - 1),
      updatedAt: serverTimestamp(),
    });
  }
};

export const removeArticleDislike = async (userId, articleId) => {
  if (!userId || !articleId) return;

  const articleRef = doc(db, "articles", articleId);
  const userRef = doc(db, "users", userId);

  // Remove from user's disliked articles
  await updateDoc(userRef, {
    dislikedArticles: arrayRemove(articleId),
    updatedAt: serverTimestamp(),
  });

  // Update article dislike count
  const articleSnap = await getDoc(articleRef);
  if (articleSnap.exists()) {
    const currentDislikes = articleSnap.data().dislikes || 0;
    await updateDoc(articleRef, {
      dislikes: Math.max(0, currentDislikes - 1),
      updatedAt: serverTimestamp(),
    });
  }
};

export const incrementArticleViews = async (articleId) => {
  if (!articleId) return;

  const articleRef = doc(db, "articles", articleId);
  const articleSnap = await getDoc(articleRef);
  if (articleSnap.exists()) {
    const currentViews = articleSnap.data().views || 0;
    await updateDoc(articleRef, {
      views: currentViews + 1,
      updatedAt: serverTimestamp(),
    });
  }
};

export const addArticleComment = async (articleId, userId, comment, userName) => {
  if (!articleId || !userId || !comment?.trim()) return;

  const commentData = {
    userId,
    userName: userName || "Anonymous",
    comment: comment.trim(),
    createdAt: serverTimestamp(),
    isAdminOnly: true, // Comments are only visible to admins
  };

  const articleRef = doc(db, "articles", articleId);
  await updateDoc(articleRef, {
    comments: arrayUnion(commentData),
    updatedAt: serverTimestamp(),
  });
};

export const getArticleComments = async (articleId) => {
  if (!articleId) return [];

  const articleSnap = await getDoc(doc(db, "articles", articleId));
  if (articleSnap.exists()) {
    return articleSnap.data().comments || [];
  }
  return [];
};
