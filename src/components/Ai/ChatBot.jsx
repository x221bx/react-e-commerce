// src/components/Ai/ChatBot.jsx
// Fresh, minimal chatbot UI (OpenRouter + product suggestions)

import { useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiSend, FiX, FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../features/cart/cartSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useAIChat } from "../../hooks/useAIChat.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { UseTheme } from "../../theme/ThemeProvider";

export default function ChatBot() {
  const user = useSelector(selectCurrentUser);
  const { messages, sendMessage, setMessages } = useAIChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [meta, setMeta] = useState([]);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = UseTheme();
  const isDark = theme === "dark";

  // simple resizable panel
  const [size, setSize] = useState({ width: 360, height: 640 });
  const startResize = (e) => {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const sw = size.width;
    const sh = size.height;
    const doDrag = (ev) => {
      setSize({
        width: Math.min(520, Math.max(320, sw + (ev.clientX - sx))),
        height: Math.min(820, Math.max(460, sh + (ev.clientY - sy))),
      });
    };
    const stopDrag = () => {
      window.removeEventListener("mousemove", doDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  };

  // load cached history
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        /* ignore bad cache */
      }
    }
  }, [setMessages]);

  // persist history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // timestamp tracking
  useEffect(() => {
    setMeta((prev) => {
      if (messages.length > prev.length) return [...prev, { createdAt: new Date() }];
      return prev;
    });
  }, [messages.length]);

  // unread counter
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role === "assistant" && !open) setUnread((u) => u + 1);
  }, [messages.length, open]);

  const ProductCardMini = ({ id }) => {
    const [product, setProduct] = useState(null);
    useEffect(() => {
      (async () => {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      })();
    }, [id]);

    if (!product) {
      return (
        <div className="border p-3 rounded-lg bg-gray-50 text-sm animate-pulse dark:bg-[#0f1717] dark:border-white/10">
          جاري التحميل...
        </div>
      );
    }

    return (
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-3 mb-3 flex gap-3 shadow-md border cursor-pointer ${
          isDark ? "bg-[#0f1d1d] border-white/10 text-[#e8f7f6]" : "bg-white border-gray-200 text-gray-900"
        }`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.thumbnailUrl || product.img}
          className="w-18 h-18 rounded-xl object-cover flex-shrink-0"
          alt={product.title || "product"}
        />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate" title={product.title}>
              {product.title}
            </p>
            <span className={`text-sm font-bold ${isDark ? "text-[#7fd5c4]" : "text-teal-700"}`}>
              {product.price} EGP
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {(product.description || product.descriptionAr || "").slice(0, 120) || "منتج متاح الآن"}
          </p>
          <div className="flex gap-2">
            {product.tag && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]">{product.tag}</span>}
            {product.stock && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]">{product.stock} in stock</span>
            )}
          </div>
          <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${product.id}`);
                  }}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border ${
                isDark ? "border-white/20 text-[#cfe9ea]" : "border-teal-200 text-teal-700"
              }`}
            >
              <FiExternalLink size={12} /> View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(addToCart(product));
              }}
              className={`text-xs px-3 py-1.5 rounded-md ${
                isDark ? "bg-[#154b3f] text-white" : "bg-teal-600 text-white"
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Motion.div>
    );
  };

  const renderMessage = (text) => {
    if (typeof text !== "string") return text;
    const clean = text.replace(/\[[^\]]*\]/g, "");
    const cardRegex = /<productCard id="([^"]+)"><\/productCard>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(clean)) !== null) {
      const before = clean.substring(lastIndex, match.index);
      if (before.trim()) {
        parts.push(
          <p key={lastIndex} className="mb-2 whitespace-pre-wrap leading-relaxed">
            {before}
          </p>
        );
      }
      const productId = match[1];
      parts.push(<ProductCardMini key={`card-${productId}`} id={productId} />);
      lastIndex = cardRegex.lastIndex;
    }

    const after = clean.substring(lastIndex);
    if (after.trim()) {
      parts.push(
        <p key={`${lastIndex}-end`} className="whitespace-pre-wrap leading-relaxed">
          {after}
        </p>
      );
    }
    return parts;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setTyping(true);
    await sendMessage(text);
    setTyping(false);
  };

  if (user?.isAdmin) return null;

  const toggleOpen = () => {
    setOpen((p) => {
      const next = !p;
      if (next) setUnread(0);
      return next;
    });
  };

  return (
    <>
      <Motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleOpen}
        className="fixed bottom-6 right-5 bg-teal-600 text-white p-4 rounded-full shadow-xl z-50"
      >
        <FiMessageCircle size={24} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] rounded-full px-1.5 py-0.5">{unread}</span>
        )}
      </Motion.button>

      <AnimatePresence>
        {open && (
          <Motion.div
            drag
            dragMomentum={false}
            dragElastic={0.12}
            ref={chatRef}
            className={`fixed z-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col border ${
              isDark ? "bg-[#0b1313] border-white/10" : "bg-[#f8faf9] border-gray-200"
            }`}
            style={{ width: size.width, height: size.height, bottom: "120px", right: "50px" }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <div onMouseDown={startResize} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent" />

            <div
              className={`flex items-center justify-between px-4 py-3 ${
                isDark ? "bg-[#0f2d2a] text-white" : "bg-gradient-to-r from-teal-600 to-emerald-500 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm font-semibold">AI</div>
                <div>
                  <p className="text-sm font-semibold">FarmVet Assistant</p>
                  <p className="text-[11px] opacity-80">اسأل عن المنتجات أو اطلب ترشيحات</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => {
                    setMessages([]);
                    setMeta([]);
                    setUnread(0);
                    localStorage.removeItem("chatHistory");
                  }}
                >
                  مسح المحادثة
                </button>
                <div className="flex items-center gap-1">
                  <button
                    className="text-xs px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white"
                    onClick={() =>
                      setSize((s) => ({
                        width: Math.min(520, s.width + 30),
                        height: Math.min(820, s.height + 40),
                      }))
                    }
                  >
                    +
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white"
                    onClick={() =>
                      setSize((s) => ({
                        width: Math.max(320, s.width - 30),
                        height: Math.max(460, s.height - 40),
                      }))
                    }
                  >
                    -
                  </button>
                </div>
                <FiX size={20} className="cursor-pointer" onClick={() => setOpen(false)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50/80 dark:bg-[#0e1717]">
              {messages.map((m, i) => (
                <Motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, x: m.role === "user" ? 35 : -35 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`max-w-[88%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
                >
                  <div className={`text-[10px] text-gray-400 mb-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                    {formatTime(meta[i]?.createdAt)}
                  </div>
                  <div
                    className={`p-3 rounded-2xl shadow-sm border ${
                      m.role === "user"
                        ? "bg-teal-600 text-white border-transparent rounded-br-sm"
                        : isDark
                        ? "bg-[#132221] text-[#e4f4f2] border-white/10 rounded-bl-sm"
                        : "bg-white text-gray-900 border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {renderMessage(m.content)}
                  </div>
                </Motion.div>
              ))}

              {typing && <p className="text-xs text-gray-500 animate-pulse">المساعد يكتب...</p>}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t bg-white dark:bg-[#0f1717]">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none border ${
                    isDark ? "bg-[#0c1313] text-white border-[#1f2d2d]" : "bg-white border-gray-200"
                  }`}
                  rows={2}
                  placeholder="اسأل عن منتج، سعر، أو اطلب ترشيحات..."
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`px-4 rounded-xl flex items-center justify-center ${
                    input.trim() ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
