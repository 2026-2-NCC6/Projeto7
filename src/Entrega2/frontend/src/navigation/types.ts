import type { ComponentType } from 'react';
import type { SessionResult } from '../gameplay/domain/metrics/session-result';
import type { TrainingRun } from '../gameplay/training/training-run';
import type { Achievement } from '../services/profile/types';
import type { LevelModeId, PlayableModeId } from '../types/game';
import type { TabIconProps } from './components/TabIcons';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  Game: { mode: PlayableModeId; level: number; training?: TrainingRun };
};

export type AppTabParamList = {
  Home: undefined;
  Play: { screen: 'LevelSelect'; params: { mode: LevelModeId } } | undefined;
  Stats: undefined;
  Ranks: undefined;
  Profile: undefined;
};

export type PlayStackParamList = {
  PlayHome: undefined;
  LevelSelect: { mode: LevelModeId };
  Trainings: undefined;
  TrainingDetail: { id: string };
};

export type GameStackParamList = {
  ModeIntro: { mode: PlayableModeId; level: number; training?: TrainingRun };
  Match: { mode: PlayableModeId; level: number; training?: TrainingRun };
  Results: { result: SessionResult; training?: TrainingRun };
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  Achievements: { achievements: Achievement[] };
  Practitioner: undefined;
};

export type AppTabName = keyof AppTabParamList;

export interface TabDefinition {
  name: AppTabName;
  label: string;
  icon: ComponentType<TabIconProps>;
}
