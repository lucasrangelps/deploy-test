// src/app/api/pagamentos/pix/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const PagamentoPIXSchema = z.object({
  id_parcela: z.string().uuid('id_parcela deve ser um UUID válido'),
  id_aluno: z.string().uuid('id_aluno deve ser um UUID válido'),
})

// POST /api/pagamentos/pix
// Gera QR Code PIX para uma parcela específica
export async function POST(req: NextRequest) {
  try {
    // Validar Bearer token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    // Validar token e obter user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Parsing e validação do body
    const body = await req.json()
    const validation = PagamentoPIXSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          erro: 'Validação falhou',
          detalhes: validation.error.flatten()
        },
        { status: 422 }
      )
    }

    const { id_parcela, id_aluno } = validation.data

    // Validar que aluno existe
    const { data: aluno, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno, id_usuario')
      .eq('id_aluno', id_aluno)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    // Validar que o usuário está operando sobre seu próprio pagamento
    const { data: usuarioAuth } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuarioAuth || usuarioAuth.id_usuario !== aluno.id_usuario) {
      return NextResponse.json({ erro: 'Sem permissão para gerar PIX para outro aluno' }, { status: 403 })
    }

    // Buscar parcela com validações
    const { data: parcela, error: parcelaError } = await supabaseAdmin
      .from('parcelas')
      .select(`
        id_parcela,
        valor_cobrado,
        status,
        numero_parcela,
        contratos (
          id_aluno
        )
      `)
      .eq('id_parcela', id_parcela)
      .single()

    if (parcelaError || !parcela) {
      return NextResponse.json({ erro: 'Parcela não encontrada' }, { status: 404 })
    }

    // Validar que a parcela pertence ao aluno
    if (parcela.contratos[0].id_aluno !== id_aluno) {
      return NextResponse.json({ erro: 'Parcela não pertence a este aluno' }, { status: 403 })
    }

    // Validar que parcela está pendente
    if (parcela.status !== 'pendente') {
      return NextResponse.json({ erro: 'Parcela não pode ser paga (status não é pendente)' }, { status: 400 })
    }

    // ============================================
    // INTEGRAÇÃO MERCADO PAGO
    // ============================================
    // TODO: Implementar integração real com Mercado Pago quando credenciais forem configuradas
    // 
    // Passos necessários:
    // 1. Instalar: npm install mercadopago
    // 2. Importar: import { MercadoPago } from 'mercadopago'
    // 3. Configurar token: MercadoPago.accessToken = process.env.MERCADO_PAGO_TOKEN
    // 4. Chamar API de pagamento PIX:
    //    const result = await MercadoPago.payments.create({
    //      transaction_amount: parseFloat(parcela.valor_cobrado),
    //      description: `Pagamento parcela ${parcela.numero_parcela}`,
    //      payment_method_id: 'pix',
    //      payer: { email: usuario.email }
    //    })
    // 5. Extrair qr_code e id do resultado
    // ============================================

    // Simulação: Gerar dados fake para teste (remover em produção)
    const qrCodeFake = `00020126580014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx520400005303986540510.${parcela.valor_cobrado.toString().padStart(5, '0')}5802BR5913Danca Sala6009SAO PAULO62410503***63041D3D`
    const idPagamentoFake = `pix_test_${Date.now()}`

    // Registrar tentativa de pagamento (será confirmado via webhook)
    const { data: novoPagamento, error: insertError } = await supabaseAdmin
      .from('pagamentos')
      .insert({
        id_parcela,
        metodo: 'pix',
        id_gateway: idPagamentoFake,
        data_pagamento: new Date().toISOString(),
        valor_pago: parcela.valor_cobrado,
        status: 'aguardando_confirmacao',
      })
      .select('id_pagamento')
      .single()

    if (insertError) {
      console.error('[POST /api/pagamentos/pix] Insert pagamento error', insertError)
      return NextResponse.json({ erro: 'Erro ao registrar pagamento' }, { status: 500 })
    }

    // Retornar QR Code para aluno escanear
    return NextResponse.json({
      id_pagamento: novoPagamento.id_pagamento,
      id_parcela,
      valor: parcela.valor_cobrado,
      qr_code: qrCodeFake,
      qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // placeholder
      expira_em: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
      id_referencia: idPagamentoFake,
      status: 'aguardando_confirmacao',
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/pagamentos/pix]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
