import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmergencyStop } from '../gameplay/components/EmergencyStop';
import { useLevelProgressStore } from '../gameplay/store/levelProgressStore';
import { nextStepOf } from '../gameplay/training/training-run';
import { GameResultsScreen } from '../screens/GameResults';
import { ModeIntroScreen } from '../screens/ModeIntro';
import { matchScreens } from './gameScreens';
import type { AppStackParamList, GameStackParamList } from './types';

const Stack = createNativeStackNavigator<GameStackParamList>();

type GameNavigatorProps = NativeStackScreenProps<AppStackParamList, 'Game'>;

export function GameNavigator({ route, navigation }: GameNavigatorProps) {
  const { mode, level, training } = route.params;
  const introSeen = useLevelProgressStore((state) => state.introSeen[mode]);
  const leaveGame = () => navigation.goBack();

  return (
    <Stack.Navigator
      initialRouteName={introSeen ? 'Match' : 'ModeIntro'}
      screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
    >
      <Stack.Screen name="ModeIntro" initialParams={{ mode, level, training }}>
        {({ navigation: stack, route: introRoute }) => (
          <ModeIntroScreen
            mode={introRoute.params.mode}
            onStart={() => stack.replace('Match', introRoute.params)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Match" initialParams={{ mode, level, training }}>
        {({ navigation: stack, route: matchRoute }) => {
          const MatchScreen = matchScreens[matchRoute.params.mode];

          return (
            <>
              <MatchScreen
                key={`${matchRoute.params.mode}:${matchRoute.params.level}:${matchRoute.params.training?.stepIndex ?? ''}`}
                level={matchRoute.params.level}
                training={matchRoute.params.training}
                onExit={leaveGame}
                onHelp={() => stack.navigate('ModeIntro', matchRoute.params)}
                onFinish={(result) =>
                  stack.replace('Results', { result, training: matchRoute.params.training })
                }
              />
              <EmergencyStop />
            </>
          );
        }}
      </Stack.Screen>

      <Stack.Screen name="Results">
        {({ navigation: stack, route: resultsRoute }) => (
          <GameResultsScreen
            result={resultsRoute.params.result}
            training={resultsRoute.params.training}
            onPlayLevel={(nextLevel) =>
              stack.replace('Match', {
                mode: resultsRoute.params.result.mode,
                level: nextLevel,
                training: resultsRoute.params.training,
              })
            }
            onNextStep={(run) => {
              const next = nextStepOf(run);
              stack.replace('Match', { mode: next.steps[next.stepIndex].mode, level: 0, training: next });
            }}
            onExit={leaveGame}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
