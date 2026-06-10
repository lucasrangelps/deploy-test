import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const AulaAgendaUpdateSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  observacao: z.string().optional(),
  cancelada: z.boolean().optional(),
})

// GET /api/aulas-agenda/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('aulas_agenda')
      .select(`
        *,
        turmas (
          id_turma,
          nome,
          nivel,
          capacidade_maxima,
          ritmos ( id_ritmo, nome ),
          professores (
            id_professor,
            usuarios ( nome_completo, email )
          ),
          matriculas (
            id_matricula,
            status,
            alunos (
              id_aluno,
              usuarios ( nome_completo )
            )
          )
        )
      `)
      .eq('id_aula_agenda', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Aula não encontrada' }, { status: 404 })
    }

    // Separa alunos matriculados ativos para lista de presença
    const alunosMatriculados = data.turmas?.matriculas
      ?.filter((m: any) => m.status === 'ATIVO')
      .map((m: any) => ({
        id_matricula: m.id_matricula,
        id_aluno: m.alunos?.id_aluno,
        nome: m.alunos?.usuarios?.nome_completo,
      })) ?? []

    return NextResponse.json({
      ...data,
      alunos_matriculados: alunosMatriculados,
      total_alunos: alunosMatriculados.length,
    })
  } catch (error) {
    console.error('[GET AULAS-AGENDA/:id]', error)
    return NextResponse.json({ erro: 'Erro ao buscar aula' }, { status: 500 })
  }
}

// PUT /api/aulas-agenda/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = AulaAgendaUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Se mudar data, verifica conflito
    if (parsed.data.data) {
      const { data: aulaAtual } = await supabaseAdmin
        .from('aulas_agenda')
        .select('id_turma')
        .eq('id_aula_agenda', id)
        .single()

      if (aulaAtual) {
        const { data: conflito } = await supabaseAdmin
          .from('aulas_agenda')
          .select('id_aula_agenda')
          .eq('id_turma', aulaAtual.id_turma)
          .eq('data', parsed.data.data)
          .eq('cancelada', false)
          .neq('id_aula_agenda', id)
          .single()

        if (conflito) {
          return NextResponse.json(
            { erro: 'Já existe uma aula para essa turma nessa data' },
            { status: 409 }
          )
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('aulas_agenda')
      .update(parsed.data)
      .eq('id_aula_agenda', id)
      .select(`
        *,
        turmas (
          nome,
          ritmos ( nome ),
          professores (
            usuarios ( nome_completo )
          )
        )
      `)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Aula não encontrada' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT AULAS-AGENDA/:id]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar aula' }, { status: 500 })
  }
}