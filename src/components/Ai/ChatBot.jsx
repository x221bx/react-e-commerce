// src/components/Ai/ChatBot.jsx  
import { useState, useEffect, useRef } from "react";
import { useAIChat } from "../../hooks/useAIChat.js";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiVolume2,
  FiVolumeX,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cart/cartSlice";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UseTheme } from "../../theme/ThemeProvider";

// 🟢 تشغيل صوت بأمان بدون Errors
const safePlay = (audio) => {
  if (!audio) return;
  const playPromise = audio.play();
  if (playPromise !== undefined) playPromise.catch(() => {});
};

// 🟢 أصوات إرسال واستقبال
const sendSound = new Audio("/send.mp3");
const receiveSound = new Audio("/receive.mp3");
// أصوات إضافية
const openSound = new Audio("/Open.mp3");
const closeSound = new Audio("/close.mp3");
// const notifySound = new Audio("/notify.mp3");
const typingSound = new Audio("/typing.mp3");

// 🟢 اقتراحات سريعة
const QUICK_REPLIES = [
  "عندي قمح أوراقه صفراء، عايز سماد مناسب",
  "عايز سماد ورقي عام يقوي النبات",
  "مبيد حشائش للذرة من غير ما يضر المحصول",
  "أفضل برنامج تسميد للبطاطس في مرحلة النمو",
];

export default function ChatBot() {
  const { messages, sendMessage, setMessages } = useAIChat(); // ⭐ مهم جداً
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unread, setUnread] = useState(0);
  const [messageMeta, setMessageMeta] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = UseTheme();
  const messagesEndRef = useRef(null);

  const formatTime = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🟢 History — FIXED (كان سبب 429)
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed); // ❗ بدل push (كان عامل loop)
        // eslint-disable-next-line
      } catch {}
    }

    const savedSound = localStorage.getItem("chatSoundEnabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
  }, [setMessages]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // 🟢 Scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // 🟢 Meta للرسائل (توقيت كل رسالة)
  useEffect(() => {
    setMessageMeta((prev) => {
      if (messages.length > prev.length) {
        const diff = messages.length - prev.length;
        const now = new Date();
        const extra = Array.from({ length: diff }, () => ({
          createdAt: now,
        }));
        return [...prev, ...extra];
      }
      return prev.slice(0, messages.length);
    });
  }, [messages.length, messages]);

  // 🟢 صوت رد البوت + unread (يتشغل فقط لما عدد الرسائل يزيد مش مع كل توكن)
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];

    if (last.role === "assistant") {
      if (soundEnabled) {
        safePlay(receiveSound);
        safePlay(typingSound);
      }
      if (!open) setUnread((u) => u + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, soundEnabled, open]);

  const handleSend = async (overrideText) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend) return;

    if (soundEnabled) safePlay(sendSound);

    setTyping(true);
    try {
      await sendMessage(textToSend);
      if (!overrideText) setInput("");
    } finally {
      setTyping(false);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("chatSoundEnabled", String(next));
      return next;
    });
  };

  const handleClearChat = () => {
    localStorage.removeItem("chatHistory");
    setMenuOpen(false);
    window.location.reload();
  };

  // ===========================================================
  // 🧠 Mini Product Card
  // ===========================================================
  const ProductCardMini = ({ id }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
      (async () => {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      })();
    }, [id]);

    if (!product)
      return (
        <div className="border p-2 rounded-lg bg-gray-100 text-sm animate-pulse">
          جارٍ تحميل المنتج...
        </div>
      );

    const isDark = theme === "dark";

    return (
      <Motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`rounded-xl p-2 mb-2 flex gap-3 cursor-pointer transition shadow-lg 
        ${
          isDark
            ? "bg-[#0f1d1d]/60 text-[#B8E4E6] border border-white/10 backdrop-blur-lg hover:shadow-xl"
            : "bg-white/80 text-gray-800 border backdrop-blur-lg hover:shadow-lg"
        }`}
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <img
          src={product.img || product.thumbnailUrl}
          alt="product"
          className="w-16 h-16 rounded-lg object-cover shadow-sm"
        />
        <div className="flex flex-col justify-between flex-1">
          <p className="font-semibold text-sm">
            {product.name || product.title}
          </p>
          <p
            className={`font-bold text-sm ${
              isDark ? "text-[#8ee3e4]" : "text-[#2F7E80]"
            }`}
          >
            {product.price} EGP
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(addToCart(product));
            }}
            className={`text-xs px-2 py-1 rounded-md w-fit 
            ${
              isDark
                ? "bg-[#1e3d3d] text-[#B8E4E6] hover:bg-[#295050]"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            Add To Cart
          </button>
        </div>
      </Motion.div>
    );
  };

  // ===========================================================
  // 🧠 Parser المنتج داخل الرسالة
  // ===========================================================
  const renderMessage = (text) => {
    if (typeof text !== "string") return text;

    const cardRegex = /<productCard id="([^"]+)"><\/productCard>/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(text)) !== null) {
      const before = text.substring(lastIndex, match.index);
      if (before.trim())
        parts.push(
          <p key={lastIndex} className="mb-2 whitespace-pre-wrap">
            {before}
          </p>
        );

      const productId = match[1];
      parts.push(<ProductCardMini key={`card-${productId}`} id={productId} />);

      lastIndex = cardRegex.lastIndex;
    }

    const after = text.substring(lastIndex);
    if (after.trim())
      parts.push(
        <p key={lastIndex + "-end"} className="whitespace-pre-wrap">
          {after}
        </p>
      );

    return parts;
  };

  const isDark = theme === "dark";

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;

      if (soundEnabled) {
        if (next) safePlay(openSound);
        else safePlay(closeSound);
      }

      if (next) setUnread(0);
      return next;
    });

    setMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ===========================================================
  // 🖥️ JSX UI
  // ===========================================================

  return (
    <>
      {/* Floating Icon */}
      <Motion.button
        initial={{ scale: 0.7, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleOpen}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 md:right-6 
        bg-teal-600 p-4 rounded-full text-white shadow-xl z-50 hover:bg-teal-700"
      >
        <FiMessageCircle size={28} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] leading-none text-white rounded-full px-1.5 py-0.5 border shadow-lg">
            {unread}
          </span>
        )}
      </Motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <Motion.div
            drag
            dragMomentum={false}
            dragElastic={0.15}
            className={`fixed bottom-24 right-6 w-80 shadow-2xl rounded-2xl overflow-hidden flex flex-col 
            backdrop-blur-2xl border z-50 ${
              isDark
                ? "bg-[#071010]/70 border-white/10"
                : "bg-white/70 border-gray-200"
            }`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-teal-600/90 text-white px-4 py-3 shadow-lg cursor-move">
              {/* AI Title */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
                  AI
                </div>

                <div>
                  <span className="font-semibold text-sm">AI Assistant</span>
                  <span className="block text-[10px] text-emerald-100">
                    متصل الآن لمساعدتك في الأسمدة و المحاصيل
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 relative">
                {/* صوت */}
                <button
                  onClick={toggleSound}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  {soundEnabled ? (
                    <FiVolume2 size={16} />
                  ) : (
                    <FiVolumeX size={16} />
                  )}
                </button>

                {/* منيو */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((p) => !p)}
                    className="p-1 rounded-full hover:bg-white/10"
                  >
                    <FiMoreVertical size={16} />
                  </button>

                  {menuOpen && (
                    <div
                      className={`absolute right-0 mt-1 rounded-lg shadow-lg text-xs z-50 min-w-[130px] ${
                        isDark
                          ? "bg-[#061011]/95 border border-white/10 text-[#E5F7F7]"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      <button
                        onClick={handleClearChat}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 text-red-600"
                      >
                        <FiTrash2 size={12} />
                        <span>مسح المحادثة</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* إغلاق */}
                <FiX
                  size={20}
                  className="cursor-pointer hover:scale-110"
                  onClick={() => {
                    setOpen(false);
                    setMenuOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Messages */}
            <div
              className={`h-80 overflow-y-auto p-3 space-y-3 custom-scroll ${
                isDark ? "bg-[#0b1b1b]/40" : "bg-gray-50/60"
              }`}
            >
              {messages.map((m, i) => (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`max-w-[85%] ${
                    m.role === "user" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {/* meta */}
                  <div
                    className={`flex items-center gap-2 mb-1 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                        AI
                      </div>
                    )}
                    {m.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center text-[10px]">
                        أنت
                      </div>
                    )}

                    <span className="text-[10px] text-gray-400">
                      {formatTime(messageMeta[i]?.createdAt)}
                    </span>
                  </div>

                  {/* bubble */}
                  <div
                    className={`p-2 rounded-2xl shadow whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-teal-500 text-white rounded-br-sm"
                        : isDark
                        ? "bg-[#102626]/70 text-[#B8E4E6] border border-white/10 rounded-bl-sm"
                        : "bg-white/80 border text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {renderMessage(m.content)}
                  </div>
                </Motion.div>
              ))}

              {/* bot typing */}
              {typing && (
                <div className="mr-auto px-3 py-1 text-xs rounded-lg text-gray-200 bg-gray-600/60 animate-pulse w-fit flex gap-2">
                  <span>المساعد يكتب…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div
              className={`px-3 pt-2 pb-1 flex flex-wrap gap-2 border-t ${
                isDark ? "bg-[#051213]/80 border-white/10" : "bg-white/70"
              }`}
            >
              {QUICK_REPLIES.map((q, idx) => (
                <Motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSend(q)}
                  className={`text-[10px] px-2 py-1 rounded-full border max-w-full truncate ${
                    isDark
                      ? "bg-[#0f2020] border-white/15 text-[#C9F2F2]"
                      : "bg-white border-teال-200 text-teal-700"
                  }`}
                >
                  {q}
                </Motion.button>
              ))}
            </div>

            {/* Input */}
            <div
              className={`flex p-3 gap-2 border-t ${
                isDark ? "bg-[#0d1a1a]/70 border-white/10" : "bg-white/70"
              }`}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                rows={1}
                className={`flex-1 rounded-xl px-3 py-2 outline-none shadow-sm text-sm resize-none ${
                  isDark
                    ? "bg-[#071414] text-white border border-white/10"
                    : "bg-white border"
                }`}
              />

              <Motion.button
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`px-3 rounded-xl shadow-md flex items-center justify-center ${
                  input.trim()
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FiSend size={18} />
              </Motion.button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
