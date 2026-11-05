import type {
  AgeGroup,
  Audience,
  Category,
  Difficulty,
  DominantHand,
  EndReason,
  GameMode,
  License,
  Objective,
  PracticeGoal,
  PricingModel,
  SkillLevel,
  TargetColor,
  TrainingStatus,
  UserRole,
} from '../api/types';

export const audienceLabels: Record<Audience, string> = {
  kids: 'Crianças',
  teens: 'Adolescentes',
  adults: 'Adultos',
  seniors: 'Melhor idade',
  all: 'Todos os públicos',
};

export const objectiveLabels: Record<Objective, string> = {
  precision: 'Precisão',
  consistency: 'Consistência',
  reaction: 'Reação',
  endurance: 'Resistência',
  fun: 'Diversão',
};

export const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const categoryLabels: Record<Category, string> = {
  warmup: 'Aquecimento',
  precision: 'Precisão',
  reaction: 'Reação',
  endurance: 'Resistência',
  kids: 'Infantil',
  competition: 'Competição',
};

export const licenseLabels: Record<License, string> = {
  free: 'Uso livre',
  cc_by: 'Creative Commons BY',
  proprietary: 'Proprietária',
};

export const pricingLabels: Record<PricingModel, string> = {
  free: 'Gratuito',
  one_time: 'Compra única',
  subscription: 'Assinatura',
};

export const statusLabels: Record<TrainingStatus, string> = {
  draft: 'Rascunho',
  in_review: 'Em revisão',
  published: 'Publicado',
  archived: 'Arquivado',
};

export const roleLabels: Record<UserRole, string> = {
  player: 'Jogador',
  coach: 'Treinador',
  admin: 'Administrador',
};

export const modeLabels: Record<GameMode, string> = {
  level_color: 'Color Mode',
  level_score: 'Score Mode',
  infinite_color: 'Infinite Color',
  infinite_score: 'Infinite Score',
};

export const stepModeLabels: Record<'level_color' | 'level_score', string> = {
  level_color: 'Color — acerte a cor pedida',
  level_score: 'Score — some pontos por cor',
};

export const colorLabels: Record<TargetColor, string> = {
  amber: 'Âmbar',
  blue: 'Azul',
  red: 'Vermelho',
};

export const endReasonLabels: Record<EndReason, string> = {
  cleared: 'Concluída',
  timeExpired: 'Tempo esgotado',
  mistakesExhausted: 'Erros esgotados',
  deviceLost: 'Parede desconectada',
  emergencyStop: 'Parada de emergência',
};

export const ageGroupLabels: Record<AgeGroup, string> = {
  child: 'Criança (até 12)',
  teen: 'Adolescente (13 a 17)',
  adult: 'Adulto (18 a 59)',
  senior: '60 ou mais',
};

export const skillLabels: Record<SkillLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const goalLabels: Record<PracticeGoal, string> = {
  precision: 'Precisão',
  consistency: 'Consistência',
  reaction: 'Reflexo',
  fitness: 'Condicionamento',
  fun: 'Diversão',
};

export const handLabels: Record<DominantHand, string> = {
  right: 'Destro',
  left: 'Canhoto',
};

export const auditLabels: Record<string, string> = {
  'auth.sign_in': 'Entrada',
  'auth.sign_up': 'Cadastro',
  'auth.sign_out': 'Saída',
  'request.refused': 'Requisição recusada',
  'request.failed': 'Falha no servidor',
  'user.role_changed': 'Papel alterado',
  'user.profile_updated': 'Perfil atualizado',
  'training.created': 'Treino criado',
  'training.updated': 'Treino editado',
  'training.simulated': 'Treino simulado',
  'training.submitted': 'Enviado para revisão',
  'training.published': 'Treino publicado',
  'training.returned': 'Devolvido ao autor',
  'training.archived': 'Treino arquivado',
  'training.restored': 'Treino restaurado',
  'session.emergency_stop': 'Parada de emergência',
  'session.offline_synced': 'Sessão offline sincronizada',
};

export function optionsOf<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
