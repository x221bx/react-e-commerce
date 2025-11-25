import Footer from "../components/layout/footer";

export default function ContactUs() {
  return (
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20">

      {/* HERO */}
      <div className="animate-fade-in">
        <section
          className="relative h-[45vh] bg-cover bg-center flex items-center justify-center text-white"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1529088749673-56c5b14b45a7?auto=format&fit=crop&w=1400&q=80')",
          }}
        >
          <div className="bg-black/40 p-6 rounded-xl backdrop-blur-md text-center">
            <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
            <p className="mt-2 text-lg">We’re here to help you anytime</p>
          </div>
        </section>
      </div>

      {/* CONTACT SECTION */}
      <section className="container mx-auto px-4 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* LEFT INFO */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            Get in Touch
          </h2>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Feel free to contact us for product inquiries, farming help, or
            support requests. Our team is always ready to assist.
          </p>

          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> support@farmvet.com</p>
            <p><strong>Phone:</strong> +20 112 345 6789</p>
            <p><strong>Address:</strong> Cairo, Egypt</p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <form className="bg-white dark:bg-slate-900 border dark:border-slate-700 p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block mb-1 text-sm font-semibold">Name</label>
            <input
              type="text"
              className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600"
              placeholder="Your Email"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">
              Message
            </label>
            <textarea
              rows="5"
              className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600"
              placeholder="Write your message..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded shadow"
          >
            Send Message
          </button>
        </form>
      </section>

      <Footer />
    </main>
  );
}
