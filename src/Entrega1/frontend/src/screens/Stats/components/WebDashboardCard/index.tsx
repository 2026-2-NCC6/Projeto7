import { Linking } from 'react-native';
import { Button } from '../../../../components/Button';
import { env } from '../../../../config/env';
import { texts } from '../../../../content/texts';
import { Container, Message, Soon, Title } from './styles';

export function WebDashboardCard() {
  const url = env.webUrl;

  return (
    <Container>
      <Title>{texts.stats.webDashboard}</Title>
      <Message>{texts.stats.webDashboardMessage}</Message>
      <Button
        label={texts.stats.webDashboardAction}
        variant="outline"
        disabled={!url}
        onPress={url ? () => void Linking.openURL(url) : undefined}
      />
      {url ? null : <Soon>{texts.stats.webDashboardSoon.toUpperCase()}</Soon>}
    </Container>
  );
}
