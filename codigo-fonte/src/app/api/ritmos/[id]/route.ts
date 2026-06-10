import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const RitmoUpdateSchema = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  imagem_url: z.string().url().optional().or(z.literal('')),
  ativo: z.boolean().optional(),
})

// PUT /api/ritmos/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = RitmoUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ritmos')
      .update(parsed.data)
      .eq('id_ritmo', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ erro: 'Ritmo não encontrado' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT RITMOS]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar ritmo' }, { status: 500 })
  }
}