import styled from 'styled-components/native';

export const ProgressTrack = styled.View<{ height?: number }>`
  width: 100%;
  height: ${({ theme, height }) => height ?? theme.sizes.progressBar}px;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

export const ProgressFill = styled.View<{ percentage: number }>`
  width: ${({ percentage }) => percentage}%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radii.pill}px;
  background-color: ${({ theme }) => theme.colors.primaryDark};
`;
