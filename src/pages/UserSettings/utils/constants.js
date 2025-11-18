import {
  AlertTriangle,
  BellRing,
  Globe,
  ShieldCheck,
  UserRound,
} from "lucide-react";

// UserSettings Constants
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export const navItems = [
  { id: "personal", label: "Personal Info", icon: UserRound, category: "profile", description: "Update your personal details" },
  { id: "security", label: "Security", icon: ShieldCheck, category: "profile", description: "Password and account security" },
  { id: "notifications", label: "Notifications", icon: BellRing, category: "preferences", description: "Manage your alerts" },
  { id: "preferences", label: "Preferences", icon: Globe, category: "preferences", description: "Language and display settings" },
  { id: "account", label: "Account", icon: AlertTriangle, category: "account", description: "Account management" },
];

export const navCategories = [
  {
    id: "profile",
    label: "Profile",
    icon: "👤",
    description: "Personal information and security",
    color: "emerald"
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: "⚙️",
    description: "Customize your experience",
    color: "blue"
  },
  {
    id: "account",
    label: "Account",
    icon: "👑",
    description: "Account management",
    color: "red"
  },
];

export const notificationDefaults = {
  productUpdates: true,
  orderUpdates: true,
  securityAlerts: true,
  marketingEmails: false,
};

export const preferenceDefaults = {
  locale: "en",
  measurement: "metric",
  deliveryNotes: "",
};

export const emptySecurityForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const notificationCopy = {
  productUpdates: "Weekly highlights about new agri-vet products and bundles.",
  orderUpdates: "Delivery tracking and billing reminders for every purchase.",
  securityAlerts: "Sign-in alerts and unusual activity notifications.",
  marketingEmails: "Seasonal promotions and educational content.",
};

export const notificationGroups = [
  {
    id: "orders",
    label: "Orders & fulfillment",
    description: "Stay in sync with shipments, invoices, and restocks.",
    keys: ["orderUpdates", "productUpdates"],
  },
  {
    id: "security",
    label: "Security & sign-in",
    description: "Be alerted whenever something looks suspicious.",
    keys: ["securityAlerts"],
  },
  {
    id: "marketing",
    label: "Learning & offers",
    description: "Occasional tips, education, and seasonal deals.",
    keys: ["marketingEmails"],
  },
];

export const accountActionCopy = {
  deactivate: {
    title: "Confirm deactivation",
    description:
      "We'll pause your activity and hide your storefront until you sign back in.",
    confirmLabel: "Yes, deactivate",
  },
  delete: {
    title: "Request permanent deletion",
    description:
      "This removes your data after a manual review by our team. You'll lose access to order history and saved preferences.",
    confirmLabel: "Request deletion",
  },
};

export const sectionToneStyles = {
  neutral: {
    light: "border border-slate-100 bg-white/95",
    dark: "border border-slate-800 bg-slate-900/80",
  },
  highlight: {
    light: "border border-emerald-100 bg-gradient-to-b from-white/95 to-emerald-50/60",
    dark: "border border-emerald-900/30 bg-gradient-to-b from-slate-900/80 to-emerald-950/30",
  },
  danger: {
    light: "border border-red-100 bg-red-50/80",
    dark: "border border-red-900/40 bg-red-950/30",
  },
};
