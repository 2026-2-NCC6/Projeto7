import { useTheme } from 'styled-components/native';
import { Avatar } from '../../../../components/Avatar';
import { texts } from '../../../../content/texts';
import type { RankedPlayer } from '../../../../services/ranking/types';
import { podiumOrder } from '../../data/leaderboardView';
import { Column, Name, Ring, Row, Step, StepNumber, Value, type PodiumPlace } from './styles';

interface PodiumProps {
  players: readonly RankedPlayer[];
  formatValue: (value: number) => string;
}

export function Podium({ players, formatValue }: PodiumProps) {
  const theme = useTheme();

  return (
    <Row>
      {podiumOrder(players).map((player) => {
        const slot = players.indexOf(player) + 1;
        const place = player.position as PodiumPlace;
        const diameter = place === 1 ? theme.sizes.podiumAvatarLeader : theme.sizes.podiumAvatar;

        return (
          <Column
            key={`${slot}-${player.name}`}
            testID={`podium-${slot}`}
            accessible
            accessibilityLabel={`${texts.ranks.position(player.position)} ${player.name}, ${formatValue(player.value)}`}
          >
            <Ring place={place}>
              <Avatar name={player.name} diameter={diameter} fontSize={place === 1 ? '4xl' : '2xl'} />
            </Ring>
            <Name numberOfLines={1}>{player.isViewer ? texts.ranks.you : player.name}</Name>
            <Value numberOfLines={1}>{formatValue(player.value)}</Value>
            <Step place={place}>
              <StepNumber place={place}>{player.position}</StepNumber>
            </Step>
          </Column>
        );
      })}
    </Row>
  );
}
