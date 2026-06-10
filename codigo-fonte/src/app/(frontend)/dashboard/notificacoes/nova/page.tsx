'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  LayoutDashboard, CalendarDays, Music2, Users, GraduationCap,
  Clock, CreditCard, CalendarRange, BarChart2, LogOut, ChevronRight,
  MessageSquare, ArrowLeft, Send, X, CheckCircle, ChevronDown,
  Zap, User, AlertCircle, Check, ExternalLink, SkipForward,
  BookOpen, ChevronUp, Eye,
} from 'lucide-react'

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Nav ─────────────────────────────────────────────────────────────────────
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

// ─── Message Templates ───────────────────────────────────────────────────────
interface MensagemModelo {
  id: string
  titulo: string
  texto: string
}

interface CategoriaModelo {
  id: string
  label: string
  emoji: string
  color: string
  modelos: MensagemModelo[]
}

const CATEGORIAS_MODELOS: CategoriaModelo[] = [
  {
    id: 'confirmacao',
    label: 'Confirmação de Aula',
    emoji: '',
    color: '#8B1A2F',
    modelos: [
      {
        id: 'conf-1',
        titulo: 'Confirmação completa',
        texto: 'Olá, {nome}! \nSua aula de {turma} está confirmada para o dia {dia} às {horario}.\n📍 Local: {local}\n👨‍🏫 Professor(a): {professor}\nQualquer dúvida estamos à disposição. Esperamos você!',
      },
      {
        id: 'conf-2',
        titulo: 'Lembrete do dia',
        texto: 'Olá, {nome}! \nPassando para lembrar da sua aula de {turma} hoje às {horario}. ✨\nChegue com alguns minutos de antecedência para aproveitarmos melhor a aula. Até mais!',
      },
      {
        id: 'conf-3',
        titulo: 'Lembrete para turma',
        texto: 'Olá, pessoal da turma {turma}! 💃\nLembramos que nossa próxima aula será:\n📅 {dia}\n🕒 {horario}\n📍 {local}\nEsperamos todos vocês para mais uma aula incrível!',
      },
    ],
  },
  {
    id: 'cancelamento',
    label: 'Cancelamento / Alteração',
    emoji: '',
    color: '#8B1A2F',
    modelos: [
      {
        id: 'canc-1',
        titulo: 'Cancelamento com motivo',
        texto: 'Olá, {nome}. \nInformamos que a aula de {turma} do dia {dia} precisou ser cancelada devido a {motivo}.\nEm breve enviaremos a nova data de reposição.\nPedimos desculpas pelo transtorno.',
      },
    ],
  },
  {
    id: 'boas-vindas',
    label: 'Boas-vindas',
    emoji: '',
    color: '#8B1A2F',
    modelos: [
      {
        id: 'bv-1',
        titulo: 'Boas-vindas completas',
        texto: 'Olá, {nome}! Seja muito bem-vindo(a) à nossa escola de dança! 🎉\nEstamos felizes em ter você conosco.\nSua turma:\n💃 Ritmo: {turma}\n📅 Início: {dia}\n🕒 Horário: {horario}\nQualquer dúvida, nossa equipe estará disponível para ajudar.',
      },
      {
        id: 'bv-2',
        titulo: 'Cadastro confirmado',
        texto: 'Olá, {nome}! \nSeu cadastro foi realizado com sucesso. \nAgora você faz parte da nossa comunidade de dança.\nEm breve enviaremos novidades, eventos e informações das suas aulas.',
      },
    ],
  },
  {
    id: 'cobranca',
    label: 'Cobrança / Mensalidade',
    emoji: '',
    color: '#8B1A2F',
    modelos: [
      {
        id: 'cob-1',
        titulo: 'Lembrete de vencimento',
        texto: 'Olá, {nome}! \nPassando para lembrar que sua mensalidade com vencimento em {dia} está disponível.\nCaso já tenha realizado o pagamento, desconsidere esta mensagem. ',
      },
      {
        id: 'cob-2',
        titulo: 'Pendência financeira',
        texto: 'Olá, {nome}. \nIdentificamos uma pendência financeira referente à mensalidade da turma {turma}.\nSe precisar de ajuda ou negociação, entre em contato conosco.',
      },
    ],
  },
  {
    id: 'eventos',
    label: 'Eventos',
    emoji: '',
    color: '#8B1A2F',
    modelos: [
      {
        id: 'ev-2',
        titulo: 'Prática de Dança',
        texto: 'Nossa próxima prática de dança já tem data marcada! \n📅 {dia}\n📍 {local}\n🕒 {horario}\nEsperamos vocês para uma noite cheia de dança e diversão!',
      },
    ],
  },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────
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
            <Icon size={16} />
            <span>{label}</span>
            {isActive(href) && <ChevronRight size={14} className="sidebar-nav-arrow" />}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout">
          <LogOut size={15} /><span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Aluno {
  id_aluno: string
  nome_completo: string
  telefone: string
  enviado?: boolean
}

interface Turma {
  id_turma: string
  nome: string
  total_alunos: number
}

// ─── Helper: gerar link WhatsApp ─────────────────────────────────────────────
function gerarLinkWhatsapp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, '')
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`
}

// ─── Helper: substituir variáveis ────────────────────────────────────────────
function substituirVariaveis(mensagem: string, aluno: { nome_completo: string }, turma?: string): string {
  const agora = new Date()
  const dia  = agora.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })
  const hora = agora.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  return mensagem
    .replace(/{nome}/g,    aluno.nome_completo.split(' ')[0])
    .replace(/{turma}/g,   turma ?? '')
    .replace(/{dia}/g,     dia)
    .replace(/{horario}/g, hora)
}

// ─── WhatsApp Preview ────────────────────────────────────────────────────────
function WhatsAppPreview({ mensagem }: { mensagem: string }) {
  const hora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  return (
    <div style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', userSelect:'none' }}>
      <div style={{ background:'#075e54', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <User size={20} color="#fff" />
        </div>
        <div>
          <p style={{ color:'#fff', fontWeight:600, fontSize:14, margin:0 }}>Aluno(a)</p>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:11, margin:0 }}>online</p>
        </div>
      </div>
      <div style={{ background:'#ece5dd', padding:'16px 14px', minHeight:160, backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c9b99a\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
        {mensagem ? (
          <div style={{ background:'#e2ffc7', borderRadius:'12px 12px 2px 12px', padding:'10px 14px', maxWidth:'80%', marginLeft:'auto', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize:13, color:'#1a1a1a', margin:0, whiteSpace:'pre-wrap', lineHeight:1.55 }}>{mensagem}</p>
            <p style={{ fontSize:10, color:'#6b7280', margin:'6px 0 0', textAlign:'right' }}>{hora} ✓✓</p>
          </div>
        ) : (
          <div style={{ textAlign:'center', paddingTop:32, color:'#aaa', fontSize:13 }}>
            <MessageSquare size={28} style={{ marginBottom:8, opacity:0.4 }} />
            <p style={{ margin:0 }}>Preview da mensagem aparecerá aqui</p>
          </div>
        )}
      </div>
      <div style={{ background:'#f0f0f0', padding:'8px 12px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ flex:1, background:'#fff', borderRadius:24, padding:'8px 14px', fontSize:12, color:'#aaa' }}>Mensagem</div>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'#25d366', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Send size={15} color="#fff" />
        </div>
      </div>
    </div>
  )
}

// ─── Modal Preview de Modelo ──────────────────────────────────────────────────
function ModalPreviewModelo({
  modelo,
  categoria,
  onClose,
  onUsar,
}: {
  modelo: MensagemModelo
  categoria: CategoriaModelo
  onClose: () => void
  onUsar: (texto: string) => void
}) {
  const hora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  const previewTexto = modelo.texto
    .replace(/{nome}/g, 'Maria')
    .replace(/{turma}/g, 'Forró')
    .replace(/{dia}/g, 'segunda-feira, 16 de junho')
    .replace(/{horario}/g, '19:00')
    .replace(/{local}/g, 'Sala 2 – Bloco A')
    .replace(/{professor}/g, 'João Silva')
    .replace(/{motivo}/g, 'imprevisto')
    .replace(/{data_inicio}/g, '23/06')
    .replace(/{data_vencimento}/g, '10/07')

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:420, boxShadow:'0 24px 80px rgba(0,0,0,0.3)', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0ebe4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:`${categoria.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              {categoria.emoji}
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a0a0a', margin:0 }}>{modelo.titulo}</p>
              <p style={{ fontSize:11, color:'#aaa', margin:0 }}>{categoria.label}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', padding:4 }}>
            <X size={18} />
          </button>
        </div>

        {/* WhatsApp preview */}
        <div style={{ padding:'16px 20px' }}>
          <p style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'#aaa', fontWeight:600, marginBottom:10 }}>Prévia com dados de exemplo</p>
          <div style={{ borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ background:'#075e54', padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <User size={16} color="#fff" />
              </div>
              <div>
                <p style={{ color:'#fff', fontWeight:600, fontSize:13, margin:0 }}>Maria Silva</p>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:10, margin:0 }}>online</p>
              </div>
            </div>
            <div style={{ background:'#ece5dd', padding:'14px 12px', minHeight:120, backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c9b99a\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              <div style={{ background:'#e2ffc7', borderRadius:'10px 10px 2px 10px', padding:'9px 12px', maxWidth:'82%', marginLeft:'auto', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize:12.5, color:'#1a1a1a', margin:0, whiteSpace:'pre-wrap', lineHeight:1.6 }}>{previewTexto}</p>
                <p style={{ fontSize:10, color:'#6b7280', margin:'5px 0 0', textAlign:'right' }}>{hora} ✓✓</p>
              </div>
            </div>
          </div>
        </div>

        {/* Texto original */}
        <div style={{ padding:'0 20px 16px' }}>
          <p style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'#aaa', fontWeight:600, marginBottom:8 }}>Texto original com variáveis</p>
          <div style={{ background:'#faf8f5', border:'1px solid #e8e0d6', borderRadius:10, padding:'10px 13px' }}>
            <p style={{ fontSize:12, color:'#555', margin:0, whiteSpace:'pre-wrap', lineHeight:1.65, fontFamily:'monospace' }}>{modelo.texto}</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #f0ebe4', display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px 0', borderRadius:9, border:'1.5px solid #e0d9d0', background:'transparent', color:'#666', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Fechar
          </button>
          <button
            onClick={() => { onUsar(modelo.texto); onClose() }}
            style={{ flex:2, padding:'10px 0', borderRadius:9, background:'#8B1A2F', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
          >
            <Check size={15} />Usar este modelo
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Seção de Modelos de Mensagem ─────────────────────────────────────────────
function SecaoModelos({ onSelecionarModelo }: { onSelecionarModelo: (texto: string) => void }) {
  const [expandido, setExpandido] = useState(false)
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null)
  const [previewModelo, setPreviewModelo] = useState<{ modelo: MensagemModelo; categoria: CategoriaModelo } | null>(null)

  const labelStyle: React.CSSProperties = {
    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#888', display: 'block', marginBottom: 6, fontWeight: 600,
  }

  return (
    <>
      {previewModelo && (
        <ModalPreviewModelo
          modelo={previewModelo.modelo}
          categoria={previewModelo.categoria}
          onClose={() => setPreviewModelo(null)}
          onUsar={(texto) => { onSelecionarModelo(texto); setPreviewModelo(null) }}
        />
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {/* Toggle header */}
        <button
          onClick={() => setExpandido(v => !v)}
          style={{
            width:'100%', padding:'16px 22px', background:'none', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            borderBottom: expandido ? '1px solid #f0ebe4' : 'none',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(139,26,47,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <BookOpen size={15} color="#8B1A2F" />
            </div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a0a0a', margin:0 }}>Modelos de Mensagem</p>
              <p style={{ fontSize:11, color:'#aaa', margin:0 }}>Selecione um modelo pronto para usar</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'#aaa', background:'#f0ebe4', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>
              {CATEGORIAS_MODELOS.reduce((acc, c) => acc + c.modelos.length, 0)} modelos
            </span>
            {expandido ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
          </div>
        </button>

        {/* Content */}
        {expandido && (
          <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:6 }}>
            {CATEGORIAS_MODELOS.map(cat => {
              const aberta = categoriaAberta === cat.id
              return (
                <div key={cat.id} style={{ border:'1px solid #f0ebe4', borderRadius:12, overflow:'hidden' }}>
                  {/* Categoria header */}
                  <button
                    onClick={() => setCategoriaAberta(aberta ? null : cat.id)}
                    style={{
                      width:'100%', padding:'11px 14px', background: aberta ? `${cat.color}08` : '#faf8f5',
                      border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between',
                      borderBottom: aberta ? `1px solid ${cat.color}20` : 'none',
                      transition:'background 0.15s',
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <span style={{ fontSize:16 }}>{cat.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:700, color: aberta ? cat.color : '#333' }}>{cat.label}</span>
                      <span style={{ fontSize:11, color:'#aaa', background:'#ece8e2', padding:'1px 7px', borderRadius:10, fontWeight:600 }}>
                        {cat.modelos.length}
                      </span>
                    </div>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:`${cat.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {aberta ? <ChevronUp size={12} color={cat.color} /> : <ChevronDown size={12} color={cat.color} />}
                    </div>
                  </button>

                  {/* Modelos list */}
                  {aberta && (
                    <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:6, background:'#fff' }}>
                      {cat.modelos.map(modelo => (
                        <div
                          key={modelo.id}
                          style={{
                            border:`1px solid #f0ebe4`, borderRadius:9, padding:'10px 12px',
                            display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10,
                          }}
                        >
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:12.5, fontWeight:700, color:'#1a0a0a', margin:'0 0 3px' }}>{modelo.titulo}</p>
                            <p style={{ fontSize:11.5, color:'#888', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.5 }}>
                              {modelo.texto.split('\n')[0].replace(/{/g, '').replace(/}/g, '')}...
                            </p>
                          </div>
                          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                            <button
                              onClick={() => setPreviewModelo({ modelo, categoria: cat })}
                              style={{ padding:'6px 10px', borderRadius:7, border:`1.5px solid ${cat.color}40`, background:`${cat.color}08`, color:cat.color, fontSize:11.5, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
                            >
                              <Eye size={12} />Prévia
                            </button>
                            <button
                              onClick={() => onSelecionarModelo(modelo.texto)}
                              style={{ padding:'6px 10px', borderRadius:7, border:'none', background:cat.color, color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
                            >
                              <Check size={12} />Usar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Modal de envio em massa ──────────────────────────────────────────────────
function ModalEnvioMassa({
  alunos, mensagem, turmaNome, onClose, onSalvar,
}: {
  alunos: Aluno[]
  mensagem: string
  turmaNome: string
  onClose: () => void
  onSalvar: (enviados: string[]) => void
}) {
  const [lista, setLista]       = useState<Aluno[]>(alunos.map(a => ({ ...a, enviado: false })))
  const [atual, setAtual]       = useState(0)
  const [enviados, setEnviados] = useState<string[]>([])
  const [confirmado, setConfirmado] = useState(false)

  const total    = lista.length
  const restante = lista.filter(a => !a.enviado).length

  function enviarAluno(idx: number) {
    const aluno = lista[idx]
    if (!aluno || !aluno.telefone) return
    const msg = substituirVariaveis(mensagem, aluno, turmaNome)
    const link = gerarLinkWhatsapp(aluno.telefone, msg)
    window.open(link, '_blank')
    const nova = [...lista]
    nova[idx] = { ...nova[idx], enviado: true }
    setLista(nova)
    setEnviados(prev => [...prev, aluno.id_aluno])
    const prox = nova.findIndex((a, i) => i > idx && !a.enviado)
    setAtual(prox >= 0 ? prox : idx)
  }

  function handleProximo() {
    enviarAluno(atual)
    const prox = lista.findIndex((a, i) => i > atual && !a.enviado)
    if (prox >= 0) setAtual(prox)
  }

  const pct = total > 0 ? Math.round((enviados.length / total) * 100) : 0

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:600, maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.25)', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid #f0ebe4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:'#1a0a0a', margin:0 }}>Envio em Massa — {turmaNome}</p>
            <p style={{ fontSize:12, color:'#888', margin:0 }}>{total} aluno{total !== 1 ? 's' : ''} · {restante} restante{restante !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', padding:4 }}><X size={20} /></button>
        </div>
        <div style={{ padding:'12px 22px', background:'#faf8f5', borderBottom:'1px solid #f0ebe4' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#888', marginBottom:6 }}>
            <span>{enviados.length} enviado{enviados.length !== 1 ? 's' : ''}</span>
            <span style={{ fontWeight:700, color: pct === 100 ? '#16a34a' : '#1a0a0a' }}>{pct}%</span>
          </div>
          <div style={{ height:8, background:'#f0ebe4', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background: pct === 100 ? '#16a34a' : '#25d366', borderRadius:4, transition:'width 0.4s ease' }} />
          </div>
        </div>
        {!confirmado && (
          <div style={{ padding:28, textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(37,211,102,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <AlertCircle size={26} color="#25d366" />
            </div>
            <p style={{ fontSize:15, fontWeight:700, color:'#1a0a0a', margin:'0 0 8px' }}>Confirmar envio em massa?</p>
            <p style={{ fontSize:13, color:'#888', margin:'0 0 24px', lineHeight:1.6 }}>
              Você enviará mensagens para <strong>{total} aluno{total !== 1 ? 's' : ''}</strong> da turma <strong>{turmaNome}</strong>.<br/>
              O envio será feito manualmente, um por vez, via WhatsApp.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={onClose} style={{ padding:'10px 24px', borderRadius:9, border:'1.5px solid #e0d9d0', background:'transparent', color:'#666', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
              <button onClick={() => setConfirmado(true)} style={{ padding:'10px 24px', borderRadius:9, background:'#8B1A2F', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                <Zap size={16} />Iniciar Disparos
              </button>
            </div>
          </div>
        )}
        {confirmado && (
          <>
            <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
              {lista.map((aluno, idx) => {
                const isAtual = idx === atual && !aluno.enviado
                return (
                  <div key={aluno.id_aluno} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 22px', background: isAtual ? 'rgba(37,211,102,0.06)' : 'transparent', borderLeft: isAtual ? '3px solid #25d366' : '3px solid transparent', transition:'all 0.2s' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background: aluno.enviado ? 'rgba(22,163,74,0.1)' : isAtual ? 'rgba(37,211,102,0.1)' : '#f0ebe4', display:'flex', alignItems:'center', justifyContent:'center', border: aluno.enviado ? '2px solid #16a34a' : isAtual ? '2px solid #25d366' : '2px solid #e0d9d0' }}>
                      {aluno.enviado ? <Check size={14} color="#16a34a" /> : <span style={{ fontSize:12, fontWeight:700, color: isAtual ? '#25d366' : '#aaa' }}>{idx + 1}</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, color: aluno.enviado ? '#aaa' : '#1a0a0a', margin:0, textDecoration: aluno.enviado ? 'line-through' : 'none' }}>{aluno.nome_completo}</p>
                      <p style={{ fontSize:12, color:'#999', margin:0 }}>{aluno.telefone || 'Sem telefone'}</p>
                    </div>
                    {aluno.enviado ? (
                      <span style={{ fontSize:12, color:'#16a34a', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}><CheckCircle size={13} />Enviado</span>
                    ) : (
                      <button onClick={() => enviarAluno(idx)} disabled={!aluno.telefone} style={{ padding:'7px 14px', borderRadius:8, border:'none', background: isAtual ? '#8B1A2F' : '#f0ebe4', color: isAtual ? '#fff' : '#666', fontSize:13, fontWeight:600, cursor: aluno.telefone ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:6, opacity: aluno.telefone ? 1 : 0.4 }}>
                        <ExternalLink size={13} />Enviar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ padding:'14px 22px', borderTop:'1px solid #f0ebe4', background:'#faf8f5', display:'flex', gap:10, alignItems:'center' }}>
              {restante > 0 ? (
                <>
                  <button onClick={handleProximo} disabled={lista[atual]?.enviado || !lista[atual]?.telefone} style={{ flex:1, padding:'10px 0', borderRadius:9, background:'#8B1A2F', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: (!lista[atual] || lista[atual].enviado) ? 0.5 : 1 }}>
                    <Send size={15} />Enviar e Próximo<SkipForward size={14} />
                  </button>
                  <span style={{ fontSize:12, color:'#aaa', whiteSpace:'nowrap' }}>{restante} restante{restante !== 1 ? 's' : ''}</span>
                </>
              ) : (
                <button onClick={() => onSalvar(enviados)} style={{ flex:1, padding:'10px 0', borderRadius:9, background:'#8B1A2F', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <CheckCircle size={15} />Concluir e Salvar Histórico
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Variables chips ─────────────────────────────────────────────────────────
const VARIAVEIS = ['{nome}', '{turma}', '{dia}', '{horario}']

// ─── Inner component ─────────────────────────────────────────────────────────
function NovaNotificacaoInner() {
  const searchParams = useSearchParams()

  const [tipo,       setTipo]       = useState<'individual' | 'turma'>('individual')
  const [mensagem,   setMensagem]   = useState(searchParams.get('mensagem') ?? '')
  const [alunoId,    setAlunoId]    = useState('')
  const [turmaId,    setTurmaId]    = useState('')
  const [busca,      setBusca]      = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const [alunos,  setAlunos]  = useState<Aluno[]>([])
  const [turmas,  setTurmas]  = useState<Turma[]>([])
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([])

  const [loading,       setLoading]       = useState(false)
  const [loadingAlunos, setLoadingAlunos] = useState(false)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([])
  const [toast,         setToast]         = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [turmaNome,     setTurmaNome]     = useState('')

  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const validarAdmin = useCallback(async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // usuário não autenticado
    if (authError || !user) {
      router.replace('/login')
      return
    }

    // busca perfil do usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('tipo_perfil')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    // erro na consulta
    if (usuarioError) {
      console.error(usuarioError)
      router.replace('/acesso-negado')
      return
    }

    // não é admin
    if (!usuario || usuario.tipo_perfil !== 'ADMIN') {
      router.replace('/acesso-negado')
      return
    }

  } catch (error) {
    console.error('Erro ao validar admin:', error)
    router.replace('/login')
  } finally {
    setAuthLoading(false)
  }
}, [router])

    useEffect(() => {
        validarAdmin()
    }, [validarAdmin])

    useEffect(() => {
        if (authLoading) return

        loadAlunos()
        loadTurmas()

        if (searchParams.get('tipo') === 'turma') {
            setTipo('turma')
        }
    }, [authLoading, searchParams])

  async function loadAlunos() {
    const { data } = await supabase
      .from('alunos')
      .select('id_aluno, telefone, usuarios(nome_completo)')
      .order('usuarios(nome_completo)')
    setAlunos((data ?? []).map((a: any) => ({
      id_aluno: a.id_aluno,
      nome_completo: a.usuarios?.nome_completo ?? '—',
      telefone: a.telefone ?? '',
    })))
  }

  async function loadTurmas() {
    const { data } = await supabase.from('turmas').select('id_turma, nome').order('nome')
    const { data: mats } = await supabase.from('matriculas_turmas').select('id_turma').eq('status', 'ativo')
    const counts: Record<string, number> = {}
    ;(mats ?? []).forEach((m: any) => { counts[m.id_turma] = (counts[m.id_turma] ?? 0) + 1 })
    setTurmas((data ?? []).map((t: any) => ({
      id_turma: t.id_turma,
      nome: t.nome,
      total_alunos: counts[t.id_turma] ?? 0,
    })))
  }

  useEffect(() => {
    if (!busca) { setAlunosFiltrados([]); return }
    setAlunosFiltrados(alunos.filter(a => a.nome_completo.toLowerCase().includes(busca.toLowerCase())).slice(0, 8))
  }, [busca, alunos])

  const alunoSelecionado  = alunos.find(a => a.id_aluno === alunoId)
  const turmaSelecionada  = turmas.find(t => t.id_turma === turmaId)

  function inserirVariavel(v: string) {
    setMensagem(prev => prev + v)
  }

  const previewMensagem = mensagem
    ? substituirVariaveis(mensagem, alunoSelecionado ?? { nome_completo: 'Nome do Aluno' }, turmaSelecionada?.nome ?? 'Turma')
    : ''

  async function handleEnviarIndividual() {
    if (!alunoId)    { showToast('Selecione um aluno.', 'err'); return }
    if (!mensagem.trim()) { showToast('Digite uma mensagem.', 'err'); return }
    if (!alunoSelecionado?.telefone) { showToast('Aluno sem telefone cadastrado.', 'err'); return }
    setLoading(true)
    const msg  = substituirVariaveis(mensagem, alunoSelecionado!, turmaNome)
    const link = gerarLinkWhatsapp(alunoSelecionado!.telefone, msg)
    window.open(link, '_blank')
    const { data: alunoData } = await supabase.from('alunos').select('id_usuario').eq('id_aluno', alunoId).maybeSingle()
    await supabase.from('notificacoes_whatsapp').insert({
      id_usuario: alunoData?.id_usuario ?? null,
      tipo_gatilho: 'individual',
      mensagem: msg,
      data_envio: new Date().toISOString(),
      status_envio: 'aberto_whatsapp',
    })
    showToast('WhatsApp aberto com sucesso!')
    setLoading(false)
  }

  async function handleAbrirModalTurma() {
    if (!turmaId)        { showToast('Selecione uma turma.', 'err'); return }
    if (!mensagem.trim()) { showToast('Digite uma mensagem.', 'err'); return }
    setLoadingAlunos(true)
    const { data } = await supabase
      .from('matriculas_turmas')
      .select('alunos(id_aluno, telefone, usuarios(nome_completo))')
      .eq('id_turma', turmaId)
      .eq('status', 'ativo')
    const lista: Aluno[] = (data ?? []).map((m: any) => ({
      id_aluno: m.alunos?.id_aluno ?? '',
      nome_completo: m.alunos?.usuarios?.nome_completo ?? '—',
      telefone: m.alunos?.telefone ?? '',
    })).filter(a => a.id_aluno)
    setAlunosDaTurma(lista)
    setTurmaNome(turmaSelecionada?.nome ?? '')
    setLoadingAlunos(false)
    setModalOpen(true)
  }

  async function handleSalvarHistorico(enviadosIds: string[]) {
    if (!enviadosIds.length) { setModalOpen(false); return }
    const { data: alunosData } = await supabase.from('alunos').select('id_aluno, id_usuario').in('id_aluno', enviadosIds)
    const rows = (alunosData ?? []).map((a: any) => ({
      id_usuario: a.id_usuario,
      tipo_gatilho: 'turma',
      mensagem: mensagem,
      data_envio: new Date().toISOString(),
      status_envio: 'aberto_whatsapp',
    }))
    if (rows.length > 0) await supabase.from('notificacoes_whatsapp').insert(rows)
    showToast(`${enviadosIds.length} mensagen${enviadosIds.length !== 1 ? 's' : ''} salva${enviadosIds.length !== 1 ? 's' : ''} no histórico!`)
    setModalOpen(false)
  }

  const inputStyle: React.CSSProperties = {
    padding: '9px 12px', borderRadius: 9, border: '1px solid #e0d9d0',
    background: '#faf8f5', fontSize: 13, color: '#1a0a0a', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#888', display: 'block', marginBottom: 6, fontWeight: 600,
  }

  const isDisabled = loading || loadingAlunos || !mensagem.trim() || (tipo === 'individual' ? !alunoId : !turmaId)

  if (authLoading) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f1eb',
      }}
    >
      <p style={{ color: '#888', fontSize: 14 }}>
        Validando acesso...
      </p>
    </div>
  )
}

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f5f1eb' }}>
      <Sidebar />

      {toast && (
        <div style={{ position:'fixed', bottom:28, right:28, background: toast.type === 'err' ? '#c0392b' : '#1a0a0a', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:600, zIndex:2000, boxShadow:'0 4px 20px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', gap:8 }}>
          {toast.type === 'ok' ? <CheckCircle size={15} color="#25d366" /> : <AlertCircle size={15} color="#fff" />}
          {toast.msg}
        </div>
      )}

      {modalOpen && (
        <ModalEnvioMassa
          alunos={alunosDaTurma}
          mensagem={mensagem}
          turmaNome={turmaNome}
          onClose={() => setModalOpen(false)}
          onSalvar={handleSalvarHistorico}
        />
      )}

      <main className="page-main">
        <div style={{ width:'100%', maxWidth:1400 }}>
          <div className="page-header">
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:4 }}>
              <Link href="/dashboard/notificacoes" style={{ display:'flex', alignItems:'center', gap:8, color:'#888', textDecoration:'none', fontSize:14, marginBottom:12 }}>
                <ArrowLeft size={15} />Voltar
              </Link>
            </div>
            <h1 className="page-title">Nova Mensagem</h1>
            <p className="page-subtitle">Configure e dispare mensagens via WhatsApp</p>
          </div>

          <div className="page-content">
            <div className="nova-notificacao-layout">

              {/* ── Formulário ── */}
              <div className="nova-notificacao-form">

                {/* Tipo destinatário */}
                <div className="card" style={{ padding:'18px 22px' }}>
                  <p style={{ ...labelStyle, marginBottom:14 }}>Tipo de Destinatário</p>
                  <div style={{ display:'flex', gap:12 }}>
                    {([['individual','Aluno Individual', User], ['turma','Turma Inteira', Users]] as const).map(([val, label, Icon]) => (
                      <button
                        key={val}
                        onClick={() => { setTipo(val); setAlunoId(''); setTurmaId(''); setBusca('') }}
                        style={{
                          flex:1, padding:'14px 16px', borderRadius:10,
                          border: tipo === val ? '2px solid #c0392b' : '2px solid #e0d9d0',
                          background: tipo === val ? 'rgba(192,57,43,0.06)' : '#faf8f5',
                          color: tipo === val ? '#c0392b' : '#888',
                          fontSize:14, fontWeight: tipo === val ? 700 : 500,
                          cursor:'pointer', transition:'all 0.18s',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        }}
                      >
                        <Icon size={17} />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção dinâmica */}
                <div className="nova-card" style={{ padding:'18px 22px' }}>
                  {tipo === 'individual' ? (
                    <>
                      <label style={labelStyle}>Selecionar Aluno</label>
                      <div style={{ position:'relative' }}>
                        <input
                          placeholder="Buscar aluno pelo nome..."
                          value={busca}
                          onChange={(e) => { setBusca(e.target.value); setShowDropdown(true); setAlunoId('') }}
                          onFocus={() => setShowDropdown(true)}
                          style={inputStyle}
                        />
                        {showDropdown && alunosFiltrados.length > 0 && (
                          <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:50, marginTop:4, overflow:'hidden', border:'1px solid #f0ebe4' }}>
                            {alunosFiltrados.map(a => (
                              <div
                                key={a.id_aluno}
                                onClick={() => { setAlunoId(a.id_aluno); setBusca(a.nome_completo); setShowDropdown(false) }}
                                style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, borderBottom:'1px solid #f9f5f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f5')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                              >
                                <span style={{ fontWeight:600 }}>{a.nome_completo}</span>
                                <span style={{ fontSize:12, color:'#aaa' }}>{a.telefone || 'Sem tel.'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {alunoSelecionado && (
                        <div style={{ marginTop:10, padding:'10px 14px', borderRadius:9, background:'#FBF3F3', border:'1px solid #C0392B', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:'#1a0a0a', margin:0 }}>{alunoSelecionado.nome_completo}</p>
                            <p style={{ fontSize:12, color:'#888', margin:0 }}>{alunoSelecionado.telefone || 'Sem telefone'}</p>
                          </div>
                          <CheckCircle size={18} color="#8B1A2F" />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <label style={labelStyle}>Selecionar Turma</label>
                      <div style={{ position:'relative' }}>
                        <select
                          value={turmaId}
                          onChange={(e) => setTurmaId(e.target.value)}
                          style={{ ...inputStyle, cursor:'pointer', appearance:'none' }}
                        >
                          <option value="">Selecione uma turma...</option>
                          {turmas.map(t => (
                            <option key={t.id_turma} value={t.id_turma}>
                              {t.nome} ({t.total_alunos} aluno{t.total_alunos !== 1 ? 's' : ''})
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'#aaa', pointerEvents:'none' }} />
                      </div>
                      {turmaSelecionada && (
                        <div style={{ marginTop:10, padding:'10px 14px', borderRadius:9, background:'#FBF3F3', border:'1px solid #C0392B', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:'#1a0a0a', margin:0 }}>{turmaSelecionada.nome}</p>
                            <p style={{ fontSize:12, color:'#888', margin:0 }}>{turmaSelecionada.total_alunos} aluno{turmaSelecionada.total_alunos !== 1 ? 's' : ''} ativos</p>
                          </div>
                          <CheckCircle size={18} color="#8B1A2F" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ── MODELOS DE MENSAGEM ── */}
                <SecaoModelos onSelecionarModelo={(texto) => setMensagem(texto)} />

                {/* Campo mensagem */}
                <div className="nova-card" style={{ padding:'18px 22px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <label style={{ ...labelStyle, marginBottom:0 }}>Mensagem</label>
                    <span style={{ fontSize:12, color: mensagem.length > 900 ? '#c0392b' : '#aaa' }}>
                      {mensagem.length}/1000
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
                    {VARIAVEIS.map(v => (
                      <button
                        key={v}
                        onClick={() => inserirVariavel(v)}
                        style={{ padding:'4px 11px', borderRadius:20, border:'1.5px solid #e0d9d0', background:'#faf8f5', fontSize:12, color:'#555', cursor:'pointer', fontWeight:600, transition:'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#25d366'; e.currentTarget.style.color = '#25d366' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0d9d0'; e.currentTarget.style.color = '#555' }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value.slice(0, 1000))}
                    placeholder={`Olá {nome}, lembramos da sua aula de {turma}!\nDia: {dia} às {horario}`}
                    rows={6}
                    style={{ ...inputStyle, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }}
                  />
                  <p style={{ fontSize:11, color:'#aaa', marginTop:6 }}>
                    Use as variáveis acima para personalizar a mensagem automaticamente.
                  </p>
                </div>

                {/* Botão enviar */}
                <button
                  onClick={tipo === 'individual' ? handleEnviarIndividual : handleAbrirModalTurma}
                  disabled={isDisabled}
                  style={{
                    padding:'14px 0', borderRadius:11,
                    background: isDisabled ? '#ccc' : '#8B1A2F',
                    color:'#fff', border:'none', fontSize:15, fontWeight:700,
                    cursor:'pointer', width:'100%',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                    boxShadow: isDisabled ? 'none' : '0 4px 16px rgba(139, 20, 45, 0.18)',
                    transition:'all 0.2s',
                  }}
                >
                  {loading || loadingAlunos ? (
                    <><RefreshCwIcon />Preparando...</>
                  ) : tipo === 'individual' ? (
                    <><ExternalLink size={17} />Abrir WhatsApp</>
                  ) : (
                    <><Zap size={17} />Gerar Envios para Turma ({turmaSelecionada?.total_alunos ?? 0} alunos)</>
                  )}
                </button>
              </div>

              {/* ── Preview WhatsApp ── */}
              <div className="nova-notificacao-preview">
                <p style={{ ...labelStyle, marginBottom:12 }}>Preview da Mensagem</p>
                <WhatsAppPreview mensagem={previewMensagem} />

                <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10, background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.2)' }}>
                  <p style={{ fontSize:12, color:'#2D6A4F', margin:0, lineHeight:1.6, fontWeight:600 }}>💡 Como funciona</p>
                  <p style={{ fontSize:12, color:'#555', margin:'6px 0 0', lineHeight:1.6 }}>
                    O sistema gera um link <strong>wa.me</strong> que abre o WhatsApp já com a mensagem preenchida.
                  </p>
                </div>

                {tipo === 'turma' && turmaSelecionada && (
                  <div style={{ marginTop:12, padding:'12px 16px', borderRadius:10, background:'rgba(107,91,149,0.08)', border:'1px solid rgba(107,91,149,0.2)' }}>
                    <p style={{ fontSize:12, color:'#6B5B95', margin:'0 0 4px', fontWeight:700 }}>📋 Envio para turma</p>
                    <p style={{ fontSize:12, color:'#555', margin:0, lineHeight:1.6 }}>
                      Você enviará para <strong>{turmaSelecionada.total_alunos}</strong> aluno{turmaSelecionada.total_alunos !== 1 ? 's' : ''}. Um modal interativo permitirá o disparo rápido um por um.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function RefreshCwIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 1s linear infinite' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
}

export default function NovaNotificacaoPage() {
  return (
    <Suspense fallback={
      <div style={{ display:'flex', minHeight:'100vh', background:'#f5f1eb', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'#aaa', fontSize:14 }}>Carregando...</p>
      </div>
    }>
      <NovaNotificacaoInner />
    </Suspense>
  )
}