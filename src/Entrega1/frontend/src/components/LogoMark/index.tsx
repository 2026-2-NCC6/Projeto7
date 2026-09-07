import { Cell, Grid } from './styles';

const CELL_COUNT = 9;
const HIGHLIGHTED_INDEX = 4;

export function LogoMark() {
  return (
    <Grid>
      {Array.from({ length: CELL_COUNT }, (_, index) => (
        <Cell key={index} highlighted={index === HIGHLIGHTED_INDEX} />
      ))}
    </Grid>
  );
}
