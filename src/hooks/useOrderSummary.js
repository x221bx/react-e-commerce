// src/hooks/useOrderSummary.js
import { useMemo } from "react";

export const useOrderSummary = (cartItems) => {
    const summary = useMemo(() => {
        const subtotal = cartItems.reduce(
            (sum, item) =>
                sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
        );
        const shipping = cartItems.length ? 50 : 0;
        return {
            subtotal,
            shipping,
            total: subtotal + shipping,
        };
    }, [cartItems]);

    return summary;
};
