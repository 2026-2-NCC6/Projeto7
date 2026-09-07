import styled, { css } from 'styled-components/native';

export interface TriangleProps {
  direction: 'right' | 'up';
  length: number;
  half: number;
  color: string;
}

export const Triangle = styled.View<TriangleProps>`
  width: 0;
  height: 0;
  background-color: transparent;
  border-style: solid;

  ${({ direction, length, half, color }) =>
    direction === 'right'
      ? css`
          border-top-width: ${half}px;
          border-bottom-width: ${half}px;
          border-left-width: ${length}px;
          border-top-color: transparent;
          border-bottom-color: transparent;
          border-left-color: ${color};
        `
      : css`
          border-left-width: ${half}px;
          border-right-width: ${half}px;
          border-bottom-width: ${length}px;
          border-left-color: transparent;
          border-right-color: transparent;
          border-bottom-color: ${color};
        `}
`;
