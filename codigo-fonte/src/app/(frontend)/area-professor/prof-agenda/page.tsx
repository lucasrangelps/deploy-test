'use client'

import { useState, useEffect, useCallback } from 'react'
import Calendar from 'react-calendar'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

interface Aula {
  id_aula: string
  data_hora_inicio: string
  data_hora_fim: string
  tipo_aula: string
  status: string
  turmas: { nome: string; ritmos: { nome: string } | null } | null
}

function formatHora(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function toLocalDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function ProfAgendaPage() {
  const [activeStart, setActiveStart] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgenda = useCallback(async (date: Date) => {
    setLoading(true)

    const ano = date.getFullYear()
    const mes = date.getMonth() + 1
    try {
      const res = await fetchWithAuth(`/api/professor/agenda?ano=${ano}&mes=${mes}`)
      if (res.ok) {
        const data = await res.json()
        setAulas(data.aulas ?? [])
      }
    } catch { /* mantém estado vazio */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAgenda(activeStart) }, [activeStart, fetchAgenda])

  // mapa de dia → lista de aulas (em horário local)
  const aulasPorDia = aulas.reduce<Record<string, Aula[]>>((acc, a) => {
    const key = a.data_hora_inicio.slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  // aulas do dia selecionado
  const selectedKey = toLocalDateKey(selectedDate)
  const aulasDoDia = aulas
    .filter(a => a.data_hora_inicio.slice(0, 10) === selectedKey)
    .sort((a, b) => a.data_hora_inicio.localeCompare(b.data_hora_inicio))

  // turmas únicas no mês
  const turmasMes = new Set(
    aulas.map(a => a.turmas?.nome).filter(Boolean)
  ).size

  const currentMonth = MONTHS[activeStart.getMonth()]

  const selectedLabel = `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}, ${WEEKDAYS[selectedDate.getDay()]}`

  return (
    <div className="p-4">

      {/* Info cards */}
      <div className="flex gap-2 mb-4">
        <div className="bg-white rounded-xl border border-[#E8E0D8] px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] flex-shrink-0"
               style={{ background: 'rgba(139,26,47,0.12)' }}>🎭</div>
          <div>
            <p className="text-[11px] text-[#6B6B6B] leading-tight">Turmas neste mês</p>
            <p className="font-['Playfair_Display'] text-[20px] font-bold text-[#1A1A1A] leading-tight">
              {loading ? '…' : turmasMes}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E0D8] px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] flex-shrink-0"
               style={{ background: 'rgba(201,169,110,0.22)' }}>📅</div>
          <div>
            <p className="text-[11px] text-[#6B6B6B] leading-tight">Aulas em {currentMonth}</p>
            <p className="font-['Playfair_Display'] text-[20px] font-bold text-[#1A1A1A] leading-tight">
              {loading ? '…' : aulas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden mb-4">
        <Calendar
          className="prof-calendar"
          locale="pt-BR"
          formatShortWeekday={(_, date) =>
            ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][date.getDay()]
          }
          formatMonthYear={(_, date) =>
            `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
          }
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) setActiveStart(activeStartDate)
          }}
          onClickDay={(date) => setSelectedDate(date)}
          value={selectedDate}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null
            const key = toLocalDateKey(date)
            const items = aulasPorDia[key]
            if (!items?.length) return null
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                {items
                  .sort((a, b) => a.data_hora_inicio.localeCompare(b.data_hora_inicio))
                  .map(a => (
                    <span
                      key={a.id_aula}
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        lineHeight: '1',
                        background: '#8B1A2F',
                        color: '#fff',
                        borderRadius: '3px',
                        padding: '2px 3px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {formatHora(a.data_hora_inicio)}
                    </span>
                  ))}
              </div>
            )
          }}
          activeStartDate={activeStart}
          view="month"
          showNeighboringMonth
          prevLabel="‹"
          nextLabel="›"
          prev2Label={null}
          next2Label={null}
        />
      </div>

      {/* Aulas do dia selecionado */}
      <div className="bg-white rounded-2xl border border-[#E8E0D8] p-4">
        <p className="text-[12px] font-semibold text-[#6B6B6B] uppercase tracking-[0.08em] mb-3 capitalize">
          {selectedLabel}
        </p>

        {loading ? (
          <p className="text-[13px] text-[#6B6B6B] text-center py-4">Carregando…</p>
        ) : aulasDoDia.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-1">
            <span className="text-3xl">📭</span>
            <p className="text-[13px] text-[#6B6B6B] mt-1">Nenhuma aula neste dia</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {aulasDoDia.map(aula => (
              <div
                key={aula.id_aula}
                className="flex items-center gap-3 rounded-xl px-3 py-3 border border-[#E8E0D8]"
              >
                {/* Hora */}
                <div className="flex flex-col items-center min-w-[48px]">
                  <span className="text-[13px] font-bold text-[#8B1A2F] leading-none">
                    {formatHora(aula.data_hora_inicio)}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] mt-0.5">
                    {formatHora(aula.data_hora_fim)}
                  </span>
                </div>

                {/* Divisor vertical */}
                <div className="w-px self-stretch bg-[#E8E0D8]" />

                {/* Turma / ritmo */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">
                    {aula.turmas?.nome ?? 'Aula'}
                  </p>
                  {aula.turmas?.ritmos?.nome && (
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                      {aula.turmas.ritmos.nome}
                    </p>
                  )}
                </div>

                {/* Badge status */}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                  style={{
                    background: aula.status === 'agendada' ? '#dcfce7' : '#fce7f3',
                    color: aula.status === 'agendada' ? '#166534' : '#9d174d',
                  }}
                >
                  {aula.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

