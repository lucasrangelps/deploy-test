import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const AulaAgendaSchema = z.object({
  id_turma: z.string().uuid('Turma inválida'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  observacao: z.string().optional(),
  cancelada: z.boolean().default(false),
})

// GET /api/aulas-agenda
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')
    const id_professor = searchParams.get('id_professor')
    const id_turma = searchParams.get('id_turma')
    const cancelada = searchParams.get('cancelada')

    let query = supabaseAdmin
      .from('aulas_agenda')
      .select(`
        *,
        turmas (
          id_turma,
          nome,
          nivel,
          ritmos ( id_ritmo, nome ),
          professores (
            id_professor,
            usuarios ( nome_completo )
          )
        )
      `)
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (data_inicio) query = query.gte('data', data_inicio)
    if (data_fim)    query = query.lte('data', data_fim)
    if (id_turma)    query = query.eq('id_turma', id_turma)
    if (cancelada !== null) query = query.eq('cancelada', cancelada === 'true')

    // Filtro por professor via turma
    if (id_professor) {
      const { data: turmasProfessor } = await supabaseAdmin
        .from('turmas')
        .select('id_turma')
        .eq('id_professor', id_professor)

      const ids = turmasProfessor?.map((t: any) => t.id_turma) ?? []
      query = query.in('id_turma', ids)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET AULAS-AGENDA]', error)
    return NextResponse.json({ erro: 'Erro ao buscar agenda' }, { status: 500 })
  }
}

// POST /api/aulas-agenda
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = AulaAgendaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Valida se turma existe
    const { data: turma } = await supabaseAdmin
      .from('turmas')
      .select('id_turma, ativo')
      .eq('id_turma', parsed.data.id_turma)
      .single()

    if (!turma) {
      return NextResponse.json({ erro: 'Turma não encontrada' }, { status: 404 })
    }

    if (!turma.ativo) {
      return NextResponse.json({ erro: 'Turma inativa' }, { status: 400 })
    }

    // Verifica conflito de horário na mesma data
    const { data: conflito } = await supabaseAdmin
      .from('aulas_agenda')
      .select('id_aula_agenda')
      .eq('id_turma', parsed.data.id_turma)
      .eq('data', parsed.data.data)
      .eq('cancelada', false)
      .single()

    if (conflito) {
      return NextResponse.json(
        { erro: 'Já existe uma aula para essa turma nessa data' },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('aulas_agenda')
      .insert(parsed.data)
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

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST AULAS-AGENDA]', error)
    return NextResponse.json({ erro: 'Erro ao criar aula' }, { status: 500 })
  }
}