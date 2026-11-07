import { Modal, Pressable } from 'react-native';
import { Button } from '../../../components/Button';
import { texts } from '../../../content/texts';
import { useSafetyStore } from '../../store/safetyStore';
import {
  Backdrop,
  Floating,
  Reason,
  ReasonLabel,
  Sheet,
  SheetHint,
  SheetTitle,
  StopLabel,
  StopMark,
  StopPill,
} from './styles';

export function EmergencyStop() {
  const lock = useSafetyStore((state) => state.lock);
  const locked = useSafetyStore((state) => state.locked);
  const choosing = useSafetyStore((state) => state.stopping);
  const beginStop = useSafetyStore((state) => state.beginStop);
  const cancelStop = useSafetyStore((state) => state.cancelStop);

  if (locked) {
    return null;
  }

  return (
    <>
      <Floating>
        <Pressable onPress={beginStop} accessibilityRole="button" accessibilityLabel={texts.safety.stopLabel}>
          <StopPill>
            <StopMark />
            <StopLabel>{texts.safety.stop.toUpperCase()}</StopLabel>
          </StopPill>
        </Pressable>
      </Floating>
      <Modal visible={choosing} transparent animationType="slide" onRequestClose={cancelStop}>
        <Backdrop>
          <Sheet>
            <SheetTitle>{texts.safety.stopLabel}</SheetTitle>
            <SheetHint>{texts.safety.chooseReason}</SheetHint>
            {texts.safety.reasons.map((reason) => (
              <Pressable key={reason} onPress={() => lock(reason)} accessibilityRole="button">
                <Reason>
                  <ReasonLabel>{reason}</ReasonLabel>
                </Reason>
              </Pressable>
            ))}
            <Button label={texts.safety.cancel} variant="outline" onPress={cancelStop} />
          </Sheet>
        </Backdrop>
      </Modal>
    </>
  );
}
