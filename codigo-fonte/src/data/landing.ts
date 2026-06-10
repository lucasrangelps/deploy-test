export const NAV_LINKS = [
  { label: 'INÍCIO', id: 'inicio' },
  { label: 'COMO FUNCIONA', id: 'como-funciona' },
  { label: 'QUIZ', id: 'quiz' },
] as const

export const STATS = [
  { val: 500, suffix: '+', label: 'Alunos felizes' },
  { val: 8, suffix: '', label: 'Anos de experiência' },
  { val: 15, suffix: '+', label: 'Estilos de dança' },
  { val: 98, suffix: '%', label: 'Satisfação' },
] as const

export const BENEFITS = [
  {
    icon: '✦',
    title: 'Aprenda sem experiência',
    desc: 'Metodologia focada em quem está dando os primeiros passos no mundo da dança.',
    color: '#c9a96e',
  },
  {
    icon: '♡',
    title: 'Confiança e socialização',
    desc: 'Desenvolva autoestima enquanto faz novas amizades em um ambiente vibrante.',
    color: '#d4727e',
  },
  {
    icon: '◈',
    title: 'Professores qualificados',
    desc: 'Instrutores apaixonados e experientes prontos para guiar sua evolução.',
    color: '#8a7a3a',
  },
  {
    icon: '⟡',
    title: 'Ambiente acolhedor',
    desc: 'Um espaço onde você se sente em casa desde o primeiro dia de aula.',
    color: '#b8614a',
  },
]

export const STEPS = [
  {
    num: '01',
    title: 'Escolha uma aula',
    desc: 'Navegue pelos nossos estilos e escolha o que mais te atrai.',
  },
  {
    num: '02',
    title: 'Agende sua aula',
    desc: 'Marque seu horário experimental gratuito diretamente pelo site.',
  },
  {
    num: '03',
    title: 'Comece a dançar',
    desc: 'Apareça no estúdio com roupas confortáveis e sinta a energia!',
  },
]

export const RHYTHMS = [
  {
    image:
      'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80',
    title: 'Dança de Salão',
    tag: 'Clássico & Sofisticado',
  },
  {
    image:
      'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
    title: 'Forró',
    tag: 'Alegria & Proximidade',
  },
  {
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
    title: 'Sertanejo',
    tag: 'Ritmo & Conexão',
  },
]

export const FAQS = [
  {
    question: 'Qual o preço das mensalidades?',
    answer:
      'Temos planos a partir de R$ 149,00 mensais, com descontos para pacotes trimestrais e múltiplas modalidades.',
  },
  {
    question: 'Preciso levar par?',
    answer:
      'Não! Fazemos rodízio entre os alunos para que todos aprendam a conduzir e ser conduzidos.',
  },
  {
    question: 'Que tipo de roupa devo usar?',
    answer:
      'Roupas confortáveis que permitam movimento e calçados que não prendam no chão. Evite chinelos.',
  },
  {
    question: 'As aulas são para iniciantes?',
    answer:
      'Sim! Temos turmas para todos os níveis, do iniciante absoluto ao avançado.',
  },
]

export const MARQUEE_RHYTHMS = [
  'Forró',
  'Sertanejo',
  'Dança de Salão',
  'Bolero',
  'Valsa',
  'Samba',
  'Tango',
]