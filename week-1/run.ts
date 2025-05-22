import { type TableConfig, CSVParser, Table } from "core";
import { parseNumber } from "utils";
import fs from "node:fs";
import { argv } from "node:process";

const config = {
  columns: [
    { type: "string", width: 18 },
    { type: "number", width: 10, align: "right" },
    { type: "number", width: 8, align: "right" },
    { type: "number", width: 8, align: "right", formula: "max" },
    { type: "string", width: 18, align: "right" },
    {
      type: "number",
      width: 6,
      align: "right",
      sort: "decs",
      getValue(row, total) {
        const density = row[3];
        return Math.round((parseNumber(density) / total[3]) * 100);
      },
    },
  ],
} satisfies TableConfig;

fs.readFile(argv[2], { encoding: "utf-8" }, (err, data) => {
  if (err) throw err;

  const result = new CSVParser().parse(data);

  new Table(config, result.slice(1)).render();
});
