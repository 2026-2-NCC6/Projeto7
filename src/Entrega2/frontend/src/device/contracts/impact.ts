export const IMPACT_MIN_RAW = 0;
export const IMPACT_MAX_RAW = 4095;

export interface ImpactReading {
  readonly raw: number;
  readonly simulated: boolean;
}
