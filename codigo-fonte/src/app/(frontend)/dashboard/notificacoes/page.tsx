'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard, CalendarDays, Music2, Users, GraduationCap,
  Clock, CreditCard, CalendarRange, BarChart2, LogOut, ChevronRight,
  MessageSquare, Send, Plus, Eye, RefreshCw, Copy,
  Filter, Search, CheckCircle, Clock3, AlertCircle, X, BookOpen,
} from 'lucide-react'

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Nav ──────────────────────────────────────────────────────────────────────
const navItems = [
  { href: '/dashboard',              label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/dashboard/agenda',       label: 'Agenda da Semana', icon: CalendarDays    },
  { href: '/dashboard/ritmos',       label: 'Ritmos',           icon: Music2          },
  { href: '/dashboard/turmas',       label: 'Turmas',           icon: Users           },
  { href: '/dashboard/professores',  label: 'Professores',      icon: GraduationCap   },
  { href: '/dashboard/horarios',     label: 'Horários',         icon: Clock           },
  { href: '/dashboard/planos',       label: 'Planos & Valores', icon: CreditCard      },
  { href: '/dashboard/agenda-admin', label: 'Agenda Geral',     icon: CalendarRange   },
  { href: '/dashboard/relatorios',   label: 'Relatórios',       icon: BarChart2       },
  { href: '/dashboard/notificacoes', label: 'WhatsApp',         icon: MessageSquare   },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
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
            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill="#C9A96E"/>
            <circle cx="12" cy="9" r="2.5" fill="#1C0A0E"/>
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
          <Link key={href} href={href} className={`sidebar-nav-item ${isActive(href) ? 'active' : ''}`}>
            <Icon size={16} /><span>{label}</span>
            {isActive(href) && <ChevronRight size={14} className="sidebar-nav-arrow" />}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout"><LogOut size={15} /><span>Sair</span></button>
      </div>
    </aside>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Notificacao {
  id_notificacao: string
  id_usuario: string
  tipo_gatilho: string
  mensagem: string
  data_envio: string
  status_envio: string
  destinatario?: string
}

interface KpiData {
  total: number
  hoje: number
  enviadas: number
}

interface AulaHoje {
  id_turma: string
  nome_turma: string
  hora_inicio: string
  hora_fim: string
  nome_professor: string
  status: string
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    enviado:         { label: 'Enviado',  color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  Icon: CheckCircle  },
    aberto_whatsapp: { label: 'Aberto',   color: '#b7791f', bg: 'rgba(183,121,31,0.1)', Icon: Clock3       },
    pendente:        { label: 'Pendente', color: '#6B5B95', bg: 'rgba(107,91,149,0.1)', Icon: Clock3       },
    erro:            { label: 'Erro',     color: '#c0392b', bg: 'rgba(192,57,43,0.1)',  Icon: AlertCircle  },
  }
  const s = map[status] ?? map['pendente']
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, fontSize:12, fontWeight:600 }}>
      <s.Icon size={11} />{s.label}
    </span>
  )
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ notif, onClose, onReenviar, onDuplicar }: {
  notif: Notificacao; onClose: () => void
  onReenviar: (n: Notificacao) => void; onDuplicar: (n: Notificacao) => void
}) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid #f0ebe4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:'#1a0a0a', margin:0 }}>Detalhes da Notificação</p>
            <p style={{ fontSize:12, color:'#888', margin:0 }}>
              {notif.destinatario ?? 'Destinatário desconhecido'} · {notif.tipo_gatilho === 'turma' ? 'Turma' : 'Individual'}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', padding:4 }}><X size={20} /></button>
        </div>
        <div style={{ padding:'20px 22px', background:'#ece5dd', backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c9b99a\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
          <div style={{ background:'#e2ffc7', borderRadius:'12px 12px 2px 12px', padding:'10px 14px', maxWidth:'85%', marginLeft:'auto', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize:13, color:'#1a1a1a', margin:0, whiteSpace:'pre-wrap', lineHeight:1.55 }}>{notif.mensagem}</p>
            <p style={{ fontSize:10, color:'#6b7280', margin:'6px 0 0', textAlign:'right' }}>
              {new Date(notif.data_envio).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })} ✓✓
            </p>
          </div>
        </div>
        <div style={{ padding:'14px 22px', background:'#faf8f5', display:'flex', gap:10 }}>
          <button onClick={() => onReenviar(notif)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 0', borderRadius:8, background:'#25d366', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <RefreshCw size={14} />Reenviar
          </button>
          <button onClick={() => onDuplicar(notif)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 0', borderRadius:8, border:'1.5px solid #8B1A2F', background:'transparent', color:'#8B1A2F', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Copy size={14} />Duplicar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Turmas Hoje ────────────────────────────────────────────────────────
function ModalTurmasHoje({ aulas, onClose }: { aulas: AulaHoje[]; onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:560, maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid #f0ebe4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:'#1a0a0a', margin:0 }}>Aulas de Hoje</p>
            <p style={{ fontSize:12, color:'#888', margin:0 }}>
              {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })} · {aulas.length} turma{aulas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', padding:4 }}><X size={20} /></button>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {aulas.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'#aaa', fontSize:14 }}>
              <CalendarDays size={32} style={{ marginBottom:10, opacity:0.3 }} />
              <p style={{ margin:0 }}>Nenhuma aula agendada para hoje</p>
            </div>
          ) : aulas.map((a, i) => (
            <div key={i} style={{ padding:'14px 22px', borderBottom:'1px solid #f9f5f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#1a0a0a', margin:'0 0 3px' }}>{a.nome_turma}</p>
                <p style={{ fontSize:12, color:'#888', margin:0 }}>
                  👨‍🏫 {a.nome_professor} · 🕐 {a.hora_inicio}{a.hora_fim ? ` – ${a.hora_fim}` : ''}
                </p>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ padding:'3px 10px', borderRadius:20, background: a.status === 'agendado' ? 'rgba(22,163,74,0.1)' : 'rgba(183,121,31,0.1)', color: a.status === 'agendado' ? '#16a34a' : '#b7791f', fontSize:11, fontWeight:600 }}>
                  {a.status}
                </span>
                <Link
                  href={`/dashboard/notificacoes/nova?turmaId=${a.id_turma}&tipo=turma`}
                  style={{ padding:'6px 12px', borderRadius:8, background:'#8B1A2F', color:'#fff', fontSize:12, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}
                >
                  <MessageSquare size={12} />Notificar
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 22px', borderTop:'1px solid #f0ebe4', background:'#faf8f5' }}>
          <Link
            href="/dashboard/notificacoes/nova?tipo=turma"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 0', borderRadius:8, background:'#8B1A2F', color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600 }}
          >
            <Plus size={14} />Nova Mensagem para Turma
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotificacoesPage() {
  const [notifs, setNotifs]               = useState<Notificacao[]>([])
  const [loading, setLoading]             = useState(true)
  const [kpi, setKpi]                     = useState<KpiData>({ total:0, hoje:0, enviadas:0 })
  const [aulasHoje, setAulasHoje]         = useState<AulaHoje[]>([])
  const [loadingAulas, setLoadingAulas]   = useState(true)
  const [modalAulas, setModalAulas]       = useState(false)
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [preview, setPreview]             = useState<Notificacao | null>(null)
  const [toast, setToast]                 = useState('')

  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
  validarAdmin()
}, [])

async function validarAdmin() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // usuário não logado
    if (!user) {
      router.push('/login')
      return
    }

    console.log('AUTH USER ID:', user.id)

    // busca usuário pelo auth_user_id
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('tipo_perfil')
      .eq('auth_user_id', user.id)
      .single()

    // bloqueia acesso se não for admin
    if (!usuario || usuario.tipo_perfil !== 'ADMIN') {
      router.push('/acesso-negado')
      return
    }

    // carrega dados
    await loadNotificacoes()
    await loadAulasHoje()

  } catch (error) {
    console.error('Erro ao validar admin:', error)
    router.push('/login')
  } finally {
    setAuthLoading(false)
  }
}

  // ── Busca aulas de hoje via aulas_agenda ──────────────────────────────────
  async function loadAulasHoje() {
    setLoadingAulas(true)
    const hoje      = new Date()
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0).toISOString()
    const fimDia    = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString()

    const { data } = await supabase
      .from('aulas_agenda')
      .select(`
        id_aula,
        id_turma,
        data_hora_inicio,
        data_hora_fim,
        status,
        turmas ( nome ),
        professores ( usuarios ( nome_completo ) )
      `)
      .gte('data_hora_inicio', inicioDia)
      .lte('data_hora_inicio', fimDia)
      .order('data_hora_inicio')

    const mapped: AulaHoje[] = (data ?? []).map((a: any) => ({
      id_turma:        a.id_turma ?? '',
      nome_turma:      a.turmas?.nome ?? '—',
      hora_inicio:     a.data_hora_inicio
        ? new Date(a.data_hora_inicio).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
        : '—',
      hora_fim:        a.data_hora_fim
        ? new Date(a.data_hora_fim).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
        : '',
      nome_professor:  a.professores?.usuarios?.nome_completo ?? 'Professor',
      status:          a.status ?? 'agendado',
    }))

    setAulasHoje(mapped)
    setLoadingAulas(false)
  }

  async function loadNotificacoes() {
    setLoading(true)
    const { data: raw } = await supabase
      .from('notificacoes_whatsapp')
      .select('*, usuarios(nome_completo)')
      .order('data_envio', { ascending: false })
      .limit(200)

    const mapped: Notificacao[] = (raw ?? []).map((r: any) => ({
      id_notificacao: r.id_notificacao,
      id_usuario:     r.id_usuario,
      tipo_gatilho:   r.tipo_gatilho,
      mensagem:       r.mensagem,
      data_envio:     r.data_envio,
      status_envio:   r.status_envio,
      destinatario:   r.usuarios?.nome_completo ?? '—',
    }))
    setNotifs(mapped)

    const hoje  = new Date().toISOString().split('T')[0]
    const total = mapped.length
    const hj    = mapped.filter(n => n.data_envio?.startsWith(hoje)).length
    const env   = mapped.filter(n => ['enviado','aberto_whatsapp'].includes(n.status_envio)).length
    setKpi({ total, hoje: hj, enviadas: env })
    setLoading(false)
  }

  const filtered = notifs.filter(n => {
    const ms = !search       || n.destinatario?.toLowerCase().includes(search.toLowerCase()) || n.mensagem.toLowerCase().includes(search.toLowerCase())
    const st = !filterStatus || n.status_envio === filterStatus
    const pr = !filterPeriodo|| n.data_envio?.startsWith(filterPeriodo)
    return ms && st && pr
  })

  async function handleReenviar(n: Notificacao) {
    const { data: aluno } = await supabase.from('alunos').select('telefone').eq('id_usuario', n.id_usuario).maybeSingle()
    if (!aluno?.telefone) { showToast('Telefone não encontrado.'); return }
    const num = aluno.telefone.replace(/\D/g, '')
    window.open(`https://wa.me/55${num}?text=${encodeURIComponent(n.mensagem)}`, '_blank')
    await supabase.from('notificacoes_whatsapp').insert({ id_usuario:n.id_usuario, tipo_gatilho:n.tipo_gatilho, mensagem:n.mensagem, data_envio:new Date().toISOString(), status_envio:'aberto_whatsapp' })
    showToast('WhatsApp aberto!')
    setPreview(null)
    loadNotificacoes()
  }

  function handleDuplicar(n: Notificacao) {
    const p = new URLSearchParams({ mensagem: n.mensagem, tipo: n.tipo_gatilho })
    window.location.href = `/dashboard/notificacoes/nova?${p.toString()}`
  }

  const inp: React.CSSProperties = { padding:'8px 12px', borderRadius:8, border:'1px solid #e0d9d0', background:'#faf8f5', fontSize:13, color:'#1a0a0a', outline:'none' }

  // KPI cards config — 4 cards
  const kpiCards = [
    { label:'Total de Mensagens', value: loading ? '...' : kpi.total.toString(),    Icon: MessageSquare, bg:'rgba(37,211,102,0.08)',  color:'#25d366',  onClick: undefined },
    { label:'Enviadas Hoje',      value: loading ? '...' : kpi.hoje.toString(),     Icon: Send,          bg:'rgba(139,26,47,0.08)',   color:'#8B1A2F',  onClick: undefined },
    { label:'Total Enviadas',     value: loading ? '...' : kpi.enviadas.toString(), Icon: CheckCircle,   bg:'rgba(22,163,74,0.08)',   color:'#16a34a',  onClick: undefined },
    {
      label: 'Aulas Hoje',
      value: loadingAulas ? '...' : aulasHoje.length.toString(),
      Icon: BookOpen,
      bg: aulasHoje.length > 0 ? 'rgba(29,78,216,0.09)' : 'rgba(160,160,160,0.08)',
      color: aulasHoje.length > 0 ? '#1d4ed8' : '#aaa',
      sublabel: aulasHoje.length > 0 ? 'Ver turmas →' : 'Nenhuma aula',
      onClick: aulasHoje.length > 0 ? () => setModalAulas(true) : undefined,
      highlight: aulasHoje.length > 0,
    },
  ]

  if (authLoading) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f1eb',
      }}
    >
      <p>Carregando...</p>
    </div>
  )
}

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f5f1eb' }}>
      <Sidebar />

      {toast && (
        <div style={{ position:'fixed', bottom:28, right:28, background:'#1a0a0a', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:600, zIndex:2000, boxShadow:'0 4px 20px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', gap:8 }}>
          <CheckCircle size={15} color="#25d366" />{toast}
        </div>
      )}
      {preview && <PreviewModal notif={preview} onClose={() => setPreview(null)} onReenviar={handleReenviar} onDuplicar={handleDuplicar} />}
      {modalAulas && <ModalTurmasHoje aulas={aulasHoje} onClose={() => setModalAulas(false)} />}

      <main className="page-main">
        <div style={{ width:'100%', maxWidth:1400 }}>
          <div className="page-header">
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
              <div>
                <p className="page-label">WhatsApp</p>
                <h1 className="page-title">Notificações WhatsApp</h1>
                <p className="page-subtitle">Gerencie e dispare mensagens para alunos e turmas</p>
              </div>
              <Link href="/dashboard/notificacoes/nova" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:10, background:'#8B1A2F', color:'#fff', textDecoration:'none', fontSize:14, fontWeight:700, boxShadow:'0 2px 8px rgba(139,20,45,0.28)' }}>
                <Plus size={16} />Nova Mensagem
              </Link>
            </div>
          </div>

          <div className="page-content">

            {/* ── KPIs — 4 cards ── */}
            <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4, 1fr)' }}>
              {kpiCards.map(({ label, value, Icon, bg, color, onClick, sublabel, highlight }) => (
                <div
                  key={label}
                  className="card kpi-card"
                  onClick={onClick}
                  style={{
                    cursor: onClick ? 'pointer' : 'default',
                    border: highlight ? '1.5px solid rgba(29,78,216,0.18)' : '1px solid #ede8e1',
                    transition: 'all 0.18s',
                    position: 'relative',
                  }}
                >
                  {highlight && (
                    <div style={{ position:'absolute', top:12, right:12, width:8, height:8, borderRadius:'50%', background:'#1d4ed8', boxShadow:'0 0 0 3px rgba(29,78,216,0.2)' }} />
                  )}
                  <div className="kpi-icon" style={{ background: bg }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div className="kpi-value" style={{ color }}>{value}</div>
                  <div className="kpi-label">{label}</div>
                  {sublabel && (
                    <div style={{ fontSize:12, color: highlight ? '#1d4ed8' : '#aaa', marginTop:4, fontWeight: highlight ? 600 : 400 }}>
                      {sublabel}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Banner aulas hoje ── */}
            {aulasHoje.length > 0 && (
              <div style={{ padding:'14px 20px', borderRadius:12, background:'rgba(29,78,216,0.06)', border:'1.5px solid rgba(29,78,216,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(29,78,216,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <CalendarDays size={18} color="#1d4ed8" />
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#1a0a0a', margin:0 }}>
                      {aulasHoje.length} aula{aulasHoje.length !== 1 ? 's' : ''} agendada{aulasHoje.length !== 1 ? 's' : ''} hoje
                    </p>
                    <p style={{ fontSize:12, color:'#888', margin:0 }}>
                      {aulasHoje.map(a => a.nome_turma).join(' · ')}
                    </p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setModalAulas(true)} style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #1d4ed8', background:'transparent', color:'#1d4ed8', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    <Eye size={14} />Ver Turmas
                  </button>
                  <Link href="/dashboard/notificacoes/nova?tipo=turma" style={{ padding:'8px 16px', borderRadius:8, background:'#1d4ed8', color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                    <MessageSquare size={14} />Notificar Alunos
                  </Link>
                </div>
              </div>
            )}

            {/* ── Filtros ── */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <Filter size={15} color="#888" />
                <span style={{ fontSize:12, fontWeight:600, color:'#888', letterSpacing:'0.06em', textTransform:'uppercase' }}>Filtros</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
                <div style={{ position:'relative' }}>
                  <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#aaa' }} />
                  <input placeholder="Buscar por nome ou mensagem..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inp, width:'100%', paddingLeft:32, boxSizing:'border-box' }} />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inp}>
                  <option value="">Todos os Status</option>
                  <option value="enviado">Enviado</option>
                  <option value="aberto_whatsapp">Aberto</option>
                  <option value="pendente">Pendente</option>
                  <option value="erro">Erro</option>
                </select>
                <input type="month" value={filterPeriodo} onChange={(e) => setFilterPeriodo(e.target.value)} style={inp} />
                {(search || filterStatus || filterPeriodo) && (
                  <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPeriodo('') }} style={{ ...inp, cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'#888' }}>
                    <X size={13} />Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {/* ── Tabela histórico ── */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0ebe4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:'#1a0a0a', margin:0 }}>Histórico de Mensagens</p>
                  <p style={{ fontSize:12, color:'#888', margin:0 }}>{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={loadNotificacoes} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'1px solid #e0d9d0', background:'transparent', fontSize:13, color:'#666', cursor:'pointer' }}>
                  <RefreshCw size={13} />Atualizar
                </button>
              </div>

              {loading ? (
                <div style={{ padding:40, textAlign:'center', color:'#aaa', fontSize:14 }}>Carregando...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding:48, textAlign:'center' }}>
                  <MessageSquare size={36} color="#ddd" style={{ marginBottom:12 }} />
                  <p style={{ color:'#aaa', fontSize:14, margin:0 }}>Nenhuma mensagem encontrada</p>
                  <Link href="/dashboard/notificacoes/nova" style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:16, padding:'9px 18px', borderRadius:8, background:'#8B1A2F', color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                    <Plus size={14} />Criar primeira mensagem
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Destinatário</th><th>Tipo</th><th>Preview da Mensagem</th><th>Data</th><th>Status</th><th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((n) => (
                        <tr key={n.id_notificacao}>
                          <td style={{ fontWeight:600 }}>{n.destinatario}</td>
                          <td>
                            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:n.tipo_gatilho==='turma'?'rgba(107,91,149,0.1)':'rgba(45,106,79,0.08)', color:n.tipo_gatilho==='turma'?'#6B5B95':'#2D6A4F', fontSize:12, fontWeight:600 }}>
                              {n.tipo_gatilho==='turma'?<Users size={11}/>:<MessageSquare size={11}/>}
                              {n.tipo_gatilho==='turma'?'Turma':'Individual'}
                            </span>
                          </td>
                          <td style={{ color:'#555', maxWidth:300 }}>
                            <span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }}>{n.mensagem}</span>
                          </td>
                          <td style={{ color:'#888', fontSize:13, whiteSpace:'nowrap' }}>
                            {new Date(n.data_envio).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </td>
                          <td><StatusBadge status={n.status_envio} /></td>
                          <td>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={() => setPreview(n)} title="Visualizar" style={{ padding:'5px 8px', borderRadius:7, border:'1px solid #e0d9d0', background:'transparent', cursor:'pointer', color:'#666', display:'flex', alignItems:'center' }}><Eye size={13}/></button>
                              <button onClick={() => handleReenviar(n)} title="Reenviar" style={{ padding:'5px 8px', borderRadius:7, border:'1px solid #25d366', background:'transparent', cursor:'pointer', color:'#25d366', display:'flex', alignItems:'center' }}><RefreshCw size={13}/></button>
                              <button onClick={() => handleDuplicar(n)} title="Duplicar" style={{ padding:'5px 8px', borderRadius:7, border:'1px solid #e0d9d0', background:'transparent', cursor:'pointer', color:'#666', display:'flex', alignItems:'center' }}><Copy size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}