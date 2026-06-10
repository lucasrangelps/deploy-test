// src/hooks/useAuthToken.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para renovar o token usando o refresh token
  const refreshToken = useCallback(async () => {
    try {
      const session = localStorage.getItem('supabase_session')
      if (!session) {
        setToken(null)
        return null
      }

      const parsedSession = JSON.parse(session)
      const refreshToken = parsedSession.refresh_token

      if (!refreshToken) {
        setToken(null)
        return null
      }

      // Usar Supabase para renovar a sessão
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      })

      if (error || !newSession) {
        console.error('[useAuthToken] Erro ao renovar token:', error)
        // Token expirado, fazer logout
        localStorage.removeItem('token')
        localStorage.removeItem('supabase_session')
        localStorage.removeItem('usuario')
        setToken(null)
        return null
      }

      // Salvar nova sessão e token
      localStorage.setItem('supabase_session', JSON.stringify(newSession))
      localStorage.setItem('token', newSession.access_token)
      setToken(newSession.access_token)

      return newSession.access_token
    } catch (err) {
      console.error('[useAuthToken] Erro:', err)
      setToken(null)
      return null
    }
  }, [])

  // Inicializar token na primeira renderização
  useEffect(() => {
    const initToken = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
          setToken(storedToken)
          // Tentar renovar para garantir que seja válido
          await refreshToken()
        }
      } catch (err) {
        console.error('[useAuthToken] Erro ao inicializar:', err)
      } finally {
        setLoading(false)
      }
    }

    initToken()
  }, [refreshToken])

  // Função para obter token com refresh automático
  const getToken = useCallback(async (): Promise<string | null> => {
    const currentToken = localStorage.getItem('token')

    if (!currentToken) {
      await refreshToken()
      return localStorage.getItem('token')
    }

    // Verificar se token vai expirar nos próximos 5 minutos
    try {
      // Decodificar o JWT para verificar exp
      const parts = currentToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        const expiresAt = (payload.exp || 0) * 1000
        const now = Date.now()
        const timeUntilExpiry = expiresAt - now

        // Se vai expirar em menos de 5 minutos, renovar
        if (timeUntilExpiry < 5 * 60 * 1000) {
          return await refreshToken()
        }
      }
    } catch (err) {
      console.error('[useAuthToken] Erro ao verificar expiração:', err)
    }

    return currentToken
  }, [refreshToken])

  return { token, loading, getToken, refreshToken }
}
