import type { ComponentType } from 'react';
import type { SessionResult } from '../gameplay/domain/metrics/session-result';
import type { Achievement } from '../services/profile/types';
import type { PlayableModeId } from '../types/game';
import type { TabIconProps } from './components/TabIcons';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  Game: { mode: PlayableModeId; level: number };
};

export type AppTabParamList = {
  Home: undefined;
  Play: { screen: 'LevelSelect'; params: { mode: PlayableModeId } } | undefined;
  Stats: undefined;
  Ranks: undefined;
  Profile: undefined;
};

export type PlayStackParamList = {
  PlayHome: undefined;
  LevelSelect: { mode: PlayableModeId };
};

export type GameStackParamList = {
  ModeIntro: { mode: PlayableModeId; level: number };
  Match: { mode: PlayableModeId; level: number };
  Results: { result: SessionResult };
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  Achievements: { achievements: Achievement[] };
};

export type AppTabName = keyof AppTabParamList;

export interface TabDefinition {
  name: AppTabName;
  label: string;
  icon: ComponentType<TabIconProps>;
}
