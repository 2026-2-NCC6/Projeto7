import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components/native';
import { axisLabelIndexes, barHeight, barLayout, niceMax } from '../scale';
import { AxisLabel, AxisRow, Container, Plot, ScaleLabel } from './styles';

export interface BarDatum {
  key: string;
  label: string;
  value: number;
}

interface BarChartProps {
  data: readonly BarDatum[];
  formatValue: (value: number) => string;
  accessibilityLabel: string;
}

export function BarChart({ data, formatValue, accessibilityLabel }: BarChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const height = theme.sizes.chartHeight;
  const max = niceMax(data.map((datum) => datum.value));
  const layout = barLayout({
    count: data.length,
    width,
    maxBarWidth: theme.sizes.chartBarMaxWidth,
    minGap: theme.sizes.chartBarMinGap,
  });
  const stubHeight = theme.sizes.hairline * 2;

  return (
    <Container accessible accessibilityLabel={accessibilityLabel}>
      <ScaleLabel>{formatValue(max)}</ScaleLabel>
      <Plot onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Line
              x1={0}
              x2={width}
              y1={height - theme.sizes.hairline / 2}
              y2={height - theme.sizes.hairline / 2}
              stroke={theme.colors.border}
              strokeWidth={theme.sizes.hairline}
            />
            {data.map((datum, index) => {
              const barValueHeight = barHeight(datum.value, max, height);
              const visibleHeight = barValueHeight > 0 ? barValueHeight : stubHeight;

              return (
                <Rect
                  key={datum.key}
                  testID={`bar-${datum.key}`}
                  x={index * layout.step + layout.offset}
                  y={height - visibleHeight}
                  width={layout.barWidth}
                  height={visibleHeight}
                  rx={Math.min(theme.radii.md, layout.barWidth / 2)}
                  fill={barValueHeight > 0 ? theme.colors.primaryDark : theme.colors.border}
                />
              );
            })}
          </Svg>
        ) : null}
      </Plot>
      <AxisRow>
        {axisLabelIndexes(data.length).map((index) => (
          <AxisLabel key={data[index].key}>{data[index].label}</AxisLabel>
        ))}
      </AxisRow>
    </Container>
  );
}
