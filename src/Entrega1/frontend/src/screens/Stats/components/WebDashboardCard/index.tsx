import { Button } from '../../../../components/Button';
import { texts } from '../../../../content/texts';
import { Container, Message, Soon, Title } from './styles';

export function WebDashboardCard() {
  return (
    <Container>
      <Title>{texts.stats.webDashboard}</Title>
      <Message>{texts.stats.webDashboardMessage}</Message>
      <Button label={texts.stats.webDashboardAction} variant="outline" disabled />
      <Soon>{texts.stats.webDashboardSoon.toUpperCase()}</Soon>
    </Container>
  );
}
