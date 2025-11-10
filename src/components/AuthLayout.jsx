export default function AuthLayout({
  title,
  subtitle,
  children,
  from = "from-[#49BBBD]",
  via = "via-[#36A2A4]",
  to = "to-[#2F7E80]",
  imageSrc,
  imageAlt = "Illustration",
}) {
  return (
    <div className="h-[calc(100svh-var(--nav-h))] bg-white">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-2">
        <aside className="relative hidden h-full overflow-hidden lg:block">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${from} ${via} ${to}`}
          />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col p-8 xl:p-10">
            <div className="mt-6 flex-1">
              <div className="h-full w-full overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/15">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm text-white/70">
                    [ Illustration Placeholder ]
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section
          className="relative h-full min-h-0 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            scrollbarGutter: "stable both-edges",
          }}
        >
          <div className="mx-auto flex min-h-full w-full max-w-xl px-6 sm:px-10">
            <div className="my-auto w-full py-10">
              <header className="mb-6">
                <h1 className="text-[28px] font-extrabold text-gray-900 sm:text-3xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 text-gray-600">{subtitle}</p>
                ) : null}
              </header>

              <div className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-7">
                <div className="min-h-8" aria-hidden="true" />
                {children}
              </div>

              <div className="h-6" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
