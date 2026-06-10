import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const AtualizarLeadSchema = z.object({
  nome: z.string().min(2).max(150).optional(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  ritmo_interesse: z.string().max(50).optional().nullable(),
  status: z.enum(['novo', 'em_contato', 'convertido', 'perdido']).optional(),
  origem: z
    .enum(['Indicação', 'Instagram', 'Site', 'WhatsApp', 'Outro'])
    .optional()
    .nullable(),
  observacoes: z.string().max(500).optional().nullable(),
})

// GET /api/leads/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id_lead', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ erro: 'Lead não encontrado' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET LEAD ID]', error)
    return NextResponse.json({ erro: 'Erro ao buscar lead' }, { status: 500 })
  }
}

// PUT /api/leads/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = AtualizarLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Confirma que o lead existe
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id_lead, status')
      .eq('id_lead', id)
      .single()

    if (leadErr || !lead) {
      return NextResponse.json({ erro: 'Lead não encontrado' }, { status: 404 })
    }

    const atualizacoes: Record<string, unknown> = { ...parsed.data }

    // Se convertendo, registra timestamp de conversão
    if (parsed.data.status === 'convertido' && lead.status !== 'convertido') {
      atualizacoes.convertido_em = new Date().toISOString()
    }

    const { data: atualizado, error: updateErr } = await supabaseAdmin
      .from('leads')
      .update(atualizacoes)
      .eq('id_lead', id)
      .select()
      .single()

    if (updateErr) throw updateErr

    return NextResponse.json(atualizado)
  } catch (error) {
    console.error('[PUT LEAD ID]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar lead' }, { status: 500 })
  }
}
