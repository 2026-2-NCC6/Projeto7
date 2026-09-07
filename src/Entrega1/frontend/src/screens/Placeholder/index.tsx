import styled from 'styled-components/native';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { texts } from '../../content/texts';

const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['5xl']}px;
`;

const Title = styled(Text).attrs({ size: '4xl', weight: 'extraBold', align: 'center' })`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Description = styled(Text).attrs({
  size: 'md',
  tone: 'inkSoft',
  align: 'center',
  leading: 'relaxed',
})``;

interface PlaceholderScreenProps {
  title: string;
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <Screen edges={['top']}>
      <Center>
        <Title>{title}</Title>
        <Description>{texts.placeholder.description}</Description>
      </Center>
    </Screen>
  );
}
