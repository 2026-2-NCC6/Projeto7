import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

export const Table = styled.View``;

export const HeaderRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const BodyRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px 0;
  border-top-width: ${({ theme }) => theme.sizes.hairline}px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

export const SessionColumn = styled.View`
  flex: 2;
`;

export const NumberColumn = styled.View`
  flex: 1;
  align-items: flex-end;
`;

export const HeaderLabel = styled(Text).attrs({
  size: '2xs',
  weight: 'extraBold',
  tone: 'inkSoft',
  tracking: 'wide',
})``;

export const ModeLabel = styled(Text).attrs({ size: 'base', weight: 'extraBold' })``;

export const DateLabel = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft' })``;

export const NumberLabel = styled(Text).attrs({ size: 'base', weight: 'extraBold', align: 'right' })``;
