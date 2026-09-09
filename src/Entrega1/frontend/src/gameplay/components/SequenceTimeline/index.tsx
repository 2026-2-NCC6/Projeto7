import styled from 'styled-components/native';
import { Text } from '../../../components/Text';

const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: 0 ${({ theme }) => theme.spacing['5xl']}px;
`;

const Dot = styled.View<{ fill: string; outline: string }>`
  width: ${({ theme }) => theme.sizes.timelineDot}px;
  height: ${({ theme }) => theme.sizes.timelineDot}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ fill }) => fill};
  border-width: ${({ theme }) => theme.sizes.timelineDotBorder}px;
  border-color: ${({ outline }) => outline};
`;

const Mark = styled(Text).attrs({ size: 'sm', weight: 'extraBold' })<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

export interface TimelineColors {
  readonly done: string;
  readonly doneMark: string;
  readonly current: string;
  readonly pending: string;
  readonly outline: string;
}

interface SequenceTimelineProps {
  length: number;
  index: number;
  colors: TimelineColors;
}

export function SequenceTimeline({ length, index, colors }: SequenceTimelineProps) {
  return (
    <Row>
      {Array.from({ length }, (_, position) => {
        const done = position < index;
        const current = position === index;

        return (
          <Dot
            key={position}
            fill={done ? colors.done : current ? colors.current : colors.pending}
            outline={current ? colors.outline : 'transparent'}
          >
            {done ? <Mark foreground={colors.doneMark}>✓</Mark> : null}
          </Dot>
        );
      })}
    </Row>
  );
}
