// Ambient module declaration for `justified-layout` (Flickr, ISC, no upstream @types/* package
// because the lib is pure JS and ships no .d.ts). Without this, `astro check` (strict tsconfig)
// fails with ts(7016) "Could not find a declaration file for module 'justified-layout'".
//
// Shape derived from the package README + Plan 04-02 / 04-RESEARCH §3 usage:
//   justifiedLayout(aspectRatios: number[], config?) -> { containerHeight, widowCount, boxes[] }
declare module 'justified-layout' {
  export interface JustifiedLayoutBox {
    aspectRatio: number;
    top: number;
    width: number;
    height: number;
    left: number;
    forcedAspectRatio?: boolean;
  }

  export interface JustifiedLayoutResult {
    containerHeight: number;
    widowCount: number;
    boxes: JustifiedLayoutBox[];
  }

  export interface JustifiedLayoutConfig {
    containerWidth?: number;
    containerPadding?: number | { top: number; right: number; bottom: number; left: number };
    boxSpacing?: number | { horizontal: number; vertical: number };
    targetRowHeight?: number;
    targetRowHeightTolerance?: number;
    maxNumRows?: number;
    forceAspectRatio?: boolean | number;
    showWidows?: boolean;
    fullWidthBreakoutRowCadence?: boolean | number;
    widowLayoutStyle?: 'left' | 'justify' | 'center';
  }

  // Input accepts either an array of numeric aspect ratios OR objects with a width/height pair.
  export type JustifiedLayoutInput = number | { width: number; height: number };

  export default function justifiedLayout(
    input: JustifiedLayoutInput[],
    config?: JustifiedLayoutConfig
  ): JustifiedLayoutResult;
}
