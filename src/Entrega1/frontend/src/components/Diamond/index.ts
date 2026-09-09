import styled from 'styled-components/native';

export const Diamond = styled.View`
  width: ${({ theme }) => theme.sizes.heroCell}px;
  height: ${({ theme }) => theme.sizes.heroCell}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ theme }) => theme.colors.primaryDark};
  transform: rotate(45deg);
`;
