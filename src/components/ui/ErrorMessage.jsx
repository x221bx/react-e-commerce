// src/components/ui/ErrorMessage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiBookmark } from "react-icons/fi";

const ErrorMessage = ({
  title,
  message,
  showBackButton = true,
  backTo = "/articles",
  backText,
  icon: Icon = FiBookmark,
  className = ""
}) => {
  const { t } = useTranslation();

  return (
    <div className={`min-h-screen bg-surface ${className}`}>
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <Icon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {title || t("articles.detail.notFound", "Article Not Found")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          {message || t("articles.detail.notFoundDesc", "The article you're looking for doesn't exist or has been moved.")}
        </p>
        {showBackButton && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <FiArrowLeft className="h-4 w-4" />
            {backText || t("articles.detail.back", "Back to Articles")}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;