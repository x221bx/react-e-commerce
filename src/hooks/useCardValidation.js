import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useCardValidation = () => {
    const { t } = useTranslation();
    const [cardForm, setCardForm] = useState({
        holder: "",
        number: "",
        expiry: "",
        cvv: "",
    });
    const [cardErrors, setCardErrors] = useState({});

    const validateCard = () => {
        const nextErrors = {};
        if (!cardForm.holder.trim())
            nextErrors.holder = t("payments.errors.holder");
        if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, "")))
            nextErrors.number = t("payments.errors.number");
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry))
            nextErrors.expiry = t("payments.errors.expiry");
        if (!/^\d{3,4}$/.test(cardForm.cvv))
            nextErrors.cvv = t("payments.errors.cvv");
        setCardErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const resetCard = () => {
        setCardForm({
            holder: "",
            number: "",
            expiry: "",
            cvv: "",
        });
        setCardErrors({});
    };

    const updateCard = (key, value) => {
        setCardForm((prev) => ({ ...prev, [key]: value }));
    };

    return {
        cardForm,
        setCardForm,
        cardErrors,
        validateCard,
        resetCard,
        updateCard,
    };
};
