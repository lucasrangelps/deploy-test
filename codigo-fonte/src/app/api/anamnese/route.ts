// src/app/api/anamnese/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AnamnesePostSchema } from '@/lib/validations'

// POST /api/anamnese
// Cria ou atualiza anamnese (UPSERT) do aluno
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
    const validation = AnamnesePostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          erro: 'Validação falhou',
          detalhes: validation.error.flatten()
        },
        { status: 422 }
      )
    }

    const { id_aluno, dados_questionario } = validation.data

    // Validar que o aluno existe
    const { data: aluno, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno, id_usuario')
      .eq('id_aluno', id_aluno)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    // Validar que o usuário está operando sobre sua própria anamnese
    const { data: usuarioAuth } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuarioAuth || usuarioAuth.id_usuario !== aluno.id_usuario) {
      return NextResponse.json({ erro: 'Sem permissão para atualizar esta anamnese' }, { status: 403 })
    }

    // Verificar se anamnese já existe
    const { data: anamneseExistente } = await supabaseAdmin
      .from('anamneses')
      .select('id_anamnese')
      .eq('id_aluno', id_aluno)
      .single()

    let resultado
    let statusCode = 201

    if (anamneseExistente) {
      // UPSERT: Atualizar se já existe
      const { data, error } = await supabaseAdmin
        .from('anamneses')
        .update({
          dados_questionario,
          data_preenchimento: new Date().toISOString(),
        })
        .eq('id_aluno', id_aluno)
        .select('id_anamnese, id_aluno, dados_questionario, data_preenchimento')
        .single()

      if (error) {
        console.error('[POST /api/anamnese] Update error', error)
        return NextResponse.json({ erro: 'Erro ao atualizar anamnese' }, { status: 500 })
      }

      resultado = data
      statusCode = 200
    } else {
      // INSERT: Criar nova
      const { data, error } = await supabaseAdmin
        .from('anamneses')
        .insert({
          id_aluno,
          dados_questionario,
          data_preenchimento: new Date().toISOString(),
        })
        .select('id_anamnese, id_aluno, dados_questionario, data_preenchimento')
        .single()

      if (error) {
        console.error('[POST /api/anamnese] Insert error', error)
        return NextResponse.json({ erro: 'Erro ao criar anamnese' }, { status: 500 })
      }

      resultado = data
    }

    return NextResponse.json(resultado, { status: statusCode })
  } catch (error) {
    console.error('[POST /api/anamnese]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
