'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────
interface Aula {
  id_aula: string
  id_professor: string
  id_turma: string
  tipo_aula: string
  data_hora_inicio: string
  data_hora_fim: string
  status: 'disponivel' | 'lotada' | 'cancelada' | 'encerrada'
  nivel?: 'Iniciante' | 'Intermediário' | 'Avançado'
  professor_nome?: string
  vagas_disponiveis?: number
  vagas_total?: number
}

// ── Nav links ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { id: 'inicio',        label: 'Início',         href: '/#inicio' },
  { id: 'como-funciona', label: 'Como Funciona',  href: '/#como-funciona' },
  { id: 'quiz',          label: 'Quiz',            href: '/#quiz' },
  { id: 'grade-aulas',   label: 'Grade de Aulas', href: '/grade-aulas' },
]

// ── Constants ─────────────────────────────────────────────────────────────
const RITMO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Dança de Salão': { bg: '#fce8ec', text: '#6B1326', border: '#6B1326' },
  'Forró':          { bg: '#fff5e6', text: '#a05c00', border: '#c9a96e' },
  'Sertanejo':      { bg: '#eef5e6', text: '#3a5c10', border: '#5a8a1a' },
  'Bolero':         { bg: '#e8eef5', text: '#1a3a5c', border: '#2a5a9a' },
  'Valsa':          { bg: '#f0e8f5', text: '#4a1a6e', border: '#7a3aaa' },
  'Samba':          { bg: '#fff0e6', text: '#8a3a00', border: '#d05a10' },
  'Tango':          { bg: '#f5e8e8', text: '#5c1a1a', border: '#9a2a2a' },
  'Salsa':          { bg: '#ffe4e6', text: '#9f1239', border: '#be123c' },
  'Zouk':           { bg: '#e8f0ff', text: '#1a3a8c', border: '#3a5adc' },
  'Bachata':        { bg: '#fef0e8', text: '#7a2a00', border: '#c04010' },
  'Kizomba':        { bg: '#f0e8ff', text: '#4a1a8c', border: '#7a3adc' },
}

const NIVEL_CONFIG: Record<string, { icon: string; color: string }> = {
  'Iniciante':    { icon: '⭐', color: '#c9a96e' },
  'Intermediário':{ icon: '⭐⭐', color: '#b07830' },
  'Avançado':     { icon: '⭐⭐⭐', color: '#8a5010' },
}

const DIAS_SEMANA_LABEL: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
  4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
}

const DIAS_FILTER = ['Todos','Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']
const TURNO_FILTER = ['Todos','Manhã','Tarde','Noite']
const NIVEL_FILTER = ['Todos','Iniciante','Intermediário','Avançado']

// ── Helpers ───────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function getDiaSemana(iso: string) {
  return DIAS_SEMANA_LABEL[new Date(iso).getDay()]
}

function getTurno(iso: string): string {
  const h = new Date(iso).getHours()
  if (h < 12) return 'Manhã'
  if (h < 18) return 'Tarde'
  return 'Noite'
}

function getNomeAula(aula: Aula): string {
  // Deriva um nome apresentável baseado no tipo + nível
  const nivel = aula.nivel ? ` ${aula.nivel}` : ''
  return `${aula.tipo_aula}${nivel !== ' ' ? nivel : ''}`
}

// ── Modal de acesso ───────────────────────────────────────────────────────
function ModalAcesso({ aula, onClose }: { aula: Aula; onClose: () => void }) {
  const ritmo = RITMO_COLORS[aula.tipo_aula] ?? { bg: '#f3f4f6', text: '#374151', border: '#6b7280' }

  // Fecha com Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 24,
          padding: '36px 32px', maxWidth: 420, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          position: 'relative',
          animation: 'modalIn 0.25s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#f5f5f5', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer',
            fontSize: 16, color: '#555', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e8e0d4')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f5f5f5')}
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Ícone cadeado */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #fff5e6, #fce8ec)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 20,
          border: '2px solid #f0e0d0',
        }}>
          🔒
        </div>

        {/* Tag ritmo */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: ritmo.bg, color: ritmo.text,
          fontSize: 10, fontWeight: 800, letterSpacing: 2,
          textTransform: 'uppercase', borderRadius: 99,
          padding: '4px 12px', marginBottom: 12,
          border: `1px solid ${ritmo.border}22`,
        }}>
          {aula.tipo_aula}
        </span>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26, fontWeight: 900, color: '#1a1a1a',
          marginBottom: 10, lineHeight: 1.2,
        }}>
          Acesso necessário
        </h2>
        <p style={{ color: '#777', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          Para se matricular, faça login ou crie sua conta. É rápido e gratuito!
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href="/login"
            style={{
              flex: 1, textAlign: 'center',
              background: '#6B1326', color: 'white',
              fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase', borderRadius: 99,
              padding: '14px 20px', textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#8a1a30')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6B1326')}
          >
            Fazer Login
          </a>
          <a
            href="/cadastro/aluno"
            style={{
              flex: 1, textAlign: 'center',
              background: 'white', color: '#6B1326',
              fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase', borderRadius: 99,
              padding: '14px 20px', textDecoration: 'none',
              border: '1.5px solid rgba(107,19,38,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fce8ec'
              e.currentTarget.style.borderColor = '#6B1326'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'rgba(107,19,38,0.3)'
            }}
          >
            Criar Conta
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Aula Card ─────────────────────────────────────────────────────────────
function AulaCard({ aula, onMatricular }: { aula: Aula; onMatricular: (a: Aula) => void }) {
  const ritmo = RITMO_COLORS[aula.tipo_aula] ?? { bg: '#f3f4f6', text: '#374151', border: '#6b7280' }
  const nivel = aula.nivel ? NIVEL_CONFIG[aula.nivel] : null
  const isLotada = aula.status === 'lotada'
  const isCancelada = aula.status === 'cancelada'
  const isEncerrada = aula.status === 'encerrada'
  const disabled = isLotada || isCancelada || isEncerrada

  const turno = getTurno(aula.data_hora_inicio)
  const dia = getDiaSemana(aula.data_hora_inicio)

  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: `1.5px solid ${ritmo.border}33`,
      borderTop: `3px solid ${ritmo.border}`,
      padding: '20px 20px 16px',
      boxShadow: '0 2px 16px rgba(107,19,38,0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      display: 'flex', flexDirection: 'column', gap: 0,
      opacity: isCancelada || isEncerrada ? 0.55 : 1,
    }}
    onMouseEnter={e => {
      if (!disabled) {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 32px rgba(107,19,38,0.13)'
      }
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = ''
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(107,19,38,0.06)'
    }}
    >
      {/* Header: ritmo + vagas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: ritmo.bg, color: ritmo.text,
          fontSize: 10, fontWeight: 800, letterSpacing: 2,
          textTransform: 'uppercase', borderRadius: 99, padding: '4px 10px',
        }}>
          {aula.tipo_aula}
        </span>
        {isLotada ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', background: '#fef3c7', borderRadius: 99, padding: '3px 10px' }}>
            Lotada
          </span>
        ) : isCancelada ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', background: '#fee2e2', borderRadius: 99, padding: '3px 10px' }}>
            Cancelada
          </span>
        ) : isEncerrada ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', background: '#f3f4f6', borderRadius: 99, padding: '3px 10px' }}>
            Encerrada
          </span>
        ) : aula.vagas_disponiveis !== undefined ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', background: '#dcfce7', borderRadius: 99, padding: '3px 10px' }}>
            {aula.vagas_disponiveis} vagas
          </span>
        ) : null}
      </div>

      {/* Nome da aula */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 20, fontWeight: 800, color: '#1a1a1a',
        marginBottom: 14, lineHeight: 1.25,
      }}>
        {getNomeAula(aula)}
      </h3>

      {/* Infos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
          <span style={{ fontSize: 15 }}>📅</span>
          <span>{dia} · {turno}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
          <span style={{ fontSize: 15 }}>🕐</span>
          <span>{formatTime(aula.data_hora_inicio)} – {formatTime(aula.data_hora_fim)}</span>
        </div>
        {aula.professor_nome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
            <span style={{ fontSize: 15 }}>👤</span>
            <span>Prof. {aula.professor_nome}</span>
          </div>
        )}
        {nivel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: nivel.color }}>
            <span style={{ fontSize: 13 }}>{nivel.icon}</span>
            <span style={{ fontWeight: 600 }}>{aula.nivel}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      {isLotada ? (
        <button disabled style={{
          width: '100%', padding: '12px', borderRadius: 99,
          background: '#e8e0d4', color: '#aaa', border: 'none',
          fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', cursor: 'not-allowed',
        }}>
          Turma Lotada
        </button>
      ) : disabled ? null : (
        <button
          onClick={() => onMatricular(aula)}
          style={{
            width: '100%', padding: '13px', borderRadius: 99,
            background: '#6B1326', color: 'white', border: 'none',
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', cursor: 'pointer',
            transition: 'background 0.2s ease',
            marginTop: 'auto',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#8a1a30')}
          onMouseLeave={e => (e.currentTarget.style.background = '#6B1326')}
        >
          Quero me matricular
        </button>
      )}
    </div>
  )
}

// ── Filter Chip ───────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`fchip ${active ? 'fchip-active' : ''}`}
    >
      {label}
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function GradeAulasPage() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [aulas, setAulas]           = useState<Aula[]>([])
  const [loading, setLoading]       = useState(true)
  const [modalAula, setModalAula]   = useState<Aula | null>(null)

  // Filtros
  const [filterRitmo, setFilterRitmo]   = useState('Todos')
  const [filterDia, setFilterDia]       = useState('Todos')
  const [filterTurno, setFilterTurno]   = useState('Todos')
  const [filterNivel, setFilterNivel]   = useState('Todos')

  // ── Fetch ──
  useEffect(() => {
    async function fetchAulas() {
      const { data, error } = await supabase
        .from('aulas_agenda')
        .select('id_aula, id_professor, id_turma, tipo_aula, data_hora_inicio, data_hora_fim, status, nivel')
        .order('data_hora_inicio', { ascending: true })

      if (error) {
        console.error('Erro ao buscar aulas:', error)
      } else {
        const formatted: Aula[] = (data || []).map((a: any) => ({
          ...a,
          status:
            a.status === 'Disponível' ? 'disponivel'
            : a.status === 'Lotada'    ? 'lotada'
            : a.status === 'Cancelada' ? 'cancelada'
            : a.status === 'Encerrada' ? 'encerrada'
            : 'disponivel',
          nivel: ['Iniciante', 'Intermediário', 'Avançado'].includes(a.nivel) ? a.nivel : undefined,
        }))
        setAulas(formatted)
      }
      setLoading(false)
    }
    fetchAulas()
  }, [])

  // ── Scroll ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = useCallback(() => setMenuOpen(false), [])

  // ── Ritmos disponíveis ──
  const ritmos = useMemo(() => {
    const set = new Set(aulas.map(a => a.tipo_aula))
    return ['Todos', ...Array.from(set)]
  }, [aulas])

  // ── Filtros aplicados ──
  const filteredAulas = useMemo(() => {
    return aulas.filter(a => {
      if (filterRitmo !== 'Todos' && a.tipo_aula !== filterRitmo) return false
      if (filterDia !== 'Todos' && getDiaSemana(a.data_hora_inicio) !== filterDia) return false
      if (filterTurno !== 'Todos' && getTurno(a.data_hora_inicio) !== filterTurno) return false
      if (filterNivel !== 'Todos' && a.nivel !== filterNivel) return false
      return true
    })
  }, [aulas, filterRitmo, filterDia, filterTurno, filterNivel])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f4ef' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#6B1326', marginBottom: 12 }}>Isabel Wencces</div>
          <div style={{ color: '#aaa', fontSize: 14 }}>Carregando grade de aulas...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #f8f4ef; }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Nav ── */
        .nav-link {
          font-size: 12px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: #555; text-decoration: none;
          transition: color 0.3s ease; position: relative; padding-bottom: 2px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 1.5px; background: #6B1326;
          transform: scaleX(0); transition: transform 0.3s ease; transform-origin: left;
        }
        .nav-link:hover { color: #6B1326; }
        .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }
        .nav-link.active { color: #6B1326; }

        .desktop-nav { display: none; }
        @media (min-width: 768px) { .desktop-nav { display: flex; } }
        .mobile-menu-btn { display: flex; }
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }

        /* ── Filter chips ── */
        .fchip {
          cursor: pointer; border: 1px solid #e8e0d4;
          background: white; color: #666;
          font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: 0.5px; padding: 7px 18px; border-radius: 99px;
          transition: all 0.18s ease; white-space: nowrap;
        }
        .fchip:hover { border-color: #6B1326; color: #6B1326; }
        .fchip-active {
          background: #6B1326 !important; color: white !important;
          border-color: #6B1326 !important;
          box-shadow: 0 3px 10px rgba(107,19,38,0.22);
        }

        /* ── Card grid ── */
        .aulas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .footer-link { color: #999; font-size: 13px; text-decoration: none; transition: color 0.3s ease; }
        .footer-link:hover { color: #6B1326; }

        /* ── Scrollbar ───────────────────────────── */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f8f4ef;
        }

        ::-webkit-scrollbar-thumb {
          background: #530F1D;
          border-radius: 999px;
          border: 2px solid #f8f4ef;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6B1326;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #530F1D #f8f4ef;
        }

      `}</style>

      {/* Modal */}
      {modalAula && (
        <ModalAcesso aula={modalAula} onClose={() => setModalAula(null)} />
      )}

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ══════════════════════════════════════════════════════════════
            HEADER — idêntico ao da landing page
        ══════════════════════════════════════════════════════════════ */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(248,244,239,0.97)' : '#f8f4ef',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid #e8e0d4' : '1px solid transparent',
          transition: 'all 0.5s ease',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <a href="/#inicio" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 20, letterSpacing: 2, color: '#6B1326', textDecoration: 'none', textTransform: 'uppercase' }}>
              Isabel Wencces
            </a>

            <nav className="desktop-nav" style={{ alignItems: 'center', gap: 32 }}>
              {NAV_LINKS.map(link => (
                <a key={link.id} href={link.href} className={`nav-link ${link.id === 'grade-aulas' ? 'active' : ''}`}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="desktop-nav" style={{ alignItems: 'center', gap: 12 }}>
              <a href="/login" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#6B1326', border: '1.5px solid rgba(107,19,38,0.25)', borderRadius: 50, padding: '10px 20px', textDecoration: 'none' }}>
                Área do Aluno
              </a>
              <a href="/cadastro/aluno"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: '#6B1326', color: 'white', borderRadius: 50, padding: '12px 24px', textDecoration: 'none', boxShadow: '0 6px 20px rgba(107,19,38,0.25)', display: 'inline-flex', transition: 'background 0.3s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#8a1a30')}
                onMouseLeave={e => (e.currentTarget.style.background = '#6B1326')}
              >
                Aula Experimental
              </a>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn"
              style={{ background: 'none', border: 'none', color: '#6B1326', cursor: 'pointer', fontSize: 24 }}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

          {menuOpen && (
            <nav style={{ padding: '16px 24px', borderTop: '1px solid #f0ece6', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 16 }} aria-label="Menu mobile">
              {NAV_LINKS.map(link => (
                <a key={link.id} href={link.href} onClick={handleNavClick} className={`nav-link ${link.id === 'grade-aulas' ? 'active' : ''}`}>
                  {link.label}
                </a>
              ))}
              <div style={{ borderTop: '1px solid #f0ece6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/login" style={{ fontSize: 11, fontWeight: 600, color: '#6B1326', textTransform: 'uppercase', letterSpacing: 2, textDecoration: 'none' }}>Área do Aluno / Professor</a>
                <a href="/cadastro/aluno" style={{ textAlign: 'center', background: '#6B1326', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 99, padding: '12px 20px', textDecoration: 'none' }}>Aula Experimental</a>
              </div>
            </nav>
          )}
        </header>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(160deg, #6B1326 0%, #4a0d1a 100%)',
          padding: '52px 24px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decoração */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, padding: '6px 16px', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
                Encontre sua dança
              </span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, color: 'white', marginBottom: 14, lineHeight: 1.1 }}>
              Grade de Aulas
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Escolha o ritmo que faz seu coração bater mais forte
            </p>
          </div>
        </div>

        {/* ── Filtros sticky ─────────────────────────────────────────────── */}
        <div style={{
          background: 'white', borderBottom: '1px solid #e8e0d4',
          padding: '16px 24px', position: 'sticky', top: 65, zIndex: 50,
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>

            {/* Ritmo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: '#aaa' }}>Ritmo</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ritmos.map(r => (
                  <FilterChip key={r} label={r} active={filterRitmo === r} onClick={() => setFilterRitmo(r)} />
                ))}
              </div>
            </div>

            <div style={{ width: 1, background: '#e8e0d4', alignSelf: 'stretch', margin: '0 4px' }} />

            {/* Dia da semana */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: '#aaa' }}>Dia da semana</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DIAS_FILTER.map(d => (
                  <FilterChip key={d} label={d} active={filterDia === d} onClick={() => setFilterDia(d)} />
                ))}
              </div>
            </div>

            <div style={{ width: 1, background: '#e8e0d4', alignSelf: 'stretch', margin: '0 4px' }} />

            {/* Turno */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: '#aaa' }}>Turno</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TURNO_FILTER.map(t => (
                  <FilterChip key={t} label={t} active={filterTurno === t} onClick={() => setFilterTurno(t)} />
                ))}
              </div>
            </div>

            

            
          </div>
        </div>

        {/* ── Conteúdo principal ────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* Contador */}
          <p style={{ fontSize: 13, color: '#999', fontWeight: 500, marginBottom: 24 }}>
            <strong style={{ color: '#6B1326' }}>{filteredAulas.length}</strong>{' '}
            {filteredAulas.length === 1 ? 'aula encontrada' : 'aulas encontradas'}
          </p>

          {filteredAulas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎵</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#6B1326', marginBottom: 8 }}>Nenhuma aula encontrada</p>
              <p style={{ color: '#aaa', fontSize: 14 }}>Tente ajustar os filtros para ver mais opções.</p>
              <button
                onClick={() => { setFilterRitmo('Todos'); setFilterDia('Todos'); setFilterTurno('Todos'); setFilterNivel('Todos') }}
                style={{ marginTop: 20, background: '#6B1326', color: 'white', border: 'none', borderRadius: 99, padding: '12px 24px', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="aulas-grid">
              {filteredAulas.map(a => (
                <AulaCard key={a.id_aula} aula={a} onMatricular={setModalAula} />
              ))}
            </div>
          )}
        </main>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div style={{ background: 'white', borderTop: '1px solid #e8e0d4', padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: '#6B1326', marginBottom: 8 }}>
            Pronto para começar?
          </p>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
            Agende sua primeira aula gratuitamente e descubra qual ritmo combina com você.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cadastro/aluno" style={{ background: '#6B1326', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 99, padding: '14px 28px', textDecoration: 'none', boxShadow: '0 6px 20px rgba(107,19,38,0.25)' }}>
              Agendar Aula Experimental
            </a>
            <a href="/#quiz" style={{ color: '#6B1326', border: '1.5px solid rgba(107,19,38,0.25)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 99, padding: '14px 28px', textDecoration: 'none' }}>
              Fazer Quiz de Indicação
            </a>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer style={{ background: '#f8f4ef', padding: '40px 24px', borderTop: '1px solid #e8e0d4' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", color: '#6B1326', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Isabel Wencces</p>
              <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7 }}>
                Dança de Salão — Pinhais/PR<br />
                © {new Date().getFullYear()} Isabel Wencces Studio.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <a href="/#inicio"        className="footer-link">Início</a>
              <a href="/#como-funciona" className="footer-link">Como Funciona</a>
              <a href="/#quiz"          className="footer-link">Quiz</a>
              <a href="#"               className="footer-link">WhatsApp</a>
              <a href="#"               className="footer-link">Termos</a>
              <a href="#"               className="footer-link">Privacidade</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}