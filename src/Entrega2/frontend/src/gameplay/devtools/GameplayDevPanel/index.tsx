import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { SimulatedTargetDevice } from '../../../device/adapters/simulated/simulated-device';
import { WALL_TARGETS, type TargetId } from '../../../device/contracts';
import { useDevice } from '../../../device/runtime/useDevice';
import { useAutopilot } from '../useAutopilot';
import {
  Cell,
  CellLabel,
  Chip,
  ChipLabel,
  Dock,
  Grid,
  Panel,
  Row,
  Toggle,
  ToggleLabel,
} from './styles';

const PACE_MS = { rápido: 700, normal: 1300, lento: 2200 } as const;

type Pace = keyof typeof PACE_MS;

interface GameplayDevPanelProps {
  expectedTargets: readonly TargetId[];
}

export function GameplayDevPanel({ expectedTargets }: GameplayDevPanelProps) {
  const theme = useTheme();
  const { device, reconnect } = useDevice();
  const [open, setOpen] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [pace, setPace] = useState<Pace>('normal');

  const simulator = device instanceof SimulatedTargetDevice ? device : null;

  useAutopilot({
    device: simulator,
    running: autopilot,
    expectedTargets,
    intervalMs: PACE_MS[pace],
  });

  if (!__DEV__ || !simulator) {
    return null;
  }

  return (
    <Dock pointerEvents="box-none">
      {open ? (
        <Panel>
          <Grid>
            {WALL_TARGETS.map((target) => {
              const tone = theme.colors.target[target.color];

              return (
                <Pressable
                  key={target.id}
                  onPress={() => simulator.emitHit(target.id)}
                  accessibilityRole="button"
                >
                  <Cell fill={tone.background}>
                    <CellLabel foreground={tone.foreground}>{target.id}</CellLabel>
                  </Cell>
                </Pressable>
              );
            })}
          </Grid>

          <Row>
            <Pressable onPress={() => setAutopilot((running) => !running)}>
              <Chip active={autopilot}>
                <ChipLabel active={autopilot}>auto</ChipLabel>
              </Chip>
            </Pressable>
            {(Object.keys(PACE_MS) as Pace[]).map((option) => (
              <Pressable key={option} onPress={() => setPace(option)}>
                <Chip active={pace === option}>
                  <ChipLabel active={pace === option}>{option}</ChipLabel>
                </Chip>
              </Pressable>
            ))}
          </Row>

          <Row>
            <Pressable onPress={() => simulator.dropConnection()}>
              <Chip active={false}>
                <ChipLabel active={false}>cair</ChipLabel>
              </Chip>
            </Pressable>
            <Pressable onPress={reconnect}>
              <Chip active={false}>
                <ChipLabel active={false}>reconectar</ChipLabel>
              </Chip>
            </Pressable>
            <Pressable onPress={() => simulator.emitRaw({ alvo: 42 })}>
              <Chip active={false}>
                <ChipLabel active={false}>ruído</ChipLabel>
              </Chip>
            </Pressable>
          </Row>
        </Panel>
      ) : null}

      <Pressable onPress={() => setOpen((visible) => !visible)} accessibilityRole="button">
        <Toggle>
          <ToggleLabel>{open ? 'fechar sim' : 'sim'}</ToggleLabel>
        </Toggle>
      </Pressable>
    </Dock>
  );
}
