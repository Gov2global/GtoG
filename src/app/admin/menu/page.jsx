import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth' // ถ้าไม่ได้ตั้ง alias ใช้: '../../lib/auth'
import MenuClient from './components/Menu'      // client component ด้านล่าง

export default async function MenuPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')              // ยังไม่ล็อกอิน → กลับหน้า login (/admin)
  return <MenuClient role={user.role} name={user.name} />
}
