import styled from 'styled-components/native';

export const IconTile = styled.View<{ diameter: number; background: string }>`
  width: ${({ diameter }) => diameter}px;
  height: ${({ diameter }) => diameter}px;
  border-radius: ${({ theme }) => theme.radii['2xl']}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ background }) => background};
`;
