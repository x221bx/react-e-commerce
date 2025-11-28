// src/components/SimpleAnalyticsPanel.jsx
import React from "react";
import useSimpleAnalytics from "../hooks/useSimpleAnalytics";

export default function SimpleAnalyticsPanel() {
  const { loading, result } = useSimpleAnalytics({
    sampleCollections: ["users", "orders", "products"],
    docLimit: 2000,
  });

  if (loading) return <div>جاري التحليل...</div>;
  if (!result) return <div>لا نتائج</div>;
  if (result.error) return <div>خطأ: {result.error}</div>;

  return (
    <div style={{ padding: 12, fontFamily: "Arial, sans-serif" }}>
      <h3>ملخص بيانات الموقع</h3>
      <p>
        Users: {result.counts.users} | Orders: {result.counts.orders} |
        Products: {result.counts.products}
      </p>

      <section style={{ marginTop: 12 }}>
        <h4>Top Products (by qty)</h4>
        <ol>
          {result.topProducts.map((p) => (
            <li key={p.productId}>
              {p.info?.title ?? p.info?.name ?? p.productId} — qty: {p.qty} —
              revenue: {Number(p.revenue || 0).toFixed(2)}
            </li>
          ))}
        </ol>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Segments sample (RFM + cluster)</h4>
        <div
          style={{
            maxHeight: 240,
            overflow: "auto",
            border: "1px solid #eee",
            padding: 8,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
                >
                  uid
                </th>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "right" }}
                >
                  recency(d)
                </th>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "right" }}
                >
                  freq
                </th>
                <th
                  style={{ borderBottom: "1px solid #ddd", textAlign: "right" }}
                >
                  monetary
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  cluster
                </th>
              </tr>
            </thead>
            <tbody>
              {result.segments.segmentsSample.map((s) => (
                <tr key={s.uid}>
                  <td style={{ padding: "6px 4px" }}>{s.uid}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right" }}>
                    {s.recency}
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "right" }}>
                    {s.frequency}
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "right" }}>
                    {Number(s.monetary).toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>
                    {s.cluster}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Co-occurrence recommendations (sample)</h4>
        <div>
          {Object.entries(result.cooccurrenceExample).map(([pid, recs]) => (
            <div key={pid} style={{ marginBottom: 8 }}>
              <strong>{productLabel(pid, result.topProducts)}</strong> →{" "}
              {recs.map((r) => r.info?.title ?? r.productId).join(", ")}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// helper to get product label from topProducts (to show title if available)
function productLabel(pid, topProducts) {
  const p = topProducts.find((x) => x.productId === pid);
  if (p && p.info) return p.info.title ?? p.info.name ?? pid;
  return pid;
}
