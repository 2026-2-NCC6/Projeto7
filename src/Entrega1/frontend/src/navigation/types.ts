import type { ComponentType } from 'react';
import type { TabIconProps } from './components/TabIcons';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Play: undefined;
  Stats: undefined;
  Ranks: undefined;
  Profile: undefined;
};

export type AppTabName = keyof AppTabParamList;

export interface TabDefinition {
  name: AppTabName;
  label: string;
  icon: ComponentType<TabIconProps>;
}
