// src/pages/contactus.jsx
import { useState } from "react";
import { db, auth } from "../services/firebase";
import { doc, collection, addDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import Footer from "../components/layout/footer";
import { UseTheme } from "../theme/ThemeProvider";
import { FiPhone, FiMail, FiUser, FiMessageCircle } from "react-icons/fi";
import { motion as Motion } from "framer-motion";

export default function ContactUs() {
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendToWhatsApp = () => {
    const phone = "01144046547";
    const msg = `New Contact Message:
Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone}
Message: ${form.message}`;

    const url = `https://wa.me/2${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        createdAt: new Date(),
        userId: user?.uid || "guest",
        seen: false,
      };

      if (user) {
        await addDoc(collection(doc(db, "users", user.uid), "messages"), data);
      }

      await addDoc(collection(db, "contactMessages"), data);
      sendToWhatsApp();
      toast.success("تم إرسال رسالتك بنجاح ✔️");

      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إرسال الرسالة ❌");
    }

    setLoading(false);
  };

  return (
    <main
      className={`
        min-h-screen flex flex-col 
        ${isDark ? "bg-[#0b1714] text-[#d7f7d0]" : "bg-gray-100 text-gray-900"}
      `}
    >

      {/* HERO */}
      <Motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="flex justify-center mt-6 px-4"
      >
        <div
          className={`
            relative h-[40vh] w-full max-w-2xl bg-cover bg-center flex items-center justify-center
            rounded-2xl overflow-hidden shadow-lg
            ${isDark ? "border border-[#2d5a4f]" : "border border-gray-300"}
          `}
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1529088749673-56c5b14b45a7')",
          }}
        >
          {/* Overlay */}
          <div
            className={`
              absolute inset-0 backdrop-blur-sm
              ${isDark ? "bg-black/50" : "bg-teal-900/30"}
            `}
          />

          <div className="relative z-10 text-center px-6">
            <h1
              className={`
                text-4xl md:text-5xl font-extrabold drop-shadow-lg
                ${isDark ? "text-teal-300" : "text-teal-700"}
              `}
            >
              Contact Us
            </h1>

            <p
              className={`
                mt-2 text-lg font-medium drop-shadow
                ${isDark ? "text-teal-200/90" : "text-teal-800/90"}
              `}
            >
              We're here to assist you anytime
            </p>
          </div>
        </div>
      </Motion.section>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto w-full px-4 mt-10 mb-16 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT PANEL */}
        <Motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className={`
            p-6 rounded-xl border shadow-sm
            ${isDark ? "bg-[#112c25]/70 border-[#2d5a4f]" : "bg-white border-gray-300"}
          `}
        >
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <FiMessageCircle className="text-teal-600" />
            Get in Touch
          </h2>

          <p className="text-sm opacity-80 leading-relaxed">
            If you have any questions or need support, feel free to contact us at
            any time. Our team will get back to you as soon as possible.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <p className="flex items-center gap-3">
              <FiMail className="text-teal-600" />
              <span>mmohamedd.ms@gmailcom</span>
            </p>

            <p className="flex items-center gap-3">
              <FiPhone className="text-teal-600" />
              <span>+20 114 404 6547</span>
            </p>

            <p className="flex items-center gap-3">
              📍 Cairo, Egypt
            </p>
          </div>
        </Motion.div>

        {/* RIGHT FORM */}
        <Motion.form
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          onSubmit={handleSubmit}
          className={`
            p-6 rounded-xl border shadow-sm space-y-4
            ${isDark ? "bg-[#112c25]/70 border-[#2d5a4f]" : "bg-white border-gray-300"}
          `}
        >
          {/* NAME */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className={`w-full rounded-lg py-2 pl-10 pr-3 text-sm ${
                isDark
                  ? "bg-[#173a30]/60 border border-[#2d5a4f] placeholder:text-[#a3ccb9]"
                  : "bg-white border border-gray-300"
              }`}
            />
          </div>

          {/* EMAIL */}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
              className={`w-full rounded-lg py-2 pl-10 pr-3 text-sm ${
                isDark
                  ? "bg-[#173a30]/60 border border-[#2d5a4f] placeholder:text-[#a3ccb9]"
                  : "bg-white border border-gray-300"
              }`}
            />
          </div>

          {/* PHONE */}
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className={`w-full rounded-lg py-2 pl-10 pr-3 text-sm ${
                isDark
                  ? "bg-[#173a30]/60 border border-[#2d5a4f] placeholder:text-[#a3ccb9]"
                  : "bg-white border border-gray-300"
              }`}
            />
          </div>

          {/* MESSAGE */}
          <textarea
            name="message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message..."
            required
            className={`w-full rounded-lg p-3 text-sm ${
              isDark
                ? "bg-[#173a30]/60 border border-[#2d5a4f] placeholder:text-[#a3ccb9]"
                : "bg-white border border-gray-300"
            }`}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg shadow disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </Motion.form>
      </section>

      <Footer />
    </main>
  );
}
