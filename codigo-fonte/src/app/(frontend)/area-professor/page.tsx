'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface DashboardData {
  nome_completo: string
  especialidade: string
  turmas_ativas: number
  total_alunos: number
  aulas_hoje: number
}

export default function ProfHomePage() {
  const [dados, setDados] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchWithAuth('/api/professor/dashboard')
      .then((r) => r.json())
      .then((json) => {
        if (!json.erro) setDados(json)
      })
      .catch(console.error)
  }, [])

  const primeiroNome = dados?.nome_completo?.split(' ')[0] ?? '...'

  return (
    <div style={{ padding: '1rem 1.25rem' }}>

      {/* Hero banner */}
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-1">
          Olá, {primeiroNome}! 👋
        </h2>
        <p className="text-[13px] opacity-80 mb-5">{dados?.especialidade ?? '—'}</p>
        <div className="flex flex-row gap-3">
          <div className="flex-1 rounded-xl p-4 text-center border border-[#E8E0D8]" style={{ background: '#FFFFFF' }}>
            <p className="font-['Playfair_Display'] text-[26px] font-bold leading-none text-[#1A1A1A]">
              {dados?.turmas_ativas ?? '—'}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B6B6B] mt-1.5">Turmas ativas</p>
          </div>
          <div className="flex-1 rounded-xl p-4 text-center border border-[#E8E0D8]" style={{ background: '#FFFFFF' }}>
            <p className="font-['Playfair_Display'] text-[26px] font-bold leading-none text-[#1A1A1A]">
              {dados?.total_alunos ?? '—'}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B6B6B] mt-1.5">Alunos</p>
          </div>
          <div className="flex-1 rounded-xl p-4 text-center border border-[#E8E0D8]" style={{ background: '#FFFFFF' }}>
            <p className="font-['Playfair_Display'] text-[26px] font-bold leading-none text-[#1A1A1A]">
              {dados?.aulas_hoje ?? '—'}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B6B6B] mt-1.5">Aulas hoje</p>
          </div>
      </div>

      {/* Estado baseado em aulas hoje */}
      {dados && dados.aulas_hoje > 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[360px]">
          <div className="text-[58px] mb-4 leading-none">🎵</div>
          <h3 className="font-['Playfair_Display'] text-[19px] font-semibold text-[#1A1A1A] mb-2">
            Você tem {dados.aulas_hoje} aula{dados.aulas_hoje > 1 ? 's' : ''} hoje!
          </h3>
          <p className="text-[13.5px] text-[#6B6B6B] text-center max-w-[320px] leading-relaxed">
            Confira sua agenda para ver os horários e turmas do dia.
          </p>
          <Link
            href="/area-professor/prof-agenda"
            className="mt-6 px-7 py-3 bg-[#8B1A2F] text-white rounded-xl text-[13px] font-semibold tracking-[0.06em] uppercase hover:bg-[#B5283D] transition-colors no-underline"
          >
            Ver Agenda do Mês
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[360px]">
          <div className="text-[58px] mb-4 leading-none opacity-85">🎉</div>
          <h3 className="font-['Playfair_Display'] text-[19px] font-semibold text-[#1A1A1A] mb-2">
            Sem aulas hoje
          </h3>
          <p className="text-[13.5px] text-[#6B6B6B] text-center max-w-[320px] leading-relaxed">
            Aproveite o descanso! Veja sua agenda mensal para os próximos dias.
          </p>
          <Link
            href="/area-professor/prof-agenda"
            className="mt-6 px-7 py-3 bg-[#8B1A2F] text-white rounded-xl text-[13px] font-semibold tracking-[0.06em] uppercase hover:bg-[#B5283D] transition-colors no-underline"
          >
            Ver Agenda do Mês
          </Link>
        </div>
      )}

    </div>
  )
}
