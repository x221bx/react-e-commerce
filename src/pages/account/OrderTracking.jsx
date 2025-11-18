import { UseTheme } from "../../theme/ThemeProvider";

const steps = [
  {
    title: "Order Placed",
    time: "July 26, 2024, 10:30 AM",
    state: "done",
  },
  {
    title: "Processing",
    time: "July 26, 2024, 11:00 AM",
    state: "done",
  },
  {
    title: "Shipped",
    time: "July 27, 2024, 09:15 AM",
    state: "current",
  },
  {
    title: "Out for Delivery",
    time: "Awaiting update",
    state: "pending",
  },
  {
    title: "Delivered",
    time: "Estimated: July 29, 2024",
    state: "pending",
  },
];

const shippingInfo = {
  recipient: "Main Farmhouse",
  address: "123 Green Valley Rd, Harvestown, HT 54321",
  carrier: "Agri-Logistics Express",
  trackingNumber: "ALE123456789",
};

export default function OrderTracking() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";
  const accent = isDark ? "text-emerald-300" : "text-emerald-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subtleButton = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800/70"
    : "border-slate-200 text-slate-600 hover:bg-slate-50";
  const shellSurface = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-100 bg-white";
  const headerMuted = isDark ? "text-slate-400" : "text-slate-500";
  const strongText = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const infoSurface = isDark
    ? "border-slate-800 bg-slate-900 text-slate-300"
    : "border-slate-100 bg-slate-50 text-slate-600";
  const infoHeading = isDark ? "text-white" : "text-slate-900";
  const connectorColor = isDark ? "bg-slate-800" : "bg-slate-200";
  const timelineIndicator = (state) => {
    if (state === "done") {
      return "border-emerald-500 bg-emerald-500 text-white";
    }
    if (state === "current") {
      return isDark
        ? "border-amber-400 bg-amber-900/40 text-amber-200"
        : "border-amber-400 bg-amber-50 text-amber-600";
    }
    return isDark
      ? "border-slate-700 bg-slate-900 text-slate-500"
      : "border-slate-200 bg-white text-slate-400";
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
            Track your recent purchases
          </p>
          <h1 className={`text-3xl font-semibold ${headingColor}`}>Order Tracking</h1>
        </div>
        <button className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${subtleButton}`}>
          View all orders
        </button>
      </header>

      <div className={`rounded-3xl border shadow-sm ${shellSurface}`}>
        <div className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 text-sm ${headerMuted} ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Order</p>
            <p className={`text-base font-semibold ${headingColor}`}>#AGRI-2024-00128</p>
            <p>Placed on July 26, 2024</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
            <p className={`text-2xl font-semibold ${headingColor}`}>$245.50</p>
          </div>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
          <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted}`}>
              Tracking Status
            </h2>
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${timelineIndicator(step.state)}`}
                    >
                      {index + 1}
                    </span>
                    {index !== steps.length - 1 && (
                      <div className={`mt-1 h-12 w-px ${connectorColor}`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${strongText}`}>{step.title}</p>
                    <p className={`text-sm ${muted}`}>{step.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={`rounded-2xl border p-4 text-sm ${infoSurface}`}>
            <h2 className={`text-base font-semibold ${infoHeading}`}>
              Shipping Information
            </h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                  Shipping To
                </dt>
                <dd className={`font-medium ${strongText}`}>{shippingInfo.recipient}</dd>
                <dd>{shippingInfo.address}</dd>
              </div>
              <div>
                <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                  Carrier
                </dt>
                <dd className={`font-medium ${strongText}`}>{shippingInfo.carrier}</dd>
              </div>
              <div>
                <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                  Tracking Number
                </dt>
                <dd className={`font-medium ${strongText}`}>{shippingInfo.trackingNumber}</dd>
                <dd>
                  <button className={`text-sm font-semibold hover:underline ${linkColor(isDark)}`}>
                    Track on carrier site
                  </button>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function linkColor(isDark) {
  return isDark ? "text-emerald-300" : "text-emerald-600";
}
