import styled from 'styled-components/native';
import { SectionTitle } from '../../components/SectionTitle';
import { Text } from '../../components/Text';

export const Content = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    paddingTop: theme.spacing['6xl'],
    paddingHorizontal: theme.spacing['5xl'],
    paddingBottom: theme.spacing.md,
  },
  showsVerticalScrollIndicator: false,
}))`
  flex: 1;
`;

export const Section = styled(SectionTitle)``;

export const Centered = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['3xl']}px;
  padding: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const ErrorMessage = styled(Text).attrs({
  size: 'md',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
})``;

export const RetryLabel = styled(Text).attrs({
  size: 'md',
  weight: 'extraBold',
  tone: 'primaryDark',
})``;
