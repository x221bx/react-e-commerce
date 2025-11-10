import footerLogo from "/src/assets/footerLogo.svg";

export default function Footer() {
  return (
    <footer className="bg-[#2D2D49] py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        {/* Logo and Subscribe Form - Top Section */}
        <div className="flex flex-col items-center justify-between space-y-8 md:flex-row md:space-y-0">
          {/* Logo and Text */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2">
              <img src={footerLogo} alt="TOTC Logo" className="h-25 w-25" />
              <div>
                <h3 className="text-xl font-bold">TOTC</h3>
                <p className="text-sm text-gray-400">
                  Virtual Class <br /> for Zoom
                </p>
              </div>
            </div>
          </div>

          {/* Subscribe Form */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-lg font-semibold">
              Subscribe to get our Newsletter
            </p>
            <div className="mt-4 flex flex-col items-center sm:flex-row sm:space-x-4">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full rounded-full border-2 border-[#4E4E65] bg-[#3B3B5B] px-6 py-3 text-white placeholder-[#78789C] focus:outline-none sm:w-auto"
              />
              <button className="mt-4 w-full rounded-full bg-[#52D2E7] px-6 py-3 font-semibold text-white transition hover:bg-[#40b0c2] sm:mt-0 sm:w-auto">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <hr className="my-10 border-gray-700" />

        {/* Bottom Footer - Links and Copyright */}
        <div className="flex flex-col items-center justify-between space-y-4 text-sm md:flex-row md:space-y-0">
          <div className="flex flex-wrap justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:underline">
              Careers
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
          </div>
          <p className="text-gray-400">© 2021 Class Technologies Inc.</p>
        </div>
      </div>
    </footer>
  );
}
