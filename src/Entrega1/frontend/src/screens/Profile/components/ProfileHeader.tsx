import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '../../../components/Avatar';
import { Text } from '../../../components/Text';

const Column = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['6xl']}px;
`;

const Ring = styled.View`
  border-width: ${({ theme }) => theme.sizes.avatarRing}px;
  border-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.sizes.avatarLarge}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const Name = styled(Text).attrs({ size: '3xl', weight: 'extraBold', align: 'center' })``;

const Subtitle = styled(Text).attrs({
  size: 'base',
  weight: 'bold',
  tone: 'inkSoft',
  align: 'center',
})`
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
`;

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
}

export function ProfileHeader({ name, subtitle }: ProfileHeaderProps) {
  const theme = useTheme();

  return (
    <Column>
      <Ring>
        <Avatar name={name} diameter={theme.sizes.avatarLarge} fontSize="5xl" />
      </Ring>
      <Name>{name}</Name>
      <Subtitle>{subtitle}</Subtitle>
    </Column>
  );
}
