export type DataIndicator = 'positive' | 'warning' | 'negative';

export interface DataItem {
  key: string;
  label: string;
  value: string | null;
  indicator?: DataIndicator;
}
