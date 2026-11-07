import { Alert } from 'react-native';
import { Button } from '../../components/Button';
import { texts } from '../../content/texts';
import { useSafetyStore } from '../../gameplay/store/safetyStore';
import { Badge, BadgeMark, Body, Hint, Message, Overlay, Safe, Title } from './styles';

export function SafetyLockOverlay() {
  const locked = useSafetyStore((state) => state.locked);
  const reason = useSafetyStore((state) => state.reason);
  const unlock = useSafetyStore((state) => state.unlock);

  if (!locked) {
    return null;
  }

  const confirmRestart = () =>
    Alert.alert(texts.safety.confirmTitle, texts.safety.confirmMessage, [
      { text: texts.safety.keepLocked, style: 'cancel' },
      { text: texts.safety.confirm, style: 'destructive', onPress: unlock },
    ]);

  return (
    <Overlay accessibilityViewIsModal>
      <Safe>
        <Body>
          <Badge>
            <BadgeMark />
          </Badge>
          <Title>{texts.safety.lockedTitle}</Title>
          <Message>{texts.safety.lockedMessage(reason)}</Message>
          <Hint>{texts.safety.checklist}</Hint>
          <Button label={texts.safety.restart} onPress={confirmRestart} />
        </Body>
      </Safe>
    </Overlay>
  );
}
