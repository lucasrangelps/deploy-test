'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Music2,
  Users,
  GraduationCap,
  Clock,
  CreditCard,
  CalendarRange,
  LogOut,
  ChevronRight,
  ChartNoAxesCombined,
  MessageSquare,
  UserCircle,
  DollarSign,
  UserPlus,
  FileText,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/agenda', label: 'Agenda da Semana', icon: CalendarDays },
  { href: '/dashboard/ritmos', label: 'Ritmos', icon: Music2 },
  { href: '/dashboard/turmas', label: 'Turmas', icon: Users },
  { href: '/dashboard/professores', label: 'Professores', icon: GraduationCap },
  { href: '/dashboard/horarios', label: 'Horários', icon: Clock },
  { href: '/dashboard/planos', label: 'Planos & Valores', icon: CreditCard },
  { href: '/dashboard/agenda-admin', label: 'Agenda Geral', icon: CalendarRange },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: ChartNoAxesCombined },
  { href: '/dashboard/notificacoes', label: 'WhatsApp', icon: MessageSquare },
  { href: '/dashboard/alunos', label: 'Alunos', icon: UserCircle },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/leads', label: 'Leads', icon: UserPlus },
  { href: '/dashboard/contratos/template', label: 'Contratos', icon: FileText },
  { href: '/dashboard/admins', label: 'Admins', icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill="#C9A96E" />
            <circle cx="12" cy="9" r="2.5" fill="#1C0A0E" />
          </svg>
        </div>
        <div>
          <p className="sidebar-logo-title">Isabel Wencces</p>
          <p className="sidebar-logo-sub">Painel Admin</p>
        </div>
      </div>

      <div className="sidebar-admin">
        <div className="sidebar-admin-avatar">A</div>
        <div>
          <p className="sidebar-admin-name">Administrador</p>
          <p className="sidebar-admin-role">Admin</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-nav-item ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
            {isActive(href) && (
              <ChevronRight size={14} className="sidebar-nav-arrow" />
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout">
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}