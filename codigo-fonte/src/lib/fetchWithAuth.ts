// src/lib/fetchWithAuth.ts
import { supabase } from '@/lib/supabase'

/**
 * Faz uma requisição com autenticação automática
 * Renova o token se necessário
 * @param url URL da requisição
 * @param options Opções do fetch (sem o header Authorization)
 * @returns Response
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<Response> {
  // Obter token e renovar se necessário
  const token = await getValidToken()

  if (!token) {
    throw new Error('Não autorizado: token inválido ou expirado')
  }

  // Adicionar header de autorização
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  }

  // Fazer requisição
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Se receber 401, tentar renovar e fazer de novo
  if (response.status === 401) {
    const newToken = await refreshTokenManually()
    if (newToken) {
      const headersRetry = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      }
      return fetch(url, {
        ...options,
        headers: headersRetry,
      })
    }
  }

  return response
}

/**
 * Obtém um token válido, renovando se necessário
 */
async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem('token')

  if (!token) {
    return null
  }

  // Verificar se token vai expirar nos próximos 5 minutos
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      const expiresAt = (payload.exp || 0) * 1000
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now

      // Se vai expirar em menos de 5 minutos, renovar agora
      if (timeUntilExpiry < 5 * 60 * 1000) {
        return await refreshTokenManually()
      }
    }
  } catch (err) {
    console.error('[fetchWithAuth] Erro ao verificar expiração:', err)
  }

  return token
}

/**
 * Renova o token manualmente usando refresh token
 */
async function refreshTokenManually(): Promise<string | null> {
  try {
    const sessionStr = localStorage.getItem('supabase_session')
    if (!sessionStr) {
      return null
    }

    const session = JSON.parse(sessionStr)
    const refreshToken = session.refresh_token

    if (!refreshToken) {
      return null
    }

    // Usar Supabase para renovar
    const { data: { session: newSession }, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (error || !newSession) {
      console.error('[refreshTokenManually] Erro:', error)
      // Limpar dados e fazer logout
      localStorage.removeItem('token')
      localStorage.removeItem('supabase_session')
      localStorage.removeItem('usuario')
      return null
    }

    // Salvar nova sessão
    localStorage.setItem('supabase_session', JSON.stringify(newSession))
    localStorage.setItem('token', newSession.access_token)

    return newSession.access_token
  } catch (err) {
    console.error('[refreshTokenManually] Erro:', err)
    return null
  }
}
