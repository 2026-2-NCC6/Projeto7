import { texts } from '../../../../content/texts';
import type { DataItem } from '../../data/dataItem';
import { Indicator, Label, List, Row, Value, ValueGroup } from './styles';

interface DataListProps {
  items: readonly DataItem[];
}

export function DataList({ items }: DataListProps) {
  return (
    <List>
      {items.map((item, index) => (
        <Row key={item.key} divided={index > 0} testID={`data-${item.key}`}>
          <Label numberOfLines={2}>{item.label}</Label>
          <ValueGroup>
            {item.indicator && item.value !== null ? (
              <Indicator indicator={item.indicator} />
            ) : null}
            <Value missing={item.value === null} numberOfLines={2}>
              {item.value ?? texts.stats.unavailable}
            </Value>
          </ValueGroup>
        </Row>
      ))}
    </List>
  );
}
