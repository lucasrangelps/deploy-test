'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Ritmo {
  id_ritmo: string
  nome: string
}

interface Turma {
  id_turma: string
  nome: string
  capacidade_maxima: number
  ritmo: Ritmo | null
  total_alunos: number
  proxima_aula: string | null
}

// Cor de badge por ritmo (fallback para roxo)
const RITMO_COLORS: Record<string, { bg: string; text: string }> = {
  default: { bg: 'rgba(139,26,47,0.12)', text: '#8B1A2F' },
}

function getBadgeColor(ritmo: string | undefined) {
  if (!ritmo) return RITMO_COLORS.default
  return RITMO_COLORS[ritmo.toLowerCase()] ?? RITMO_COLORS.default
}

export default function ProfTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTurmas() {
      try {
        const res = await fetchWithAuth('/api/professor/turmas')

        if (!res.ok) {
          const data = await res.json()
          setErro(data.erro ?? 'Erro ao carregar turmas')
          return
        }

        const data = await res.json()
        setTurmas(data.turmas ?? [])
      } catch {
        setErro('Não foi possível carregar as turmas')
      } finally {
        setLoading(false)
      }
    }

    fetchTurmas()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '1rem 1.25rem' }}>
        <div className="flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-8 h-8 rounded-full border-2 border-[#7a1535] border-t-transparent animate-spin mb-4" />
          <p className="text-[13.5px] text-[#7b6f8a]">Carregando turmas...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div style={{ padding: '1rem 1.25rem' }}>
        <div className="flex flex-col items-center justify-center min-h-[360px]">
          <p className="text-[13.5px] text-red-500">{erro}</p>
        </div>
      </div>
    )
  }

  if (turmas.length === 0) {
    return (
      <div style={{ padding: '1rem 1.25rem' }}>
        <div className="flex flex-col items-center justify-center min-h-[360px]">
          <svg className="w-[72px] h-[72px] mb-5 opacity-85" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="62" r="12" fill="#8B1A2F" opacity="0.9" />
            <circle cx="56" cy="54" r="12" fill="#C9A96E" opacity="0.75" />
            <rect x="32" y="10" width="6" height="52" rx="3" fill="#8B1A2F" opacity="0.85" />
            <rect x="62" y="4" width="6" height="50" rx="3" fill="#C9A96E" opacity="0.75" />
            <rect x="32" y="10" width="36" height="7" rx="3.5" fill="#8B1A2F" opacity="0.85" />
          </svg>
          <h3 className="font-['Playfair_Display'] text-[19px] font-semibold text-[#1A1A1A] mb-2">
            Sem turmas atribuídas
          </h3>
          <p className="text-[13.5px] text-[#6B6B6B] text-center max-w-[320px] leading-relaxed">
            O administrador ainda não te atribuiu turmas. Entre em contato com o estúdio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem 1.25rem' }}>
      <p className="text-[13px] text-[#6B6B6B] mb-4">{turmas.length} turma(s) atribuída(s)</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {turmas.map((turma) => {
          const badge = getBadgeColor(turma.ritmo?.nome)
          return (
            <div
              key={turma.id_turma}
              className="bg-white rounded-2xl border border-[#E8E0D8]"
              style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              {/* Ícone de ritmo */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0"
                style={{ background: badge.bg }}
              >
                🎵
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="font-['Playfair_Display'] text-[16px] font-semibold text-[#1A1A1A]">
                    {turma.nome}
                  </span>
                  {turma.ritmo && (
                    <span
                      className="text-[11px] font-medium rounded-full px-2.5 py-0.5"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {turma.ritmo.nome}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[13px] text-[#6B6B6B]">
                    {turma.total_alunos ?? 0}/{turma.capacidade_maxima} aluno(s)
                  </p>
                  {turma.proxima_aula && (
                    <p className="text-[12px] text-[#6B6B6B]">
                      Próxima:{' '}
                      <span className="font-medium text-[#1A1A1A]">
                        {new Date(turma.proxima_aula).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short',
                        })}
                        {' às '}
                        {new Date(turma.proxima_aula).toLocaleTimeString('pt-BR', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
