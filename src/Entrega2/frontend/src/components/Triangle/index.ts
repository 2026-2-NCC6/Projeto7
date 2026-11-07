import styled, { css } from 'styled-components/native';

export type TriangleDirection = 'right' | 'left' | 'up' | 'down';

export interface TriangleProps {
  direction: TriangleDirection;
  length: number;
  half: number;
  color: string;
}

const oppositeSide: Record<TriangleDirection, 'left' | 'right' | 'top' | 'bottom'> = {
  right: 'left',
  left: 'right',
  up: 'bottom',
  down: 'top',
};

const perpendicularSides: Record<TriangleDirection, ['top', 'bottom'] | ['left', 'right']> = {
  right: ['top', 'bottom'],
  left: ['top', 'bottom'],
  up: ['left', 'right'],
  down: ['left', 'right'],
};

export const Triangle = styled.View<TriangleProps>`
  width: 0;
  height: 0;
  background-color: transparent;
  border-style: solid;

  ${({ direction, length, half, color }) => {
    const [first, second] = perpendicularSides[direction];

    return css`
      border-${first}-width: ${half}px;
      border-${second}-width: ${half}px;
      border-${first}-color: transparent;
      border-${second}-color: transparent;
      border-${oppositeSide[direction]}-width: ${length}px;
      border-${oppositeSide[direction]}-color: ${color};
    `;
  }}
`;
