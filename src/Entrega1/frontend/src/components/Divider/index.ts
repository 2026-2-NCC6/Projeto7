import styled from 'styled-components/native';

export const Divider = styled.View`
  flex: 1;
  height: ${({ theme }) => theme.sizes.hairline}px;
  background-color: ${({ theme }) => theme.colors.border};
`;
