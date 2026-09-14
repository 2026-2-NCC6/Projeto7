import { EmptyState } from '../../../../components/StateView';
import { texts } from '../../../../content/texts';
import type { ViewerStanding } from '../../data/leaderboardView';
import { Spacer } from './styles';

interface StandingPromptProps {
  standing: ViewerStanding;
  boardIsEmpty: boolean;
  onSignIn: () => void;
}

export function StandingPrompt({ standing, boardIsEmpty, onSignIn }: StandingPromptProps) {
  if (standing === 'guest') {
    return (
      <Spacer>
        <EmptyState
          title={texts.ranks.guestTitle}
          message={texts.ranks.guestMessage}
          action={{ label: texts.ranks.guestAction, onPress: onSignIn }}
        />
      </Spacer>
    );
  }

  if (standing === 'unranked' && !boardIsEmpty) {
    return (
      <Spacer>
        <EmptyState title={texts.ranks.unrankedTitle} message={texts.ranks.unrankedMessage} />
      </Spacer>
    );
  }

  return null;
}
