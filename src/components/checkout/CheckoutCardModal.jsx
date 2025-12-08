// src/components/checkout/CheckoutCardModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { UseTheme } from "../../theme/ThemeProvider";

const BRAND_COLORS = {
  visa: "#1A73E8",
  mastercard: "#EB001B",
  amex: "#2E77BB",
  jcb: "#0B4EA2",
  default: "#10B981",
};

export default function CheckoutCardModal({
  isOpen,
  onClose,
  onSubmit,
  cardValidation,
  saveCardForLater,
  onSaveCardToggle,
}) {
  const { t } = useTranslation();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const {
    cardForm = {},
    cardErrors = {},
    handleCardFormChange = () => {},
    formatCardNumber = (value) => value,
    formatHolderName = (value) => value,
    formatExpiry = (value) => value,
    detectBrand = () => null,
    validateCard,
  } = cardValidation || {};

  const brand = detectBrand(cardForm.number || "");
  const brandColor = BRAND_COLORS[brand] || BRAND_COLORS.default;

  const hasErrors = !!cardErrors && Object.keys(cardErrors).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCard) return;
    if (!validateCard()) return;
    await onSubmit(cardForm, !!saveCardForLater);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("payments.form.cardTitle", "Add new card")}
      footer={false}
      className="!p-0"
    >
      {/* MAIN CARD BODY */}
      <form
        onSubmit={handleSubmit}
        className={`
          space-y-6 p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl
          transition-all duration-300 
          ${
            isDark
              ? "bg-slate-900/85 border-slate-700 text-white shadow-black/60"
              : "bg-white/95 border-emerald-100 text-slate-900 shadow-emerald-600/15"
          }
        `}
      >
        {/* Error summary */}
        {hasErrors && (
          <div
            className={`flex items-start gap-2 rounded-2xl px-3 py-2 text-xs mb-1
            ${
              isDark
                ? "bg-red-900/20 border border-red-700/60 text-red-100"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
            <span>
              {t(
                "payments.form.errorSummary",
                "Please double-check the highlighted card details."
              )}
            </span>
          </div>
        )}

        {/* CARD PREVIEW */}
        <div
          className={`
            w-full rounded-2xl px-5 py-4 shadow-lg border relative overflow-hidden
            ${
              isDark
                ? "bg-slate-800/70 border-slate-700"
                : "bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 border-emerald-200"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${brandColor}22`,
                  color: brandColor,
                }}
              >
                {brand ? brand.toUpperCase() : t("payments.form.brand", "CARD")}
              </span>
            </div>

            <span
              className="h-6 w-6 rounded-full shadow-inner shadow-black/20"
              style={{ background: brandColor }}
            />
          </div>

          <p
            className={`mt-4 text-lg tracking-[0.22em] font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {cardForm.number
              ? formatCardNumber(cardForm.number)
              : "•••• •••• •••• ••••"}
          </p>

          <div className="flex justify-between mt-4 text-[11px] opacity-85">
            <span className="truncate max-w-[65%]">
              {cardForm.holder ||
                t("payments.form.cardHolder", "Card holder name")}
            </span>
            <span>{cardForm.exp || "MM/YY"}</span>
          </div>
        </div>

        {/* CARD HOLDER */}
        <div>
          <label
            className={`block text-sm font-semibold mb-1 ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {t("payments.form.cardHolder", "Card holder name")}
          </label>
          <input
            type="text"
            value={cardForm.holder || ""}
            onChange={(e) =>
              handleCardFormChange("holder", formatHolderName(e.target.value))
            }
            aria-invalid={!!cardErrors.holder}
            className={`
              w-full rounded-xl px-4 py-3 shadow-sm border transition
              focus:outline-none focus:ring-2 focus:ring-emerald-500/70
              ${
                isDark
                  ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
              }
              ${
                cardErrors.holder
                  ? "!border-red-500 ring-1 ring-red-300"
                  : "focus:border-emerald-500/80"
              }
            `}
          />
          {cardErrors.holder && (
            <p className="text-red-500 text-xs mt-1">{cardErrors.holder}</p>
          )}
        </div>

        {/* CARD NUMBER */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className={`block text-sm font-semibold ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {t("payments.form.cardNumber", "Card number")}
            </label>
            <span className="text-[11px] opacity-70">
              {t("payments.form.cardNumberHint", "16–19 digits")}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={formatCardNumber(cardForm.number || "")}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                handleCardFormChange("number", digits);
              }}
              aria-invalid={!!cardErrors.number}
              className={`
                w-full rounded-xl px-4 py-3 shadow-sm border pr-12 transition
                focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                ${
                  isDark
                    ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }
                ${
                  cardErrors.number
                    ? "!border-red-500 ring-1 ring-red-300"
                    : "focus:border-emerald-500/80"
                }
              `}
            />

            {/* BRAND BUBBLE */}
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full shadow-inner shadow-black/20"
              style={{ background: brandColor }}
            />
          </div>

          {cardErrors.number && (
            <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>
          )}

          <p
            className={`mt-1 text-[11px] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t(
              "payments.form.cardNumberSecurity",
              "We never store your full card number on our servers."
            )}
          </p>
        </div>

        {/* EXP + CVV */}
        <div className="flex gap-4">
          {/* EXPIRY */}
          <div className="flex-1">
            <label
              className={`block text-sm font-semibold mb-1 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {t("payments.form.expiry", "Expiry (MM/YY)")}
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={formatExpiry(cardForm.exp || "")}
              onChange={(e) =>
                handleCardFormChange("exp", formatExpiry(e.target.value))
              }
              aria-invalid={!!cardErrors.exp}
              className={`
                w-full rounded-xl px-4 py-3 shadow-sm border transition
                focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                ${
                  isDark
                    ? "bg-slate-900/70 border-slate-700 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }
                ${
                  cardErrors.exp
                    ? "!border-red-500 ring-1 ring-red-300"
                    : "focus:border-emerald-500/80"
                }
              `}
            />
            {cardErrors.exp && (
              <p className="text-red-500 text-xs mt-1">{cardErrors.exp}</p>
            )}
          </div>

          {/* CVV */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <label
                className={`block text-sm font-semibold ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {t("payments.form.cvv", "CVV")}
              </label>
              <span className="text-[11px] opacity-70">
                {t("payments.form.cvvHint", "Back of your card")}
              </span>
            </div>

            <input
              type="text"
              placeholder="123"
              value={cardForm.cvv || ""}
              onChange={(e) => {
                const detected = detectBrand(cardForm.number || "");
                const max = detected === "amex" ? 4 : 3;
                handleCardFormChange(
                  "cvv",
                  e.target.value.replace(/\D/g, "").slice(0, max)
                );
              }}
              aria-invalid={!!cardErrors.cvv}
              className={`
                w-full rounded-xl px-4 py-3 shadow-sm border transition
                focus:outline-none focus:ring-2 focus:ring-emerald-500/70
                ${
                  isDark
                    ? "bg-slate-900/70 border-slate-700 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }
                ${
                  cardErrors.cvv
                    ? "!border-red-500 ring-1 ring-red-300"
                    : "focus:border-emerald-500/80"
                }
              `}
            />
            {cardErrors.cvv && (
              <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
            )}
          </div>
        </div>

        {/* SAVE CARD TOGGLE */}
        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!saveCardForLater}
            onChange={(e) => onSaveCardToggle?.(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span className={isDark ? "text-slate-200" : "text-slate-700"}>
            {t(
              "payments.form.saveForLater",
              "Save this card to Payment Methods for next time"
            )}
            <span className="block text-xs opacity-60">
              {t(
                "payments.securityHint",
                "We only store the last 4 digits and nickname; full number and CVV are never saved."
              )}
            </span>
          </span>
        </label>

        {/* NICKNAME */}
        <div>
          <label
            className={`block text-sm font-semibold mb-1 ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {t("payments.form.nickname", "Nickname (optional)")}
          </label>
          <input
            type="text"
            value={cardForm.nickname || ""}
            onChange={(e) =>
              handleCardFormChange?.("nickname", e.target.value)
            }
            placeholder={t(
              "payments.form.nicknamePlaceholder",
              "Personal card"
            )}
            className={`
              w-full rounded-xl px-4 py-3 shadow-sm border transition
              focus:outline-none focus:ring-2 focus:ring-emerald-500/70
              ${
                isDark
                  ? "bg-slate-900/70 border-slate-700 text-white"
                  : "bg-white border-slate-300 text-slate-900"
              }
              focus:border-emerald-500/80
            `}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className={`
              rounded-xl px-5 py-2 text-sm font-semibold border transition
              ${
                isDark
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            {t("common.cancel", "Cancel")}
          </button>

          <button
            type="submit"
            className="
              rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold 
              text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600 transition
            "
          >
            {t(
              "checkout.actions.completeOrder",
              "Place order"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
