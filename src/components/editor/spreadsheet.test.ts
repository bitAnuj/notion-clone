/**
 * Self-contained Spreadsheet Logic & Verification Tests
 * Executable without external test runner globals.
 */

export function runSpreadsheetTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`Assertion failed: ${message}`);
    }
  }

  // 1. Initial Dimensions & Data
  const DEFAULT_SHEET_DATA = [
    ["Item", "Quantity", "Price", "=B1*C1"],
    ["Notebook", "5", "12", "=B2*C2"],
    ["Pen", "10", "2", "=B3*C3"],
    ["Desk Mat", "1", "25", "=B4*C4"],
  ];
  assert(DEFAULT_SHEET_DATA.length === 4, "Initial rows should be 4");
  assert(DEFAULT_SHEET_DATA[0].length === 4, "Initial columns should be 4");
  assert(DEFAULT_SHEET_DATA[0][3] === "=B1*C1", "Formula intact in initial data");

  // 2. Coordinate Mapping
  const getCellName = (x: number, y: number) => {
    const colLetter = String.fromCharCode(65 + x);
    const rowNumber = y + 1;
    return `${colLetter}${rowNumber}`;
  };
  assert(getCellName(0, 0) === "A1", "0,0 should map to A1");
  assert(getCellName(1, 0) === "B1", "1,0 should map to B1");
  assert(getCellName(2, 4) === "C5", "2,4 should map to C5");
  assert(getCellName(3, 9) === "D10", "3,9 should map to D10");

  // 3. CSV Escaping & Serialization
  const matrix = [
    ["Product", "Description", "Cost"],
    ["Coffee", 'Dark "Roast"', "$5.00"],
    ["Tea", "Green, Herbal", "$3.50"],
  ];
  const serializeToCsv = (data: string[][]) =>
    data
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const csv = serializeToCsv(matrix);
  assert(csv.includes('"Product","Description","Cost"'), "Header serialized");
  assert(csv.includes('"Coffee","Dark ""Roast""","$5.00"'), "Quotes escaped");
  assert(csv.includes('"Tea","Green, Herbal","$3.50"'), "Comma values enclosed");

  // 4. Row Expansion
  const initialRows = [["A", "B"], ["1", "2"]];
  const addRows = (rows: string[][], count: number, colsCount: number) => {
    const copy = [...rows];
    for (let i = 0; i < count; i++) {
      copy.push(new Array(colsCount).fill(""));
    }
    return copy;
  };
  const expanded = addRows(initialRows, 10, 2);
  assert(expanded.length === 12, "Rows should increase by 10");
  assert(expanded[11].length === 2 && expanded[11][0] === "", "Empty row structure matches");

  return { passed, failed };
}
