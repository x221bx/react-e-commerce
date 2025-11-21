import { useMemo, useState } from "react";
import {
  CreditCard,
  WalletCards,
  ShieldCheck,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import Input from "../../components/ui/Input";
import { UseTheme } from "../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";

const initialMethods = [
  {
    id: "card-1",
    type: "card",
    brand: "visa",
    holder: "Ahmad Farmer",
    last4: "4242",
    exp: "04/27",
    nickname: "Farm supplies",
    isDefault: true,
  },
  {
    id: "wallet-1",
    type: "wallet",
    provider: "paypal",
    email: "billing@farmhub.dev",
    isDefault: false,
  },
];

const brandCopy = {
  visa: { label: "Visa", color: "text-sky-600" },
  mastercard: { label: "Mastercard", color: "text-amber-600" },
  amex: { label: "American Express", color: "text-emerald-600" },
};

const walletLabels = {
  paypal: "PayPal",
  apple: "Apple Pay",
  google: "Google Wallet",
};

export default function PaymentMethods() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const [methods, setMethods] = useState(initialMethods);
  const [cardForm, setCardForm] = useState({
    holder: "",
    number: "",
    exp: "",
    cvv: "",
    nickname: "",
  });
  const [walletForm, setWalletForm] = useState({
    provider: "paypal",
    email: "",
  });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [cardErrors, setCardErrors] = useState({});
  const [walletErrors, setWalletErrors] = useState({});
  const isDark = theme === "dark";

  const defaultMethod = useMemo(
    () => methods.find((method) => method.isDefault),
    [methods]
  );

  const activeCards = useMemo(
    () => methods.filter((method) => method.type === "card"),
    [methods]
  );

  const activeWallets = useMemo(
    () => methods.filter((method) => method.type === "wallet"),
    [methods]
  );

  const accentText = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const badgeSurface = isDark
    ? "border-emerald-800/40 bg-emerald-900/30 text-emerald-100"
    : "border-emerald-100 bg-emerald-50/60 text-emerald-700";
  const panelSurface = isDark
    ? "border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-900/40"
    : "border-slate-100 bg-white/95";
  const dashedSurface = isDark
    ? "border-slate-800 text-slate-400"
    : "border-slate-200 text-slate-500";
  const labelColor = isDark ? "text-slate-200" : "text-slate-700";
  const quietButton = isDark
    ? "border-slate-700/70 text-slate-100 hover:bg-slate-800/70"
    : "border-slate-200 text-slate-700 hover:bg-slate-50";
  const selectBase = isDark
    ? "border-slate-700 bg-slate-900 text-slate-100"
    : "border-slate-200 bg-white text-slate-700";
  const selectFocus = isDark
    ? "focus:border-emerald-500 focus:ring-emerald-500/30"
    : "focus:border-emerald-400 focus:ring-emerald-100";

  const luhnCheck = (raw) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = raw.length - 1; i >= 0; i -= 1) {
      let digit = parseInt(raw[i], 10);
      if (Number.isNaN(digit)) return false;
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (value) => {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) return false;
    const [_, month, year] = match;
    const monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12) return false;
    const fullYear = 2000 + Number(year);
    const expiry = new Date(fullYear, monthNum - 1, 1);
    expiry.setMonth(expiry.getMonth() + 1);
    return expiry > new Date();
  };

  const handleCardFormChange = (field, value) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
    setCardErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleWalletFormChange = (field, value) => {
    setWalletForm((prev) => ({ ...prev, [field]: value }));
    setWalletErrors((prev) => ({ ...prev, [field]: undefined }));
  };


    const handleAddCard = (event) => {
      event.preventDefault();
      const errors = {};
      const holder = cardForm.holder.trim();
      const sanitizedNumber = cardForm.number.replace(/\s+/g, "");
      const cvvTrimmed = cardForm.cvv.trim();
  
      if (!holder) {
        errors.holder = t("payments.errors.holder", "Please enter the card holder name.");
      }
      if (sanitizedNumber.length < 13 || sanitizedNumber.length > 19 || !luhnCheck(sanitizedNumber)) {
        errors.number = t("payments.errors.number", "Enter a valid card number.");
      }
      if (!validateExpiry(cardForm.exp)) {
        errors.exp = t("payments.errors.expiry", "Expiry must be MM/YY and in the future.");
      }
      if (cvvTrimmed.length < 3 || cvvTrimmed.length > 4 || /\D/.test(cvvTrimmed)) {
        errors.cvv = t("payments.errors.cvv", "Enter the 3 or 4 digit CVV.");
      }
  
      if (Object.keys(errors).length) {
        setCardErrors(errors);
        return;
      }
  
      setIsAddingCard(true);
      setTimeout(() => {
        setMethods((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "card",
            brand: detectBrand(sanitizedNumber),
            holder,
            last4: sanitizedNumber.slice(-4),
            exp: cardForm.exp,
            nickname: cardForm.nickname.trim(),
            isDefault: prev.length === 0,
          },
        ]);
        setCardForm({ holder: "", number: "", exp: "", cvv: "", nickname: "" });
        setCardErrors({});
        setIsAddingCard(false);
      }, 600);
    };
  
    const handleAddWallet = (event) => {
      event.preventDefault();
      const errors = {};
      const email = walletForm.email.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = t("payments.errors.email", "Enter a valid email address.");
      }
  
      if (Object.keys(errors).length) {
        setWalletErrors(errors);
        return;
      }
  
      setIsAddingWallet(true);
      setTimeout(() => {
        setMethods((prev) => [
          ...prev,
          {
            id: generateId(),
            type: "wallet",
            provider: walletForm.provider,
            email,
            isDefault: methods.length === 0,
          },
        ]);
        setWalletForm({ provider: "paypal", email: "" });
        setWalletErrors({});
        setIsAddingWallet(false);
      }, 600);
    };

const handleDeleteMethod = (id) => {
    setMethods((prev) => prev.filter((method) => method.id !== id));
  };

  const handleSetDefault = (id) => {
    setMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className={`text-sm font-semibold uppercase tracking-wide ${accentText}`}>
          Billing & payments
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-semibold ${headingColor}`}>Payment Methods</h1>
            <p className={`text-sm ${subText}`}>
              Store cards and wallets you trust. Everything renders responsively across the
              account hub.
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${badgeSurface}`}>
            {defaultMethod
              ? `Default: ${getMethodLabel(defaultMethod)}`
              : "No default method"}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className={`space-y-4 rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${headingColor}`}>Active methods</p>
              <p className={`text-xs ${subText}`}>
                {methods.length} saved | {activeCards.length} cards | {activeWallets.length} wallets
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="space-y-3">
            {methods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onMakeDefault={() => handleSetDefault(method.id)}
                onDelete={() => handleDeleteMethod(method.id)}
                isDark={isDark}
                t={t}
              />
            ))}
            {methods.length === 0 && (
              <div className={`rounded-2xl border border-dashed p-6 text-center text-sm ${dashedSurface}`}>
                No payment methods saved yet. Use the forms on the right to add one.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className={`rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
            <div className={`mb-4 flex items-center gap-2 ${headingColor}`}>
              <CreditCard className="h-4 w-4" />
              <p className="text-sm font-semibold">
                {t("payments.form.cardTitle", "Add new card")}
              </p>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
              <Input
                label={t("payments.form.cardHolder", "Card holder name")}
                value={cardForm.holder}
                onChange={(e) => handleCardFormChange("holder", e.target.value)}
                error={cardErrors.holder}
              />
              <Input
                label={t("payments.form.cardNumber", "Card number")}
                value={cardForm.number}
                onChange={(e) => handleCardFormChange("number", e.target.value.replace(/\s+/g, ""))}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                error={cardErrors.number}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t("payments.form.expiry", "Expiry (MM/YY)")}
                  value={cardForm.exp}
                  onChange={(e) => handleCardFormChange("exp", e.target.value)}
                  placeholder="04/27"
                  error={cardErrors.exp}
                />
                <Input
                  label={t("payments.form.cvv", "CVV")}
                  value={cardForm.cvv}
                  onChange={(e) => handleCardFormChange("cvv", e.target.value.slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  error={cardErrors.cvv}
                />
              </div>
              <Input
                label={t("payments.form.nickname", "Nickname (optional)")}
                value={cardForm.nickname}
                onChange={(e) => handleCardFormChange("nickname", e.target.value)}
                placeholder={t("payments.form.nicknamePlaceholder", "Farm purchases")}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isAddingCard}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${quietButton}`}
                >
                  <Plus className="h-4 w-4" />
                  {isAddingCard
                    ? t("payments.form.saving", "Saving...")
                    : t("payments.form.saveCard", "Save card")}
                </button>
                <button
                  type="button"
                  onClick={() => setCardForm({ holder: "", number: "", exp: "", cvv: "", nickname: "" })}
                  className="text-sm font-semibold text-emerald-500 hover:underline"
                >
                  {t("payments.form.reset", "Reset")}
                </button>
              </div>
            </form>
          </div>

          <div className={`rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
            <div className={`mb-4 flex items-center gap-2 ${headingColor}`}>
              <WalletCards className="h-4 w-4" />
              <p className="text-sm font-semibold">
                {t("payments.form.walletTitle", "Link wallet")}
              </p>
            </div>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <label className={`flex flex-col gap-2 text-sm font-medium ${labelColor}`}>
                {t("payments.form.walletProvider", "Provider")}
                <select
                  value={walletForm.provider}
                  onChange={(e) => handleWalletFormChange("provider", e.target.value)}
                  className={`h-11 rounded-xl px-3 text-sm font-normal shadow-sm transition focus:outline-none focus:ring-2 ${selectBase} ${selectFocus}`}
                >
                  <option value="paypal">PayPal</option>
                  <option value="apple">Apple Pay</option>
                  <option value="google">Google Wallet</option>
                </select>
              </label>
              <Input
                label={t("payments.form.walletEmail", "Account email")}
                value={walletForm.email}
                onChange={(e) => handleWalletFormChange("email", e.target.value)}
                placeholder="team@farmhub.dev"
                error={walletErrors.email}
              />
              <button
                type="submit"
                disabled={isAddingWallet}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${quietButton}`}
              >
                <Plus className="h-4 w-4" />
                {isAddingWallet
                  ? t("payments.form.linking", "Linking...")
                  : t("payments.form.linkWallet", "Link wallet")}
              </button>
            </form>
          </div>

        </aside>
      </div>
    </div>
  );
}

function PaymentMethodCard({ method, onMakeDefault, onDelete, isDark, t }) {
  const isCard = method.type === "card";
  const badge =
    isCard && brandCopy[method.brand]
      ? brandCopy[method.brand]
      : { label: walletLabels[method.provider] || "Wallet", color: "text-emerald-600" };
  const surface = isDark
    ? "border-slate-800/70 bg-gradient-to-br from-slate-900/60 to-slate-900/30"
    : "border-slate-100 bg-white/90";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const defaultBadge = isDark
    ? "bg-emerald-900/30 text-emerald-200"
    : "bg-emerald-50 text-emerald-700";
  const outlineButton = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
    : "border-slate-200 text-slate-700 hover:bg-slate-50";
  const destructiveButton = isDark
    ? "border-red-900/40 text-red-200 hover:bg-red-900/30"
    : "border-red-200 text-red-600 hover:bg-red-50";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${surface}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isCard ? (
            <CreditCard className="h-5 w-5 text-emerald-500" />
          ) : (
            <WalletCards className="h-5 w-5 text-emerald-500" />
          )}
          <div>
            <p className={`text-sm font-semibold ${headingColor}`}>
              {getMethodLabel(method)}
            </p>
            <p className={`text-xs ${muted}`}>
              {isCard
                ? `${badge.label} ending in ${method.last4}`
                : `${badge.label} - ${method.email}`}
            </p>
          </div>
        </div>
        {method.isDefault && (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${defaultBadge}`}>
            <Star className="h-3 w-3" />
            {t("payments.status.defaultBadge", "Default")}
          </span>
        )}
      </div>

      {method.nickname && (
        <p className={`mt-2 text-xs ${muted}`}>{method.nickname}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        {!method.isDefault && (
          <button
            type="button"
            onClick={onMakeDefault}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${outlineButton}`}
          >
            <Star className="h-3 w-3" />
            {t("payments.actions.makeDefault", "Make default")}
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${destructiveButton}`}
        >
          <Trash2 className="h-3 w-3" />
          {t("payments.actions.delete", "Delete")}
        </button>
      </div>
    </div>
  );
}

function detectBrand(number) {
  if (number.startsWith("34") || number.startsWith("37")) return "amex";
  if (number.startsWith("5")) return "mastercard";
  return "visa";
}

function getMethodLabel(method) {
  if (method.type === "card") {
    const brand = brandCopy[method.brand]?.label || "Card";
    return method.nickname || `${brand} **** ${method.last4}`;
  }

  const label = walletLabels[method.provider] || "Wallet";
  return method.nickname || `${label} (${method.email})`;
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
