import styled from 'styled-components/native';
import { PillToggle, type PillOption } from '../../../components/PillToggle';
import { Text } from '../../../components/Text';
import { texts } from '../../../content/texts';
import { useThemeStore } from '../../../store/themeStore';
import type { ThemePreference } from '../../../theme';

const options: PillOption<ThemePreference>[] = [
  { value: 'light', label: texts.settings.themeLight },
  { value: 'dark', label: texts.settings.themeDark },
  { value: 'system', label: texts.settings.themeSystem },
];

const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing['3xl']}px;
`;

const Label = styled(Text).attrs({ size: 'mdPlus', weight: 'bold' })``;

export function ThemeModeRow() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  return (
    <Container>
      <Label>{texts.settings.theme}</Label>
      <PillToggle options={options} selected={preference} onSelect={setPreference} raised />
    </Container>
  );
}
