
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { enviarEmailRedefinicaoSenha } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ erro: 'E-mail é obrigatório.' }, { status: 400 })
    }

    // 1. Busca o usuário pelo e-mail
    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario, nome_completo, email')
      .eq('email', email)
      .single()

    // Sempre retorna sucesso para não revelar se o e-mail existe ou não
    if (error || !usuario) {
      return NextResponse.json({
        mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
      })
    }

    // 2. Gera token único
    const token = crypto.randomBytes(32).toString('hex')
    const expiraEm = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // 3. Invalida tokens anteriores do usuário
    await supabaseAdmin
      .from('tokens_redefinicao_senha')
      .update({ usado: true })
      .eq('id_usuario', usuario.id_usuario)
      .eq('usado', false)

    // 4. Salva o novo token
    const { error: erroInsert } = await supabaseAdmin
      .from('tokens_redefinicao_senha')
      .insert({
        id_usuario: usuario.id_usuario,
        token,
        expira_em: expiraEm.toISOString(),
      })

    if (erroInsert) {
      console.error('[ESQUECI-SENHA] Erro ao salvar token:', erroInsert)
      return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
    }

    // 5. Envia o e-mail
    await enviarEmailRedefinicaoSenha(usuario.email, usuario.nome_completo, token)

    return NextResponse.json({
      mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
    })
  } catch (error) {
    console.error('[ESQUECI-SENHA]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor.' }, { status: 500 })
  }
}