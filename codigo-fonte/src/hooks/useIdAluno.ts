// src/hooks/useIdAluno.ts

import { useState, useEffect } from 'react'

export function useIdAluno() {
  const [idAluno, setIdAluno] = useState<string | null>(null)
  const [idUsuario, setIdUsuario] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function resolver() {
      try {
        const raw = localStorage.getItem('usuario')
        if (!raw) return

        const parsed = JSON.parse(raw)

        // Sempre extrair id_usuario se disponível
        if (parsed.id_usuario) {
          setIdUsuario(parsed.id_usuario)
        }

        // Sessões novas já têm id_aluno (após correção do login)
        if (parsed.id_aluno) {
          setIdAluno(parsed.id_aluno)
          return
        }

        // Sessões antigas: busca pelo id_usuario e atualiza o localStorage
        const id_usuario = parsed.id_usuario
        if (!id_usuario) return

        const res = await fetch(`/api/alunos?id_usuario=${id_usuario}`)
        if (!res.ok) return

        const json = await res.json()
        const id = json.data?.id_aluno ?? null
        if (id) {
          setIdAluno(id)
          localStorage.setItem('usuario', JSON.stringify({ ...parsed, id_aluno: id }))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    resolver()
  }, [])

  return { idAluno, idUsuario, loading }
}
