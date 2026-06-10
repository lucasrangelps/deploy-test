// src/app/api/alunos/:id/proxima-aula
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/alunos/:id/proxima-aula
// Retorna a próxima aula agendada do aluno
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: id_aluno } = await params

    // Validar que aluno existe
    const { data: aluno } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno')
      .eq('id_aluno', id_aluno)
      .single()

    if (!aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    // Buscar todas as turmas onde o aluno está matriculado (status ativa)
    const { data: matriculas } = await supabaseAdmin
      .from('matriculas_turmas')
      .select('id_turma')
      .eq('id_aluno', id_aluno)
      .eq('status', 'ativa')

    if (!matriculas || matriculas.length === 0) {
      return NextResponse.json({
        proxima_aula: null,
        mensagem: 'Nenhuma turma ativa',
      })
    }

    const turmaIds = matriculas.map(m => m.id_turma)

    // Buscar a próxima aula agora (data >= hoje, não cancelada)
    const hoje = new Date().toISOString().split('T')[0]

    const { data: aulas } = await supabaseAdmin
      .from('aulas_agenda')
      .select(`
        id_aula,
        data,
        hora_inicio,
        hora_fim,
        observacao,
        cancelada,
        turmas (
          id_turma,
          nome,
          ritmos ( nome ),
          professores (
            id_professor,
            usuarios ( nome_completo )
          )
        )
      `)
      .in('id_turma', turmaIds)
      .eq('cancelada', false)
      .gte('data', hoje)
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(1)

    if (!aulas || aulas.length === 0) {
      return NextResponse.json({
        proxima_aula: null,
        mensagem: 'Nenhuma aula agendada',
      })
    }

    const aula = aulas[0]
    const turma = aula.turmas as any
    const professor = turma?.professores?.[0]?.usuarios?.nome_completo || 'Sem professor'
    const ritmo = turma?.ritmos?.nome || 'Desconhecido'

    const resposta = {
      proxima_aula: {
        id_aula: aula.id_aula,
        id_turma: turma?.id_turma,
        data: aula.data,
        hora_inicio: aula.hora_inicio,
        hora_fim: aula.hora_fim,
        turma_nome: turma?.nome,
        ritmo: ritmo,
        professor: professor,
        observacao: aula.observacao,
      },
    }

    return NextResponse.json(resposta)
  } catch (error) {
    console.error('[GET /api/alunos/:id/proxima-aula]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
