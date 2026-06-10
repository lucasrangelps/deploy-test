'use client'

// src/app/area-aluno/layout.tsx

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Home, BookOpen, Music2, CreditCard,
  Star, Lightbulb, ChevronRight, LogOut, Heart, User, Layers,
} from 'lucide-react'

const navItems = [
  { href: '/area-aluno',             label: 'Início',        icon: Home       },
  { href: '/area-aluno/turmas',      label: 'Turmas',        icon: Music2     },
  { href: '/area-aluno/meu-plano',   label: 'Meu Plano',     icon: Layers     },
  { href: '/area-aluno/anamnese',    label: 'Anamnese',      icon: Heart      },
  { href: '/area-aluno/pagamentos',  label: 'Pagamentos',    icon: CreditCard },
  { href: '/area-aluno/perfil',      label: 'Meu Perfil',    icon: User       },
  { href: '/area-aluno/avaliacoes',  label: 'Avaliar Aulas', icon: Star       },
  { href: '/area-aluno/publicacoes', label: 'Publicações',   icon: BookOpen   },
  { href: '/area-aluno/sugestoes',   label: 'Sugestões',     icon: Lightbulb  },
]

export default function AreaAlunoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [nomeAluno, setNomeAluno]   = useState('Aluno')
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    // Verifica sessão ativa no Supabase — mesmo padrão do login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }

      // Pega nome do localStorage (salvo pelo login igual ao projeto faz)
      try {
        const raw = localStorage.getItem('usuario')
        if (raw) {
          const usuario = JSON.parse(raw)
          const nome = usuario.nome_completo ?? usuario.nome ?? 'Aluno'
          setNomeAluno(nome.split(' ')[0])
        }
      } catch {}

      setAutorizado(true)
    })

    // Escuta mudanças de sessão em tempo real (logout em outra aba, token expirado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const isActive = (href: string) =>
    href === '/area-aluno' ? pathname === href : pathname.startsWith(href)

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  // Não renderiza nada até confirmar sessão — evita flash de conteúdo
  if (!autorizado) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0EB' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, minHeight: '100vh', background: '#1C0A0E',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 18px', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(201,169,110,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill="#C9A96E"/>
              <circle cx="12" cy="9" r="2.5" fill="#1C0A0E"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 700, color: '#F5F0EB', lineHeight: 1.2 }}>Isabel Wencces</p>
            <p style={{ fontSize: 10, color: '#C9A96E', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Área do Aluno</p>
          </div>
        </div>

        {/* Aluno */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8B1A2F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#F5F0EB', flexShrink: 0 }}>
            {nomeAluno.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#F5F0EB' }}>{nomeAluno}</p>
            <p style={{ fontSize: 10, color: 'rgba(245,240,235,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Aluno</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px', overflowY: 'auto' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 7, fontSize: 13,
                color: active ? '#F5F0EB' : 'rgba(245,240,235,0.55)',
                textDecoration: 'none',
                background: active ? '#8B1A2F' : 'transparent',
                borderLeft: active ? '2px solid #C9A96E' : '2px solid transparent',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s ease',
              }}>
                <Icon size={16} />
                <span>{label}</span>
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 7, fontSize: 13,
            color: 'rgba(245,240,235,0.4)', background: 'none',
            border: 'none', cursor: 'pointer', width: '100%',
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,26,47,0.3)'; e.currentTarget.style.color = '#F5F0EB' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(245,240,235,0.4)' }}
          >
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        {children}
      </main>

    </div>
  )
}
