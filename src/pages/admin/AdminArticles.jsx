import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import useArticles from "../../hooks/useArticles";
import { generateSlug } from "../../data/articles";
import { computeReadTime, suggestRelatedProducts, buildTranslationsFromForm } from "../../utils/articleUtils";
import { getFallbackProducts } from "../../data/products";
import {
  createArticle,
  deleteArticle,
  updateArticle,
} from "../../services/articlesService";
import { generateAiDraft, reviewArticleWithAI, generateSEOWithAI } from "../../utils/aiHelpers";
import { UseTheme } from "../../theme/ThemeProvider";
import { ArticleForm, ArticleList, PublishOverlay, PreviewModal } from "./components";

const defaultForm = {
  title: "",
  summary: "",
  tag: "Product Usage",
  readTime: "",
  author: "",
  heroImage: "",
  content: "",
  featureHome: false,
  featureAccount: true,
  titleAr: "",
  summaryAr: "",
  contentAr: "",
  // New fields
  status: "draft", // draft, published, published
  articleType: "blog", // blog, guide, news
  difficulty: "beginner", // beginner, intermediate, advanced
  seoDescription: "",
  keywords: "",
  relatedProducts: [],
  publishDate: "",
};

const aiTopics = [
  {
    value: "usage",
    label: "Product usage guide",
    tag: "Product Usage",
    prompt: "Explain how to use the selected product step by step.",
    sampleHero:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "combo",
    label: "Combine two products",
    tag: "Product Combo",
    prompt: "Show how to combine two products safely with a clear sequence.",
    sampleHero:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "troubleshoot",
    label: "Fix a recurring issue",
    tag: "Troubleshooting",
    prompt: "Describe how this product fixes a common farm issue.",
    sampleHero:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80",
  },
];

const AdminArticles = () => {
  const { t } = useTranslation();
  UseTheme(); // ensures CSS variables are set for theming
  const { articles } = useArticles();

  const savedDraft = localStorage.getItem('articleDraft');
  const initialForm = savedDraft ? JSON.parse(savedDraft) : defaultForm;
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiTopic, setAiTopic] = useState(aiTopics[0].value);
  const [aiLines, setAiLines] = useState(5);
  const [productContext, setProductContext] = useState("");

  // New state for enhanced features
  const [showPreview, setShowPreview] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("content"); // content, seo, products, review
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showPublishOverlay, setShowPublishOverlay] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState(null);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [splitView, setSplitView] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto-mirror between EN/AR fields to reduce double typing
      if (["title", "summary", "content"].includes(name)) {
        const arabicSide = `${name}Ar`;

        // If user typed Arabic and Arabic field is empty, mirror there; otherwise if user typed Latin and Arabic field exists but empty, mirror too.
        if (!prev[arabicSide]) {
          next[arabicSide] = value;
        }

        // If user typed Arabic and English field was empty, keep English as-is (same text) so it can be translated manually later.
      }

      if (["titleAr", "summaryAr", "contentAr"].includes(name)) {
        const base = name.replace("Ar", "");
        if (!prev[base]) {
          next[base] = value;
        }
      }

      if (name === "content") {
        next.readTime = computeReadTime(value, prev.readTime);
      }

      return next;
    });
  };

  const handleGenerate = () => {
    const draft = generateAiDraft({
      topicKey: aiTopic,
      productContext,
      lineCount: aiLines,
    });
    setForm((prev) => ({
      ...prev,
      title: prev.title || draft.title,
      summary: draft.summary,
      content: draft.content,
      tag: draft.tag,
      heroImage: prev.heroImage || draft.heroImage,
      readTime: computeReadTime(draft.content, draft.readTime),
      author: prev.author || draft.author || "Product Specialist",
    }));

    // Generate product suggestions based on the new content
    const suggestions = suggestRelatedProducts(draft.content, draft.tag);
    setSuggestedProducts(suggestions);
  };

  const handleGenerateTitle = async () => {
    if (!form.content && !form.summary) {
      toast.error("Add content or summary first");
      return;
    }
    try {
      // Assume aiHelpers has generateTitle function
      const generatedTitle = await generateAiDraft({ content: form.content || form.summary, type: 'title' });
      setForm(prev => ({ ...prev, title: generatedTitle.title }));
      toast.success("Title generated!");
    } catch {
      toast.error("Failed to generate title");
    }
  };

  const handleGenerateSummary = async () => {
    if (!form.content) {
      toast.error("Add content first");
      return;
    }
    try {
      const generatedSummary = await generateAiDraft({ content: form.content, type: 'summary' });
      setForm(prev => ({ ...prev, summary: generatedSummary.summary }));
      toast.success("Summary generated!");
    } catch {
      toast.error("Failed to generate summary");
    }
  };


  const handleRewrite = async (style) => {
    if (!form.content) {
      toast.error("Add content first");
      return;
    }
    try {
      const rewritten = generateAiDraft({ content: form.content, style });
      setForm(prev => ({ ...prev, content: rewritten }));
      toast.success("Content rewritten!");
    } catch {
      toast.error("Failed to rewrite content");
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.content;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const imageMarkdown = `![${file.name}](${dataUrl})\n`;
        const newValue = currentValue.slice(0, start + index * imageMarkdown.length) + imageMarkdown + currentValue.slice(end + index * imageMarkdown.length);
        setForm(prev => ({ ...prev, content: newValue }));
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} image(s) inserted!`);
  };

  const handleAiReview = async () => {
    setReviewing(true);
    try {
      const review = await reviewArticleWithAI(form);
      setAiReview(review);
      setActiveTab("review");
      toast.success("AI review completed!");
    } catch {
      toast.error("AI review failed");
    } finally {
      setReviewing(false);
    }
  };

  const handleGenerateSEO = async () => {
    setGeneratingSEO(true);
    try {
      const seoData = await generateSEOWithAI(form);
      setSeoSuggestions(seoData);
      setForm(prev => ({
        ...prev,
        seoDescription: prev.seoDescription || seoData.metaDescription,
        keywords: prev.keywords || seoData.keywords,
      }));
      toast.success("SEO suggestions generated!");
    } catch {
      toast.error("SEO generation failed");
    } finally {
      setGeneratingSEO(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const generateProductSuggestions = useCallback(() => {
    const suggestions = suggestRelatedProducts(form.content || form.summary, form.tag);
    setSuggestedProducts(suggestions);
  }, [form.content, form.summary, form.tag]);

  // Auto-generate suggestions when content, summary, or tag changes
  useEffect(() => {
    if (form.content || form.summary || form.title) {
      generateProductSuggestions();
    }
  }, [form.content, form.summary, form.title, form.tag, generateProductSuggestions]);

  // Autosave draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('articleDraft', JSON.stringify(form));
    }, 10000);
    return () => clearInterval(interval);
  }, [form]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Only show overlay for content tab (publishing/updating articles)
    if (activeTab === "content") {
      // Show publishing overlay
      setShowPublishOverlay(true);
    } else {
      // For other tabs, just save without overlay
      await handleConfirmPublish();
    }
  };

  const handleConfirmPublish = async () => {
    setSubmitting(true);
    try {
      const { titleAr, summaryAr, contentAr, ...rest } = form;
      const translations = buildTranslationsFromForm({ titleAr, summaryAr, contentAr });
      const slug = generateSlug(form.title);
      const ensuredReadTime = computeReadTime(form.content || form.summary, rest.readTime);
      const ensuredAuthor = (rest.author || "").trim() || "Vet Clinic Admin";
      let status = rest.status;
      if (rest.publishDate && new Date(rest.publishDate) > new Date()) {
        status = "scheduled";
      }
      const payload = {
        ...rest,
        status,
        readTime: ensuredReadTime,
        author: ensuredAuthor,
        slug,
        relatedProducts: selectedProducts.map(p => p.id),
        ...(Object.keys(translations).length ? { translations } : {}),
      };

      if (editingId) {
        await updateArticle(editingId, payload);
        toast.success("Article updated");
      } else {
        await createArticle(payload);
        toast.success("Article created");
      }
      setForm(defaultForm);
      setEditingId(null);
      setAiReview(null);
      setSuggestedProducts([]);
      setSelectedProducts([]);
      setShowPublishOverlay(false);
      localStorage.removeItem('articleDraft');
    } catch (error) {
      console.error(error);
      toast.error("Unable to save article");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    const arabic = article.translations?.ar || {};
    setForm({
      title: article.title,
      summary: article.summary,
      tag: article.tag,
      readTime: article.readTime || computeReadTime(article.content || article.summary, ""),
      heroImage: article.heroImage || "",
      content: article.content || "",
      featureHome: !!article.featureHome,
      featureAccount: article.featureAccount !== false,
      titleAr: arabic.title || "",
      summaryAr: arabic.summary || "",
      contentAr: arabic.content || "",
      // New fields
      status: article.status || "draft",
      articleType: article.articleType || "blog",
      difficulty: article.difficulty || "beginner",
      author: article.author || "",
      seoDescription: article.seoDescription || "",
      keywords: article.keywords || "",
      publishDate: article.publishDate || "",
    });

    // Ensure slug exists for URL routing
    if (!article.slug && article.title) {
      // Update the article with a slug if missing
      updateArticle(article.id, { slug: generateSlug(article.title) }).catch(console.error);
    }

    // Load related products
    if (article.relatedProducts) {
      const related = getFallbackProducts().filter((p) => article.relatedProducts.includes(p.id));
      setSelectedProducts(related);
    }

    // Generate suggestions for existing content
    const suggestions = suggestRelatedProducts(article.content, article.tag);
    setSuggestedProducts(suggestions);

    // Reset AI states
    setAiReview(null);
    setSeoSuggestions(null);
  };

  const handleDuplicate = (article) => {
    const arabic = article.translations?.ar || {};
    setForm({
      title: article.title + " (Copy)",
      summary: article.summary,
      tag: article.tag,
      readTime: article.readTime || computeReadTime(article.content || article.summary, ""),
      heroImage: article.heroImage || "",
      content: article.content || "",
      featureHome: !!article.featureHome,
      featureAccount: article.featureAccount !== false,
      titleAr: arabic.title || "",
      summaryAr: arabic.summary || "",
      contentAr: arabic.content || "",
      // New fields
      status: "draft",
      articleType: article.articleType || "blog",
      difficulty: article.difficulty || "beginner",
      author: article.author || "",
      seoDescription: article.seoDescription || "",
      keywords: article.keywords || "",
      publishDate: "",
    });

    // Load related products
    if (article.relatedProducts) {
      const related = getFallbackProducts().filter((p) => article.relatedProducts.includes(p.id));
      setSelectedProducts(related);
    }

    // Generate suggestions for existing content
    const suggestions = suggestRelatedProducts(article.content, article.tag);
    setSuggestedProducts(suggestions);

    // Reset AI states
    setAiReview(null);
    setSeoSuggestions(null);
    setEditingId(null);
  };

  const handleDelete = async (article) => {
    try {
      await deleteArticle(article.id);
      toast.success("Article deleted");
      if (editingId === article.id) {
        setEditingId(null);
        setForm(defaultForm);
        setAiReview(null);
        setSuggestedProducts([]);
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete article");
    }
  };

  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
      ),
    [articles]
  );

  return (
    <div className="min-h-screen bg-surface text-[var(--text-main)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase text-emerald-800">
              📚 {t("articles.admin.eyebrow", "Knowledge center")}
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight">
              {t("articles.admin.title", "Manage Articles")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              {t(
                "articles.admin.subtitle",
                "Create, edit, and publish articles with AI assistance and product integration."
              )}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="card-surface rounded-xl border border-muted p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                  {t("articles.admin.count", "Total articles")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--text-main)]">
                  {articles.length}
                </p>
              </div>
              <div className="card-surface rounded-xl border border-muted p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                  {t("articles.admin.published", "Published")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">
                  {articles.filter(a => a.status === 'published').length}
                </p>
              </div>
              <div className="card-surface rounded-xl border border-muted p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                  {t("articles.admin.drafts", "Drafts")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-amber-600">
                  {articles.filter(a => a.status !== 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAiReview}
                disabled={reviewing || !form.content}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:opacity-50"
              >
                {reviewing ? "🔄" : "🤖"} {t("articles.admin.review", "AI Review")}
              </button>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <ArticleForm
            form={form}
            editingId={editingId}
            activeTab={activeTab}
            splitView={splitView}
            setSplitView={setSplitView}
            setShowPreview={setShowPreview}
            generateProductSuggestions={generateProductSuggestions}
            handleChange={handleChange}
            handleGenerateTitle={handleGenerateTitle}
            handleGenerateSummary={handleGenerateSummary}
            handleRewrite={handleRewrite}
            handleImageDrop={handleImageDrop}
            handleSubmit={handleSubmit}
            submitting={submitting}
            aiTopics={aiTopics}
            aiTopic={aiTopic}
            setAiTopic={setAiTopic}
            aiLines={aiLines}
            setAiLines={setAiLines}
            productContext={productContext}
            setProductContext={setProductContext}
            handleGenerate={handleGenerate}
            seoSuggestions={seoSuggestions}
            handleGenerateSEO={handleGenerateSEO}
            generatingSEO={generatingSEO}
            suggestedProducts={suggestedProducts}
            selectedProducts={selectedProducts}
            handleProductSelect={handleProductSelect}
            aiReview={aiReview}
            handleAiReview={handleAiReview}
            reviewing={reviewing}
            setActiveTab={setActiveTab}
            setEditingId={setEditingId}
            setForm={setForm}
            defaultForm={defaultForm}
            setAiReview={setAiReview}
            setSuggestedProducts={setSuggestedProducts}
            setSelectedProducts={setSelectedProducts}
            setSeoSuggestions={setSeoSuggestions}
          />

          <ArticleList
            sortedArticles={sortedArticles}
            handleEdit={handleEdit}
            handleDuplicate={handleDuplicate}
            handleDelete={handleDelete}
          />
        </div>

        <PublishOverlay
          showPublishOverlay={showPublishOverlay}
          setShowPublishOverlay={setShowPublishOverlay}
          handleConfirmPublish={handleConfirmPublish}
          submitting={submitting}
          editingId={editingId}
        />

        <PreviewModal
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          form={form}
          selectedProducts={selectedProducts}
        />
      </div>
    </div>
  );
};

export default AdminArticles;