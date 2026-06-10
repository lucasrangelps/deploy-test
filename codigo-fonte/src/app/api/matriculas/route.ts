import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const turma = searchParams.get('turma')
    const aluno = searchParams.get('aluno')

    let query = supabaseAdmin
      .from('matriculas_turmas')
      .select(`
        *,
        alunos (
          id_aluno,
          usuarios ( nome_completo, email )
        ),
        turmas ( id_turma, nome )
      `)

    if (turma) query = query.eq('id_turma', turma)
    if (aluno) query = query.eq('id_aluno', aluno)

    const { data, error } = await query

    if (error) {
      console.error('[MATRICULAS GET]', error)
      return NextResponse.json({ erro: 'Erro ao buscar matriculas.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[MATRICULAS GET]', err)
    return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id_aluno, id_turma } = body

    if (!id_aluno || !id_turma) {
      return NextResponse.json(
        { erro: 'Aluno e turma sao obrigatorios.' },
        { status: 400 }
      )
    }

    // Verificar se ja esta matriculado
    const { data: existente } = await supabaseAdmin
      .from('matriculas_turmas')
      .select('id_matricula')
      .eq('id_aluno', id_aluno)
      .eq('id_turma', id_turma)
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ erro: 'Aluno ja matriculado nesta turma.' }, { status: 409 })
    }

    // Verificar capacidade da turma
    const { data: turma } = await supabaseAdmin
      .from('turmas')
      .select('capacidade_maxima')
      .eq('id_turma', id_turma)
      .single()

    const { count: matriculados } = await supabaseAdmin
      .from('matriculas_turmas')
      .select('*', { count: 'exact', head: true })
      .eq('id_turma', id_turma)
      .eq('status', 'ativa')

    if (turma && matriculados !== null && matriculados >= turma.capacidade_maxima) {
      return NextResponse.json({ erro: 'Turma lotada.' }, { status: 409 })
    }

    const { data, error } = await supabaseAdmin
      .from('matriculas_turmas')
      .insert({ id_aluno, id_turma, status: 'pendente' })
      .select()
      .single()

    if (error) {
      console.error('[MATRICULAS POST]', error)
      return NextResponse.json({ erro: 'Erro ao criar matricula.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[MATRICULAS POST]', err)
    return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
  }
}