import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

const NEW_CARD_OPTION = "__new_card__";

export const usePaymentMethods = (userId) => {
    const [savedCards, setSavedCards] = useState([]);
    const [savedPaymentLoading, setSavedPaymentLoading] = useState(false);
    const [selectedSavedCardId, setSelectedSavedCardId] = useState(NEW_CARD_OPTION);
    const savedCardsCountRef = useRef(0);

    useEffect(() => {
        const fetchSavedMethods = async () => {
            if (!userId) {
                setSavedCards([]);
                savedCardsCountRef.current = 0;
                setSelectedSavedCardId(NEW_CARD_OPTION);
                setSavedPaymentLoading(false);
                return;
            }
            setSavedPaymentLoading(true);
            try {
                const methodsRef = collection(db, "users", userId, "paymentMethods");
                const snap = await getDocs(query(methodsRef, orderBy("createdAt", "desc")));
                const methods = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                const cards = methods.filter((method) => method.type === "card");

                cards.sort((a, b) => {
                    if (a.isDefault && !b.isDefault) return -1;
                    if (!a.isDefault && b.isDefault) return 1;
                    const aDate = a.createdAt?.toMillis?.() || a.createdAt || 0;
                    const bDate = b.createdAt?.toMillis?.() || b.createdAt || 0;
                    return bDate - aDate;
                });

                setSavedCards(cards);
                const hadCardsBefore = savedCardsCountRef.current > 0;
                savedCardsCountRef.current = cards.length;

                if (!cards.length) {
                    setSelectedSavedCardId(NEW_CARD_OPTION);
                    return;
                }

                setSelectedSavedCardId((prev) => {
                    if (
                        prev &&
                        prev !== NEW_CARD_OPTION &&
                        cards.some((card) => card.id === prev)
                    ) {
                        return prev;
                    }
                    if (prev === NEW_CARD_OPTION && hadCardsBefore) {
                        return prev;
                    }
                    const defaultCard = cards.find((card) => card.isDefault) || cards[0];
                    return defaultCard?.id || cards[0].id;
                });
            } catch (err) {
                console.error("Failed to load payment methods", err);
                setSavedCards([]);
                savedCardsCountRef.current = 0;
                setSelectedSavedCardId(NEW_CARD_OPTION);
            } finally {
                setSavedPaymentLoading(false);
            }
        };

        fetchSavedMethods();
    }, [userId]);

    return {
        savedCards,
        savedPaymentLoading,
        selectedSavedCardId,
        setSelectedSavedCardId,
        NEW_CARD_OPTION,
    };
};
