import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getFallbackArticle, localizeArticleRecord, normalizeLocale } from "../data/articles";

const articlesCollection = collection(db, "articles");

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
  const { featureHome, featureAccount } = options;
  const q = query(articlesCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const articles = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((article) => {
          if (featureHome !== undefined && article.featureHome !== featureHome) {
            return false;
          }
          if (featureAccount !== undefined && article.featureAccount !== featureAccount) {
            return false;
          }
          return true;
        });
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

export const fetchArticlesByIds = async (ids = [], locale = "en") => {
  if (!ids.length) return [];
  const normalized = normalizeLocale(locale);
  const results = await Promise.all(
    ids.map(async (articleId) => {
      const data = await fetchArticle(articleId);
      if (data) {
        return localizeArticleRecord({ id: articleId, ...data }, normalized);
      }
      const fallback = getFallbackArticle(articleId, normalized);
      return fallback ? { ...fallback, id: articleId } : null;
    })
  );
  return results.filter(Boolean);
};

export const createArticle = async (article) => {
  const { translations: rawTranslations, ...rest } = article;
  const translations = cleanTranslations(rawTranslations);
  const payload = withTimestamps({
    title: rest.title,
    summary: rest.summary,
    tag: rest.tag || "General",
    readTime: rest.readTime || "5 min",
    heroImage: rest.heroImage || "",
    content: rest.content || "",
    featureHome: !!rest.featureHome,
    featureAccount: rest.featureAccount !== false,
    author: rest.author || "Farm Vet Editorial",
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
