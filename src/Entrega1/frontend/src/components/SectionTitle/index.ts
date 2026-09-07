import styled from 'styled-components/native';
import { Text } from '../Text';

export const SectionTitle = styled(Text).attrs({ size: 'lg', weight: 'extraBold' })`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;
