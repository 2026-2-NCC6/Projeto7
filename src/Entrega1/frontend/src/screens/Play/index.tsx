import { Screen } from '../../components/Screen';
import { texts } from '../../content/texts';
import { isPlayable, modeCatalog } from '../../gameplay/modes/mode-catalog';
import type { PlayableModeId } from '../../types/game';
import { ModeCard } from './components/ModeCard';
import { CardList, Content, Subtitle, Title } from './styles';

interface PlayScreenProps {
  onSelectMode: (mode: PlayableModeId) => void;
}

export function PlayScreen({ onSelectMode }: PlayScreenProps) {
  return (
    <Screen edges={['top']}>
      <Content>
        <Title>{texts.play.title}</Title>
        <Subtitle>{texts.play.subtitle}</Subtitle>

        <CardList>
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
