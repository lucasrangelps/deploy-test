import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/presenca?id_aula=xxx
export async function GET(req: NextRequest) {
  try {
    const id_aula = req.nextUrl.searchParams.get('id_aula')

    if (!id_aula) {
      return NextResponse.json({ erro: 'id_aula e obrigatorio.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('agendamento_aulas')
      .select(`
        *,
        alunos (
          id_aluno,
          usuarios ( nome_completo )
        )
      `)
      .eq('id_aula', id_aula)

    if (error) {
      console.error('[PRESENCA GET]', error)
      return NextResponse.json({ erro: 'Erro ao buscar presenca.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[PRESENCA GET]', err)
    return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
  }
}

// POST /api/presenca
// Body: { id_aula: string, presencas: [{ id_aluno: string, status_presenca: 'presente' | 'ausente' }] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id_aula, presencas } = body

    if (!id_aula || !presencas || !Array.isArray(presencas)) {
      return NextResponse.json(
        { erro: 'id_aula e array de presencas sao obrigatorios.' },
        { status: 400 }
      )
    }

    let registrados = 0

    for (const p of presencas) {
      // Upsert: atualiza se ja existe, cria se nao
      const { data: existente } = await supabaseAdmin
        .from('agendamento_aulas')
        .select('id_agendamento')
        .eq('id_aula', id_aula)
        .eq('id_aluno', p.id_aluno)
        .maybeSingle()

      if (existente) {
        await supabaseAdmin
          .from('agendamento_aulas')
          .update({ status_presenca: p.status_presenca })
          .eq('id_agendamento', existente.id_agendamento)
      } else {
        await supabaseAdmin
          .from('agendamento_aulas')
          .insert({
            id_aula,
            id_aluno: p.id_aluno,
            status_presenca: p.status_presenca,
          })
      }
      registrados++
    }

    return NextResponse.json({
      mensagem: 'Presenca registrada.',
      registros: registrados,
    })
  } catch (err) {
    console.error('[PRESENCA POST]', err)
    return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
  }
}