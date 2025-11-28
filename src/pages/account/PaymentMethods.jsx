import { useEffect, useMemo, useRef, useState } from "react";
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
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import ConfirmDialog from "../../admin/ConfirmDialog";

const brandCopy = {
  visa: {
    label: "Visa",
    color: "text-sky-600",
    gradient: "linear-gradient(135deg, #1a6cf3, #0ba3f5)",
  },
  mastercard: {
    label: "Mastercard",
    color: "text-orange-600",
    gradient: "linear-gradient(135deg, #ff8c37, #ff3c3c)",
  },
  amex: {
    label: "American Express",
    color: "text-emerald-600",
    gradient: "linear-gradient(135deg, #028174, #1bc8b1)",
  },
};

const walletLabels = {
  paypal: "PayPal",
  apple: "Apple Pay",
  google: "Google Wallet",
};

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function PaymentMethods() {
  const { theme } = UseTheme();
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const [methods, setMethods] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [cardValid, setCardValid] = useState(false);
  const [lastAddAttempt, setLastAddAttempt] = useState(0);
  const cardHolderRef = useRef(null);

  // Auto-focus on card holder field when component mounts
  useEffect(() => {
    if (cardHolderRef.current) {
      cardHolderRef.current.focus();
    }
  }, []);
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
    const [, month, year] = match;
    const monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12) return false;
    const fullYear = 2000 + Number(year);
    const expiry = new Date(fullYear, monthNum - 1, 1);
    expiry.setMonth(expiry.getMonth() + 1);
    return expiry > new Date();
  };

  const detectBrand = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    if (/^4\d{12,18}$/.test(cleaned)) return "visa";
    if (/^3[47]\d{13}$/.test(cleaned)) return "amex";
    if (
      /^5[1-5]\d{14}$/.test(cleaned) ||
      /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/.test(cleaned)
    ) {
      return "mastercard";
    }
    return null;
  };

  const getExpectedLength = (brand) => {
    switch (brand) {
      case "amex": return 15;
      case "visa": return [13, 16, 18, 19];
      case "mastercard": return 16;
      default: return [13, 14, 15, 16, 17, 18, 19];
    }
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatHolderName = (value) =>
    value
      .replace(/[^A-Za-z\s]/g, "") // allow English letters and spaces only
      .toUpperCase();

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleCardFormChange = (field, value) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
    setCardErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Real-time card validation
  useEffect(() => {
    const sanitizedNumber = cardForm.number.replace(/\s+/g, "");
    const brand = detectBrand(sanitizedNumber);
    const expectedLengths = getExpectedLength(brand);
    const isValidLength = Array.isArray(expectedLengths)
      ? expectedLengths.includes(sanitizedNumber.length)
      : sanitizedNumber.length === expectedLengths;

    const isValid = brand && isValidLength && luhnCheck(sanitizedNumber);
    setCardValid(isValid);
  }, [cardForm.number]);

  const handleWalletFormChange = (field, value) => {
    setWalletForm((prev) => ({ ...prev, [field]: value }));
    setWalletErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Load payment methods from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setMethods([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const colRef = collection(db, "users", user.uid, "paymentMethods");
    getDocs(query(colRef))
      .then((snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aDate = a.createdAt?.toMillis?.() || 0;
            const bDate = b.createdAt?.toMillis?.() || 0;
            return bDate - aDate;
          });
        setMethods(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load payment methods", err);
        setLoading(false);
      });
  }, [user?.uid]);

  const ensureSingleDefault = async (keepId) => {
    if (!user?.uid || !keepId) return;
    const snap = await getDocs(collection(db, "users", user.uid, "paymentMethods"));
    const tasks = snap.docs.map((d) => updateDoc(d.ref, { isDefault: d.id === keepId }));
    await Promise.all(tasks);
  };

  const handleAddCard = (event) => {
    event.preventDefault();

    // Rate limiting: prevent adding cards too quickly (minimum 2 seconds between attempts)
    const now = Date.now();
    if (now - lastAddAttempt < 2000) {
      setCardErrors({ general: t("common.rateLimitExceeded", "Too many attempts. Please wait {{seconds}} seconds.", { seconds: 2 }) });
      return;
    }
    setLastAddAttempt(now);

    const errors = {};
    const holder = cardForm.holder.trim();
    const sanitizedNumber = cardForm.number.replace(/\s+/g, "");
    const cvvTrimmed = cardForm.cvv.trim();
    const brand = detectBrand(sanitizedNumber);

    if (!holder) {
      errors.holder = t("payments.errors.holder", "Please enter the card holder name.");
    } else if (!/^[A-Z\\s]+$/.test(holder)) {
      errors.holder = t("payments.errors.holder", "Use letters only (A-Z).");
    }

    const numberTooShort = sanitizedNumber.length < 13;
    const numberTooLong = sanitizedNumber.length > 19;
    const invalidLuhn = !luhnCheck(sanitizedNumber);

    const brandLengthOk =
      (brand === "visa" &&
        (sanitizedNumber.length === 13 ||
          sanitizedNumber.length === 16 ||
          sanitizedNumber.length === 19)) ||
      (brand === "mastercard" && sanitizedNumber.length === 16) ||
      (brand === "amex" && sanitizedNumber.length === 15);

    if (!brand || numberTooShort || numberTooLong || invalidLuhn || !brandLengthOk) {
      errors.number = t("payments.errors.number", "Enter a valid card number.");
    }
    if (!validateExpiry(cardForm.exp)) {
      errors.exp = t("payments.errors.expiry", "Expiry must be MM/YY and in the future.");
    }
    const expectedCvvLen = brand === "amex" ? 4 : 3;
    if (cvvTrimmed.length !== expectedCvvLen || /\D/.test(cvvTrimmed)) {
      errors.cvv = t("payments.errors.cvv", "Enter the 3 or 4 digit CVV.");
    }
    if (!user?.uid) {
      errors.general = t("common.error", "Error");
    }

    if (Object.keys(errors).length) {
      setCardErrors(errors);
      return;
    }

    setIsAddingCard(true);
    const id = generateId();
    const newMethod = {
      id,
      type: "card",
      brand,
      holder,
      last4: sanitizedNumber.slice(-4),
      // Note: Expiry date is not stored for security reasons (PCI DSS compliance)
      nickname: cardForm.nickname.trim(),
      isDefault: methods.length === 0 || !methods.some((m) => m.isDefault),
      createdAt: serverTimestamp(),
    };

    const ref = doc(db, "users", user.uid, "paymentMethods", id);
    setDoc(ref, newMethod)
      .then(() =>
        ensureSingleDefault(
          newMethod.isDefault ? id : methods.find((m) => m.isDefault)?.id || id
        )
      )
      .then(() => {
        // Refresh the list after adding
        const colRef = collection(db, "users", user.uid, "paymentMethods");
        return getDocs(query(colRef));
      })
      .then((snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aDate = a.createdAt?.toMillis?.() || 0;
            const bDate = b.createdAt?.toMillis?.() || 0;
            return bDate - aDate;
          });
        setMethods(data);
      })
      .catch((err) => console.error("Failed to save card", err))
      .finally(() => {
        setCardForm({ holder: "", number: "", exp: "", cvv: "", nickname: "" });
        setCardErrors({});
        setIsAddingCard(false);
      });
  };

  const handleAddWallet = (event) => {
    event.preventDefault();
    const errors = {};
    const email = walletForm.email.trim();
    if (!email || !isValidEmail(email)) {
      errors.email = t("payments.errors.email", "Enter a valid email address.");
    }
    if (!user?.uid) {
      errors.general = t("common.error", "Error");
    }

    if (Object.keys(errors).length) {
      setWalletErrors(errors);
      return;
    }

    setIsAddingWallet(true);
    const id = generateId();
    const newMethod = {
      id,
      type: "wallet",
      provider: walletForm.provider,
      email,
      isDefault: methods.length === 0 || !methods.some((m) => m.isDefault),
      createdAt: serverTimestamp(),
    };

    const ref = doc(db, "users", user.uid, "paymentMethods", id);
    setDoc(ref, newMethod)
      .then(() =>
        ensureSingleDefault(
          newMethod.isDefault ? id : methods.find((m) => m.isDefault)?.id || id
        )
      )
      .then(() => {
        // Refresh the list after adding
        const colRef = collection(db, "users", user.uid, "paymentMethods");
        return getDocs(query(colRef));
      })
      .then((snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aDate = a.createdAt?.toMillis?.() || 0;
            const bDate = b.createdAt?.toMillis?.() || 0;
            return bDate - aDate;
          });
        setMethods(data);
      })
      .catch((err) => console.error("Failed to save wallet", err))
      .finally(() => {
        setWalletForm({ provider: "paypal", email: "" });
        setWalletErrors({});
        setIsAddingWallet(false);
      });
  };

  const handleDeleteMethod = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDeleteMethod = async () => {
    if (!user?.uid || !deleteConfirm) return;
    const ref = doc(db, "users", user.uid, "paymentMethods", deleteConfirm);

    try {
      await deleteDoc(ref);
      const colRef = collection(db, "users", user.uid, "paymentMethods");
      const snap = await getDocs(query(colRef));
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aDate = a.createdAt?.toMillis?.() || 0;
          const bDate = b.createdAt?.toMillis?.() || 0;
          return bDate - aDate;
        });

      // ensure a default method remains
      const hasDefault = data.some((method) => method.isDefault);
      if (!hasDefault && data[0]) {
        await ensureSingleDefault(data[0].id);
        const refreshedSnap = await getDocs(query(colRef));
        const refreshed = refreshedSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aDate = a.createdAt?.toMillis?.() || 0;
            const bDate = b.createdAt?.toMillis?.() || 0;
            return bDate - aDate;
          });
        setMethods(refreshed);
      } else {
        setMethods(data);
      }
    } catch (err) {
      console.error("Failed to delete method", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSetDefault = (id) => {
    ensureSingleDefault(id).catch((err) => console.error("Failed to set default", err));
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-600 dark:text-slate-300">
        {t("account.login_required_title", "Please log in to view your payment methods")}
      </div>
    );
  }

  const detectedBrand = detectBrand(cardForm.number);
  const brandMeta = detectedBrand ? brandCopy[detectedBrand] : null;
  const brandLabel = brandMeta?.label || t("payments.brandUnknown", "Card type not recognized yet");
  const brandColor = brandMeta?.color || "text-slate-500";
  const brandGradient = brandMeta?.gradient || "linear-gradient(135deg, #0f766e, #2dd4bf)";

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className={`text-sm font-semibold uppercase tracking-wide ${accentText}`}>
          {t("payments.eyebrow", "Billing & payments")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-semibold ${headingColor}`}>Payment Methods</h1>
            <p className={`text-sm ${subText}`}>
              {t("payments.subtitle", "Manage cards and wallets used for faster checkout.")}
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
                {loading
                  ? t("common.loading", "Loading...")
                  : t("payments.noMethods", "No payment methods saved yet. Use the forms on the right to add one.")}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className={`rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
            <div className={`mb-3 flex items-center gap-2 ${headingColor}`}>
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-semibold">
                {t("payments.form.cardPreview", "Card preview")}
              </p>
            </div>
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xl transition-all duration-500"
              style={{
                background: brandGradient,
                minHeight: 190,
              }}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] opacity-95">
                <span className={`font-semibold ${brandColor}`}>
                  {brandLabel}
                </span>
                <div className="flex items-center gap-2 text-[11px] opacity-90">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{t("payments.cardLabel", "Card")}</span>
                </div>
              </div>
              <div className="mt-5 h-8 w-14 rounded-md bg-white/25 shadow-inner" aria-hidden="true" />
              <div className="mt-4 text-lg tracking-[0.22em] font-semibold">
                {formatCardNumber(cardForm.number).padEnd(19, "•") || "•••• •••• •••• ••••"}
              </div>
              <div className="mt-6 flex items-end justify-between text-sm">
                <div>
                  <p className="text-[11px] uppercase opacity-75">{t("payments.nameLabel", "Name")}</p>
                  <p className="font-semibold">
                    {cardForm.holder || t("payments.form.cardHolder", "Card holder name")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase opacity-75">{t("payments.expLabel", "EXP")}</p>
                  <p className="font-semibold">{cardForm.exp ? formatExpiry(cardForm.exp) : t("payments.expPlaceholder", "MM/YY")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border p-5 shadow-lg ${panelSurface}`}>
            <div className={`mb-4 flex items-center gap-2 ${headingColor}`}>
              <CreditCard className="h-4 w-4" />
              <p className="text-sm font-semibold">
                {t("payments.form.cardTitle", "Add new card")}
              </p>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
              <Input
                ref={cardHolderRef}
                label={t("payments.form.cardHolder", "Card holder name")}
                value={cardForm.holder}
                onChange={(e) =>
                  handleCardFormChange("holder", formatHolderName(e.target.value))
                }
                error={cardErrors.holder}
                autoFocus
              />
              <Input
                label={t("payments.form.cardNumber", "Card number")}
                value={formatCardNumber(cardForm.number)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                  handleCardFormChange("number", digits);
                }}
                placeholder="4242 4242 4242 4242"
                maxLength={23}
                error={cardErrors.number}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${brandColor} flex items-center gap-1`}>
                  {detectedBrand && <span className="text-green-500">✓</span>}
                  {brandLabel}
                  {cardValid && <span className="text-green-600 ml-1">({t("common.valid", "Valid")})</span>}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {t("payments.securityHint", "We only store last 4; full number and CVV never saved.")}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t("payments.form.expiry", "Expiry (MM/YY)")}
                  value={formatExpiry(cardForm.exp)}
                  onChange={(e) => handleCardFormChange("exp", formatExpiry(e.target.value))}
                  placeholder="04/27"
                  error={cardErrors.exp}
                />
                <Input
                  label={t("payments.form.cvv", "CVV")}
                  value={cardForm.cvv}
                  onChange={(e) => {
                    const brand = detectBrand(cardForm.number);
                    const max = brand === "amex" ? 4 : 3;
                    handleCardFormChange("cvv", e.target.value.replace(/\D/g, "").slice(0, max));
                  }}
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
                  onClick={() =>
                    setCardForm({ holder: "", number: "", exp: "", cvv: "", nickname: "" })
                  }
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

      <ConfirmDialog
        open={!!deleteConfirm}
        title={t("payments.confirmDeleteTitle", "Delete Payment Method")}
        message={t("payments.confirmDeleteMessage", "Are you sure you want to delete this payment method? This action cannot be undone.")}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
        onConfirm={confirmDeleteMethod}
        onCancel={() => setDeleteConfirm(null)}
        confirmTone="danger"
      />
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
                ? `${badge.label} ${t("payments.endingIn", "ending in")} ${method.last4}`
                : `${badge.label} ${t("payments.separator", "-")} ${method.email}`}
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
