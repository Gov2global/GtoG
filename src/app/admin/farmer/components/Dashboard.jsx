"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("th-TH") : n ?? "-");
const pct = (n) => `${Number(n || 0).toFixed(2)}%`;

const buildUrl = (start, end) => {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  return `/api/admin/farmer/dashboard${qs.toString() ? `?${qs}` : ""}`;
};

function KpiCard({ label, value, sub, loading }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        {loading ? (
          <>
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-7 w-28 mb-2" />
            <Skeleton className="h-3 w-16" />
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Province card: preview 4 แถว + toggle; คอนเทนต์เต็มกรอบ */
function ProvinceCard({ p }) {
  const ROW_PREVIEW = 4;
  const [open, setOpen] = React.useState(false);
  const rows = p?.districts || [];
  const more = Math.max(0, rows.length - ROW_PREVIEW);
  const show = open ? rows : rows.slice(0, ROW_PREVIEW);

  return (
    <Card className="rounded-xl">
      <CardContent className="pt-3 px-0 pb-3">
        <div className="text-sm font-medium mb-2 px-4">
          {p.province || "-"}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({fmt(p.total)} ราย)
          </span>
        </div>

        <div role="list" className="w-full text-xs divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-1.5 text-[11px] text-muted-foreground bg-gray-50/60">
            <span>อำเภอ</span>
            <span>จำนวน</span>
          </div>

          {show.map((d, i) => (
            <div
              key={`${p.province}-${d?.name || i}`}
              role="listitem"
              className="flex items-center justify-between px-4 py-1.5"
              title={d?.name || "-"}
            >
              <span className="truncate mr-3">{d?.name || "-"}</span>
              <span className="tabular-nums">{fmt(d?.count || 0)}</span>
            </div>
          ))}
        </div>

        {more > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-black px-4"
            aria-expanded={open}
          >
            {open ? (
              <>ซ่อน ({more}) <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>ดูทั้งหมด (+{more}) <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function exportCSV(byProvince, periodLabel) {
  const header = ["province", "district", "count"];
  const rows = [header.join(",")];
  byProvince.forEach((p) => {
    if (!p.districts?.length) rows.push([p.province, "", String(p.total)].join(","));
    p.districts?.forEach((d) => rows.push([p.province, d.name, String(d.count)].join(",")));
  });
  const blob = new Blob([`# Farmer Dashboard ${periodLabel}\n` + rows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `farmer-dashboard-${periodLabel.replaceAll(" ", "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FarmerDashboard({ start, end }) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState(""); // ป้องกัน hydration mismatch

  // แผนที่ plantID -> plantNameTH จาก /api/farmer/get/plant
  const [plantMap, setPlantMap] = React.useState({});

  const loadData = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const url = buildUrl(start, end);

      const [resDash, resPlants] = await Promise.all([
        fetch(url, { cache: "no-store" }),
        fetch("/api/farmer/get/plant", { cache: "no-store" }),
      ]);

      const jsonDash = await resDash.json();
      const jsonPlants = await resPlants.json();

      if (!resDash.ok) throw new Error(jsonDash?.message || "โหลดข้อมูลไม่สำเร็จ");
      if (!resPlants.ok) throw new Error(jsonPlants?.message || "โหลดข้อมูลพืชไม่สำเร็จ");

      // map ด้วย plantID (e.g., PLA001)
      const list = Array.isArray(jsonPlants?.data) ? jsonPlants.data : [];
      const m = {};
      for (const p of list) m[String(p.plantID)] = p.plantNameTH;
      setPlantMap(m);

      setData(jsonDash);
      setError(null);
      setLastUpdated(new Date().toLocaleString("th-TH"));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [start, end]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const periodLabel = start || end ? `ช่วง ${start || "…"} ถึง ${end || "…"}` : "ทั้งหมด";
  const total = data?.total ?? 0;
  const pc = data?.percents ?? { renterCaretaker: 0, owner: 0, other: 0 };

  // helper: แสดงชื่อพืชจาก plantID
  const plantName = (id) => {
    if (!id || id === "none") return "ไม่ระบุชนิดพืช";
    return plantMap[id] || id; // ถ้าแมปไม่เจอ แสดงรหัสไว้ก่อน
  };

  return (
    <div className="space-y-6" aria-busy={loading || refreshing} aria-live="polite">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Farmer Dashboard</h2>
          <p className="text-sm text-muted-foreground">สรุปผู้ลงทะเบียน — {periodLabel}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{loading ? "Loading…" : "Up to date"}</Badge>
          <Button variant="outline" size="icon" aria-label="รีเฟรช" onClick={loadData}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="ดาวน์โหลด CSV"
            onClick={() => exportCSV(data?.byProvince || [], periodLabel)}
            disabled={!data?.byProvince?.length}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error?.message || "ไม่สามารถโหลดข้อมูลได้"}</AlertDescription>
        </Alert>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="ผู้ลงทะเบียน (เกษตรกร)" value={fmt(total)} loading={loading} />
        <KpiCard
          label="ผู้เช่าปลูก/ผู้ดูแลสวน"
          value={fmt(data?.renterCaretaker || 0)}
          sub={pct(pc.renterCaretaker)}
          loading={loading}
        />
        <KpiCard label="เจ้าของสวน" value={fmt(data?.owner || 0)} sub={pct(pc.owner)} loading={loading} />
      </div>

      {/* Composition */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">สัดส่วนผู้ลงทะเบียน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[{ k: "ผู้เช่าปลูก/ผู้ดูแลสวน", v: pc.renterCaretaker }, { k: "เจ้าของสวน", v: pc.owner }].map(
            (row) => (
              <div key={row.k} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{row.k}</span>
                  <span>{pct(row.v)}</span>
                </div>
                <Progress value={Number(row.v)} />
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* ชนิดของพืช */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ชนิดของพืช</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
          ) : (data?.byPlant?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลชนิดพืช</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {data.byPlant
                .slice()
                .sort((a, b) => b.count - a.count)
                .map((bp) => (
                  <div key={bp.plantId} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium truncate pr-2">{plantName(bp.plantId)}</span>
                      <span className="tabular-nums">{fmt(bp.count)}</span>
                    </div>
                    <Progress value={Number(bp.percent)} />
                    <div className="mt-1 text-[11px] text-muted-foreground">{pct(bp.percent)}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provinces grid */}
      <div className="space-y-3">
        {!loading && (data?.byProvince?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลตามจังหวัด</p>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-gray-200 pb-1 mb-2">
              <h3 className="text-xl font-semibold text-gray-700">จังหวัด</h3>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="rounded-xl">
                    <CardHeader className="py-3 pb-1">
                      <Skeleton className="h-4 w-40" />
                    </CardHeader>
                    <CardContent className="pt-1 space-y-1.5">
                      {[...Array(5)].map((__, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {data?.byProvince?.map((p) => (
                  <ProvinceCard key={p.province || "unknown"} p={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* เวลาอัปเดต (client only) */}
      {lastUpdated && (
        <p className="text-[11px] text-muted-foreground">
          อัปเดตล่าสุด: <time suppressHydrationWarning>{lastUpdated}</time>
        </p>
      )}
    </div>
  );
}
