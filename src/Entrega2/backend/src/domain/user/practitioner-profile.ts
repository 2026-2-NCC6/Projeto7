export const AGE_GROUPS = ['child', 'teen', 'adult', 'senior'] as const;
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const PRACTICE_GOALS = ['precision', 'consistency', 'reaction', 'fitness', 'fun'] as const;
export const DOMINANT_HANDS = ['right', 'left'] as const;
export const MAX_RESTRICTIONS_LENGTH = 280;

export type AgeGroup = (typeof AGE_GROUPS)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type PracticeGoal = (typeof PRACTICE_GOALS)[number];
export type DominantHand = (typeof DOMINANT_HANDS)[number];

export interface PractitionerProfile {
  ageGroup: AgeGroup | null;
  skillLevel: SkillLevel | null;
  goals: PracticeGoal[];
  dominantHand: DominantHand | null;
  restrictions: string | null;
}

export const EMPTY_PRACTITIONER_PROFILE: PractitionerProfile = {
  ageGroup: null,
  skillLevel: null,
  goals: [],
  dominantHand: null,
  restrictions: null,
};

export function isMinor(ageGroup: AgeGroup | null): boolean {
  return ageGroup === 'child' || ageGroup === 'teen';
}

export function publicNameOf(name: string, minor: boolean): string {
  if (!minor) {
    return name;
  }

  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);

  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}

export function normalizeProfile(profile: PractitionerProfile): PractitionerProfile {
  const restrictions = profile.restrictions?.trim() ?? '';

  return {
    ageGroup: profile.ageGroup,
    skillLevel: profile.skillLevel,
    goals: [...new Set(profile.goals)],
    dominantHand: profile.dominantHand,
    restrictions: restrictions.length > 0 ? restrictions.slice(0, MAX_RESTRICTIONS_LENGTH) : null,
  };
}
