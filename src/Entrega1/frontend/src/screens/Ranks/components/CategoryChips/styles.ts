import styled from 'styled-components/native';

export const Scroller = styled.ScrollView.attrs(({ theme }) => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { paddingHorizontal: theme.spacing['5xl'] },
}))`
  flex-grow: 0;
  margin: 0 -${({ theme }) => theme.spacing['5xl']}px;
`;
