// src/components/articles/CommentForm.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiMessageCircle } from "react-icons/fi";
import { addArticleComment } from "../../services/articlesService";
import toast from "react-hot-toast";

const CommentForm = ({ articleId, user, onCommentAdded }) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid || !comment.trim()) return;

    setSubmitting(true);
    try {
      await addArticleComment(
        articleId,
        user.uid,
        comment,
        user.displayName || user.email
      );
      setComment("");
      if (onCommentAdded) {
        onCommentAdded();
      }
      toast.success("Comment sent to admin");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="border-t border-slate-200 pt-8 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiMessageCircle className="h-5 w-5" />
        Send Comment to Admin
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment here... (Only visible to administrators)"
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          required
        />
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Sending..." : "Send to Admin"}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;