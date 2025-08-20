//src\app\admin\menu\components\Role.jsx
// ใช้ใน Client Components (เพราะมี React icon components อยู่)
import {
  Sprout, PackageSearch, Landmark, MapPin, GraduationCap,Tractor, Bird,
  Users as UsersIcon, BarChart3, Settings as SettingsIcon,
} from 'lucide-react'

// เมนูทั้งหมด
export const MENU_LIST = [
  { key: 'farmer',      label: 'รายชื่อเกษตรกร',      icon: Sprout,        path: '/admin/farmer',      color: 'text-green-600',   bg: 'bg-green-100' },
  { key: 'gap',      label: 'เกษตรกรขอ GAP',      icon: Tractor,        path: '/admin/gap',      color: 'text-red-600',   bg: 'bg-red-100' },
  { key: 'product',     label: 'เกษตรกรแจ้งผลผลิต',     icon: PackageSearch,     path: '/admin/product',     color: 'text-blue-600',    bg: 'bg-blue-100' },
  { key: 'baac',  label: 'เกษตรกรที่รับเงินสนับสนุน ธกส.',  icon: Landmark,      path: '/admin/government',  color: 'text-yellow-700',  bg: 'bg-yellow-100' },
  { key: 'local',       label: 'การบริหารสวนเกษตรกร',       icon: MapPin,        path: '/admin/local',       color: 'text-purple-600',  bg: 'bg-purple-100' },

  // admin-only
  { key: 'users',    label: 'Users',    icon: UsersIcon,     path: '/admin/users',    color: 'text-slate-700',  bg: 'bg-slate-100' },
  { key: 'broadcast',    label: 'Broadcast',    icon: Bird,     path: '/admin/broadcast',    color: 'text-slate-700',  bg: 'bg-slate-100' },
  { key: 'reports',  label: 'Reports',  icon: BarChart3,     path: '/admin/reports',  color: 'text-emerald-700',bg: 'bg-emerald-100' },
  { key: 'settings', label: 'Settings', icon: SettingsIcon,  path: '/admin/settings', color: 'text-rose-700',   bg: 'bg-rose-100' },
]

// การมองเห็นเมนูของแต่ละ role
export const ROLE_MENUS = {
  admin: ['farmer','gap','product','baac','broadcast','users','reports','settings'],
  educational: ['farmer'],
  local: ['farmer'],
  government: ['farmer'],
  private: ['farmer'],
  farmer: ['farmer'],
}

export const getMenuByRole = (role) => {
  const allowed = ROLE_MENUS[String(role || '').toLowerCase()] || []
  return MENU_LIST.filter(m => allowed.includes(m.key))
}
