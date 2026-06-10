export interface DanceStyle {
  name: string
  emoji: string
  color: string
  vibe: string
  cta: string
}

export interface QuizOption {
  text: string
  weights: Record<string, number>
}

export interface QuizQuestion {
  q: string
  icon: string
  opts: QuizOption[]
}

export const DANCE_STYLES: Record<string, DanceStyle> = {
  forro: {
    name: 'Forró',
    emoji: '🪗',
    color: '#d4727e',
    vibe: 'Você busca conexão, alegria e raízes. O forró é abraço, sorriso e sanfona — pura energia nordestina que aquece o coração.',
    cta: 'Forró',
  },
  samba: {
    name: 'Samba',
    emoji: '🥁',
    color: '#e8a838',
    vibe: 'Seu corpo pede ritmo, suor e celebração! O samba é a alma brasileira em movimento — cadência, malandragem e pura alegria contagiante.',
    cta: 'Samba',
  },
  salsa: {
    name: 'Salsa',
    emoji: '🌶️',
    color: '#e05555',
    vibe: 'Você tem fogo por dentro! A salsa é paixão latina, giros rápidos e uma energia magnética que transforma qualquer pista.',
    cta: 'Salsa',
  },
  sertanejo: {
    name: 'Sertanejo',
    emoji: '🤠',
    color: '#c9a96e',
    vibe: 'Você curte descontração e romance no compasso certo. O sertanejo é a trilha sonora perfeita pra quem quer dançar juntinho e se divertir.',
    cta: 'Sertanejo',
  },
  zouk: {
    name: 'Zouk',
    emoji: '🌊',
    color: '#7b8ec9',
    vibe: 'Você sente a música de corpo e alma. O zouk é fluidez, expressão e movimentos ondulantes que parecem uma conversa silenciosa entre dois corpos.',
    cta: 'Zouk',
  },
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: 'Qual é o seu objetivo principal ao começar a dançar?',
    icon: '🎯',
    opts: [
      { text: 'Socializar e fazer amigos', weights: { forro: 15, samba: 6, salsa: 7, sertanejo: 9, zouk: 3 } },
      { text: 'Queimar calorias e me exercitar intensamente', weights: { forro: 3, samba: 15, salsa: 10, sertanejo: 4, zouk: 2 } },
      { text: 'Expressar minhas emoções de forma livre', weights: { forro: 3, samba: 4, salsa: 5, sertanejo: 2, zouk: 15 } },
      { text: 'Me divertir dançando com alguém especial', weights: { forro: 7, samba: 3, salsa: 6, sertanejo: 15, zouk: 5 } },
    ],
  },
  {
    q: 'Que tipo de música faz seu pé bater no chão?',
    icon: '🎵',
    opts: [
      { text: 'Sanfona, triângulo e zabumba', weights: { forro: 15, samba: 4, salsa: 2, sertanejo: 6, zouk: 2 } },
      { text: 'Pagode, batucada e percussão', weights: { forro: 5, samba: 15, salsa: 6, sertanejo: 3, zouk: 2 } },
      { text: 'Ritmos latinos, trompete e energia caribenha', weights: { forro: 3, samba: 6, salsa: 15, sertanejo: 3, zouk: 3 } },
      { text: 'Sertanejo universitário e modão', weights: { forro: 6, samba: 2, salsa: 2, sertanejo: 15, zouk: 2 } },
      { text: 'R&B, músicas suaves e envolventes', weights: { forro: 2, samba: 2, salsa: 3, sertanejo: 2, zouk: 15 } },
    ],
  },
  {
    q: 'Como você se sente em relação ao contato físico na dança?',
    icon: '🤝',
    opts: [
      { text: 'Amo! Dançar coladinho é a melhor parte', weights: { forro: 14, samba: 2, salsa: 6, sertanejo: 12, zouk: 6 } },
      { text: 'Prefiro meu próprio espaço e liberdade de movimento', weights: { forro: 2, samba: 15, salsa: 5, sertanejo: 3, zouk: 2 } },
      { text: 'Gosto de conexão suave, fluida e sensível', weights: { forro: 5, samba: 2, salsa: 5, sertanejo: 3, zouk: 15 } },
      { text: 'Curto a energia de conduzir e ser conduzido com ritmo', weights: { forro: 5, samba: 5, salsa: 15, sertanejo: 7, zouk: 4 } },
    ],
  },
  {
    q: 'Qual o seu nível de energia após um dia de trabalho?',
    icon: '⚡',
    opts: [
      { text: 'Preciso de algo relaxante e fluido', weights: { forro: 3, samba: 2, salsa: 3, sertanejo: 5, zouk: 15 } },
      { text: 'Preciso de algo explosivo pra descarregar o stress!', weights: { forro: 5, samba: 15, salsa: 13, sertanejo: 4, zouk: 2 } },
      { text: 'Quero algo animado mas sem exagero', weights: { forro: 13, samba: 4, salsa: 5, sertanejo: 15, zouk: 3 } },
    ],
  },
  {
    q: 'Qual visual mais te atrai em uma apresentação de dança?',
    icon: '✨',
    opts: [
      { text: 'Roupas casuais, sorrisos e muita descontração', weights: { forro: 14, samba: 4, salsa: 3, sertanejo: 15, zouk: 3 } },
      { text: 'Figurinos vibrantes, brilho e muita atitude', weights: { forro: 3, samba: 14, salsa: 15, sertanejo: 3, zouk: 3 } },
      { text: 'Movimentos suaves, elegância e fluidez no corpo', weights: { forro: 4, samba: 3, salsa: 5, sertanejo: 3, zouk: 15 } },
    ],
  },
]

// TODO: Substituir pelo número real do WhatsApp do estúdio
export const WHATSAPP_NUMBER = '5571999999999'