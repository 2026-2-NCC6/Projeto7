import { Container, Label, Value } from './styles';

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <Container>
      <Value>{value}</Value>
      <Label>{label}</Label>
    </Container>
  );
}
