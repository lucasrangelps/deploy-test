import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const BaixaManualSchema = z.object({
  metodo: z.enum(['PIX', 'Cartão', 'Dinheiro', 'Boleto']),
  data_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  valor_pago: z.number().positive('Valor deve ser positivo'),
})

// GET /api/pagamentos/:id — detalhe da parcela
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: parcela, error } = await supabaseAdmin
      .from('parcelas')
      .select(`
        id_parcela,
        numero_parcela,
        valor_cobrado,
        data_vencimento,
        status,
        contratos (
          id_contrato,
          forma_pgto_padrao,
          planos ( nome, ciclo_meses, valor_base ),
          alunos (
            id_aluno,
            usuarios ( nome_completo, email )
          )
        ),
        pagamentos (
          id_pagamento,
          metodo,
          data_pagamento,
          valor_pago,
          notas_fiscais (
            id_nota,
            numero_nfse,
            status_emissao,
            xml_link,
            data_emissao
          )
        )
      `)
      .eq('id_parcela', id)
      .maybeSingle()

    if (error) throw error
    if (!parcela) {
      return NextResponse.json({ erro: 'Parcela não encontrada' }, { status: 404 })
    }

    return NextResponse.json(parcela)
  } catch (error) {
    console.error('[GET PAGAMENTO ID]', error)
    return NextResponse.json({ erro: 'Erro ao buscar parcela' }, { status: 500 })
  }
}

// PUT /api/pagamentos/:id — baixa manual
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = BaixaManualSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Confirma que a parcela existe e ainda não foi paga
    const { data: parcela, error: parcelaErr } = await supabaseAdmin
      .from('parcelas')
      .select('id_parcela, status')
      .eq('id_parcela', id)
      .single()

    if (parcelaErr || !parcela) {
      return NextResponse.json({ erro: 'Parcela não encontrada' }, { status: 404 })
    }

    if (parcela.status === 'pago') {
      return NextResponse.json(
        { erro: 'Esta parcela já foi paga' },
        { status: 409 }
      )
    }

    // Insere registro de pagamento
    const { data: pagamento, error: pgtoErr } = await supabaseAdmin
      .from('pagamentos')
      .insert({
        id_parcela: id,
        metodo: parsed.data.metodo,
        data_pagamento: `${parsed.data.data_pagamento}T12:00:00`,
        valor_pago: parsed.data.valor_pago,
      })
      .select()
      .single()

    if (pgtoErr) throw pgtoErr

    // Atualiza status da parcela para 'pago'
    const { error: updateErr } = await supabaseAdmin
      .from('parcelas')
      .update({ status: 'pago' })
      .eq('id_parcela', id)

    if (updateErr) throw updateErr

    // Após marcar parcela como paga, verificar se este é o primeiro pagamento
    // do contrato e, se for, ativar matrículas pendentes do aluno.
    let ativacaoAviso: string | null = null

    try {
      const { data: parcelaInfo, error: parcelaInfoErr } = await supabaseAdmin
        .from('parcelas')
        .select('id_contrato')
        .eq('id_parcela', id)
        .single()

      if (!parcelaInfoErr && parcelaInfo) {
        const id_contrato = parcelaInfo.id_contrato

        const { data: contratoInfo, error: contratoInfoErr } = await supabaseAdmin
          .from('contratos')
          .select('id_aluno')
          .eq('id_contrato', id_contrato)
          .single()

        if (!contratoInfoErr && contratoInfo) {
          const id_aluno = contratoInfo.id_aluno

          // Buscar todas as parcelas do contrato para contar pagamentos
          const { data: parcelasContrato, error: parcelasContratoErr } = await supabaseAdmin
            .from('parcelas')
            .select('id_parcela')
            .eq('id_contrato', id_contrato)

          if (!parcelasContratoErr) {
            const parcelaIds = (parcelasContrato || []).map((p: any) => p.id_parcela)

            // Contar pagamentos existentes para as parcelas deste contrato
            const { count: pagamentosCount } = await supabaseAdmin
              .from('pagamentos')
              .select('*', { head: true, count: 'exact' })
              .in('id_parcela', parcelaIds)

            if ((pagamentosCount ?? 0) === 1) {
              // Primeiro pagamento: ativar matrículas pendentes do aluno
              const { error: ativErr } = await supabaseAdmin
                .from('matriculas_turmas')
                .update({ status: 'ativa' })
                .eq('id_aluno', id_aluno)
                .eq('status', 'pendente')

              if (ativErr) {
                console.error('[ATIVAR MATRICULAS]', ativErr)
                ativacaoAviso = 'Pagamento registrado, mas falha ao ativar matrículas (ver logs).'
              }
            }
          } else {
            console.warn('[ATIVAR MATRICULAS] falha ao buscar parcelas do contrato', parcelasContratoErr)
          }
        } else {
          console.warn('[ATIVAR MATRICULAS] contrato nao encontrado', contratoInfoErr)
        }
      } else {
        console.warn('[ATIVAR MATRICULAS] parcela info nao encontrada', parcelaInfoErr)
      }
    } catch (e) {
      console.error('[ATIVAR MATRICULAS] erro inesperado', e)
      ativacaoAviso = 'Pagamento registrado, mas ocorreu um erro ao tentar ativar matrículas.'
    }

    const responsePayload: any = {
      mensagem: 'Baixa realizada com sucesso',
      id_pagamento: pagamento.id_pagamento,
    }
    if (ativacaoAviso) responsePayload.aviso = ativacaoAviso

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('[PUT PAGAMENTO ID]', error)
    return NextResponse.json({ erro: 'Erro ao registrar pagamento' }, { status: 500 })
  }
}
