// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

// BrowserRouter لدعم التنقل بين الصفحات
import { BrowserRouter } from "react-router-dom";

// ربط التطبيق بـ Redux
import { Provider } from "react-redux";

// إعداد React Query للتعامل مع البيانات الخارجية
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Theme Provider للتحكم بالثيم الداكن والفاتح
import ThemeProvider from "./theme/ThemeProvider.jsx";

// الملف الرئيسي للتطبيق
import App from "./App.jsx";

// ملفات CSS العالمية
import "./index.css";

// استيراد الـ Redux store
import { store } from "./redux/store";

// إعداد i18n للترجمة
import "./i18n";

// إنشاء كائن QueryClient لإدارة React Query
const queryClient = new QueryClient();

// رندر التطبيق بالكامل داخل div#root
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
