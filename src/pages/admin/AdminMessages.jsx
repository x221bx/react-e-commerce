import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import PageHeader from "../../admin/PageHeader";
import { UseTheme } from "../../theme/ThemeProvider";
import toast from "react-hot-toast";
import { FiSearch, FiPhoneCall, FiTrash } from "react-icons/fi";

export default function AdminMessages() {
    const { theme } = UseTheme();
    const dark = theme === "dark";

    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState(null);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const q = query(
            collection(db, "contactMessages"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
            setMessages(list);
        });

        return () => unsub();
    }, []);

    const openMessage = async (msg) => {
        setSelected(msg);

        if (!msg.seen) {
            await updateDoc(doc(db, "contactMessages", msg.id), {
                seen: true,
            });
        }
    };

    /* 🗑️ DELETE MESSAGE WITHOUT ALERT */
    const deleteMessage = async () => {
        if (!selected?.id) return;

        try {
            await deleteDoc(doc(db, "contactMessages", selected.id));
            toast.success("Message deleted");
            setSelected(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete message");
        }
    };

    /* 📞 WHATSAPP REPLY */
    const replyWhatsApp = () => {
        if (!selected) return;

        const phone = selected.phone?.replace(/\D/g, "");
        if (!phone) return toast.error("User did not provide a phone number");

        const text = `Hello ${selected.name},\n\nRegarding your message:\n"${selected.message}"`;

        const url = `https://wa.me/2${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    /* 🔎 FILTERING */
    const filteredMessages = messages.filter((m) => {
        const matchSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            (m.phone || "").toLowerCase().includes(search.toLowerCase());

        const matchFilter =
            filter === "all"
                ? true
                : filter === "seen"
                    ? m.seen
                    : !m.seen;

        return matchSearch && matchFilter;
    });

    return (
        <div
            className={`
        min-h-screen w-full
        transition-all duration-300 
        pt-28 pb-10 px-4 md:px-6
        ${dark ? "bg-[#0d1a1a] text-[#cfecec]" : "bg-[#f9f9f9] text-gray-900"}
      `}
        >
            <PageHeader title="Messages Inbox" />

            {/* 🔍 SEARCH + FILTER */}
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4">

                {/* Search Bar */}
                <div className="relative w-full md:w-1/3">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`
              w-full rounded-lg py-2 pl-10 pr-3 text-sm
              ${dark ? "bg-[#173a30]/60 border border-[#2d5a4f]" : "bg-white border border-gray-300"}
            `}
                    />
                </div>

                {/* Filter */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`
            rounded-lg py-2 px-4 text-sm
            ${dark ? "bg-[#173a30]/60 border border-[#2d5a4f]" : "bg-white border border-gray-300"}
          `}
                >
                    <option value="all">All Messages</option>
                    <option value="seen">Seen</option>
                    <option value="unseen">Unseen</option>
                </select>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                {/* 💌 Messages List */}
                <div
                    className={`
            rounded-2xl border p-4 shadow-sm h-[78vh] overflow-y-auto
            ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
          `}
                >
                    <h2 className="mb-3 text-base font-semibold opacity-80">Messages</h2>

                    {filteredMessages.length === 0 && (
                        <p className="text-center opacity-60 mt-10">No messages found</p>
                    )}

                    {filteredMessages.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => openMessage(m)}
                            className={`
                w-full p-3 rounded-xl text-left mb-2 transition-all border
                ${
                                m.seen
                                    ? dark
                                        ? "bg-[#152929] border-[#244] hover:bg-[#1b3030]"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                    : "bg-emerald-50 border-emerald-200 shadow-sm hover:bg-emerald-100"
                            }
              `}
                        >
                            <p className="font-semibold">{m.name}</p>
                            <p className="text-xs opacity-70">{m.email}</p>
                            {m.phone && <p className="text-xs opacity-60">{m.phone}</p>}
                        </button>
                    ))}
                </div>

                {/* 📄 Message Viewer */}
                <div
                    className={`
            md:col-span-2 rounded-2xl border p-6 shadow-sm h-[78vh] overflow-y-auto
            ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
          `}
                >
                    {!selected && (
                        <p className="opacity-60 text-center mt-20 text-lg">
                            Select a message to view
                        </p>
                    )}

                    {selected && (
                        <>
                            <h2 className="text-2xl font-semibold">{selected.name}</h2>
                            <p className="opacity-70 mt-1">{selected.email}</p>
                            {selected.phone && (
                                <p className="opacity-70 mt-1">{selected.phone}</p>
                            )}

                            <p className="mt-6 whitespace-pre-wrap leading-relaxed text-base">
                                {selected.message}
                            </p>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-3 mt-6">

                                {/* WhatsApp Reply */}
                                <button
                                    onClick={replyWhatsApp}
                                    className="px-5 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                                >
                                    <FiPhoneCall /> WhatsApp Reply
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={deleteMessage}
                                    className="px-5 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
                                >
                                    <FiTrash /> Delete
                                </button>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
