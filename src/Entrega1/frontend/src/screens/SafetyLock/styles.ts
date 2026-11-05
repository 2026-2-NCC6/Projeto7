import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Body = styled.View`
  flex: 1;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing['3xl']}px;
  padding: ${({ theme }) => theme.spacing['5xl']}px;
`;

export const Badge = styled.View`
  width: ${({ theme }) => theme.sizes.avatarLarge}px;
  height: ${({ theme }) => theme.sizes.avatarLarge}px;
  border-radius: ${({ theme }) => theme.radii['5xl']}px;
  align-self: center;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.danger};
`;

export const BadgeMark = styled.View`
  width: ${({ theme }) => theme.sizes.badge / 2}px;
  height: ${({ theme }) => theme.sizes.badge / 2}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ theme }) => theme.colors.onDanger};
`;

export const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold', align: 'center' })``;

export const Message = styled(Text).attrs({ size: 'md', weight: 'bold', tone: 'inkSoft', align: 'center', leading: 'relaxed' })``;

export const Hint = styled(Text).attrs({ size: 'smPlus', tone: 'inkSoft', align: 'center', leading: 'relaxed' })``;

export const Safe = styled(SafeAreaView)`
  flex: 1;
`;
