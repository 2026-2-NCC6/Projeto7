import styled from 'styled-components/native';
import { Divider } from '../../../components/Divider';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

const Label = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft' })``;

export function OrDivider() {
  return (
    <Row>
      <Divider />
      <Label>{texts.login.divider}</Label>
      <Divider />
    </Row>
  );
}
