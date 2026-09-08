import styled from 'styled-components/native';
import { Text } from '../../components/Text';

export { Centered, Content, ErrorMessage, RetryLabel, Section } from '../shared/screenStyles';

export const GuestMessage = styled(Text).attrs({
  size: 'md',
  tone: 'inkSoft',
  align: 'center',
  leading: 'relaxed',
})`
  margin-bottom: ${({ theme }) => theme.spacing['7xl']}px;
`;
