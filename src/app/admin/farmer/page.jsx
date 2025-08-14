"use client";
import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Dashboard from "../../admin/farmer/components/Dashboard";
import DataInformation from "../farmer/components/DataInformation";
import { Menu, LayoutDashboard, Calendar, Users as UsersIcon, X, ArrowLeft } from "lucide-react";

/* --------- Buttons / Items --------- */
function TabButton({ id, activeTab, setActiveTab, children }) {
  const isActive = activeTab === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActiveTab(id)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const order = ["dashboard", "data", "users"];
          const idx = order.indexOf(activeTab);
          const next = e.key === "ArrowRight" ? (idx + 1) % order.length : (idx - 1 + order.length) % order.length;
          setActiveTab(order[next]);
        }
      }}
      className={
        "px-4 py-2 rounded-2xl text-sm font-medium transition shadow-sm outline-none focus:ring-2 focus:ring-offset-2 " +
        (isActive
          ? "bg-black text-white focus:ring-black"
          : "bg-white text-black border border-gray-200 hover:bg-gray-50 focus:ring-gray-400")
      }
    >
      {children}
    </button>
  );
}

function SideNavItem({ id, icon: Icon, label, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`sidenav-${id}`}
      onClick={() => setActiveTab(id)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const order = ["dashboard", "data", "users"];
          const idx = order.indexOf(activeTab);
          const next = e.key === "ArrowDown" ? (idx + 1) % order.length : (idx - 1 + order.length) % order.length;
          setActiveTab(order[next]);
        }
      }}
      className={
        "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition outline-none focus:ring-2 focus:ring-offset-2 " +
        (isActive ? "bg-black text-white focus:ring-black" : "text-gray-700 hover:bg-gray-100 focus:ring-gray-400")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

/* --------- (ตัวอย่าง) Date Section ถ้ายังต้องใช้ที่อื่น --------- */
function DateSection({ start, end, setStart, setEnd }) {
  const valid = useMemo(() => (start && end ? new Date(start) <= new Date(end) : true), [start, end]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Date</h2>
      <p className="text-sm text-gray-500 mb-6">เลือกช่วงวันที่เพื่อกรองข้อมูล</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <label className="text-sm text-gray-600">เริ่มต้น</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <label className="text-sm text-gray-600">สิ้นสุด</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="text-sm text-gray-600">สรุป</div>
            <div className="mt-1 text-sm text-gray-500">
              {start && end ? (
                valid ? (
                  <>ช่วงวันที่ <b>{start}</b> ถึง <b>{end}</b></>
                ) : (
                  <span className="text-red-600">วันที่เริ่มต้นต้อง ≤ วันสิ้นสุด</span>
                )
              ) : (
                <span>ยังไม่เลือกช่วงวันที่</span>
              )}
            </div>
          </div>
          <button
            disabled={!start || !end || !valid}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-white disabled:opacity-40"
          >
            ใช้ตัวกรอง
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h3 className="font-medium">ข้อมูลตามช่วงวันที่</h3>
        <p className="text-sm text-gray-500">ผลลัพธ์จะสะท้อนในแท็บ Dashboard</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="ผลผลิตรวม (กก.)" value="—" />
          <KpiCard label="ออเดอร์รวม" value="—" />
          <KpiCard label="รายได้รวม (฿)" value="—" />
        </div>
      </div>
    </div>
  );
}

/* --------- Users (ตัวอย่าง) --------- */
function UsersSection() {
  const [q, setQ] = useState("");
  const users = [
    { id: 1, name: "Somchai", role: "Buyer", status: "active" },
    { id: 2, name: "Suda", role: "Farmer", status: "inactive" },
    { id: 3, name: "Anan", role: "Admin", status: "active" },
  ];
  const filtered = users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-gray-500">จัดการผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>
        <button className="rounded-xl bg-black text-white px-4 py-2 text-sm">+ เพิ่มผู้ใช้</button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <input
            placeholder="ค้นหาชื่อผู้ใช้..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-2.5 outline-none focus:ring-2 focus:ring-black"
          />
          <button className="rounded-xl border px-3 py-2 text-sm">ค้นหา</button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">ชื่อ</th>
                <th className="py-2">บทบาท</th>
                <th className="py-2">สถานะ</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3">{u.role}</td>
                  <td className="py-3">
                    <span
                      className={
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs " +
                        (u.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600")
                      }
                    >
                      <span className={`h-2 w-2 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sm underline mr-3">แก้ไข</button>
                    <button className="text-sm text-red-600 underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    ไม่พบผู้ใช้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --------- Page --------- */
export default function FarmerPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — เต็มจอ */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border"
              onClick={() => setNavOpen(true)}
              aria-label="เปิดเมนู"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">F</div>
            <div>
              <div className="text-sm text-gray-500">Farmer App</div>
              <h1 className="text-lg font-semibold leading-tight">FarmerPage</h1>
            </div>
          </div>

          {/* Tabs (มือถือ) */}
          <nav role="tablist" aria-label="Main sections" className="md:hidden flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
            <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab}>Dashboard</TabButton>
            <TabButton id="data" activeTab={activeTab} setActiveTab={setActiveTab}>Data</TabButton>
            <TabButton id="users" activeTab={activeTab} setActiveTab={setActiveTab}>Users</TabButton>
          </nav>
        </div>
      </header>

      {/* Layout — เต็มจอ */}
      <div className="flex w-full">
        {/* Overlay (mobile) */}
        {navOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={closeNav} aria-hidden="true" />}

        {/* Sidebar */}
        <aside
          className={
            "fixed md:static z-50 md:z-auto inset-y-0 left-0 transform md:transform-none transition-transform duration-200 " +
            (navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
          }
          aria-label="เมนูหลัก"
        >
          <div className="h-full w-64 bg-white border-r border-gray-100 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <div className="font-semibold">เมนู</div>
              <button className="inline-flex items-center justify-center h-8 w-8 rounded-xl border" onClick={closeNav} aria-label="ปิดเมนู">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Link
              href="/admin/menu"
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition"
            >
              <ArrowLeft className="h-4 w-4" /> กลับไป
            </Link>

            <div className="hidden md:block text-xs text-gray-500 mb-2">เมนู</div>
            <div role="tablist" aria-orientation="vertical" className="space-y-1">
              <SideNavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideNavItem id="data" icon={Calendar} label="Data" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideNavItem id="users" icon={UsersIcon} label="Users" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="mt-auto pt-4 text-[11px] text-gray-500">v1.0 • © Farmer</div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 py-6">
          <section
            id="panel-dashboard"
            role="tabpanel"
            aria-labelledby="sidenav-dashboard"
            hidden={activeTab !== "dashboard"}
            className="animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <Dashboard start={start} end={end} />
          </section>

          <section
            id="panel-data"
            role="tabpanel"
            aria-labelledby="sidenav-data"
            hidden={activeTab !== "data"}
            className="animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {/* ใช้หน้า DataInformation แบบเต็มความกว้าง */}
            <DataInformation />
          </section>

          <section
            id="panel-users"
            role="tabpanel"
            aria-labelledby="sidenav-users"
            hidden={activeTab !== "users"}
            className="animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <UsersSection />
          </section>
        </main>
      </div>
    </div>
  );
}
