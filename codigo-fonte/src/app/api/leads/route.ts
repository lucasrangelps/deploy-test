import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const LeadSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(150),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  ritmo_interesse: z.string().max(50).optional(),
  status: z.enum(['novo', 'em_contato', 'convertido', 'perdido']).default('novo'),
  origem: z
    .enum(['Indicação', 'Instagram', 'Site', 'WhatsApp', 'Outro'])
    .optional(),
  observacoes: z.string().max(500).optional(),
})

// GET /api/leads?status=&ritmo=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusFiltro = searchParams.get('status')
    const ritmo = searchParams.get('ritmo')

    let query = supabaseAdmin
      .from('leads')
      .select('*')
      .order('criado_em', { ascending: false })

    if (statusFiltro) query = query.eq('status', statusFiltro)
    if (ritmo) query = query.eq('ritmo_interesse', ritmo)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET LEADS]', error)
    return NextResponse.json({ erro: 'Erro ao buscar leads' }, { status: 500 })
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = LeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const payload = {
      ...parsed.data,
      email: parsed.data.email || null,
      telefone: parsed.data.telefone || null,
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST LEADS]', error)
    return NextResponse.json({ erro: 'Erro ao criar lead' }, { status: 500 })
  }
}
