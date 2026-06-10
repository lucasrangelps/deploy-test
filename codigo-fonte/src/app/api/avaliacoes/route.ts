// src/app/api/avaliacoes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function GET(req: NextRequest) {
  const params   = req.nextUrl.searchParams
  const id_aluno = params.get('id_aluno')
  const id_turma = params.get('id_turma')
  const medias   = params.get('medias')

  // ── 1. Avaliações de um aluno específico ────────────────────────────────
  if (id_aluno) {
    const { data, error } = await supabase()
      .from('avaliacoes_aulas')
      .select('id_avaliacao, id_turma, nota, comentario, criado_em')
      .eq('id_aluno', id_aluno)

    if (error) {
      console.error('[GET /api/avaliacoes] id_aluno', error)
      return NextResponse.json({ erro: 'Erro ao buscar avaliações.' }, { status: 500 })
    }
    return NextResponse.json({ data })
  }

  // ── 2. Detalhe de uma turma ─────────────────────────────────────────────
  //    avaliacoes_aulas → alunos → usuarios (nome_completo)
  if (id_turma) {
    const { data, error } = await supabase()
      .from('avaliacoes_aulas')
      .select(`
        id_avaliacao,
        nota,
        comentario,
        criado_em,
        alunos (
          usuarios ( nome_completo )
        )
      `)
      .eq('id_turma', id_turma)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('[GET /api/avaliacoes] id_turma', error)
      return NextResponse.json({ erro: 'Erro ao buscar avaliações da turma.' }, { status: 500 })
    }
    return NextResponse.json({ data })
  }

  // ── 3. Médias por turma (dashboard de gestão) ───────────────────────────
  //    avaliacoes_aulas → turmas → ritmos (nome)
  //                             → professores → usuarios (nome_completo)
  if (medias === 'true') {
    const { data, error } = await supabase()
      .from('avaliacoes_aulas')
      .select(`
        id_turma,
        nota,
        turmas (
          nome,
          ritmos ( nome ),
          professores (
            usuarios ( nome_completo )
          )
        )
      `)

    if (error) {
      console.error('[GET /api/avaliacoes] medias', error)
      return NextResponse.json({ erro: 'Erro ao buscar médias.' }, { status: 500 })
    }

    // Agrega por turma no servidor
    const turmasMap = new Map<string, {
      id_turma:       string
      turma_nome:     string
      professor_nome: string
      ritmo:          string
      notas:          number[]
    }>()

    for (const row of (data ?? []) as any[]) {
      if (!turmasMap.has(row.id_turma)) {
        turmasMap.set(row.id_turma, {
          id_turma:       row.id_turma,
          turma_nome:     row.turmas?.nome                                   ?? '—',
          professor_nome: row.turmas?.professores?.usuarios?.nome_completo   ?? '—',
          ritmo:          row.turmas?.ritmos?.nome                           ?? '—',
          notas:          [],
        })
      }
      turmasMap.get(row.id_turma)!.notas.push(row.nota)
    }

    const resultado = [...turmasMap.values()].map(t => {
      const total = t.notas.length
      const media = total ? t.notas.reduce((s, n) => s + n, 0) / total : 0
      return {
        id_turma:          t.id_turma,
        turma_nome:        t.turma_nome,
        professor_nome:    t.professor_nome,
        ritmo:             t.ritmo,
        total_avaliacoes:  total,
        media_nota:        media,
        cinco_estrelas:    t.notas.filter(n => n === 5).length,
        quatro_estrelas:   t.notas.filter(n => n === 4).length,
        ate_tres_estrelas: t.notas.filter(n => n <= 3).length,
      }
    })

    return NextResponse.json({ data: resultado })
  }

  return NextResponse.json(
    { erro: 'Informe id_aluno, id_turma ou medias=true.' },
    { status: 400 },
  )
}

// POST — sem alterações
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.id_aluno || !body?.id_turma || !body?.nota)
    return NextResponse.json(
      { erro: 'Campos obrigatórios: id_aluno, id_turma, nota.' },
      { status: 400 },
    )

  const nota = Number(body.nota)
  if (!Number.isInteger(nota) || nota < 1 || nota > 5)
    return NextResponse.json({ erro: 'Nota deve ser entre 1 e 5.' }, { status: 400 })

  const { data, error } = await supabase()
    .from('avaliacoes_aulas')
    .upsert(
      {
        id_aluno:   body.id_aluno,
        id_turma:   body.id_turma,
        nota,
        comentario: body.comentario ?? null,
        criado_em:  new Date().toISOString(),
      },
      { onConflict: 'id_aluno,id_turma' },
    )
    .select()
    .single()

  if (error) {
    console.error('[POST /api/avaliacoes]', error)
    return NextResponse.json({ erro: 'Erro ao salvar avaliação.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}