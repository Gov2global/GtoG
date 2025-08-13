"use client"
import React, { useMemo, useState } from "react";

// Single-file, production-ready demo component
// - TailwindCSS utility classes for styling
// - Simple tab switcher (no external UI libs required)
// - 3 sections: Dashboard, Date, Users
// - Accessible keyboard navigation

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
          const order = ["dashboard", "date", "users"];
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

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function DashboardSection() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Farmer Dashboard</h2>
          <p className="text-sm text-gray-500">ภาพรวมผลผลิตและออเดอร์ล่าสุด</p>
        </div>
        <div className="text-xs text-gray-500">Updated just now</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="ผลผลิต (กก.)" value="1,240" sub="+8% จากสัปดาห์ก่อน" />
        <KpiCard label="ออเดอร์" value="86" sub="-3% WoW" />
        <KpiCard label="รายได้ (฿)" value="152,400" sub="+12% MoM" />
        <KpiCard label="สต๊อกคงเหลือ" value="420" sub="กก." />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">รายการล่าสุด</h3>
            <button className="text-sm underline">ดูทั้งหมด</button>
          </div>
          <ul className="mt-4 divide-y divide-gray-100">
            {[
              { id: 1, item: "มะเขือเทศ", qty: 120, buyer: "ตลาด A" },
              { id: 2, item: "แตงกวา", qty: 80, buyer: "ร้าน B" },
              { id: 3, item: "พริก", qty: 60, buyer: "ตลาด C" },
            ].map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.item}</div>
                  <div className="text-xs text-gray-500">ผู้ซื้อ: {r.buyer}</div>
                </div>
                <div className="text-sm">{r.qty} กก.</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="font-medium">การแจ้งเตือน</h3>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-yellow-400" aria-hidden />
              <span>สต๊อก <b>ผักชี</b> ต่ำกว่า 50 กก.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
              <span>ออเดอร์ #A-102 ชำระเงินล่าช้า</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden />
              <span>เก็บเกี่ยว <b>คะน้า</b> เสร็จสิ้น</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DateSection() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const valid = useMemo(() => (start && end ? new Date(start) <= new Date(end) : true), [start, end]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Date</h2>
      <p className="text-sm text-gray-500 mb-6">เลือกช่วงวันที่เพื่อกรองข้อมูลผลผลิต/ออเดอร์</p>

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
                  <>
                    ช่วงวันที่ <b>{start}</b> ถึง <b>{end}</b>
                  </>
                ) : (
                  <span className="text-red-600">วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันสิ้นสุด</span>
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
        <p className="text-sm text-gray-500">(ใส่ผลลัพธ์จริงจาก API ได้ภายหลัง)</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="ผลผลิตรวม (กก.)" value="—" />
          <KpiCard label="ออเดอร์รวม" value="—" />
          <KpiCard label="รายได้รวม (฿)" value="—" />
        </div>
      </div>
    </div>
  );
}

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
                        (u.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600")
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

export default function FarmerPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">F</div>
            <div>
              <div className="text-sm text-gray-500">Farmer App</div>
              <h1 className="text-lg font-semibold leading-tight">FarmerPage</h1>
            </div>
          </div>

          {/* Tabs */}
          <nav
            role="tablist"
            aria-label="Main sections"
            className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-2xl"
          >
            <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab}>
              Dashboard
            </TabButton>
            <TabButton id="date" activeTab={activeTab} setActiveTab={setActiveTab}>
              Date
            </TabButton>
            <TabButton id="users" activeTab={activeTab} setActiveTab={setActiveTab}>
              Users
            </TabButton>
          </nav>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden sticky top-[57px] z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab}>
            Dashboard
          </TabButton>
          <TabButton id="date" activeTab={activeTab} setActiveTab={setActiveTab}>
            Date
          </TabButton>
          <TabButton id="users" activeTab={activeTab} setActiveTab={setActiveTab}>
            Users
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <section
          id="panel-dashboard"
          role="tabpanel"
          aria-labelledby="tab-dashboard"
          hidden={activeTab !== "dashboard"}
          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <DashboardSection />
        </section>
        <section
          id="panel-date"
          role="tabpanel"
          aria-labelledby="tab-date"
          hidden={activeTab !== "date"}
          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <DateSection />
        </section>
        <section
          id="panel-users"
          role="tabpanel"
          aria-labelledby="tab-users"
          hidden={activeTab !== "users"}
          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <UsersSection />
        </section>
      </main>
    </div>
  );
}