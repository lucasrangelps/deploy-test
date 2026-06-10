'use client'

import { AlertCircle } from 'lucide-react'

// Tipo para fieldErrors: cada chave pode ter um array de strings
interface FieldErrors {
  [key: string]: string[] | undefined
}

interface FieldErrorDisplayProps {
  errors: FieldErrors
  field?: string
}

export function FieldErrorDisplay({ errors, field }: FieldErrorDisplayProps) {
  // Se um campo específico for passado, mostra apenas os erros daquele campo
  if (field) {
    const fieldErrorList = errors[field]
    if (!fieldErrorList || fieldErrorList.length === 0) return null

    return (
      <div className="flex flex-col gap-1">
        {fieldErrorList.map((error, index) => (
          <p
            key={index}
            className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <AlertCircle size={16} />
            {error}
          </p>
        ))}
      </div>
    )
  }

  // Se nenhum campo for passado, mostra todos os erros
  const errorEntries = Object.entries(errors).filter(
    ([, messages]) => messages && messages.length > 0
  )

  if (errorEntries.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      {errorEntries.map(([fieldName, messages]) =>
        messages?.map((message, index) => (
          <p
            key={`${fieldName}-${index}`}
            className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <AlertCircle size={16} />
            {message}
          </p>
        ))
      )}
    </div>
  )
}

// ─── Componente para exibir erro com detalhes ─────────────────────────────────

interface ErrorWithDetailsProps {
  erro: string
  detalhes?: string[]
}

export function ErrorWithDetails({ erro, detalhes }: ErrorWithDetailsProps) {
  if (!erro) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
        <AlertCircle size={16} />
        {erro}
      </p>
      {detalhes && detalhes.length > 0 && (
        <ul className="mt-2 ml-6 list-disc list-inside text-sm text-red-500 space-y-1">
          {detalhes.map((detalhe, index) => (
            <li key={index}>{detalhe}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Helper para extrair fieldErrors de uma resposta de API
// O formato da API é: { formErrors: [], fieldErrors: { campo: ['erro1', 'erro2'] } }
export function getFieldErrors(data: unknown): FieldErrors {
  if (data && typeof data === 'object' && 'fieldErrors' in data) {
    const fieldErrors = (data as { fieldErrors: unknown }).fieldErrors
    if (fieldErrors && typeof fieldErrors === 'object') {
      const result: FieldErrors = {}
      const fe = fieldErrors as Record<string, unknown>
      for (const [key, value] of Object.entries(fe)) {
        if (Array.isArray(value)) {
          result[key] = value.filter((v): v is string => typeof v === 'string')
        }
      }
      return result
    }
  }
  return {}
}

// Helper para obter erros de formulário (formErrors)
export function getFormErrors(data: unknown): string[] {
  if (data && typeof data === 'object' && 'formErrors' in data) {
    const formErrors = (data as { formErrors: unknown }).formErrors
    if (Array.isArray(formErrors)) {
      return formErrors.filter((item): item is string => typeof item === 'string')
    }
  }
  return []
}

// Helper para obter erro geral (não relacionado a um campo específico)
export function getGeneralError(data: unknown): string | null {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (d.erro && typeof d.erro === 'string') {
      return d.erro as string
    }
  }
  return null
}