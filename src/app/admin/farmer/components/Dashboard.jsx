"use client";
import React from "react";

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ start, end }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState({
    total: 0,
    renterCaretaker: 0,
    owner: 0,
    other: 0,
    percents: { renterCaretaker: 0, owner: 0, other: 0 },
    byProvince: [], // 👈 รับข้อมูลจังหวัด/อำเภอ
  });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (start) qs.set("start", start);
        if (end) qs.set("end", end);
        const url = `/api/admin/farmer/dashboard${qs.toString() ? `?${qs}` : ""}`;

        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "โหลดข้อมูลไม่สำเร็จ");
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [start, end]);

  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);
  const pct = (n) => `${Number(n || 0).toFixed(2)}%`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Farmer Dashboard</h2>
          <p className="text-sm text-gray-500">
            สรุปผู้ลงทะเบียน {(start || end) ? ` — ช่วง ${start || "…"} ถึง ${end || "…"} ` : ""}
          </p>
        </div>
        <div className="text-xs text-gray-500">{loading ? "Loading…" : "Updated just now"}</div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="ผู้ลงทะเบียน (เกษตรกร) — รวม" value={loading ? "—" : fmt(data.total)} />
        <KpiCard label="ผู้เช่าปลูก/ผู้ดูแลสวน" value={loading ? "—" : fmt(data.renterCaretaker)} sub={loading ? "" : pct(data.percents.renterCaretaker)} />
        <KpiCard label="เจ้าของสวน" value={loading ? "—" : fmt(data.owner)} sub={loading ? "" : pct(data.percents.owner)} />
      </div>

      {/* ตารางจังหวัด/อำเภอ */}
      <div className="mt-8 space-y-6">
        {!loading && data.byProvince?.length === 0 && (
          <div className="text-sm text-gray-500">ยังไม่มีข้อมูลตามจังหวัด</div>
        )}

        {data.byProvince?.map((p) => (
          <div key={p.province || "unknown"} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">
                จังหวัด {p.province || "-"}{" "}
                <span className="text-sm text-gray-500">({fmt(p.total)} ราย)</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">อำเภอ</th>
                    <th className="py-2 w-32 text-right">จำนวน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {p.districts?.map((d, i) => (
                    <tr key={`${p.province}-${d?.name || i}`}>
                      <td className="py-2">{d?.name || "-"}</td>
                      <td className="py-2 text-right">{fmt(d?.count || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
