import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const AtualizarAlunoSchema = z.object({
  nome_completo: z.string().min(3).max(150).optional(),
  email: z.string().email().optional(),
  cpf: z.string().regex(/^\d{11}$/).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  endereco: z.string().max(255).optional().nullable(),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  nome_mae: z.string().max(150).optional().nullable(),
  profissao: z.string().max(150).optional().nullable(),
  tel_parente: z.string().max(20).optional().nullable(),
  nome_parente: z.string().max(255).optional().nullable(),
  grau_parentesco: z.string().max(20).optional().nullable(),
  genero: z.string().max(30).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
})

// GET /api/alunos/:id — ficha completa
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Dados do aluno + usuário
    const { data: aluno, error: alunoErr } = await supabaseAdmin
      .from('alunos')
      .select(`
        *,
        usuarios (
          id_usuario,
          nome_completo,
          email,
          criado_em
        )
      `)
      .eq('id_aluno', id)
      .single()

    if (alunoErr || !aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    // Anamnese
    const { data: anamnese } = await supabaseAdmin
      .from('anamneses')
      .select('dados_questionario, data_preenchimento')
      .eq('id_aluno', id)
      .maybeSingle()

    // Matrículas em turmas
    const { data: matriculas } = await supabaseAdmin
      .from('matriculas_turmas')
      .select(`
        id_matricula,
        status,
        turmas (
          nome,
          ritmos ( nome )
        )
      `)
      .eq('id_aluno', id)

    // Contratos e parcelas
    const { data: contratos } = await supabaseAdmin
      .from('contratos')
      .select(`
        id_contrato,
        forma_pgto_padrao,
        criado_em,
        planos ( nome, ciclo_meses, valor_base ),
        parcelas (
          id_parcela,
          numero_parcela,
          valor_cobrado,
          data_vencimento,
          status
        )
      `)
      .eq('id_aluno', id)

    const parcelas = (contratos ?? []).flatMap((c: any) =>
      (c.parcelas ?? []).map((p: any) => ({ ...p, id_contrato: c.id_contrato }))
    )

    const matriculasFormatadas = (matriculas ?? []).map((m: any) => ({
      id_matricula: m.id_matricula,
      nome_turma: m.turmas?.nome ?? '',
      ritmo: m.turmas?.ritmos?.nome ?? '',
      status: m.status,
    }))

    return NextResponse.json({
      id_usuario: aluno.usuarios?.id_usuario,
      nome_completo: aluno.usuarios?.nome_completo,
      email: aluno.usuarios?.email,
      id_aluno: aluno.id_aluno,
      cpf: aluno.cpf,
      telefone: aluno.telefone,
      endereco: aluno.endereco,
      data_nascimento: aluno.data_nascimento,
      nome_mae: aluno.nome_mae,
      profissao: aluno.profissao,
      tel_parente: aluno.tel_parente,
      nome_parente: aluno.nome_parente,
      grau_parentesco: aluno.grau_parentesco,
      genero: aluno.genero,
      observacoes: aluno.observacoes,
      anamnese: anamnese ?? null,
      matriculas: matriculasFormatadas,
      parcelas,
    })
  } catch (error) {
    console.error('[GET ALUNO ID]', error)
    return NextResponse.json({ erro: 'Erro ao buscar aluno' }, { status: 500 })
  }
}

// PUT /api/alunos/:id — atualizar dados do aluno
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsed = AtualizarAlunoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Confirma que o aluno existe
    const { data: aluno, error: alunoErr } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno, id_usuario')
      .eq('id_aluno', id)
      .single()

    if (alunoErr || !aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    const { nome_completo, email, ...dadosAluno } = parsed.data

    // Atualiza usuarios se campos de usuário foram enviados
    if (nome_completo || email) {
      const camposUsuario: Record<string, string> = {}
      if (nome_completo) camposUsuario.nome_completo = nome_completo
      if (email) camposUsuario.email = email

      const { error: usuarioErr } = await supabaseAdmin
        .from('usuarios')
        .update(camposUsuario)
        .eq('id_usuario', aluno.id_usuario)

      if (usuarioErr) throw usuarioErr
    }

    // Atualiza tabela alunos
    const camposAluno = Object.fromEntries(
      Object.entries(dadosAluno).filter(([, v]) => v !== undefined)
    )

    if (Object.keys(camposAluno).length > 0) {
      const { error: updateErr } = await supabaseAdmin
        .from('alunos')
        .update(camposAluno)
        .eq('id_aluno', id)

      if (updateErr) throw updateErr
    }

    return NextResponse.json({ mensagem: 'Aluno atualizado com sucesso' })
  } catch (error) {
    console.error('[PUT ALUNO ID]', error)
    return NextResponse.json({ erro: 'Erro ao atualizar aluno' }, { status: 500 })
  }
}
