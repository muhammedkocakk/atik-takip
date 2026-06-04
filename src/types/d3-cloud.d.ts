declare module "d3-cloud" {
  export interface CloudWord {
    text?: string;
    font?: string;
    style?: string;
    weight?: string | number;
    rotate?: number;
    size?: number;
    padding?: number;
    x?: number;
    y?: number;
    [key: string]: unknown;
  }

  export interface CloudLayout {
    size(): [number, number];
    size(size: [number, number]): CloudLayout;
    words(): CloudWord[];
    words(words: CloudWord[]): CloudLayout;
    padding(): number;
    padding(padding: number | ((d: CloudWord, i: number) => number)): CloudLayout;
    font(): string | ((d: CloudWord, i: number) => string);
    font(font: string | ((d: CloudWord, i: number) => string)): CloudLayout;
    fontSize(): number | ((d: CloudWord, i: number) => number);
    fontSize(size: number | ((d: CloudWord, i: number) => number)): CloudLayout;
    fontStyle(): string | ((d: CloudWord, i: number) => string);
    fontStyle(style: string | ((d: CloudWord, i: number) => string)): CloudLayout;
    fontWeight(): string | number | ((d: CloudWord, i: number) => string | number);
    fontWeight(
      weight: string | number | ((d: CloudWord, i: number) => string | number)
    ): CloudLayout;
    rotate(): number | ((d: CloudWord, i: number) => number);
    rotate(rotate: number | ((d: CloudWord, i: number) => number)): CloudLayout;
    spiral(): string | ((size: [number, number]) => (t: number) => [number, number]);
    spiral(
      spiral: string | ((size: [number, number]) => (t: number) => [number, number])
    ): CloudLayout;
    random(): () => number;
    random(random: () => number): CloudLayout;
    on(type: "end", listener: (words: CloudWord[], layout?: CloudLayout) => void): CloudLayout;
    on(type: "word", listener: (word: CloudWord) => void): CloudLayout;
    start(): CloudLayout;
    stop(): CloudLayout;
  }

  export default function cloud(): CloudLayout;
}
