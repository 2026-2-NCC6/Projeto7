import type { AchievementId } from '../services/profile/types';

interface AchievementCopy {
  title: string;
  description: string;
}

const achievementItems: Record<AchievementId, AchievementCopy> = {
  first_session: {
    title: 'Primeiro saque',
    description: 'Complete sua primeira sessão de treino',
  },
  sessions_25: {
    title: 'Rotina firme',
    description: 'Complete 25 sessões de treino',
  },
  sessions_100: {
    title: 'Maratonista',
    description: 'Complete 100 sessões de treino',
  },
  level_10: {
    title: 'Nível 10',
    description: 'Alcance o nível 10 em qualquer trilha',
  },
  level_25: {
    title: 'Nível 25',
    description: 'Alcance o nível 25 em qualquer trilha',
  },
  level_50: {
    title: 'Nível 50',
    description: 'Alcance o nível 50 em qualquer trilha',
  },
  level_color_20: {
    title: 'Mestre das cores',
    description: 'Alcance o nível 20 na trilha Color',
  },
  level_score_20: {
    title: 'Mestre dos pontos',
    description: 'Alcance o nível 20 na trilha Score',
  },
  xp_10k: {
    title: 'Dez mil de XP',
    description: 'Acumule 10.000 pontos de experiência',
  },
  xp_50k: {
    title: 'Cinquenta mil de XP',
    description: 'Acumule 50.000 pontos de experiência',
  },
  streak_7: {
    title: 'Uma semana inteira',
    description: 'Mantenha uma ofensiva de 7 dias seguidos',
  },
  streak_30: {
    title: 'Um mês sem falhar',
    description: 'Mantenha uma ofensiva de 30 dias seguidos',
  },
  streak_100: {
    title: 'Cem dias de parede',
    description: 'Chegue a uma ofensiva recorde de 100 dias',
  },
  score_10k: {
    title: 'Dez mil pontos',
    description: 'Some 10.000 pontos entre todas as sessões',
  },
  score_100k: {
    title: 'Cem mil pontos',
    description: 'Some 100.000 pontos entre todas as sessões',
  },
  accuracy_80: {
    title: 'Mira afiada',
    description: 'Chegue a 80% de precisão nos seus treinos',
  },
  accuracy_90: {
    title: 'Mira cirúrgica',
    description: 'Chegue a 90% de precisão nos seus treinos',
  },
  accuracy_95: {
    title: 'Quase perfeito',
    description: 'Chegue a 95% de precisão nos seus treinos',
  },
  hit_streak_25: {
    title: 'Vinte e cinco sem errar',
    description: 'Acerte 25 alvos seguidos sem falhar',
  },
  hit_streak_50: {
    title: 'Cinquenta sem errar',
    description: 'Acerte 50 alvos seguidos sem falhar',
  },
  hit_streak_100: {
    title: 'Cem sem errar',
    description: 'Acerte 100 alvos seguidos sem falhar',
  },
  mode_level_color_10: {
    title: 'Veterano do Level Color',
    description: 'Jogue 10 sessões de Level Color Mode',
  },
  mode_level_score_10: {
    title: 'Veterano do Level Score',
    description: 'Jogue 10 sessões de Level Score Mode',
  },
  mode_infinite_color_10: {
    title: 'Veterano do Infinite Color',
    description: 'Jogue 10 sessões de Infinite Color Mode',
  },
  mode_infinite_score_10: {
    title: 'Veterano do Infinite Score',
    description: 'Jogue 10 sessões de Infinite Score Mode',
  },
  rank_top_100: {
    title: 'Top 100',
    description: 'Entre nas 100 primeiras posições do ranking',
  },
  rank_top_10: {
    title: 'Top 10',
    description: 'Entre nas 10 primeiras posições do ranking',
  },
  rank_first: {
    title: 'Primeiro lugar',
    description: 'Chegue ao topo do ranking',
  },
};

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
    dailyChallenge: 'Ofensiva diária',
    dailyStreak: (days: number) => `Ofensiva de ${days} ${days === 1 ? 'dia' : 'dias'}`,
    dailyPending: 'Treine hoje para manter a ofensiva',
    dailyDone: 'Você já treinou hoje',
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
    viewProfile: 'Ver perfil',
    accountMenu: 'Sua conta',
  },

  play: {
    title: 'Escolha um modo',
    subtitle: 'A parede recebe as batidas. O app mostra o que acertar e como você foi.',
    soon: 'Em breve',
    playMode: (name: string) => `Jogar ${name}`,
    modeTag: {
      level_color: 'Sequência de cores',
      level_score: 'Pontos por alvo',
      infinite_color: 'Cores sem fim',
      infinite_score: 'Pontos contra o relógio',
    },
    modeDescription: {
      level_color:
        'Acerte a sequência de cores na ordem mostrada. A tela vira a cor do próximo alvo.',
      level_score: 'Persiga os alvos que valem mais e alcance a pontuação do nível.',
      infinite_color: 'Cores sem fim, até você errar.',
      infinite_score: 'Some pontos sem parar, contra o relógio.',
    },
  },

  levels: {
    title: (mode: string) => `${mode} · Níveis`,
    level: (level: number) => `Nível ${level}`,
    back: 'Voltar',
    locked: 'Bloqueado',
    bestScore: (score: number) => `Recorde ${score.toLocaleString('pt-BR')}`,
    progress: (cleared: number, total: number) => `${cleared} de ${total} concluídos`,
  },

  intro: {
    eyebrow: (mode: string) => `${mode} · COMO FUNCIONA`,
    skip: 'Pular',
    back: 'Voltar',
    next: 'Próximo',
    start: 'Começar treino',
    steps: {
      level_color: [
        {
          title: 'Siga a sequência',
          description:
            'Cada nível mostra uma sequência de cores. Acerte os alvos da parede exatamente nessa ordem.',
        },
        {
          title: 'A tela mostra o alvo',
          description:
            'O celular fica da cor do próximo alvo: tela âmbar significa acertar o alvo âmbar.',
        },
        {
          title: 'Não perca o ritmo',
          description:
            'A linha do tempo marca cada acerto. Um erro devolve a sequência para o começo.',
        },
      ],
      level_score: [
        {
          title: 'Cada alvo vale pontos',
          description:
            'Os alvos da parede valem valores diferentes. Os mais difíceis pagam mais.',
        },
        {
          title: 'Alcance a meta',
          description: 'Continue batendo até a pontuação chegar à meta do nível.',
        },
        {
          title: 'Sequência multiplica',
          description:
            'Acertos seguidos aumentam o multiplicador. Errar zera a sequência e pode custar pontos.',
        },
      ],
    },
  },

  game: {
    close: 'Sair',
    header: (mode: string, level: number) => `${mode} · Nível ${level}`,
    help: 'Como funciona',
    prepare: 'Prepare-se',
    hitTarget: 'ACERTE O ALVO',
    targetName: {
      amber: 'âmbar',
      blue: 'azul',
      red: 'vermelho',
    },
    sequence: (done: number, total: number) => `${done} de ${total}`,
    scoreGoal: (target: number) => `de ${target.toLocaleString('pt-BR')} pontos para passar de nível`,
    streak: (streak: number) => `Sequência ${streak}`,
    multiplier: (value: number) => `${value.toLocaleString('pt-BR')}x`,
    minimumAccuracy: (percent: number) => `Precisão mínima ${percent}%`,
    currentAccuracy: (percent: number) => `Precisão ${Math.round(percent)}%`,
    timeLeft: 'Tempo restante',
    mistakesLeft: (left: number) => `${left} ${left === 1 ? 'erro restante' : 'erros restantes'}`,
    device: {
      connecting: 'Procurando a parede…',
      lost: 'Conexão com a parede perdida',
      disconnected: 'Parede desconectada',
      retry: 'Reconectar',
    },
  },

  results: {
    cleared: 'Nível concluído!',
    clearedSubtitle: 'Bom trabalho na parede',
    failed: 'Nível não concluído',
    failedReason: {
      timeExpired: 'O tempo acabou.',
      mistakesExhausted: 'Erros demais nesta sequência.',
      deviceLost: 'A conexão com a parede caiu.',
    },
    duration: 'Duração',
    accuracy: 'Precisão',
    averageResponse: 'Resposta média',
    fastestResponse: 'Resposta mais rápida',
    slowestResponse: 'Resposta mais lenta',
    averageInterval: 'Intervalo médio',
    fastestInterval: 'Intervalo mais curto',
    longestStreak: 'Maior sequência',
    finalScore: 'Pontuação',
    completion: 'Conclusão',
    attempts: 'Tentativas',
    impact: 'Impacto médio',
    xpAwarded: (xp: number) => `+${xp.toLocaleString('pt-BR')} XP`,
    levelUp: (level: number) => `Você chegou ao nível ${level}!`,
    saveError: 'Não foi possível salvar esta sessão.',
    guestNotice: 'Entre na sua conta para guardar seu progresso.',
    nextLevel: 'Próximo nível',
    retryLevel: 'Repetir nível',
    exit: 'Sair',
    allLevelsDone: 'Você concluiu todos os níveis deste modo.',
  },

  profile: {
    subtitle: (email: string, level: number) => `${email} · Nível ${level}`,
    sessions: 'Sessões',
    accuracy: 'Precisão',
    bestStreak: 'Melhor sequência',
    favoriteModeLabel: 'MODO FAVORITO',
    records: 'Recordes pessoais',
    bestScore: 'Melhor pontuação',
    fastestLevel: 'Nível mais rápido',
    longestHitStreak: 'Maior sequência de acertos',
    progress: 'Progresso',
    achievements: 'Conquistas',
    seeAll: 'Ver todas',
    settings: 'Configurações',
    empty: '—',
    percentValue: (percent: number) => `${Math.round(percent)}%`,
    durationValue: (milliseconds: number) => {
      const totalSeconds = Math.round(milliseconds / 1000);
      return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
    },
    loadError: 'Não foi possível carregar seu perfil.',
    retry: 'Tentar novamente',
    guestName: 'Visitante',
    guestSubtitle: 'Você está explorando sem uma conta',
    guestMessage:
      'Crie uma conta para salvar seu progresso, acompanhar suas estatísticas e desbloquear conquistas.',
  },

  achievements: {
    title: 'Conquistas',
    unlockedCount: (unlocked: number, total: number) =>
      `${unlocked} de ${total} desbloqueadas`,
    filterAll: 'Todas',
    filterUnlocked: 'Desbloqueadas',
    filterLocked: 'Bloqueadas',
    emptyList: 'Nenhuma conquista nesta lista.',
    items: achievementItems,
  },

  settings: {
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    themeSystem: 'Sistema',
    signOut: 'Sair da conta',
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
