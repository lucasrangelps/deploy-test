import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const TurmaSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  id_ritmo: z.string().uuid('Ritmo inválido'),
  id_professor: z.string().uuid('Professor inválido'),
  nivel: z.enum(['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']),
  dias_semana: z.array(
    z.enum(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'])
  ).min(1, 'Selecione ao menos um dia'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  capacidade_maxima: z.number().int().positive(),
  valor_avulso: z.number().positive().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
})

// GET /api/turmas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id_ritmo = searchParams.get('id_ritmo')
    const id_professor = searchParams.get('id_professor')

    let query = supabaseAdmin
      .from('turmas')
      .select(`
        *,
        ritmos ( id_ritmo, nome ),
        professores (
          id_professor,
          usuarios ( nome_completo )
        ),
        matriculas_turmas (
          id_matricula
        )
      `)
      .order('nome', { ascending: true })

    if (id_ritmo)     query = query.eq('id_ritmo', id_ritmo)
    if (id_professor) query = query.eq('id_professor', id_professor)

    const { data, error } = await query

    if (error) throw error

    // Enriquecer dados com contagem de vagas
    const turmasEnriquecidas = data?.map((turma: any) => {
      const alunos_matriculados = turma.matriculas_turmas?.length || 0
      const vagas_disponiveis = turma.capacidade_maxima - alunos_matriculados

      return {
        ...turma,
        alunos_matriculados,
        vagas_disponiveis,
        professor: turma.professores?.usuarios?.nome_completo || null,
        ritmo: turma.ritmos?.nome || null,
        matriculas_turmas: undefined, // remover array de detalhes
      }
    })

    return NextResponse.json(turmasEnriquecidas)
  } catch (error) {
    console.error('[GET TURMAS]', error)
    return NextResponse.json({ erro: 'Erro ao buscar turmas' }, { status: 500 })
  }
}

// POST /api/turmas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = TurmaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Valida se ritmo existe
    const { data: ritmo } = await supabaseAdmin
      .from('ritmos')
      .select('id_ritmo')
      .eq('id_ritmo', parsed.data.id_ritmo)
      .single()

    if (!ritmo) {
      return NextResponse.json({ erro: 'Ritmo não encontrado' }, { status: 404 })
    }

    // Valida se professor existe e está ativo
    const { data: professor } = await supabaseAdmin
      .from('professores')
      .select('id_professor')
      .eq('id_professor', parsed.data.id_professor)
      .single()

    if (!professor) {
      return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('turmas')
      .insert(parsed.data)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST TURMAS]', error)
    return NextResponse.json({ erro: 'Erro ao criar turma' }, { status: 500 })
  }
}