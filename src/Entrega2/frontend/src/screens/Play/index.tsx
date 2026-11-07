import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { isPlayable, modeCatalog } from '../../gameplay/modes/mode-catalog';
import type { PlayableModeId } from '../../types/game';
import { ModeCard } from './components/ModeCard';
import { TrainingEntryCard } from './components/TrainingEntryCard';
import { CardList, Content, Subtitle, Title } from './styles';

interface PlayScreenProps {
  onSelectMode: (mode: PlayableModeId) => void;
  onOpenTrainings: () => void;
}

export function PlayScreen({ onSelectMode, onOpenTrainings }: PlayScreenProps) {
  return (
    <Screen edges={['top']}>
      <Content>
        <Title>{texts.play.title}</Title>
        <Subtitle>{texts.play.subtitle}</Subtitle>

        <CardList>
          <TrainingEntryCard onPress={onOpenTrainings} />
          {modeCatalog.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              onPress={() => {
                if (isPlayable(mode)) {
                  onSelectMode(mode.id);
                }
              }}
            />
          ))}
        </CardList>
      </Content>
    </Screen>
  );
}
