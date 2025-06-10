export type booleanSetterType = (state: boolean) => void;

export function clamp(num: number, lower: number, upper: number): number {
  return Math.min(Math.max(num, lower), upper);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
