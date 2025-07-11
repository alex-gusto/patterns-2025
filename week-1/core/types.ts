export interface Parser {
  parse(str: string): string[][];
}

export type ValueType = string | number | undefined;

export type TableColumn = {
  type?: "string" | "number";
  width?: number;
  align?: "left" | "right";
  formula?: "max";
  sort?: "decs";
  getValue?: (row: ValueType[], totalRow: number[]) => string | number;
};

export type TableRow = unknown[];

export type TableConfig = {
  columns: TableColumn[];
};

export type TableBody = TableRow[];

export type Presenter = {
  render: (...args: unknown[]) => void;
};
