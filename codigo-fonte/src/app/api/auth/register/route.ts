import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { RegisterSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Validação
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      console.log(parsed.error.flatten()) // 🔥 MOSTRA O ERRO REAL
      const fieldErrors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { erro: 'Dados inválidos', fieldErrors },
        { status: 400 }
      )
    }

    const { nomeCompleto, email, senha, telefone, dataNascimento, role, cpf,
      endereco,
      nomeMae,
      profissao,
      menorIdade,
      telParente,
      nomeParente,
      grauParentesco, especialidade } = parsed.data

    // 2. Criar usuário no AUTH do Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json({ erro: authError.message }, { status: 400 })
    }

    const authUserId = authData.user.id

    // 3. Inserir na tabela usuarios
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_user_id: authUserId,
        nome_completo: nomeCompleto,
        email,
        tipo_perfil: role,

      })
      .select()
      .single()

    if (userError) throw userError

    // 4. Inserir nas tabelas específicas
    // ALUNO
    let idAluno = null
    if (role === 'ALUNO') {
      const { data: alunoInsertData, error: alunoError } = await supabaseAdmin.from('alunos').insert({
        id_usuario: usuario.id_usuario,
        telefone,
        data_nascimento: dataNascimento,

        cpf,
        endereco,
        nome_mae: nomeMae,
        profissao,

        tel_parente: menorIdade ? telParente : null,
        nome_parente: menorIdade ? nomeParente : null,
        grau_parentesco: menorIdade ? grauParentesco : null
      }).select('id_aluno').single()

      if (alunoError) {
        console.error('[ERRO AO INSERIR ALUNO]', alunoError)
        throw alunoError
      }
      
      idAluno = alunoInsertData?.id_aluno
    }

    // PROFESSOR
    if (role === 'PROFESSOR') {
      const { error: profError } = await supabaseAdmin
        .from('professores')
        .insert({
          id_usuario: usuario.id_usuario,

          telefone,
          data_nascimento: dataNascimento,
          cpf,
          endereco,
          especialidade
        })

      if (profError) {
        console.error('[ERRO AO INSERIR PROFESSOR]', profError)
        throw profError
      }
    }

    // ADMIN
    if (role === 'ADMIN') {
      await supabaseAdmin.from('admins').insert({
        id_usuario: usuario.id_usuario
      })
    }

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        id_aluno: idAluno || undefined
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }

}