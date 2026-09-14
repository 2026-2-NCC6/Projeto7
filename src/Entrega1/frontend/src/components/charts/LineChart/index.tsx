import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useTheme } from 'styled-components/native';
import { linePoints, lineSegments } from '../scale';
import { Plot } from './styles';

const GRID_RATIOS = [0, 0.5, 1] as const;

interface LineChartProps {
  values: readonly (number | null)[];
  domainMax: number;
  formatAxis: (value: number) => string;
  accessibilityLabel: string;
}

export function LineChart({ values, domainMax, formatAxis, accessibilityLabel }: LineChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const height = theme.sizes.chartLineHeight;
  const axisWidth = theme.sizes.chartAxisWidth;
  const inset = theme.sizes.chartDot + theme.sizes.chartStroke;
  const plotWidth = Math.max(0, width - axisWidth);
  const usableHeight = height - inset * 2;
  const points = linePoints(values, plotWidth, height, domainMax, inset).map((point) =>
    point ? { x: point.x + axisWidth, y: point.y } : null,
  );

  return (
    <Plot
      accessible
      accessibilityLabel={accessibilityLabel}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {GRID_RATIOS.map((ratio) => {
            const y = inset + (1 - ratio) * usableHeight;
            return (
              <Line
                key={ratio}
                x1={axisWidth}
                x2={width}
                y1={y}
                y2={y}
                stroke={theme.colors.border}
                strokeWidth={theme.sizes.hairline}
                strokeDasharray={[theme.spacing.xs, theme.spacing.xs]}
              />
            );
          })}
          {GRID_RATIOS.map((ratio) => (
            <SvgText
              key={`label-${ratio}`}
              x={axisWidth - theme.spacing.md}
              y={inset + (1 - ratio) * usableHeight}
              fill={theme.colors.inkSoft}
              fontSize={theme.typography.fontSize['2xs']}
              fontFamily={theme.typography.fontFamily.bold}
              textAnchor="end"
              alignmentBaseline="middle"
            >
              {formatAxis(domainMax * ratio)}
            </SvgText>
          ))}
          {lineSegments(points).map((segment) => (
            <Polyline
              key={`${segment[0].x}-${segment[0].y}`}
              points={segment.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={theme.colors.primaryDark}
              strokeWidth={theme.sizes.chartStroke}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {points.map((point, index) =>
            point ? (
              <Circle
                key={index}
                testID="line-point"
                cx={point.x}
                cy={point.y}
                r={theme.sizes.chartDot}
                fill={theme.colors.surfaceRaised}
                stroke={theme.colors.primaryDark}
                strokeWidth={theme.sizes.chartStroke}
              />
            ) : null,
          )}
        </Svg>
      ) : null}
    </Plot>
  );
}
