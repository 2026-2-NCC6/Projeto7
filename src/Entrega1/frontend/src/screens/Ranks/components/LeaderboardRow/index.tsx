import { useTheme } from 'styled-components/native';
import { Avatar } from '../../../../components/Avatar';
import { texts } from '../../../../content/texts';
import type { RankedPlayer } from '../../../../services/ranking/types';
import { Identity, Labels, Name, Position, Row, Value, YouLabel, YouTag } from './styles';

interface LeaderboardRowProps {
  player: RankedPlayer;
  formatValue: (value: number) => string;
}

export function LeaderboardRow({ player, formatValue }: LeaderboardRowProps) {
  const theme = useTheme();
  const value = formatValue(player.value);

  return (
    <Row
      highlighted={player.isViewer}
      accessible
      accessibilityLabel={`${texts.ranks.position(player.position)} ${player.name}, ${value}`}
    >
      <Position numberOfLines={1} adjustsFontSizeToFit>
        {player.position}
      </Position>
      <Identity>
        <Avatar name={player.name} diameter={theme.sizes.rowAvatar} fontSize="md" />
        <Labels>
          <Name numberOfLines={1}>{player.name}</Name>
          {player.isViewer ? (
            <YouTag>
              <YouLabel>{texts.ranks.you}</YouLabel>
            </YouTag>
          ) : null}
        </Labels>
      </Identity>
      <Value numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Value>
    </Row>
  );
}
