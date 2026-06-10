import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/alunos/:id/turmas-matriculadas — lista otimizada de turmas ativas
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar turmas ativas (status = 'ativa') do aluno
    const { data: matriculas, error } = await supabaseAdmin
      .from('matriculas_turmas')
      .select(`
        id_matricula,
        id_turma,
        status,
        turmas (
          id_turma,
          nome,
          id_ritmo,
          id_professor,
          dia_semana,
          hora_inicio,
          hora_fim,
          ritmos ( id_ritmo, nome ),
          professores (
            id_professor,
            usuarios ( nome_completo )
          )
        )
      `)
      .eq('id_aluno', id)
      .in('status', ['ativa', 'pendente'])

    if (error) {
      console.error('[GET TURMAS MATRICULADAS]', error)
      return NextResponse.json(
        { erro: 'Erro ao buscar turmas matriculadas' },
        { status: 500 }
      )
    }

    // Formatar resposta
    const turmasFormatadas = (matriculas ?? []).map((m: any) => ({
      id_matricula: m.id_matricula,
      id_turma: m.id_turma,
      nome_turma: m.turmas?.nome ?? '',
      ritmo: m.turmas?.ritmos?.nome ?? '',
      professor: m.turmas?.professores?.usuarios?.nome_completo ?? '',
      dia_semana: m.turmas?.dia_semana ?? [],
      hora_inicio: m.turmas?.hora_inicio ?? '',
      hora_fim: m.turmas?.hora_fim ?? '',
      status: m.status,
    }))

    return NextResponse.json(turmasFormatadas)
  } catch (error) {
    console.error('[GET TURMAS MATRICULADAS]', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar turmas matriculadas' },
      { status: 500 }
    )
  }
}
