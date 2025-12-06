import React from "react";
import Footer from "../Authcomponents/Footer";
import { useTranslation } from "react-i18next";

function Orders() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      Orders
      <Footer />
    </div>
  );
}

export default Orders;
