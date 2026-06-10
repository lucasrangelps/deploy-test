import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const NotaFiscalSchema = z.object({
  id_pagamento: z.string().uuid('ID de pagamento inválido'),
})

// POST /api/notas-fiscais — acionar gatilho de emissão de NFS-e
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = NotaFiscalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Confirma que o pagamento existe
    const { data: pagamento, error: pgtoErr } = await supabaseAdmin
      .from('pagamentos')
      .select('id_pagamento')
      .eq('id_pagamento', parsed.data.id_pagamento)
      .single()

    if (pgtoErr || !pagamento) {
      return NextResponse.json({ erro: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Verifica se já existe nota fiscal para este pagamento
    const { data: existente } = await supabaseAdmin
      .from('notas_fiscais')
      .select('id_nota, status_emissao')
      .eq('id_pagamento', parsed.data.id_pagamento)
      .maybeSingle()

    if (existente) {
      return NextResponse.json(
        { erro: 'Nota fiscal já solicitada para este pagamento', status_emissao: existente.status_emissao },
        { status: 409 }
      )
    }

    // Cria registro de nota fiscal com status 'pendente'
    const { data: nota, error: notaErr } = await supabaseAdmin
      .from('notas_fiscais')
      .insert({
        id_pagamento: parsed.data.id_pagamento,
        status_emissao: 'pendente',
      })
      .select()
      .single()

    if (notaErr) throw notaErr

    return NextResponse.json(
      { mensagem: 'Emissão de nota fiscal solicitada', id_nota: nota.id_nota },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST NOTAS-FISCAIS]', error)
    return NextResponse.json({ erro: 'Erro ao solicitar nota fiscal' }, { status: 500 })
  }
}
