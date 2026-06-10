import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const PlanoUpdateSchema = z.object({
  nome: z.string().min(2).optional(),
  ciclo_meses: z.number().int().positive().optional(),
  valor_base: z.number().positive().optional(),
  percentual_desconto: z.number().min(0).max(100).optional(),
  ativo: z.boolean().optional(),
})

// GET /api/planos/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('planos')
      .select(`
        *,
        matriculas (
          id_matricula,
          status,
          alunos (
            id_aluno,
            usuarios ( nome_completo )
          )
        )
      `)
      .eq('id_plano', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Plano não encontrado' }, { status: 404 })
    }

    const matriculasAtivas = data.matriculas?.filter(
      (m: any) => m.status === 'ATIVO'
    ).length ?? 0

    return NextResponse.json({
      ...data,
      valor_final: data.valor_base * (1 - data.percentual_desconto / 100),
      total_matriculas_ativas: matriculasAtivas,
    })
  } catch (error) {
    console.error('[GET PLANO/:id]', error)
    return NextResponse.json({ erro: 'Erro ao buscar plano' }, { status: 500 })
  }
}

// PUT /api/planos/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = PlanoUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Se mudar nome, verifica duplicata
    if (parsed.data.nome) {
      const { data: existente } = await supabaseAdmin
        .from('planos')
        .select('id_plano')
        .eq('nome', parsed.data.nome)
        .neq('id_plano', id)
        .single()

      if (existente) {
        return NextResponse.json(
          { erro: 'Já existe um plano com esse nome' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('planos')
      .update(parsed.data)
      .eq('id_plano', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Plano não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      ...data,
      valor_final: data.valor_base * (1 - data.percentual_desconto / 100),
    })
  } catch (error) {
    console.error('[PUT PLANO/:id]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar plano' }, { status: 500 })
  }
}