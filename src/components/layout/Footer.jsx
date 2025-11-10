import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaGlobe } from "react-icons/fa";
import { UseTheme } from "../../theme/ThemeProvider";

export default function Footer() {
  const { theme } = UseTheme();

  return (
    <footer
      className={`transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#0e1b1b] text-[#B8E4E6]"
          : "bg-[#142727] text-[#B8E4E6]"
      } py-10 mt-16 shadow-inner`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 🌿 Brand */}
        <div>
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            🌿 <span>Farm Vet Shop</span>
          </h2>
          <p className="mt-3 text-sm opacity-80 leading-relaxed">
            Trusted veterinary products with top quality & affordable prices.
          </p>
        </div>

        {/* 🧭 Navigation */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: "About", path: "/about" },
              { name: "Contact", path: "/contact" },
            ].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`transition-colors duration-200 hover:underline ${
                    theme === "dark"
                      ? "hover:text-[#B8E4E6]"
                      : "hover:text-[#f5d061]"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🌐 Social Media */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Follow Us</h3>
          <div className="flex space-x-4 text-xl">
            {[FaGlobe, FaFacebookF, FaInstagram, FaTwitter].map(
              (Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-transform duration-300 hover:scale-110 ${
                    theme === "dark"
                      ? "hover:bg-[#B8E4E6]/10"
                      : "hover:bg-white/20"
                  }`}
                >
                  <Icon />
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* 🔸 Copy Rights */}
      <div
        className={`mt-10 pt-5 border-t text-center text-sm transition-colors duration-300 ${
          theme === "dark" ? "border-gray-700 text-gray-400" : "border-white/30 text-white/80"
        }`}
      >
        © {new Date().getFullYear()} <span className="font-semibold">Farm Vet Shop</span>. All rights reserved.
      </div>
    </footer>
  );
}
