import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { token, novaSenha } = await req.json()

    if (!token || !novaSenha) {
      return NextResponse.json({ erro: 'Token e nova senha são obrigatórios.' }, { status: 400 })
    }

    if (novaSenha.length < 8) {
      return NextResponse.json({ erro: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 })
    }

    // 1. Busca o token no banco
    const { data: registro, error } = await supabaseAdmin
      .from('tokens_redefinicao_senha')
      .select('id, id_usuario, expira_em, usado')
      .eq('token', token)
      .single()

    if (error || !registro) {
      return NextResponse.json({ erro: 'Token inválido ou expirado.' }, { status: 400 })
    }

    // 2. Verifica se já foi usado
    if (registro.usado) {
      return NextResponse.json({ erro: 'Este link já foi utilizado.' }, { status: 400 })
    }

    // 3. Verifica se não expirou
    if (new Date() > new Date(registro.expira_em)) {
      return NextResponse.json({ erro: 'Este link expirou. Solicite um novo.' }, { status: 400 })
    }

    // 4. Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 12)

    // 5. Atualiza a senha do usuário
    const { error: erroUpdate } = await supabaseAdmin
      .from('usuarios')
      .update({ senha_hash: senhaHash })
      .eq('id_usuario', registro.id_usuario)

    if (erroUpdate) {
      console.error('[REDEFINIR-SENHA] Erro ao atualizar senha:', erroUpdate)
      return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
    }

    // 6. Marca o token como usado
    await supabaseAdmin
      .from('tokens_redefinicao_senha')
      .update({ usado: true })
      .eq('id', registro.id)

    return NextResponse.json({ mensagem: 'Senha redefinida com sucesso!' })
  } catch (error) {
    console.error('[REDEFINIR-SENHA]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor.' }, { status: 500 })
  }
}