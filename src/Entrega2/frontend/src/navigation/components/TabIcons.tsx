import styled from 'styled-components/native';
import { Triangle } from '../../components/Triangle';

const Column = styled.View`
  align-items: center;
`;

const Block = styled.View<{ width: number; height: number; color: string; radius?: string }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  background-color: ${({ color }) => color};
  border-radius: ${({ radius }) => radius ?? '0px'};
`;

const BarsRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
`;

const Ring = styled.View<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  border-width: 3px;
  border-color: ${({ color }) => color};
`;

const PersonHead = styled.View<{ color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 4.5px;
  background-color: ${({ color }) => color};
  margin-bottom: 2px;
`;

export interface TabIconProps {
  color: string;
}

export function HomeIcon({ color }: TabIconProps) {
  return (
    <Column>
      <Triangle direction="up" length={6} half={6} color={color} />
      <Block width={12} height={8} color={color} radius="0px 0px 2px 2px" />
    </Column>
  );
}

export function PlayIcon({ color }: TabIconProps) {
  return <Triangle direction="right" length={11} half={7} color={color} />;
}

export function StatsIcon({ color }: TabIconProps) {
  return (
    <BarsRow>
      <Block width={4} height={8} color={color} radius="1px" />
      <Block width={4} height={15} color={color} radius="1px" />
      <Block width={4} height={11} color={color} radius="1px" />
    </BarsRow>
  );
}

export function RanksIcon({ color }: TabIconProps) {
  return <Ring color={color} />;
}

export function ProfileIcon({ color }: TabIconProps) {
  return (
    <Column>
      <PersonHead color={color} />
      <Block width={16} height={8} color={color} radius="5px 5px 0px 0px" />
    </Column>
  );
}
