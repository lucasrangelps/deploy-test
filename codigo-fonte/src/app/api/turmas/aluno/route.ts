// src/app/api/turmas/aluno/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// GET /api/turmas/aluno?id_aluno=<uuid>
export async function GET(req: NextRequest) {
  const id_aluno = req.nextUrl.searchParams.get('id_aluno')
  if (!id_aluno)
    return NextResponse.json({ erro: 'id_aluno obrigatório.' }, { status: 400 })

  const { data, error } = await supabase()
    .from('matriculas_turmas')
    .select(`
      turmas (
        id_turma,
        nome,
        dia_semana,
        hora_inicio,
        hora_fim,
        ritmos (
          nome
        )
      )
    `)
    .eq('id_aluno', id_aluno)

  if (error) {
    console.error('[GET /api/turmas/aluno]', error)
    return NextResponse.json({ erro: 'Erro ao buscar turmas.' }, { status: 500 })
  }

  const turmas = (data ?? []).map((r: any) => r.turmas).filter(Boolean)

  return NextResponse.json({ data: turmas })
}
