import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { texts } from '../content/texts';
import { HomeScreen } from '../screens/Home';
import { PlaceholderScreen } from '../screens/Placeholder';
import type { PlayableModeId } from '../types/game';
import {
  HomeIcon,
  PlayIcon,
  ProfileIcon,
  RanksIcon,
  StatsIcon,
} from './components/TabIcons';
import { SmashTabBar } from './components/SmashTabBar';
import { PlayNavigator } from './PlayNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import type { AppTabParamList, TabDefinition } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const tabs: TabDefinition[] = [
  { name: 'Home', label: texts.tabs.home, icon: HomeIcon },
  { name: 'Play', label: texts.tabs.play, icon: PlayIcon },
  { name: 'Stats', label: texts.tabs.stats, icon: StatsIcon },
  { name: 'Ranks', label: texts.tabs.ranks, icon: RanksIcon },
  { name: 'Profile', label: texts.tabs.profile, icon: ProfileIcon },
];

interface AppTabsProps {
  onStartLevel: (mode: PlayableModeId, level: number) => void;
}

export function AppTabs({ onStartLevel }: AppTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <SmashTabBar {...props} tabs={tabs} />}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen
            onViewProfile={() => navigation.navigate('Profile')}
            onOpenPlay={() => navigation.navigate('Play')}
            onSelectMode={(mode) =>
              navigation.navigate('Play', { screen: 'LevelSelect', params: { mode } })
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Play">{() => <PlayNavigator onStartLevel={onStartLevel} />}</Tab.Screen>
      <Tab.Screen name="Stats">{() => <PlaceholderScreen title={texts.tabs.stats} />}</Tab.Screen>
      <Tab.Screen name="Ranks">{() => <PlaceholderScreen title={texts.tabs.ranks} />}</Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
