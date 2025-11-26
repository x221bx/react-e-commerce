import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import PageHeader from "../../admin/PageHeader";
import { UseTheme } from "../../theme/ThemeProvider";

export default function AdminMessages() {
  const { theme } = UseTheme();
  const dark = theme === "dark";

  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

        {/* 💌 Messages List */}
        <div
          className={`
            rounded-2xl border p-4 shadow-sm h-[78vh] overflow-y-auto
            ${dark ? "bg-[#0f2222] border-[#1e3a3a]" : "bg-white border-gray-200"}
          `}
        >
          <h2 className="mb-3 text-base font-semibold opacity-80">Messages</h2>

          {messages.length === 0 && (
            <p className="text-center opacity-60 mt-10">No messages yet</p>
          )}

          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => openMessage(m)}
              className={`
                w-full p-3 rounded-xl text-left mb-2 transition-all border
                ${m.seen
                  ? dark
                    ? "bg-[#152929] border-[#244] hover:bg-[#1b3030]"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  : "bg-emerald-50 border-emerald-200 shadow-sm hover:bg-emerald-100"
                }
              `}
            >
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs opacity-70">{m.email}</p>
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

              <p className="mt-6 whitespace-pre-wrap leading-relaxed text-base">
                {selected.message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
