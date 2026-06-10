'use client'

type BadgeStatus =
  | 'ativo'
  | 'inativo'
  | 'em_dia'
  | 'inadimplente'
  | 'pago'
  | 'pendente'
  | 'atrasado'
  | 'novo'
  | 'em_contato'
  | 'convertido'
  | 'perdido'
  | 'emitida'
  | 'erro'

interface StatusBadgeProps {
  status: BadgeStatus
  label?: string
}

const STATUS_MAP: Record<BadgeStatus, { cssClass: string; text: string }> = {
  pago:          { cssClass: 'badge badge-green',  text: 'Pago'         },
  ativo:         { cssClass: 'badge badge-green',  text: 'Ativo'        },
  em_dia:        { cssClass: 'badge badge-green',  text: 'Em Dia'       },
  emitida:       { cssClass: 'badge badge-green',  text: 'Emitida'      },
  pendente:      { cssClass: 'badge badge-orange', text: 'Pendente'     },
  em_contato:    { cssClass: 'badge badge-orange', text: 'Em Contato'   },
  atrasado:      { cssClass: 'badge badge-red',    text: 'Atrasado'     },
  inadimplente:  { cssClass: 'badge badge-red',    text: 'Inadimplente' },
  erro:          { cssClass: 'badge badge-red',    text: 'Erro'         },
  novo:          { cssClass: 'badge badge-gold',   text: 'Novo'         },
  convertido:    { cssClass: 'badge badge-wine',   text: 'Convertido'   },
  inativo:       { cssClass: 'badge badge-gray',   text: 'Inativo'      },
  perdido:       { cssClass: 'badge badge-gray',   text: 'Perdido'      },
}

export default function StatusBadge({ status, label }: StatusBadgeProps){
  const mapping = STATUS_MAP[status]
  if (!mapping) {
    return <span className="badge badge-gray">{label ?? status}</span>
  }

  const { cssClass, text } = STATUS_MAP[status]
  return <span className={cssClass}>{label ?? text}</span>
}

export type { BadgeStatus, StatusBadgeProps }
