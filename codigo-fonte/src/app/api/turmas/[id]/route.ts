import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const TurmaUpdateSchema = z.object({
  nome: z.string().min(2).optional(),
  id_ritmo: z.string().uuid().optional(),
  id_professor: z.string().uuid().optional(),
  nivel: z.enum(['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']).optional(),
  dias_semana: z.array(
    z.enum(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'])
  ).optional(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  capacidade_maxima: z.number().int().positive().optional(),
  valor_avulso: z.number().positive().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
})

// GET /api/turmas/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('turmas')
      .select(`
        *,
        ritmos ( id_ritmo, nome ),
        professores (
          id_professor,
          usuarios ( nome_completo, email )
        ),
        matriculas (
          id_matricula,
          status,
          data_matricula,
          alunos (
            id_aluno,
            usuarios ( nome_completo, email ),
            telefone
          )
        )
      `)
      .eq('id_turma', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Turma não encontrada' }, { status: 404 })
    }

    // Calcula vagas disponíveis
    const matriculasAtivas = data.matriculas?.filter(
      (m: any) => m.status === 'ATIVO'
    ).length ?? 0

    return NextResponse.json({
      ...data,
      vagas_ocupadas: matriculasAtivas,
      vagas_disponiveis: data.capacidade_maxima - matriculasAtivas,
    })
  } catch (error) {
    console.error('[GET TURMA/:id]', error)
    return NextResponse.json({ erro: 'Erro ao buscar turma' }, { status: 500 })
  }
}

// PUT /api/turmas/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = TurmaUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Se mudar professor, valida existência
    if (parsed.data.id_professor) {
      const { data: professor } = await supabaseAdmin
        .from('professores')
        .select('id_professor')
        .eq('id_professor', parsed.data.id_professor)
        .single()

      if (!professor) {
        return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('turmas')
      .update(parsed.data)
      .eq('id_turma', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Turma não encontrada' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT TURMA/:id]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar turma' }, { status: 500 })
  }
}