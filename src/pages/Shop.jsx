import React from "react";
import Footer from "../Authcomponents/Footer";
import { useTranslation } from "react-i18next";

function Shop() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      Shop
      <Footer />
    </div>
  );
}

export default Shop;
