// src/components/Ai/ChatBot.jsx
// -------------------------------------------------------
// NEW ChatBot.jsx  (Resizable + Draggable + Shorter + Wider)
// -------------------------------------------------------

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
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../features/cart/cartSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UseTheme } from "../../theme/ThemeProvider";

const safePlay = (audio) => {
    if (!audio) return;
    const playPromise = audio.play();
    if (playPromise !== undefined) playPromise.catch(() => {});
};

const sendSound = new Audio("/send.mp3");
const receiveSound = new Audio("/receive.mp3");
const openSound = new Audio("/Open.mp3");
const closeSound = new Audio("/close.mp3");

export default function ChatBot() {
    const user = useSelector(selectCurrentUser);
    const { messages, sendMessage, setMessages } = useAIChat();
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

    const isDark = theme === "dark";

    // ----------------------- RESIZING LOGIC -----------------------
    const chatRef = useRef(null);
    const [size, setSize] = useState({ width: 460, height: 380 });

    const startResize = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;

        const startWidth = size.width;
        const startHeight = size.height;

        const doDrag = (ev) => {
            setSize({
                width: Math.min(700, Math.max(320, startWidth + (ev.clientX - startX))),
                height: Math.min(
                    700,
                    Math.max(250, startHeight + (ev.clientY - startY))
                ),
            });
        };

        const stopDrag = () => {
            window.removeEventListener("mousemove", doDrag);
            window.removeEventListener("mouseup", stopDrag);
        };

        window.addEventListener("mousemove", doDrag);
        window.addEventListener("mouseup", stopDrag);
    };

    // --------------------------------------------------------------

    const formatTime = (date) => {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMessages(parsed);
            } catch {}
        }
    }, [setMessages]);

    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    useEffect(() => {
        setMessageMeta((prev) => {
            if (messages.length > prev.length) {
                const now = new Date();
                return [...prev, { createdAt: now }];
            }
            return prev;
        });
    }, [messages.length]);

    useEffect(() => {
        if (!messages.length) return;
        const last = messages[messages.length - 1];

        if (last.role === "assistant") {
            if (soundEnabled) safePlay(receiveSound);
            if (!open) setUnread((u) => u + 1);
        }
    }, [messages.length, soundEnabled, open]);

    const toggleSound = () => {
        setSoundEnabled((prev) => {
            const next = !prev;
            localStorage.setItem("chatSoundEnabled", String(next));
            return next;
        });
    };

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
                    جاري التحميل...
                </div>
            );

        return (
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-2 mb-2 flex gap-3 cursor-pointer shadow-md ${
                    isDark
                        ? "bg-[#0f1d1d]/60 border border-white/10 text-[#B8E4E6]"
                        : "bg-white border text-gray-800"
                }`}
                onClick={() => navigate(`/products/${product.id}`)}
            >
                <img
                    src={product.thumbnailUrl || product.img}
                    className="w-16 h-16 rounded-lg object-cover"
                    alt={product.title || "product"}
                />

                <div className="flex flex-col justify-between flex-1">
                    <p className="font-semibold text-sm">{product.title}</p>
                    <p
                        className={`font-bold text-sm ${
                            isDark ? "text-[#79ccd4]" : "text-teal-700"
                        }`}
                    >
                        {product.price} EGP
                    </p>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToCart(product));
                        }}
                        className={`text-xs px-2 py-1 rounded-md ${
                            isDark ? "bg-[#1d3c3c]" : "bg-teal-600 text-white"
                        }`}
                    >
                        Add To Cart
                    </button>
                </div>
            </Motion.div>
        );
    };

    const renderMessage = (text) => {
        if (typeof text !== "string") return text;

        text = text.replace(/\[[^\]]*\]/g, "");

        const cardRegex = /<productCard id="([^"]+)"><\/productCard>/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = cardRegex.exec(text)) !== null) {
            const before = text.substring(lastIndex, match.index);
            if (before.trim()) {
                parts.push(
                    <p key={lastIndex} className="mb-2 whitespace-pre-wrap">
                        {before}
                    </p>
                );
            }

            const productId = match[1];
            parts.push(<ProductCardMini key={`card-${productId}`} id={productId} />);

            lastIndex = cardRegex.lastIndex;
        }

        const after = text.substring(lastIndex);
        if (after.trim()) {
            parts.push(
                <p key={lastIndex + "-end"} className="whitespace-pre-wrap">
                    {after}
                </p>
            );
        }

        return parts;
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        if (soundEnabled) safePlay(sendSound);
        setInput("");
        setTyping(true);
        await sendMessage(text);
        setTyping(false);
    };

    if (user?.isAdmin) return null;

    const toggleOpen = () => {
        setOpen((p) => {
            const next = !p;
            if (soundEnabled) safePlay(next ? openSound : closeSound);
            if (next) setUnread(0);
            return next;
        });
        setMenuOpen(false);
    };

    return (
        <>
            {/* Floating Icon */}
            <Motion.button
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleOpen}
                className="fixed bottom-6 right-4 bg-teal-600 p-4 rounded-full text-white shadow-xl z-50"
            >
                <FiMessageCircle size={26} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white rounded-full px-1.5 py-0.5">
            {unread}
          </span>
                )}
            </Motion.button>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {open && (
                    <Motion.div
                        drag
                        dragMomentum={false}
                        dragElastic={0.1}
                        ref={chatRef}
                        className={`
              fixed z-50 
              rounded-2xl shadow-2xl overflow-hidden flex flex-col border backdrop-blur-xl
              ${isDark ? "bg-[#071010]/80 border-white/10" : "bg-white/90 border-gray-200"}
            `}
                        style={{
                            width: size.width,
                            height: size.height,
                            bottom: "110px",
                            right: "50px",
                            position: "fixed",
                        }}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        {/* RESIZE HANDLE */}
                        <div
                            onMouseDown={startResize}
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent"
                        ></div>

                        {/* HEADER */}
                        <div className="flex items-center justify-between bg-teal-600/90 text-white px-4 py-2 cursor-move">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white/20 rounded-full text-xs flex items-center justify-center">
                                    AI
                                </div>
                                <p className="text-sm font-semibold">AI Assistant</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleSound}
                                    className="p-1 hover:bg-white/10 rounded-full"
                                >
                                    {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
                                </button>

                                <FiX
                                    size={20}
                                    className="cursor-pointer hover:scale-110"
                                    onClick={() => setOpen(false)}
                                />
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((m, i) => (
                                <Motion.div
                                    key={m.id || i}
                                    initial={{ opacity: 0, x: m.role === "user" ? 40 : -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`max-w-[85%] ${
                                        m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                                >
                                    <div
                                        className={`text-[10px] text-gray-400 mb-1 ${
                                            m.role === "user" ? "text-right" : "text-left"
                                        }`}
                                    >
                                        {formatTime(messageMeta[i]?.createdAt)}
                                    </div>

                                    <div
                                        className={`p-2 rounded-2xl shadow ${
                                            m.role === "user"
                                                ? "bg-teal-600 text-white rounded-br-sm"
                                                : isDark
                                                    ? "bg-[#102626]/70 text-[#B8E4E6]"
                                                    : "bg-white border text-gray-800"
                                        }`}
                                    >
                                        {renderMessage(m.content)}
                                    </div>
                                </Motion.div>
                            ))}

                            {typing && (
                                <p className="text-xs text-gray-400 animate-pulse">
                                    المساعد يكتب...
                                </p>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT */}
                        <div className="p-2 flex gap-2 border-t">
              <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none ${
                      isDark ? "bg-[#071414] text-white" : "bg-white border"
                  }`}
                  placeholder="اكتب رسالتك..."
              />

                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className={`px-3 rounded-xl ${
                                    input.trim()
                                        ? "bg-teal-600 text-white"
                                        : "bg-gray-300 text-gray-500"
                                }`}
                            >
                                <FiSend size={18} />
                            </button>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
}