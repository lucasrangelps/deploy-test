// src/app/(frontend)/area-professor/layout.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Home, Calendar, Music, Users, Bell, LogOut, ChevronLeft } from 'lucide-react'
import { useIdProfessor } from '@/hooks/useIdProfessor'

interface AreaProfessorLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { id: 'prof-home',   label: 'Início',        Icon: Home,     href: '/area-professor' },
  { id: 'prof-agenda', label: 'Minha Agenda',  Icon: Calendar, href: '/area-professor/prof-agenda' },
  { id: 'prof-turmas', label: 'Minhas Turmas', Icon: Music,    href: '/area-professor/prof-turmas' },
  { id: 'prof-alunos', label: 'Meus Alunos',   Icon: Users,    href: '/area-professor/prof-alunos' },
]

const pageTitles: Record<string, string> = {
  'prof-home':   'Início',
  'prof-agenda': 'Minha Agenda',
  'prof-turmas': 'Minhas Turmas',
  'prof-alunos': 'Meus Alunos',
}

export default function AreaProfessorLayout({ children }: AreaProfessorLayoutProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const { nomeProfessor, especialidade, loading } = useIdProfessor()

  const nomeExibicao  = nomeProfessor?.trim() || 'Professor'
  const inicialNome   = nomeExibicao.charAt(0).toUpperCase()
  const activeSegment = navItems.find(item => pathname.includes(item.id))?.id ?? 'prof-home'
  const isHome        = activeSegment === 'prof-home'
  const pageTitle     = pageTitles[activeSegment] ?? 'Área do Professor'

  function handleLogout() {
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex">

      {/* ═══════ SIDEBAR ═══════ */}
      <aside className="w-[240px] min-h-screen bg-[#1C0A0E] border-r border-[rgba(201,169,110,0.15)] flex flex-col fixed top-0 left-0 bottom-0 z-50">

        {/* Brand */}
        <div className="px-5 py-6 border-b border-[rgba(255,255,255,0.06)]">
          <h1 className="font-['Playfair_Display'] text-[15px] font-semibold text-[#F5F0EB] leading-tight">
            Isabel Wencces
          </h1>
          <p className="text-[9px] font-medium tracking-[0.12em] text-[#C9A96E] uppercase mt-1">
            Área do Professor
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2">
          {navItems.map(({ id, label, Icon, href }) => (
            <Link
              key={id}
              href={href}
              className={`
                flex items-center gap-[11px] px-4 py-2.5 text-[13.5px] font-normal rounded-[7px]
                border-l-[2px] transition-colors duration-150 no-underline
                ${activeSegment === id
                  ? 'text-[#F5F0EB] bg-[#8B1A2F] border-l-[#C9A96E] font-medium'
                  : 'text-[rgba(245,240,235,0.55)] border-l-transparent hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(245,240,235,0.9)]'
                }
              `}
            >
              <span className="w-5 text-center"><Icon size={16} /></span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8B1A2F] text-[#F5F0EB] flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
              {inicialNome}
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#F5F0EB]">{nomeExibicao}</p>
              <p className="text-[10px] text-[rgba(245,240,235,0.4)] uppercase tracking-[0.08em]">{especialidade || 'Professor(a)'}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-[12px] text-[rgba(245,240,235,0.55)] hover:text-[#F5F0EB] transition-colors bg-transparent border-none cursor-pointer mb-4"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <main className="ml-[240px] flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-[60px] bg-[#F5F0EB] border-b border-[#E8E0D8] flex items-center px-7 gap-3.5 sticky top-0 z-10">
          {!isHome && (
            <button
              onClick={() => router.push('/area-professor')}
              className="flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#8B1A2F] transition-colors bg-transparent border-none cursor-pointer font-['DM_Sans']"
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
          )}
          <h1 className="font-['Playfair_Display'] text-[20px] font-semibold text-[#1A1A1A]">
            {pageTitle}
          </h1>
          <div className="ml-auto">
            <button className="w-9 h-9 bg-[rgba(201,169,110,0.2)] rounded-xl border-none cursor-pointer flex items-center justify-center text-[#8B1A2F] hover:bg-[rgba(201,169,110,0.32)] transition-colors">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

      </main>
    </div>
  )
}