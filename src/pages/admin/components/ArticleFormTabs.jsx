import React from "react";

const ArticleFormTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-muted">
      <div className="flex">
        {[
          { id: "content", label: "Content", icon: "📝" },
          { id: "ai", label: "AI Tools", icon: "🤖" },
          { id: "seo", label: "SEO", icon: "🔍" },
          { id: "review", label: "AI Review", icon: "⭐" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArticleFormTabs;