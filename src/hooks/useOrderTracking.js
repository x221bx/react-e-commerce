import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import useUserOrders from "./useUserOrders";
import toast from "react-hot-toast";

const buildTrackingUrl = (trackingNumber) =>
    `https://www.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;

export const useOrderTracking = (userId) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const orderIdQuery = query.get("orderId");

    const { orders: allOrders, loading, connectionError: ordersConnectionError, confirmDelivery } = useUserOrders(userId);
  
    // Filter out completed/canceled orders for tracking - they should only show in Order History
    const orders = allOrders.filter(order =>
      !['delivered', 'canceled'].includes(order.status?.toLowerCase())
    );
    const [order, setOrder] = useState(null);
    const [orderConnectionError, setOrderConnectionError] = useState(false);

    const targetOrderId = useMemo(
        () => orderIdQuery || orders?.[0]?.id || null,
        [orderIdQuery, orders]
    );

    useEffect(() => {
        if (!targetOrderId) {
            setOrder(null);
            return undefined;
        }

        setOrderConnectionError(false);
        const orderRef = doc(db, "orders", targetOrderId);
        const unsubscribe = onSnapshot(
            orderRef,
            (snap) => {
                if (!snap.exists()) {
                    setOrder(null);
                    return;
                }
                const data = snap.data();
                setOrder({
                    id: snap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || null,
                    updatedAt: data.updatedAt?.toDate?.() || null,
                });
                setOrderConnectionError(false);
            },
            (err) => {
                console.error("OrderTracking onSnapshot error", err);
                setOrder(null);
                if (err.message?.includes("blocked") || err.code === "unavailable") {
                    setOrderConnectionError(true);
                }
            }
        );

        return () => unsubscribe();
    }, [targetOrderId]);

    useEffect(() => {
        if (ordersConnectionError || orderConnectionError) {
            toast.error(
                "Real-time order tracking is blocked. Please disable ad blockers for this site.",
                { duration: 6000 }
            );
        }
    }, [ordersConnectionError, orderConnectionError]);

    const handleSelectOrder = (id) => {
        navigate(`/account/tracking?orderId=${id}`);
    };

    return {
        orders,
        order,
        loading,
        orderConnectionError,
        ordersConnectionError,
        handleSelectOrder,
        buildTrackingUrl,
        confirmDelivery,
    };
};
