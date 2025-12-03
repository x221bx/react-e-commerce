import Footer from "./Footer";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-28 overflow-hidden">
      {/* 🔥 خلفية جديدة واضحة */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=90&w=1920"
          alt="Farm & Veterinary"
          className="w-full h-full object-cover brightness-105"
        />

        {/* طبقة تفتيح + بلور */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
      </div>

      {/* 🟩 الفورم */}
      <div
        className="relative z-10 w-full max-w-2xl p-10 rounded-3xl
                   bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl"
      >
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-700 mt-2 text-lg">{subtitle}</p>}
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-inner border border-gray-200">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
