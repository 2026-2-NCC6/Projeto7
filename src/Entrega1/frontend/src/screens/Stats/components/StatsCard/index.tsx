import type { ReactNode } from 'react';
import { Caption, Container, Header, Title, Titles } from './styles';

interface StatsCardProps {
  title: string;
  caption?: string;
  accessory?: ReactNode;
  children?: ReactNode;
}

export function StatsCard({ title, caption, accessory, children }: StatsCardProps) {
  return (
    <Container>
      <Header>
        <Titles>
          <Title accessibilityRole="header">{title}</Title>
          {caption ? <Caption>{caption}</Caption> : null}
        </Titles>
        {accessory}
      </Header>
      {children}
    </Container>
  );
}
