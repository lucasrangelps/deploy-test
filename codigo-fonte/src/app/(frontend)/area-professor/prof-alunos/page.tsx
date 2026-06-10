'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Aluno {
  id_aluno: string
  nome_completo: string
  email: string
  turmas: string[]
}

export default function ProfAlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAlunos() {
      try {
        const res = await fetchWithAuth('/api/professor/alunos')

        if (!res.ok) {
          const data = await res.json()
          setErro(data.erro ?? 'Erro ao carregar alunos')
          return
        }

        const data = await res.json()
        setAlunos(data.alunos ?? [])
      } catch {
        setErro('Não foi possível carregar os alunos')
      } finally {
        setLoading(false)
      }
    }
    fetchAlunos()
  }, [])

  if (loading) {
    return (
      <div className="p-7 flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#7a1535] border-t-transparent animate-spin mb-4" />
        <p className="text-[13.5px] text-[#7b6f8a]">Carregando alunos...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="p-7 flex flex-col items-center justify-center min-h-[360px]">
        <p className="text-[13.5px] text-red-500">{erro}</p>
      </div>
    )
  }

  if (alunos.length === 0) {
    return (
      <div className="p-7">
        <p className="text-[13px] text-[#7b6f8a] mb-7">
          <span className="font-medium text-[#1A1A1A]">0</span> aluno(s) nas suas turmas
        </p>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <svg className="w-[72px] h-[56px] mb-5 opacity-30" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="12" r="9" fill="#8B1A2F" />
            <path d="M22 44c0-9.941 8.059-18 18-18s18 8.059 18 18" fill="#8B1A2F" />
            <circle cx="24" cy="14" r="9" fill="#C9A96E" />
            <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" fill="#C9A96E" />
          </svg>
          <h3 className="font-['Playfair_Display'] text-[19px] font-semibold text-[#1A1A1A] mb-2">
            Nenhum aluno ainda
          </h3>
          <p className="text-[13.5px] text-[#6B6B6B] text-center max-w-[280px] leading-relaxed">
            Seus alunos aparecerão aqui quando fizerem matrícula.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-7">
      <p className="text-[13px] text-[#7b6f8a] mb-5">
        <span className="font-medium text-[#1A1A1A]">{alunos.length}</span> aluno(s) nas suas turmas
      </p>

      <div className="flex flex-col gap-3">
        {alunos.map(aluno => (
          <div
            key={aluno.id_aluno}
            className="bg-white rounded-2xl border border-[#E8E0D8] px-5 py-4 flex items-center gap-4"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#8B1A2F] text-white flex items-center justify-center text-[14px] font-semibold flex-shrink-0">
              {aluno.nome_completo.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#1A1A1A] truncate">{aluno.nome_completo}</p>
              <p className="text-[12px] text-[#6B6B6B] truncate">{aluno.email}</p>
            </div>

            {/* Turmas */}
            <div className="flex flex-wrap gap-1.5 justify-end">
              {aluno.turmas.map(t => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ background: 'rgba(139,26,47,0.12)', color: '#8B1A2F' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

