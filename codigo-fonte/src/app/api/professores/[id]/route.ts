import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const ProfessorUpdateSchema = z.object({
  telefone: z.string().optional(),
  data_nascimento: z.string().optional(),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  especialidade: z.string().optional(),
  bio: z.string().optional(),
  foto_url: z.string().url().optional().or(z.literal('')),
  ativo: z.boolean().optional(),
})

// GET /api/professores/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('professores')
      .select(`
        *,
        usuarios (
          id_usuario,
          nome_completo,
          email,
          tipo_perfil
        ),
        turmas (
          id_turma,
          nome,
          nivel,
          dias_semana,
          hora_inicio,
          hora_fim,
          capacidade_maxima,
          ativo,
          ritmos ( id_ritmo, nome ),
          matriculas ( id_matricula, status )
        )
      `)
      .eq('id_professor', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
    }

    // Enriquece dados das turmas
    const turmasEnriquecidas = data.turmas?.map((turma: any) => ({
      ...turma,
      total_alunos: turma.matriculas?.filter(
        (m: any) => m.status === 'ATIVO'
      ).length ?? 0,
    }))

    return NextResponse.json({
      ...data,
      turmas: turmasEnriquecidas,
      total_turmas_ativas: turmasEnriquecidas?.filter((t: any) => t.ativo).length ?? 0,
    })
  } catch (error) {
    console.error('[GET PROFESSOR/:id]', error)
    return NextResponse.json({ erro: 'Erro ao buscar professor' }, { status: 500 })
  }
}

// PUT /api/professores/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = ProfessorUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Atualiza tabela professores
    const { data, error } = await supabaseAdmin
      .from('professores')
      .update(parsed.data)
      .eq('id_professor', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
    }

    // Se vier nome_completo, atualiza também na tabela usuarios
    if (body.nome_completo) {
      await supabaseAdmin
        .from('usuarios')
        .update({ nome_completo: body.nome_completo })
        .eq('id_usuario', data.id_usuario)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT PROFESSOR/:id]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar professor' }, { status: 500 })
  }
}