import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export const Stage = styled(Animated.View)`
  flex: 1;
`;

export const Safe = styled(SafeAreaView)`
  flex: 1;
`;

export const TimeArea = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing['5xl']}px ${({ theme }) => theme.spacing['5xl']}px 0;
`;

export const TimeLabel = styled(Text).attrs({
  size: 'xs',
  weight: 'extraBold',
  tracking: 'wider',
})<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

export const Middle = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['4xl']}px;
`;

export const Prompt = styled(Text).attrs({
  size: 'sm',
  weight: 'extraBold',
  tracking: 'wider',
  align: 'center',
})<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

export const TargetName = styled(Text).attrs({
  size: '5xl',
  weight: 'extraBold',
  align: 'center',
})<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

export const Score = styled(Text).attrs({
  size: '3xl',
  weight: 'extraBold',
  align: 'center',
})<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;

export const Footer = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const FooterNote = styled(Text).attrs({
  size: 'smPlus',
  weight: 'bold',
  align: 'center',
})<{ foreground: string }>`
  color: ${({ foreground }) => foreground};
`;
