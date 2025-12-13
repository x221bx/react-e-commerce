// src/hooks/useOrderSummary.js
import { useMemo, useState, useEffect } from "react";
import { getShippingCost } from "../services/shippingService";

export const useOrderSummary = (cartItems) => {
    const [shippingCost, setShippingCost] = useState(50);

    useEffect(() => {
        const fetchShippingCost = async () => {
            try {
                const cost = await getShippingCost();
                setShippingCost(cost);
            } catch (error) {
                console.error("Error fetching shipping cost:", error);
                setShippingCost(50); // Fallback to default
            }
        };

        fetchShippingCost();
    }, []);

    const summary = useMemo(() => {
        const subtotal = cartItems.reduce(
            (sum, item) =>
                sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
        );
        const shipping = cartItems.length ? shippingCost : 0;
        return {
            subtotal,
            shipping,
            total: subtotal + shipping,
        };
    }, [cartItems, shippingCost]);

    return summary;
};
