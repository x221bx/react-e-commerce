// src/Authcomponents/AuthLayout.jsx
import Footer from "./Footer";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] p-6 md:p-8">
          <header className="mb-6 text-center space-y-2">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
          </header>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}

AuthLayout.Footer = Footer;

export default AuthLayout;
