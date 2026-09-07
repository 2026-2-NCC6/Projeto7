export const texts = {
  brand: 'SMASH BALL',

  login: {
    heading: 'Bem-vindo de volta',
    subheading: 'Entre e continue acertando seus alvos.',
    email: 'E-mail',
    password: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    submit: 'Entrar',
    submitting: 'Entrando…',
    divider: 'OU',
    guest: 'Entrar como visitante',
    footerPrompt: 'Não tem uma conta? ',
    footerAction: 'Cadastre-se',
  },

  signUp: {
    heading: 'Criar conta',
    subheading: 'Comece a transformar treino em desempenho.',
    name: 'Nome completo',
    email: 'E-mail',
    password: 'Senha',
    submit: 'Criar conta',
    submitting: 'Criando conta…',
    terms: 'Ao continuar, você concorda com os Termos e a Política de Privacidade.',
    footerPrompt: 'Já tem uma conta? ',
    footerAction: 'Entrar',
  },

  home: {
    greetingMorning: 'Bom dia',
    greetingAfternoon: 'Boa tarde',
    greetingEvening: 'Boa noite',
    salutation: 'Olá, ',
    heroEyebrow: 'O APP É SEU CONTROLE',
    heroTitle: 'Escolha um modo e vá acertar a parede de verdade',
    heroAction: 'Começar treino',
    dailyChallenge: 'Desafio Diário',
    dailyStreak: (days: number) => `Ofensiva de ${days} ${days === 1 ? 'dia' : 'dias'}`,
    dailyPending: 'Jogue o desafio de hoje',
    dailyDone: 'Concluído hoje',
    chooseMode: 'Escolha um modo',
    progress: 'Progresso',
    level: (level: number) => `Nível ${level}`,
    xpCounter: (xp: number, required: number) =>
      `${xp.toLocaleString('pt-BR')} / ${required.toLocaleString('pt-BR')} XP`,
    summary: 'Resumo',
    sessions: 'Sessões',
    bestStreak: 'Melhor sequência',
    totalScore: 'Pontuação total',
    loadError: 'Não foi possível carregar seus dados.',
    retry: 'Tentar novamente',
  },

  tabs: {
    home: 'Início',
    play: 'Jogar',
    stats: 'Estatísticas',
    ranks: 'Ranking',
    profile: 'Perfil',
  },

  placeholder: {
    description: 'Esta tela faz parte de uma entrega futura.',
  },
} as const;
