// src/hooks/useSimpleAnalytics.js
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "../services/firebase.js";

// --- Simple KMeans implementation (works for small datasets in browser) ---
function simpleKMeans(data, k = 3, maxIter = 100) {
  if (!data.length) return { centroids: [], labels: [] };
  const dims = data[0].length;
  const centroids = [];
  const used = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * data.length);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push([...data[idx]]);
    }
  }

  let labels = new Array(data.length).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;
    // assign
    for (let i = 0; i < data.length; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        let d = 0;
        for (let j = 0; j < dims; j++) {
          const diff = data[i][j] - centroids[c][j];
          d += diff * diff;
        }
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        moved = true;
      }
    }
    if (!moved) break;
    // update centroids
    const sums = Array.from({ length: k }, () => Array(dims).fill(0));
    const counts = Array(k).fill(0);
    for (let i = 0; i < data.length; i++) {
      const lbl = labels[i];
      counts[lbl] += 1;
      for (let j = 0; j < dims; j++) sums[lbl][j] += data[i][j];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) continue;
      for (let j = 0; j < dims; j++) centroids[c][j] = sums[c][j] / counts[c];
    }
  }
  return { centroids, labels };
}

// helper to get days between two dates
function daysBetween(d1, d2) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((d2 - d1) / msPerDay);
}

export default function useSimpleAnalytics({
  sampleCollections = ["users", "orders", "products"],
  docLimit = 1000,
} = {}) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        const data = {};
        // Read sample docs from each collection (limited)
        for (const colName of sampleCollections) {
          try {
            const q = query(
              collection(db, colName),
              orderBy("createdAt", "desc"),
              firestoreLimit(Math.max(1, Math.min(docLimit, 5000)))
            );
            const snap = await getDocs(q);
            data[colName] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          } catch {
            // if ordering by createdAt fails (no index or no field), fallback to getDocs(collection)
            const snap = await getDocs(collection(db, colName));
            data[colName] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          }
        }

        const orders = data["orders"] || [];
        const products = data["products"] || [];
        const users = data["users"] || [];

        // Build product index map once
        const productIndex = {};
        for (const p of products) {
          const pid = p.productId ?? p.id ?? p.sku ?? null;
          if (pid) productIndex[pid] = p;
        }

        // Aggregations
        const topSellers = {}; // pid -> { qty, revenue }
        const cooccurrence = {}; // pid -> { pid2: count }
        const userStats = {}; // uid -> { lastOrderDate, freq, monetary }

        for (const order of orders) {
          const uid =
            order.uid ?? order.userId ?? order.customerId ?? "unknown";
          // normalize createdAt (Firestore Timestamp or ISO string or Date)
          let createdAt;
          if (order.createdAt && order.createdAt.seconds) {
            createdAt = new Date(order.createdAt.seconds * 1000);
          } else if (order.createdAt) {
            createdAt = new Date(order.createdAt);
            if (isNaN(createdAt)) createdAt = new Date();
          } else {
            createdAt = new Date();
          }

          const items = order.items ?? order.lineItems ?? order.products ?? [];
          const normalized = items
            .map((it) => ({
              productId: it.productId ?? it.id ?? it.sku ?? null,
              qty: Number(it.qty ?? it.quantity ?? 1),
              price: Number(it.price ?? it.unitPrice ?? 0),
            }))
            .filter((i) => i.productId);

          let orderTotal = 0;
          normalized.forEach((it) => {
            const pid = it.productId;
            const qty = isNaN(it.qty) ? 1 : it.qty;
            const price = isNaN(it.price) ? 0 : it.price;
            orderTotal += price * qty;
            if (!topSellers[pid]) topSellers[pid] = { qty: 0, revenue: 0 };
            topSellers[pid].qty += qty;
            topSellers[pid].revenue += price * qty;
          });

          const pids = Array.from(new Set(normalized.map((n) => n.productId)));
          for (let i = 0; i < pids.length; i++) {
            const a = pids[i];
            if (!cooccurrence[a]) cooccurrence[a] = {};
            for (let j = i + 1; j < pids.length; j++) {
              const b = pids[j];
              cooccurrence[a][b] = (cooccurrence[a][b] || 0) + 1;
              if (!cooccurrence[b]) cooccurrence[b] = {};
              cooccurrence[b][a] = (cooccurrence[b][a] || 0) + 1;
            }
          }

          if (!userStats[uid])
            userStats[uid] = { lastOrderDate: createdAt, freq: 0, monetary: 0 };
          userStats[uid].freq += 1;
          userStats[uid].monetary += orderTotal;
          if (createdAt > userStats[uid].lastOrderDate)
            userStats[uid].lastOrderDate = createdAt;
        }

        // RFM
        const today = new Date();
        const rfm = [];
        for (const uid of Object.keys(userStats)) {
          const s = userStats[uid];
          const recency = daysBetween(s.lastOrderDate, today); // smaller better
          const frequency = s.freq;
          const monetary = s.monetary;
          rfm.push({ uid, recency, frequency, monetary });
        }

        // If not enough users, handle gracefully
        let segments = { k: 0, segmentsSample: [] };
        if (rfm.length > 0) {
          const matrix = rfm.map((r) => [r.recency, r.frequency, r.monetary]);

          // compute simple std for scaling (avoid divide by zero)
          function colStd(mat, col) {
            const vals = mat.map((r) => r[col]);
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            const v =
              vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
            return Math.sqrt(v) || 1;
          }
          const s0 = colStd(matrix, 0);
          const s1 = colStd(matrix, 1);
          const s2 = colStd(matrix, 2);
          const scaled = matrix.map((r) => [r[0] / s0, r[1] / s1, r[2] / s2]);

          const k = Math.min(
            4,
            Math.max(2, Math.round(Math.sqrt(scaled.length)))
          );
          const { labels } = simpleKMeans(scaled, k);
          segments = {
            k,
            segmentsSample: rfm
              .slice(0, 500)
              .map((r, idx) => ({ ...r, cluster: labels[idx] ?? 0 })),
          };
        }

        // top products sorted
        const topProducts = Object.entries(topSellers)
          .map(([pid, v]) => ({
            productId: pid,
            qty: v.qty,
            revenue: v.revenue,
            info: productIndex[pid] ?? null,
          }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 30);

        // recommendations sample (cooccurrence top)
        function recommendFor(productId, topN = 5) {
          const map = cooccurrence[productId] || {};
          return Object.entries(map)
            .map(([pid, cnt]) => ({
              productId: pid,
              score: cnt,
              info: productIndex[pid] ?? null,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN);
        }

        const cooccurrenceExample = {};
        Object.keys(cooccurrence)
          .slice(0, 10)
          .forEach((pid) => {
            cooccurrenceExample[pid] = recommendFor(pid, 5);
          });

        const output = {
          counts: {
            users: users.length,
            orders: orders.length,
            products: products.length,
          },
          rfmSummary: {
            totalUsersWithOrders: rfm.length,
            rfmSample: rfm.slice(0, 10),
          },
          segments,
          topProducts,
          cooccurrenceExample,
        };

        if (mounted) {
          setResult(output);
          setLoading(false);
        }
      } catch (err) {
        console.error("analytics error", err);
        if (mounted) {
          setResult({ error: String(err) });
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [sampleCollections, docLimit]);

  return { loading, result };
}
