"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw, Search, Filter, X } from "lucide-react";

/** สร้าง URL จาก params (ตัดค่าว่างออก) */
const apiUrl = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      qs.set(k, String(v).trim());
    }
  });
  return `/api/admin/farmer/information?${qs.toString()}`;
};

function useInformation() {
  const [rows, setRows] = React.useState([]);
  const [nextCursor, setNextCursor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const abortRef = React.useRef(null);

  const [params, setParams] = React.useState({
    q: "",
    plant: "",
    species: "",
    sub_district: "",
    district: "",
    province: "",
    regSubType: "",
    limit: 100, // ขนาดเพจสำหรับหน้าแสดงผล
  });

  const cancelPending = () => {
    try {
      abortRef.current?.abort();
    } catch {}
  };

  const refresh = React.useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError("");
      cancelPending();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const merged = { ...params, ...overrides };
        const res = await fetch(apiUrl(merged), {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "โหลดข้อมูลไม่สำเร็จ");
        setRows(json.data || []);
        setNextCursor(json.nextCursor || null);
      } catch (e) {
        if (e?.name !== "AbortError") setError(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const loadMore = React.useCallback(
    async () => {
      if (!nextCursor) return;
      setLoading(true);
      setError("");
      cancelPending();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(apiUrl({ ...params, cursor: nextCursor }), {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "โหลดข้อมูลไม่สำเร็จ");
        setRows((prev) => [...prev, ...(json.data || [])]);
        setNextCursor(json.nextCursor || null);
      } catch (e) {
        if (e?.name !== "AbortError") setError(e?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    },
    [params, nextCursor]
  );

  React.useEffect(() => () => cancelPending(), []);

  return { rows, nextCursor, loading, error, params, setParams, refresh, loadMore };
}

/* ===== Export helpers ===== */

async function fetchAllRows(params) {
  const PAGE_LIMIT = 1000;
  let cursor = null;
  const all = [];
  for (let i = 0; i < 200; i++) {
    const url = apiUrl(cursor ? { ...params, limit: PAGE_LIMIT, cursor } : { ...params, limit: PAGE_LIMIT });
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "โหลดข้อมูล (export) ไม่สำเร็จ");
    const chunk = Array.isArray(json?.data) ? json.data : [];
    all.push(...chunk);
    if (!json?.nextCursor) break;
    cursor = json.nextCursor;
  }
  return all;
}

async function exportXLSX_fromRows(rows) {
  if (!rows?.length) return;
  const XLSXmod = await import("xlsx");
  const XLSX = XLSXmod.default || XLSXmod;

  const header = [
    "ชื่อ","นามสกุล","เบอร์โทร",
    "ชนิดพืช","จำนวนต้น","ชนิดพืชอื่น",
    "สายพันธุ์","อายุพืช",
    "วา","งาน","ไร่",
    "ที่อยู่","ตำบล","อำเภอ","จังหวัด",
    "สถานะ","วันที่ลงทะเบียน(TH)"
  ];

  const data = rows.map((r) => {
    const plant = Array.isArray(r.regPlant) ? r.regPlant.join(", ") : (r.regPlant ?? "");
    const species = Array.isArray(r.regPlantSpecies) ? r.regPlantSpecies.join(", ") : "";
    return [
      r.regName ?? "", r.regSurname ?? "", r.regTel ?? "",
      plant, r.regPlantAmount ?? "",
      r.regPlantOther ?? "",
      species,
      r.regPlantAge ?? "",
      r.areaWa ?? "", r.areaNgan ?? "", r.areaRai ?? "",
      r.addressDetail ?? "", r.sub_district ?? "", r.district ?? "", r.province ?? "",
      r.regSubType ?? "", r.createdAtTH ?? ""
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ข้อมูลเกษตรกร");
  XLSX.writeFile(wb, `farmer-information-${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ===== Page ===== */

export default function DataInformationPage() {
  const { rows, nextCursor, loading, error, params, setParams, refresh, loadMore } = useInformation();
  const [showFilters, setShowFilters] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  // โหลดครั้งแรก
  React.useEffect(() => { refresh(); }, [refresh]);

  // ดีบาวซ์เฉพาะช่องค้นหา q
  React.useEffect(() => {
    const q = (params.q || "").trim();
    const t = setTimeout(() => {
      if (q.length === 0 || q.length >= 2) refresh();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  // เปลี่ยนจำนวนต่อหน้า → รีเฟรชทันที
  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.limit]);

  const activeFilterChips = [
    params.plant && { k: "plant", label: `ชนิดพืช: ${params.plant}` },
    params.species && { k: "species", label: `สายพันธุ์: ${params.species}` },
    params.sub_district && { k: "sub_district", label: `ตำบล: ${params.sub_district}` },
    params.district && { k: "district", label: `อำเภอ: ${params.district}` },
    params.province && { k: "province", label: `จังหวัด: ${params.province}` },
    params.regSubType && { k: "regSubType", label: `สถานะ: ${params.regSubType}` },
  ].filter(Boolean);

  const clearOne = (k) => setParams((p) => ({ ...p, [k]: "" }));
  const clearAllFilters = () =>
    setParams((p) => ({ ...p, plant: "", species: "", sub_district: "", district: "", province: "", regSubType: "" }));

  const handleExportAll = async () => {
    try {
      setExporting(true);
      const all = await fetchAllRows(params);
      await exportXLSX_fromRows(all);
    } catch (e) {
      alert(e?.message || "Export ไม่สำเร็จ");
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">ข้อมูลผู้ลงทะเบียน (ตาราง)</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="รีเฟรช"
                onClick={() => refresh()}
                disabled={loading || exporting}
                title="รีเฟรช"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="ส่งออก XLSX"
                onClick={handleExportAll}
                disabled={exporting}
                title="ส่งออกผลลัพธ์ทั้งหมดตามตัวกรองเป็น .xlsx"
              >
                <Download className={`h-4 w-4 ${exporting ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* แถวค้นหา (Enter ทำงานแน่ ๆ) */}
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              refresh();
            }}
          >
            <div className="relative flex-1 min-w-[240px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="pl-9 pr-8 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                placeholder="ค้นหา ชื่อ/นามสกุล/เบอร์โทร/ที่อยู่… (พิมพ์ ≥ 2 ตัว หรือกด Enter)"
                value={params.q}
                onChange={(e) => setParams((p) => ({ ...p, q: e.target.value }))}
              />
              {params.q ? (
                <button
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, q: "" }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  aria-label="ล้างคำค้นหา"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                value={params.limit}
                onChange={(e) => setParams((p) => ({ ...p, limit: Number(e.target.value) }))}
                title="จำนวนต่อหน้า (เฉพาะบนตาราง)"
              >
                {[50, 100, 200, 500, 1000].map((n) => (
                  <option key={n} value={n}>{n}/หน้า</option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                title="ตัวกรองเพิ่มเติม"
                disabled={exporting}
              >
                <Filter className="h-4 w-4 mr-2" />
                ตัวกรอง
                {activeFilterChips.length > 0 && (
                  <span className="ml-2 rounded-full bg-black text-white text-[11px] px-2 py-0.5">
                    {activeFilterChips.length}
                  </span>
                )}
              </Button>

              <Button type="submit" disabled={loading || exporting} className="rounded-xl">
                ค้นหา
              </Button>
            </div>
          </form>

          {/* ชิปตัวกรอง */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterChips.map((c) => (
                <span
                  key={c.k}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs"
                >
                  {c.label}
                  <button
                    className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-gray-200"
                    onClick={() => clearOne(c.k)}
                    aria-label="ลบตัวกรอง"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                className="text-xs underline text-gray-500 hover:text-black"
                onClick={clearAllFilters}
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}

          {/* แผงตัวกรอง */}
          {showFilters && (
            <div className="rounded-xl border border-gray-200 p-3 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2">
                <input
                  className="px-3 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                  placeholder="ชนิดพืช (รหัส/ชื่อ)"
                  value={params.plant}
                  onChange={(e) => setParams((p) => ({ ...p, plant: e.target.value }))}
                />
                <input
                  className="px-3 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                  placeholder="สายพันธุ์"
                  value={params.species}
                  onChange={(e) => setParams((p) => ({ ...p, species: e.target.value }))}
                />
                <input
                  className="px-3 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                  placeholder="ตำบล"
                  value={params.sub_district}
                  onChange={(e) => setParams((p) => ({ ...p, sub_district: e.target.value }))}
                />
                <input
                  className="px-3 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                  placeholder="อำเภอ"
                  value={params.district}
                  onChange={(e) => setParams((p) => ({ ...p, district: e.target.value }))}
                />
                <input
                  className="px-3 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                  placeholder="จังหวัด"
                  value={params.province}
                  onChange={(e) => setParams((p) => ({ ...p, province: e.target.value }))}
                />
                <select
                  className="px-3 py-2 w-full rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                  value={params.regSubType}
                  onChange={(e) => setParams((p) => ({ ...p, regSubType: e.target.value }))}
                  title="สถานะ"
                >
                  <option value="">สถานะ (ทั้งหมด)</option>
                  <option value="ผู้เช่าปลูก/ผู้ดูแลสวน">ผู้เช่าปลูก/ผู้ดูแลสวน</option>
                  <option value="เจ้าของสวน">เจ้าของสวน</option>
                </select>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="outline" className="rounded-xl" onClick={clearAllFilters} disabled={exporting}>
                  ล้าง
                </Button>
                <Button className="rounded-xl" onClick={() => refresh()} disabled={exporting}>
                  ใช้ตัวกรอง
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ตาราง */}
          <div className="relative">
            {loading && rows.length > 0 && (
              <div className="absolute inset-x-0 -top-7 text-xs text-gray-500">กำลังโหลดข้อมูล…</div>
            )}
            <div className="overflow-auto rounded-xl border border-gray-100">
              <table className="min-w-[1400px] w-full text-sm whitespace-nowrap">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-left text-gray-600">
                    {[
                      "ชื่อ","นามสกุล","เบอร์โทร",
                      "ชนิดพืช","จำนวนต้น","ชนิดพืชอื่น",
                      "สายพันธุ์","อายุพืช",
                      "วา","งาน","ไร่",
                      "ที่อยู่","ตำบล","อำเภอ","จังหวัด",
                      "สถานะ","วันที่ลงทะเบียน (TH)"
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-3 py-2 font-medium bg-gray-50 ${i === 0 ? "sticky left-0 z-20" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && rows.length === 0
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 17 }).map((__, j) => (
                            <td key={j} className={`px-3 py-2 ${j === 0 ? "sticky left-0 bg-white" : ""}`}>
                              <Skeleton className="h-4 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : rows.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/70">
                          <td className="px-3 py-2 sticky left-0 bg-white z-10">{r.regName}</td>
                          <td className="px-3 py-2">{r.regSurname}</td>
                          <td className="px-3 py-2">{r.regTel}</td>
                          <td className="px-3 py-2">
                            {Array.isArray(r.regPlant) ? r.regPlant.join(", ") : r.regPlant}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.regPlantAmount}</td>
                          <td className="px-3 py-2">{r.regPlantOther}</td>
                          <td className="px-3 py-2">
                            {Array.isArray(r.regPlantSpecies) ? r.regPlantSpecies.join(", ") : "-"}
                          </td>
                          <td className="px-3 py-2">{r.regPlantAge}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.areaWa}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.areaNgan}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.areaRai}</td>

                          {/* ที่อยู่: แสดงบรรทัดเดียว + ellipsis แต่ยัง hover ดูเต็มด้วย title */}
                          <td className="px-3 py-2 max-w-[420px] truncate" title={r.addressDetail}>
                            {r.addressDetail}
                          </td>

                          <td className="px-3 py-2">{r.sub_district}</td>
                          <td className="px-3 py-2">{r.district}</td>
                          <td className="px-3 py-2">{r.province}</td>
                          <td className="px-3 py-2">{r.regSubType}</td>
                          <td className="px-3 py-2">{r.createdAtTH}</td>
                        </tr>
                      ))}

                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={17} className="px-3 py-6 text-center text-gray-500">
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* โหลดเพิ่ม */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              แสดง {rows.length.toLocaleString("th-TH")} รายการ
            </div>
            <div className="flex items-center gap-2">
              {nextCursor ? (
                <Button onClick={loadMore} disabled={loading || exporting} className="rounded-xl">
                  {loading ? "กำลังโหลด..." : "โหลดเพิ่ม"}
                </Button>
              ) : (
                <span className="text-xs text-gray-500">สิ้นสุดรายการ</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
