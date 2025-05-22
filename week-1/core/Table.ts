import { asserts, logger, parseNumber, parseString, toString } from "utils";
import {
  TableConfig,
  TableBody,
  TableColumn,
  ValueType,
  Presenter,
} from "./types";

type ParsedRow = ValueType[];

export class Table {
  #config: TableConfig;

  #body: ParsedRow[];

  #totalRow: number[];

  renderer: Presenter = logger;

  constructor(config: TableConfig, body: TableBody) {
    this.#config = config;
    this.#body = [];

    const { columns } = config;

    this.#totalRow = [];

    // Normalize values according to the table config
    for (const row of body) {
      const parsedRow: ParsedRow = [];

      let colIndex = 0;
      while (colIndex < columns.length) {
        const col = columns[colIndex];
        const value = col.getValue
          ? undefined
          : this.#parseValue(row[colIndex], col.type);

        parsedRow.push(value);

        if (col.formula === "max") {
          asserts(
            typeof value === "number",
            "Value has to be number for max formula"
          );

          this.#totalRow[colIndex] ??= 0;
          if (this.#totalRow[colIndex] < value) {
            this.#totalRow[colIndex] = value;
          }
        }

        colIndex++;
      }

      this.#body.push(parsedRow);
    }
  }

  #parseValue(value: unknown, type?: string): string;
  #parseValue(value: unknown, type: number): number;
  #parseValue(value: unknown, type?: string | number) {
    switch (type) {
      case "number":
        return parseNumber(value);

      case "string":
      default:
        return parseString(value);
    }
  }

  #renderCell(col: TableColumn, value: string | number | undefined) {
    const { width, align = "left" } = col;
    const str = toString(value);

    if (width) {
      return align === "left" ? str.padEnd(width) : str.padStart(width);
    }

    return str;
  }

  #renderRow(row: ParsedRow) {
    const { columns } = this.#config;

    let formattedRow = "";
    let colIndex = 0;
    while (colIndex < columns.length) {
      const col = columns[colIndex];
      const value = col.getValue
        ? col.getValue(row, this.#totalRow)
        : row[colIndex];

      formattedRow += this.#renderCell(col, value);
      colIndex++;
    }

    return formattedRow;
  }

  #renderBody() {
    const body = [];
    let rowIndex = 0;
    while (rowIndex < this.#body.length) {
      body.push(this.#renderRow(this.#body[rowIndex++]));
    }

    this.renderer.render(body.join("\n"));
  }

  #sort() {
    const { columns } = this.#config;
    let colIndex = 0;
    while (colIndex < columns.length) {
      const col = columns[colIndex];

      if (col.sort) {
        this.#sortBy(col, colIndex);
      }

      colIndex++;
    }
  }

  #sortBy(col: TableColumn, colIndex: number) {
    asserts(!!col.sort, "Sort has to be enabled");

    const getValue = (row: ParsedRow) =>
      col.getValue ? col.getValue(row, this.#totalRow) : row[colIndex];

    this.#body = [...this.#body].sort((rowA, rowB) => {
      const valueA = getValue(rowA);
      const valueB = getValue(rowB);

      asserts(typeof valueA === "number", "Has to be number!");
      asserts(typeof valueB === "number", "Has to be number!");

      return valueB - valueA;
    });
  }

  render() {
    this.#sort();
    this.#renderBody();
  }
}
