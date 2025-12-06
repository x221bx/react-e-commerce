import React from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, FileText, Shield, Star, Zap, User } from "lucide-react";

const SupportFormStep1 = ({ formData, updateFormData, errors, isDark }) => {
  const { t } = useTranslation();
  const categories = [
    {
      id: "orders",
      title: t("support.topics.orders"),
      description: t("support.topics.orders_desc"),
      icon: <FileText className="w-6 h-6" />,
      color: "blue"
    },
    {
      id: "billing",
      title: t("support.topics.billing"),
      description: t("support.topics.billing_desc"),
      icon: <Shield className="w-6 h-6" />,
      color: "green"
    },
    {
      id: "products",
      title: t("support.topics.product"),
      description: t("support.topics.product_desc"),
      icon: <Star className="w-6 h-6" />,
      color: "purple"
    },
    {
      id: "technical",
      title: t("support.topics.technical"),
      description: t("support.topics.technical_desc"),
      icon: <Zap className="w-6 h-6" />,
      color: "orange"
    },
    {
      id: "account",
      title: t("support.topics.account"),
      description: t("support.topics.account_desc"),
      icon: <User className="w-6 h-6" />,
      color: "indigo"
    },
    {
      id: "other",
      title: t("support.topics.other"),
      description: t("support.topics.other_desc"),
      icon: <MessageSquare className="w-6 h-6" />,
      color: "gray"
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t("support.step1.title")}
        </h2>
        <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {t("support.step1.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => updateFormData('category', category.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
              formData.category === category.id
                ? `border-emerald-500 bg-emerald-50 ${isDark ? 'bg-emerald-900/20' : ''}`
                : `border-gray-200 hover:border-gray-300 ${isDark ? 'border-slate-600 hover:border-slate-500' : ''}`
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                formData.category === category.id
                  ? 'bg-emerald-500 text-white'
                  : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {category.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {errors.category && (
        <p className="text-red-500 text-center mb-4">{errors.category}</p>
      )}
    </div>
  );
};

export default SupportFormStep1;