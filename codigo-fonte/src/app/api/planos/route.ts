import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const PlanoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  ciclo_meses: z.number().int().positive('Ciclo deve ser positivo'),
  valor_base: z.number().positive('Valor deve ser positivo'),
  percentual_desconto: z.number().min(0).max(100).default(0),
  ativo: z.boolean().default(true),
})

// GET /api/planos
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('planos')
      .select('*')
      .order('ciclo_meses', { ascending: true })

    if (error) throw error

    // Calcula valor final de cada plano
    const resultado = data.map((plano: any) => ({
      ...plano,
      valor_final: plano.valor_base * (1 - plano.percentual_desconto / 100),
    }))

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('[GET PLANOS]', error)
    return NextResponse.json({ erro: 'Erro ao buscar planos' }, { status: 500 })
  }
}

// POST /api/planos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = PlanoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Verifica se já existe plano com mesmo nome
    const { data: existente } = await supabaseAdmin
      .from('planos')
      .select('id_plano')
      .eq('nome', parsed.data.nome)
      .single()

    if (existente) {
      return NextResponse.json(
        { erro: 'Já existe um plano com esse nome' },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('planos')
      .insert(parsed.data)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        ...data,
        valor_final: data.valor_base * (1 - data.percentual_desconto / 100),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST PLANOS]', error)
    return NextResponse.json({ erro: 'Erro ao criar plano' }, { status: 500 })
  }
}