// src/components/dashboard/HomeComponents.tsx
'use client'

import React from 'react'
import Link from 'next/link'

// ========== GREETING CARD ==========
interface GreetingCardProps {
  nome: string
}

export function GreetingCard({ nome }: GreetingCardProps) {
  // Validação defensiva: nome pode ser undefined
  const nomeValido = nome && nome.trim() ? nome : 'Visitante'
  const primeiroNome = nomeValido.split(' ')[0]
  const agora = new Date().getHours()
  const saudacao = agora < 12 ? 'Bom dia' : agora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{
      background: 'linear-gradient(135deg, #8B1A2F 0%, #6B1326 100%)',
      borderRadius: 12,
      padding: 24,
      marginBottom: 24,
      color: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.5px', opacity: 0.9, marginBottom: 4 }}>
        {saudacao}
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
        Bem-vindo, {primeiroNome}! 🩰
      </h1>
      <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>
        Bem-vindo de volta ao Studio Isabel Weneccess
      </p>
    </div>
  )
}

// ========== ALERT BANNER ==========
interface AlertBannerProps {
  show: boolean
  title: string
  message: string
  buttonText: string
  buttonHref: string
}

export function AlertBanner({ show, title, message, buttonText, buttonHref }: AlertBannerProps) {
  if (!show) return null

  return (
    <div style={{
      background: '#FEF3C7',
      border: '1px solid #FCD34D',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
          ⚠️ {title}
        </p>
        <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.4 }}>
          {message}
        </p>
      </div>
      <Link
        href={buttonHref}
        style={{
          background: '#92400E',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
          cursor: 'pointer',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.background = '#B45309'
          }
        }}
        onMouseLeave={(e) => {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.background = '#92400E'
          }
        }}
      >
        {buttonText}
      </Link>
    </div>
  )
}

// ========== JOURNEY STEP ==========
interface JourneyStepProps {
  numero: number
  titulo: string
  status: 'completed' | 'current' | 'pending'
}

function JourneyStep({ numero, titulo, status }: JourneyStepProps) {
  const statusColor = {
    completed: { bg: '#DCFAE6', text: '#166534', icon: '✓' },
    current: { bg: '#FEF3C7', text: '#92400E', icon: numero.toString() },
    pending: { bg: '#E8E0D8', text: '#6B6B6B', icon: numero.toString() },
  }

  const color = statusColor[status]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: color.bg,
          color: color.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 700,
          border: `2px solid ${color.text}`,
        }}
      >
        {color.icon}
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', textAlign: 'center', maxWidth: 80 }}>
        {titulo}
      </p>
    </div>
  )
}

interface JourneyContainerProps {
  anamnesePreenchida: boolean
  matriculadoEmTurma: boolean
  pagamentosEmDia: boolean
}

export function JourneyContainer({ anamnesePreenchida, matriculadoEmTurma, pagamentosEmDia }: JourneyContainerProps) {
  const steps = [
    { numero: 1, titulo: 'Cadastro', status: 'completed' as const },
    {
      numero: 2,
      titulo: 'Anamnese',
      status: anamnesePreenchida ? ('completed' as const) : ('current' as const),
    },
    {
      numero: 3,
      titulo: 'Matrícula',
      status: matriculadoEmTurma ? ('completed' as const) : anamnesePreenchida ? ('current' as const) : ('pending' as const),
    },
    {
      numero: 4,
      titulo: '1º Pagto',
      status: pagamentosEmDia ? ('completed' as const) : matriculadoEmTurma ? ('current' as const) : ('pending' as const),
    },
  ]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E8E0D8',
      padding: 24,
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 20 }}>
        Sua Jornada
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {steps.map((step) => (
          <JourneyStep key={step.numero} {...step} />
        ))}
      </div>
    </div>
  )
}

// ========== SUMMARY CARD ==========
interface SummaryCardProps {
  titulo: string
  valor: string | number
  descricao?: string
  icon?: string
  cor?: 'primary' | 'warning' | 'success' | 'danger'
}

export function SummaryCard({ titulo, valor, descricao, icon, cor = 'primary' }: SummaryCardProps) {
  const corMap = {
    primary: { bg: '#F0F4F8', text: '#1A1A1A' },
    warning: { bg: '#FEF3C7', text: '#92400E' },
    success: { bg: '#DCFAE6', text: '#166534' },
    danger: { bg: '#FEE2E2', text: '#991B1B' },
  }

  const coreSelecionada = corMap[cor]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E8E0D8',
      padding: 20,
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 8 }}>
          {titulo}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
          <p style={{ fontSize: 28, fontWeight: 700, color: coreSelecionada.text }}>
            {valor}
          </p>
        </div>
      </div>
      {descricao && (
        <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 8, lineHeight: 1.4 }}>
          {descricao}
        </p>
      )}
    </div>
  )
}

// ========== NEXT CLASS CARD ==========
interface NextClassCardProps {
  turma_nome?: string
  ritmo?: string
  professor?: string
  data?: string
  hora_inicio?: string
  hora_fim?: string
  onConfirm?: () => void
}

export function NextClassCard({
  turma_nome = 'Carregando...',
  ritmo = '',
  professor = '',
  data = '',
  hora_inicio = '',
  hora_fim = '',
  onConfirm,
}: NextClassCardProps) {
  const formatarData = (dataStr: string) => {
    if (!dataStr) return ''
    const date = new Date(dataStr + 'T00:00:00')
    const opcoes = { weekday: 'long' as const, day: '2-digit' as const, month: 'long' as const }
    return date.toLocaleDateString('pt-BR', opcoes).replace(/^(\w)/, (s) => s.toUpperCase())
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E8E0D8',
      padding: 20,
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 16 }}>
        Próxima Aula
      </h2>

      {data ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
              {turma_nome}
            </p>
            <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 12 }}>
              {ritmo}
            </p>

            <div style={{
              background: '#F5F0EB',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E', marginBottom: 4 }}>Data</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                    {formatarData(data)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E', marginBottom: 4 }}>Horário</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                    {hora_inicio} - {hora_fim}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E8E0D8', paddingTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E', marginBottom: 4 }}>Professor</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                  {professor}
                </p>
              </div>
            </div>

            <button
              onClick={onConfirm}
              style={{
                width: '100%',
                background: '#8B1A2F',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#6B1326'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#8B1A2F'
              }}
            >
              Confirmar Presença
            </button>
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13, padding: '20px 0' }}>
          Nenhuma aula agendada no momento.
        </p>
      )}
    </div>
  )
}

// ========== ACTION BUTTONS ==========
interface ActionButtonsProps {
  onAnamneseClick?: () => void
  onTurmasClick?: () => void
  onPagamentosClick?: () => void
  onContatoClick?: () => void
}

export function ActionButtons({
  onAnamneseClick,
  onTurmasClick,
  onPagamentosClick,
  onContatoClick,
}: ActionButtonsProps) {
  const buttons = [
    { label: 'Ver Turmas', href: '/area-aluno/turmas', icon: '💃' },
    { label: 'Pagamentos', href: '/area-aluno/pagamentos', icon: '💳' },
    { label: 'Anamnese', href: '/area-aluno/anamnese', icon: '🏥' },
    { label: 'Falar com Studio', href: 'https://wa.me/5511999999999', icon: '💬' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      marginBottom: 24,
    }}>
      {buttons.map((btn, idx) => (
        <Link
          key={idx}
          href={btn.href}
          style={{
            background: '#fff',
            border: '1px solid #E8E0D8',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
            el.style.borderColor = '#C9A96E'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = 'none'
            el.style.borderColor = '#E8E0D8'
          }}
        >
          <span style={{ fontSize: 24 }}>{btn.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
            {btn.label}
          </span>
        </Link>
      ))}
    </div>
  )
}

// ========== RECENT ACTIVITY LIST ==========
interface ActivityItem {
  tipo: string
  titulo: string
  descricao: string
  timestamp: string
  icon: string
}

interface RecentActivityListProps {
  atividades?: ActivityItem[]
  loading?: boolean
}

export function RecentActivityList({ atividades = [], loading = false }: RecentActivityListProps) {
  const formatarTempo = (dataStr: string) => {
    const agora = new Date()
    const data = new Date(dataStr)
    const diff = Math.floor((agora.getTime() - data.getTime()) / 1000)

    if (diff < 60) return 'Há poucos segundos'
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} minutos`
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)} horas`
    if (diff < 604800) return `Há ${Math.floor(diff / 86400)} dias`
    return data.toLocaleDateString('pt-BR')
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E8E0D8',
      padding: 24,
    }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 16 }}>
        Atividade Recente
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13, padding: '20px 0' }}>
          Carregando atividades...
        </p>
      ) : atividades.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13, padding: '20px 0' }}>
          Nenhuma atividade recente
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {atividades.map((ativ, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 12,
                paddingBottom: 12,
                borderBottom: idx < atividades.length - 1 ? '1px solid #E8E0D8' : 'none',
              }}
            >
              <div style={{ fontSize: 20 }}>{ativ.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>
                  {ativ.titulo}
                </p>
                <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 4 }}>
                  {ativ.descricao}
                </p>
                <p style={{ fontSize: 11, color: '#999' }}>
                  {formatarTempo(ativ.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
