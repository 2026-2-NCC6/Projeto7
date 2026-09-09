import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLevelProgressStore } from '../gameplay/store/levelProgressStore';
import { GameResultsScreen } from '../screens/GameResults';
import { ModeIntroScreen } from '../screens/ModeIntro';
import { matchScreens } from './gameScreens';
import type { AppStackParamList, GameStackParamList } from './types';

const Stack = createNativeStackNavigator<GameStackParamList>();

type GameNavigatorProps = NativeStackScreenProps<AppStackParamList, 'Game'>;

export function GameNavigator({ route, navigation }: GameNavigatorProps) {
  const { mode, level } = route.params;
  const introSeen = useLevelProgressStore((state) => state.introSeen[mode]);
  const leaveGame = () => navigation.goBack();

  return (
    <Stack.Navigator
      initialRouteName={introSeen ? 'Match' : 'ModeIntro'}
      screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
    >
      <Stack.Screen name="ModeIntro" initialParams={{ mode, level }}>
        {({ navigation: stack, route: introRoute }) => (
          <ModeIntroScreen
            mode={introRoute.params.mode}
            onStart={() => stack.replace('Match', introRoute.params)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Match" initialParams={{ mode, level }}>
        {({ navigation: stack, route: matchRoute }) => {
          const MatchScreen = matchScreens[matchRoute.params.mode];

          return (
            <MatchScreen
              key={`${matchRoute.params.mode}:${matchRoute.params.level}`}
              level={matchRoute.params.level}
              onExit={leaveGame}
              onHelp={() => stack.navigate('ModeIntro', matchRoute.params)}
              onFinish={(result) => stack.replace('Results', { result })}
            />
          );
        }}
      </Stack.Screen>

      <Stack.Screen name="Results">
        {({ navigation: stack, route: resultsRoute }) => (
          <GameResultsScreen
            result={resultsRoute.params.result}
            onPlayLevel={(nextLevel) =>
              stack.replace('Match', { mode: resultsRoute.params.result.mode, level: nextLevel })
            }
            onExit={leaveGame}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
