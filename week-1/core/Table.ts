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

  /**
   * Row with total values, min/max, etc
   */
  #aggregateRow: number[];

  renderer: Presenter = logger;

  constructor(config: TableConfig, body: TableBody) {
    this.#config = config;
    this.#body = [];
    this.#aggregateRow = [];

    this.#parseBody(body);
  }

  // Normalize values according to the table config
  #parseBody(body: TableBody) {
    const { columns } = this.#config;

    for (const row of body) {
      const parsedRow: ParsedRow = [];

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
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

          this.#aggregateRow[colIndex] ??= 0;
          if (this.#aggregateRow[colIndex] < value) {
            this.#aggregateRow[colIndex] = value;
          }
        }
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
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex];
      const value = col.getValue
        ? col.getValue(row, this.#aggregateRow)
        : row[colIndex];

      formattedRow += this.#renderCell(col, value);
    }

    return formattedRow;
  }

  #renderBody() {
    const body = [];

    for (const row of this.#body) {
      const formattedRow = this.#renderRow(row);
      body.push(formattedRow);
    }

    this.renderer.render(body.join("\n"));
  }

  #sort() {
    const { columns } = this.#config;
    
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex];

      if (col.sort) {
        this.#sortBy(col, colIndex);
      }
    }
  }

  #sortBy(col: TableColumn, colIndex: number) {
    asserts(!!col.sort, "Sort has to be enabled");

    const getValue = (row: ParsedRow) =>
      col.getValue ? col.getValue(row, this.#aggregateRow) : row[colIndex];

    this.#body.sort((rowA, rowB) => {
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
  static fromCSV(str: string, config: TableConfig, skipRowsFromTop = 0) {
    const lines = str.split("\n");
    const rows: string[][] = [];

    for (const line of lines) {
      rows.push(line.split(","));
    }

    return new Table(config, rows.slice(skipRowsFromTop));
  }
}
