import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailRedefinicaoSenha(
  email: string,
  nome: string,
  token: string
) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`

  await resend.emails.send({
    from: 'Isabel Wenccess <onboarding@resend.dev>',
    to: email,
    subject: 'Redefinição de senha — Isabel Wenccess',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Redefinição de senha</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(107,19,38,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:#6B1326;padding:32px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;">
                      ISABEL WENCCESS
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:1px;">
                      Studio de Dança
                    </p>
                  </td>
                </tr>

                <!-- Conteúdo -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">
                      Olá, ${nome} 👋
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                      Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                    </p>

                    <!-- Botão -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="background:#6B1326;border-radius:12px;">
                          <a href="${link}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                            Redefinir minha senha
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
                      Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                    </p>
                    <p style="margin:0 0 24px;font-size:12px;color:#6B1326;word-break:break-all;">
                      ${link}
                    </p>

                    <div style="background:#f5f0eb;border-radius:10px;padding:16px 20px;margin:0 0 8px;">
                      <p style="margin:0;font-size:13px;color:#888;">
                        ⏱ Este link expira em <strong style="color:#1a1a1a;">1 hora</strong>.
                      </p>
                      <p style="margin:6px 0 0;font-size:13px;color:#888;">
                        🔒 Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanece a mesma.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px 32px;border-top:1px solid #f0ebe4;">
                    <p style="margin:0;font-size:11px;color:#bbb;text-align:center;letter-spacing:1px;">
                      © 2026 Isabel Wenccess Studio de Dança · Salvador, Bahia
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })
}

export async function enviarEmailBoasVindasAdmin(
  email: string,
  nome: string,
  senhaTemp: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`

  await resend.emails.send({
    from: 'Isabel Wenccess <onboarding@resend.dev>',
    to: email,
    subject: 'Bem-vindo(a) ao painel — Isabel Wenccess',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Bem-vindo ao painel admin</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(107,19,38,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:#6B1326;padding:32px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#c9a96e;">
                      ISABEL WENCCESS
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:1px;">
                      Studio de Dança · Painel Admin
                    </p>
                  </td>
                </tr>

                <!-- Conteúdo -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">
                      Olá, ${nome} 👋
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                      Sua conta de administrador foi criada com sucesso. Use as credenciais abaixo para o seu primeiro acesso.
                    </p>

                    <!-- Credenciais -->
                    <div style="background:#faf7f4;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
                      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8B1A2F;">
                        Suas credenciais de acesso
                      </p>
                      <p style="margin:0 0 6px;font-size:13px;color:#555;">
                        <strong style="color:#1a1a1a;">E-mail:</strong> ${email}
                      </p>
                      <p style="margin:0;font-size:13px;color:#555;">
                        <strong style="color:#1a1a1a;">Senha provisória:</strong>
                        <code style="background:#f0e8e0;padding:2px 8px;border-radius:4px;font-size:14px;font-weight:700;color:#8B1A2F;letter-spacing:1px;">${senhaTemp}</code>
                      </p>
                    </div>

                    <!-- Botão -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="background:#6B1326;border-radius:12px;">
                          <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                            Acessar o painel
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#f5f0eb;border-radius:10px;padding:16px 20px;">
                      <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
                        🔒 Recomendamos que você altere sua senha após o primeiro acesso.
                      </p>
                      <p style="margin:6px 0 0;font-size:13px;color:#888;">
                        Se você não esperava este e-mail, entre em contato com o suporte.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px 32px;border-top:1px solid #f0ebe4;">
                    <p style="margin:0;font-size:11px;color:#bbb;text-align:center;letter-spacing:1px;">
                      © 2026 Isabel Wenccess Studio de Dança · Salvador, Bahia
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })
}