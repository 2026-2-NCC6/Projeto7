import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../components/Text';
import type { AppTabName, TabDefinition } from '../types';

const Bar = styled.View<{ bottomInset: number }>`
  flex-direction: row;
  border-top-width: ${({ theme }) => theme.sizes.hairline}px;
  border-top-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceRaised};
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-left: ${({ theme }) => theme.spacing.sm}px;
  padding-right: ${({ theme }) => theme.spacing.sm}px;
  padding-bottom: ${({ theme, bottomInset }) => theme.spacing.lg + bottomInset}px;
`;

const Tab = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.xxs}px;
`;

const IconSlot = styled.View`
  width: ${({ theme }) => theme.sizes.tabIcon}px;
  height: ${({ theme }) => theme.sizes.tabIcon}px;
  align-items: center;
  justify-content: center;
`;

const Label = styled(Text).attrs<{ active: boolean }>(({ active }) => ({
  size: '2xs' as const,
  weight: 'extraBold' as const,
  tone: active ? ('ink' as const) : ('inkSoft' as const),
}))<{ active: boolean }>``;

const TabButton = styled(Pressable)`
  flex: 1;
`;

interface SmashTabBarProps extends BottomTabBarProps {
  tabs: TabDefinition[];
}

export function SmashTabBar({ state, navigation, tabs }: SmashTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Bar bottomInset={insets.bottom}>
      {tabs.map((tab, index) => {
        const active = state.index === index;
        const Icon = tab.icon;

        return (
          <TabButton
            key={tab.name}
            accessibilityRole="button"
            accessibilityState={active ? { selected: true } : {}}
            onPress={() => navigation.navigate(tab.name as AppTabName)}
          >
            <Tab>
              <IconSlot>
                <Icon color={active ? theme.colors.primaryDark : theme.colors.inkSoft} />
              </IconSlot>
              <Label active={active} numberOfLines={1} adjustsFontSizeToFit>{tab.label}</Label>
            </Tab>
          </TabButton>
        );
      })}
    </Bar>
  );
}
