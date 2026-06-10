// src/hooks/useIdProfessor.ts
import { useState, useEffect } from 'react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export function useIdProfessor() {
  const [idProfessor,  setIdProfessor]  = useState<string | null>(null)
  const [nomeProfessor, setNomeProfessor] = useState<string>('')
  const [especialidade, setEspecialidade] = useState<string>('Instrutor')
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    async function resolver() {
      try {
        const res = await fetchWithAuth('/api/professor/me')
        if (!res.ok) return

        const { usuario } = await res.json()
        if (!usuario) return

        const prof = Array.isArray(usuario.professores)
          ? usuario.professores[0]
          : usuario.professores

        setIdProfessor(prof?.id_professor ?? null)
        setNomeProfessor(usuario.nome_completo ?? '')
        setEspecialidade(
          prof?.especialidade?.split(',')[0].trim() ?? 'Instrutor'
        )
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    resolver()
  }, [])

  return { idProfessor, nomeProfessor, especialidade, loading }
}