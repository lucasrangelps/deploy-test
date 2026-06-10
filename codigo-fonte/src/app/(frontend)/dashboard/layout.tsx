import { Sidebar } from '@/components/dashboard/Sidebar'
import './dashboard.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-root">
      <Sidebar />
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  )
}