import styled from 'styled-components/native';
import { Text } from '../../../../components/Text';

const SHADE_FLOOR = 0.14;
const SHADE_RANGE = 1 - SHADE_FLOOR;

export const Grid = styled.View`
  width: 100%;
  max-width: ${({ theme }) => theme.sizes.heatmapMaxWidth}px;
  align-self: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const GridRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Cell = styled.View`
  flex: 1;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii['2xl']}px;
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
`;

export const Shade = styled.View<{ intensity: number }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ intensity }) => (intensity > 0 ? SHADE_FLOOR + intensity * SHADE_RANGE : 0)};
`;

export const Swatch = styled.View<{ color: string }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm}px;
  left: ${({ theme }) => theme.spacing.sm}px;
  width: ${({ theme }) => theme.sizes.swatch / 1.5}px;
  height: ${({ theme }) => theme.sizes.swatch / 1.5}px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background-color: ${({ color }) => color};
`;

export const CellLabel = styled(Text).attrs<{ strong: boolean }>(({ strong }) => ({
  size: 'smPlus' as const,
  weight: 'extraBold' as const,
  tone: strong ? ('onPrimary' as const) : ('ink' as const),
}))<{ strong: boolean }>``;

export const Divider = styled.View`
  height: ${({ theme }) => theme.sizes.hairline}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const Subheading = styled(Text).attrs({ size: 'base', weight: 'extraBold' })``;

export const ColorRows = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const ColorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const ColorSwatch = styled.View<{ color: string }>`
  width: ${({ theme }) => theme.sizes.swatch}px;
  height: ${({ theme }) => theme.sizes.swatch}px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  background-color: ${({ color }) => color};
`;

export const ColorName = styled(Text).attrs({ size: 'sm', weight: 'bold', tone: 'inkSoft' })`
  width: 28%;
`;

export const Meter = styled.View`
  flex: 1;
`;

export const ColorValue = styled(Text).attrs({ size: 'base', weight: 'extraBold', align: 'right' })`
  min-width: ${({ theme }) => theme.sizes.rankColumn + theme.spacing.md}px;
`;
