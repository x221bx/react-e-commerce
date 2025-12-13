// src/hooks/useOrderSummary.js
import { useMemo, useState, useEffect } from "react";
import { getShippingCost, subscribeShippingCost } from "../services/shippingService";

export const useOrderSummary = (cartItems) => {
    const [shippingCost, setShippingCost] = useState(0);

    useEffect(() => {
        const fetchShippingCost = async () => {
            try {
                const cost = await getShippingCost();
                setShippingCost(cost && cost > 0 ? cost : 0);
            } catch (error) {
                console.error("Error fetching shipping cost:", error);
                // No fallback to hardcoded value - use 0 if API fails
            }
        };

        fetchShippingCost();

        // Subscribe to real-time shipping cost changes
        const unsubscribe = subscribeShippingCost((cost) => {
            setShippingCost(cost && cost > 0 ? cost : 0);
        });

        return () => {
            unsubscribe();
        };
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
