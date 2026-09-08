import styled from 'styled-components/native';
import { Text } from '../Text';

export const Circle = styled.View<{ diameter: number }>`
  width: ${({ diameter }) => diameter}px;
  height: ${({ diameter }) => diameter}px;
  border-radius: ${({ diameter }) => diameter / 2}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.ink};
`;

export const Initial = styled(Text).attrs({ weight: 'extraBold', tone: 'onInk' })``;
