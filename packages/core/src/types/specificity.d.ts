declare module 'specificity' {
  export interface SpecificityResult {
    selector: string;
    specificityArray: [number, number, number, number];
    specificity: string;
  }

  export const specificity: {
    calculate(selector: string): SpecificityResult[];
    compare(a: string, b: string): number;
  };
}