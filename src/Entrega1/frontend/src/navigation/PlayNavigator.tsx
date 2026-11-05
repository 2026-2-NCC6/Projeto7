import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { hasLevels, INFINITE_LEVEL } from '../gameplay/modes/mode-catalog';
import type { TrainingRun } from '../gameplay/training/training-run';
import { LevelSelectScreen } from '../screens/LevelSelect';
import { PlayScreen } from '../screens/Play';
import { TrainingCatalogScreen } from '../screens/TrainingCatalog';
import { TrainingDetailScreen } from '../screens/TrainingDetail';
import type { PlayableModeId } from '../types/game';
import type { PlayStackParamList } from './types';

const Stack = createNativeStackNavigator<PlayStackParamList>();

interface PlayNavigatorProps {
  onStartLevel: (mode: PlayableModeId, level: number) => void;
  onStartTraining: (run: TrainingRun) => void;
}

export function PlayNavigator({ onStartLevel, onStartTraining }: PlayNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="PlayHome">
        {({ navigation }) => (
          <PlayScreen
            onOpenTrainings={() => navigation.navigate('Trainings')}
            // An endless mode has nothing to select, so it opens straight into the game.
            onSelectMode={(mode) =>
              hasLevels(mode)
                ? navigation.navigate('LevelSelect', { mode })
                : onStartLevel(mode, INFINITE_LEVEL)
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="LevelSelect">
        {({ navigation, route }) => (
          <LevelSelectScreen
            mode={route.params.mode}
            onGoBack={() => navigation.goBack()}
            onSelectLevel={(level) => onStartLevel(route.params.mode, level)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Trainings">
        {({ navigation }) => (
          <TrainingCatalogScreen
            onGoBack={() => navigation.goBack()}
            onOpenTraining={(id) => navigation.navigate('TrainingDetail', { id })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TrainingDetail">
        {({ navigation, route }) => (
          <TrainingDetailScreen
            trainingId={route.params.id}
            onGoBack={() => navigation.goBack()}
            onStart={onStartTraining}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
