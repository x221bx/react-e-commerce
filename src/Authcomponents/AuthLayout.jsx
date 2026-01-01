// src/Authcomponents/AuthLayout.jsx
import { FiCheckCircle, FiHeadphones, FiShield, FiTruck } from "react-icons/fi";
import Footer from "./Footer";

const defaultBullets = [
  {
    title: "Verified suppliers",
    description: "We only list vetted veterinary partners with cold-chain handling.",
    icon: FiShield,
  },
  {
    title: "Fast fulfillment",
    description: "Trackable delivery windows built for clinic schedules.",
    icon: FiTruck,
  },
  {
    title: "In-language support",
    description: "Specialists available in English and Arabic for quick help.",
    icon: FiHeadphones,
  },
];

function AuthLayout({
  eyebrow = "Farm Vet E-Shop",
  title,
  subtitle,
  heroTitle,
  heroSubtitle,
  heroBullets = [],
  stat,
  badge,
  note,
  children,
  variant = "split", // "split" | "simple"
  showFooter = true,
}) {
  const bullets = heroBullets.length ? heroBullets : defaultBullets;

  if (variant === "simple") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] p-6 md:p-8">
            <header className="space-y-2 text-center">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                  {eyebrow}
                </span>
              )}
              <h1 className="text-3xl font-bold text-[var(--color-text)]">{title}</h1>
              {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
            </header>

            <div className="mt-6 space-y-6">{children}</div>

            {note && (
              <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                {note}
              </div>
            )}
          </div>
        </div>
        {showFooter && <Footer />}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4fbf8] via-[var(--color-bg)] to-[#e1f4f2] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <aside className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)] backdrop-blur">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-600/10 blur-3xl" />
            <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative space-y-5">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                  {eyebrow}
                </span>
              )}

              <h1 className="text-3xl font-bold leading-tight md:text-4xl">{heroTitle || title}</h1>
              {heroSubtitle && <p className="max-w-2xl text-[var(--color-text-muted)]">{heroSubtitle}</p>}

              <div className="mt-4 grid gap-3">
                {bullets.map((item, idx) => {
                  const Icon = item.icon || FiCheckCircle;
                  return (
                    <div
                      key={`${item.title}-${idx}`}
                      className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-3 shadow-[var(--shadow-sm)]"
                    >
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/10 text-[var(--color-accent)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-[var(--color-text-muted)]">{item.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {stat && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600/10 text-[var(--color-accent)]">
                      <FiShield className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                      <p className="text-xl font-semibold text-[var(--color-text)]">{stat.value}</p>
                    </div>
                  </div>
                  {stat.helper && <p className="text-sm text-[var(--color-text-muted)]">{stat.helper}</p>}
                </div>
              )}
            </div>
          </aside>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] backdrop-blur-sm">
              <div className="border-b border-[var(--color-border)] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {badge && (
                      <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {badge}
                      </span>
                    )}
                    <h2 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
                  </div>
                  <span className="hidden h-12 w-12 items-center justify-center rounded-full bg-emerald-600/10 text-[var(--color-accent)] sm:inline-flex">
                    <FiHeadphones className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">{children}</div>

              {note && (
                <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-4 text-sm text-[var(--color-text-muted)]">
                  {note}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

AuthLayout.Footer = Footer;

export default AuthLayout;
