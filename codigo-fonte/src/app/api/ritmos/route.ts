import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const RitmoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  descricao: z.string().optional(),
  imagem_url: z.string().url().optional().or(z.literal('')),
  ativo: z.boolean().default(true),
})

// GET /api/ritmos
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('ritmos')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET RITMOS]', error)
    return NextResponse.json({ erro: 'Erro ao buscar ritmos' }, { status: 500 })
  }
}

// POST /api/ritmos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = RitmoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ritmos')
      .insert(parsed.data)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST RITMOS]', error)
    return NextResponse.json({ erro: 'Erro ao criar ritmo' }, { status: 500 })
  }
}