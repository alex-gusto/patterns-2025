import { Parser } from "./types";

export class CSVParser implements Parser {
  parse(str: string) {
    const lines = str.split("\n");
    const rows: string[][] = [];

    for (const line of lines) {
      rows.push(line.split(","));
    }

    return rows;
  }
}
