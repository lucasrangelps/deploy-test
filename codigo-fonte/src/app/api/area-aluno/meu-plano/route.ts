import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const MigrarSchema = z.object({
  id_aluno: z.string().uuid(),
  id_plano: z.string().uuid(),
})

// GET /api/area-aluno/meu-plano?id_aluno={id}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id_aluno = searchParams.get('id_aluno')

    if (!id_aluno) {
      return NextResponse.json({ erro: 'id_aluno é obrigatório' }, { status: 400 })
    }

    const { data: contrato, error } = await supabaseAdmin
      .from('contratos')
      .select(`
        id_contrato,
        forma_pgto_padrao,
        criado_em,
        planos (
          id_plano,
          nome,
          ciclo_meses,
          valor_base,
          percentual_desconto
        )
      `)
      .eq('id_aluno', id_aluno)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (!contrato || !contrato.planos) {
      return NextResponse.json({ plano_atual: null, id_contrato: null, parcelas_pendentes: 0 })
    }

    const plano = contrato.planos as any
    const valorFinal = plano.valor_base * (1 - plano.percentual_desconto / 100)

    // Conta parcelas ainda não pagas no contrato atual
    const { count: pendentes } = await supabaseAdmin
      .from('parcelas')
      .select('*', { count: 'exact', head: true })
      .eq('id_contrato', contrato.id_contrato)
      .neq('status', 'pago')

    return NextResponse.json({
      plano_atual: { ...plano, valor_final: valorFinal },
      id_contrato: contrato.id_contrato,
      parcelas_pendentes: pendentes ?? 0,
    })
  } catch (error) {
    console.error('[GET MEU-PLANO]', error)
    return NextResponse.json({ erro: 'Erro ao buscar plano do aluno' }, { status: 500 })
  }
}

// POST /api/area-aluno/meu-plano — aderir ou migrar para outro plano
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = MigrarSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { id_aluno, id_plano } = parsed.data

    // Busca dados completos do plano novo
    const { data: planoNovo, error: planoErr } = await supabaseAdmin
      .from('planos')
      .select('id_plano, nome, ciclo_meses, valor_base, percentual_desconto')
      .eq('id_plano', id_plano)
      .single()

    if (planoErr || !planoNovo) {
      return NextResponse.json({ erro: 'Plano não encontrado' }, { status: 404 })
    }

    // Busca contrato atual do aluno para verificar regra de downgrade
    const { data: contratoAtual } = await supabaseAdmin
      .from('contratos')
      .select(`
        id_contrato,
        planos ( ciclo_meses )
      `)
      .eq('id_aluno', id_aluno)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (contratoAtual) {
      const cicloAtual = (contratoAtual.planos as any)?.ciclo_meses ?? 0

      // Regra: downgrade bloqueado enquanto houver parcelas pendentes
      if (cicloAtual > planoNovo.ciclo_meses) {
        const { count: pendentes } = await supabaseAdmin
          .from('parcelas')
          .select('*', { count: 'exact', head: true })
          .eq('id_contrato', contratoAtual.id_contrato)
          .neq('status', 'pago')

        if ((pendentes ?? 0) > 0) {
          return NextResponse.json(
            {
              erro: `Você possui ${pendentes} parcela(s) pendente(s) no plano atual. Conclua todos os pagamentos antes de migrar para um plano de ciclo menor.`,
            },
            { status: 409 }
          )
        }
      }
    }

    // Cria novo contrato
    const { data: novoContrato, error: contratoErr } = await supabaseAdmin
      .from('contratos')
      .insert({ id_aluno, id_plano, forma_pgto_padrao: 'PIX' })
      .select('id_contrato')
      .single()

    if (contratoErr) throw contratoErr

    // Gera parcelas automaticamente: 1 por mês do ciclo, vencendo no dia 10
    const valorFinal = planoNovo.valor_base * (1 - planoNovo.percentual_desconto / 100)
    const valorParcela = Number((valorFinal / planoNovo.ciclo_meses).toFixed(2))
    const hoje = new Date()

    const parcelas = Array.from({ length: planoNovo.ciclo_meses }, (_, i) => {
      const venc = new Date(hoje.getFullYear(), hoje.getMonth() + 1 + i, 10)
      return {
        id_contrato: novoContrato.id_contrato,
        numero_parcela: i + 1,
        valor_cobrado: valorParcela,
        data_vencimento: venc.toISOString().slice(0, 10),
        status: 'pendente',
      }
    })

    const { error: parcelasErr } = await supabaseAdmin
      .from('parcelas')
      .insert(parcelas)

    if (parcelasErr) throw parcelasErr

    return NextResponse.json(
      {
        mensagem: 'Plano migrado com sucesso',
        id_contrato: novoContrato.id_contrato,
        parcelas_geradas: planoNovo.ciclo_meses,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST MEU-PLANO]', error)
    return NextResponse.json({ erro: 'Erro ao migrar plano' }, { status: 500 })
  }
}
