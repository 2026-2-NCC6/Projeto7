import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export const Content = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    flexGrow: 1,
    paddingTop: theme.spacing['9xl'],
    paddingHorizontal: theme.spacing['8xl'],
    paddingBottom: theme.spacing['10xl'],
  },
  keyboardShouldPersistTaps: 'handled' as const,
}))`
  flex: 1;
`;

export const Spacer = styled.View`
  flex: 1;
`;

export const BrandName = styled(Text).attrs({
  size: 'lg',
  weight: 'extraBold',
  tracking: 'wide',
})``;

export const Heading = styled(Text).attrs({
  size: '5xl',
  weight: 'extraBold',
  leading: 'tight',
})`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Subheading = styled(Text).attrs({
  size: 'lg',
  tone: 'inkSoft',
  leading: 'relaxed',
})``;

export const FieldStack = styled.View`
  gap: ${({ theme }) => theme.spacing['2xl']}px;
`;

export const FormError = styled(Text).attrs({
  size: 'base',
  weight: 'bold',
  tone: 'danger',
  align: 'center',
})`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const FooterPrompt = styled(Text).attrs({
  size: 'md',
  tone: 'inkSoft',
  align: 'center',
})`
  padding-top: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const FooterAction = styled(Text).attrs({
  size: 'md',
  weight: 'extraBold',
  tone: 'primaryDark',
})``;
