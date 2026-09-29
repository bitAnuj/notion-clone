import { useEffect, useRef, useState, useCallback } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "../../styles/spreadsheet-theme.css";
import { usePageStore } from "../../store/usePageStore";
import { useBroadcastEvent, useEventListener } from "../../lib/liveblocks";
import PresenceAvatars from "./PresenceAvatars";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Download,
  Undo2,
  Redo2,
  Table,
  HelpCircle,
  FileSpreadsheet,
  X,
  Edit2,
} from "lucide-react";

type Props = {
  pageId: string;
};

type SheetTab = {
  id: string;
  title: string;
  data: string[][];
};

const DEFAULT_SHEETS: SheetTab[] = [
  {
    id: "sheet-1",
    title: "Sheet1",
    data: [
      ["Item", "Quantity", "Price", "=B1*C1"],
      ["Notebook", "5", "12", "=B2*C2"],
      ["Pen", "10", "2", "=B3*C3"],
      ["Desk Mat", "1", "25", "=B4*C4"],
    ],
  },
];

export default function SpreadsheetEditor({ pageId }: Props) {
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const sheetInstanceRef = useRef<any>(null);
  const isRemoteChangeRef = useRef(false);

  const { pages, updateContent, flushContent } = usePageStore();
  const page = pages.find((p) => p.id === pageId);

  // Multi-tab state
  const [sheetsList, setSheetsList] = useState<SheetTab[]>(() => {
    if (page?.content) {
      try {
        const parsed = JSON.parse(page.content);
        if (parsed.type === "spreadsheet") {
          if (Array.isArray(parsed.sheets) && parsed.sheets.length > 0) {
            return parsed.sheets;
          }
          if (Array.isArray(parsed.data)) {
            return [{ id: "sheet-1", title: "Sheet1", data: parsed.data }];
          }
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SHEETS;
  });

  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const activeSheetIndexRef = useRef(activeSheetIndex);
  activeSheetIndexRef.current = activeSheetIndex;

  const sheetsListRef = useRef(sheetsList);
  sheetsListRef.current = sheetsList;

  // Google Sheets formula bar state
  const [selectedCellName, setSelectedCellName] = useState<string>("A1");
  const [formulaValue, setFormulaValue] = useState<string>("");
  const [activeCoords, setActiveCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rowsToAdd, setRowsToAdd] = useState<number>(10);
  const [showFormulasHelp, setShowFormulasHelp] = useState<boolean>(false);

  // Liveblocks hooks
  const broadcast = useBroadcastEvent();

  useEventListener(({ event }) => {
    if (event.type === "SHEET_CELL_CHANGE" && event.sheetIndex === activeSheetIndexRef.current) {
      const worksheet = sheetInstanceRef.current?.[0];
      if (!worksheet) return;

      isRemoteChangeRef.current = true;
      try {
        worksheet.setValueFromCoords(event.x, event.y, event.value, true);
      } finally {
        isRemoteChangeRef.current = false;
      }
    }
  });

  const saveCurrentSheetData = useCallback(() => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    try {
      const currentData = worksheet.getData();
      const updatedSheets = sheetsListRef.current.map((sheet, idx) => {
        if (idx === activeSheetIndexRef.current) {
          return { ...sheet, data: currentData };
        }
        return sheet;
      });

      setSheetsList(updatedSheets);
      const payload = JSON.stringify({
        type: "spreadsheet",
        sheets: updatedSheets,
        data: updatedSheets[0]?.data ?? [],
      });
      updateContent(pageId, payload);
    } catch (err) {
      console.error("Failed to get sheet data:", err);
    }
  }, [pageId, updateContent]);

  const updateFormulaBar = useCallback((x: number, y: number) => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    const colLetter = String.fromCharCode(65 + x);
    const rowNumber = y + 1;
    setSelectedCellName(`${colLetter}${rowNumber}`);
    setActiveCoords({ x, y });

    const rawValue = worksheet.getValueFromCoords(x, y) ?? "";
    setFormulaValue(String(rawValue));
  }, []);

  // Initialize or reload current active worksheet
  useEffect(() => {
    if (!sheetContainerRef.current) return;

    sheetContainerRef.current.innerHTML = "";

    const activeSheet = sheetsListRef.current[activeSheetIndex] || DEFAULT_SHEETS[0];
    const initialData = activeSheet.data && activeSheet.data.length > 0
      ? activeSheet.data
      : [["", "", "", ""]];

    const sheets = jspreadsheet(sheetContainerRef.current, {
      worksheets: [
        {
          data: initialData,
          minDimensions: [8, 25],
          tableOverflow: true,
          tableWidth: "100%",
          tableHeight: "480px",
          columns: [
            { type: "text", title: "A", width: 140 },
            { type: "numeric", title: "B", width: 110 },
            { type: "numeric", title: "C", width: 110 },
            { type: "numeric", title: "D", width: 130 },
            { type: "text", title: "E", width: 120 },
            { type: "text", title: "F", width: 120 },
            { type: "text", title: "G", width: 120 },
            { type: "text", title: "H", width: 120 },
          ],
        },
      ],
      onafterchanges: (_instance: any, changes: any[]) => {
        saveCurrentSheetData();

        if (isRemoteChangeRef.current) return;

        if (Array.isArray(changes)) {
          for (const change of changes) {
            broadcast({
              type: "SHEET_CELL_CHANGE",
              sheetIndex: activeSheetIndexRef.current,
              x: Number(change.x),
              y: Number(change.y),
              value: change.value,
            });
          }
        }
      },
      onselection: (_instance: any, x1: number, y1: number) => {
        updateFormulaBar(x1, y1);
      },
      ondeleterow: () => saveCurrentSheetData(),
      oninsertrow: () => saveCurrentSheetData(),
      ondeletecolumn: () => saveCurrentSheetData(),
      oninsertcolumn: () => saveCurrentSheetData(),
    });

    sheetInstanceRef.current = sheets;

    return () => {
      flushContent(pageId);
      if (sheetContainerRef.current) {
        sheetContainerRef.current.innerHTML = "";
      }
      sheetInstanceRef.current = null;
    };
  }, [activeSheetIndex, pageId, broadcast, saveCurrentSheetData, updateFormulaBar, flushContent]);

  // Tab operations
  const handleSwitchTab = (newIndex: number) => {
    if (newIndex === activeSheetIndex) return;
    saveCurrentSheetData();
    setActiveSheetIndex(newIndex);
  };

  const handleAddTab = () => {
    saveCurrentSheetData();
    const newNumber = sheetsList.length + 1;
    const newSheet: SheetTab = {
      id: `sheet-${Date.now()}`,
      title: `Sheet${newNumber}`,
      data: [
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
      ],
    };
    const updated = [...sheetsList, newSheet];
    setSheetsList(updated);
    setActiveSheetIndex(updated.length - 1);
  };

  const handleRenameTab = (index: number) => {
    const currentTitle = sheetsList[index].title;
    const nextTitle = prompt("Enter sheet name:", currentTitle);
    if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === currentTitle) return;

    const updated = sheetsList.map((s, idx) =>
      idx === index ? { ...s, title: nextTitle.trim() } : s
    );
    setSheetsList(updated);

    const payload = JSON.stringify({
      type: "spreadsheet",
      sheets: updated,
      data: updated[0]?.data ?? [],
    });
    updateContent(pageId, payload);
  };

  const handleDeleteTab = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sheetsList.length <= 1) {
      alert("A spreadsheet must have at least one sheet.");
      return;
    }
    if (!confirm(`Delete sheet "${sheetsList[index].title}"?`)) return;

    saveCurrentSheetData();
    const updated = sheetsList.filter((_, idx) => idx !== index);
    setSheetsList(updated);
    setActiveSheetIndex(Math.max(0, index - 1));

    const payload = JSON.stringify({
      type: "spreadsheet",
      sheets: updated,
      data: updated[0]?.data ?? [],
    });
    updateContent(pageId, payload);
  };

  // Actions
  const handleApplyFormula = (e: React.FormEvent) => {
    e.preventDefault();
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    worksheet.setValueFromCoords(activeCoords.x, activeCoords.y, formulaValue, true);
    saveCurrentSheetData();
  };

  const insertFormulaTemplate = (template: string) => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    setFormulaValue(template);
    worksheet.setValueFromCoords(activeCoords.x, activeCoords.y, template, true);
    saveCurrentSheetData();
  };

  const handleAddRows = (count: number) => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    for (let i = 0; i < count; i++) {
      worksheet.insertRow();
    }
    saveCurrentSheetData();
  };

  const handleAddColumn = () => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    worksheet.insertColumn();
    saveCurrentSheetData();
  };

  const handleDeleteRow = () => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    worksheet.deleteRow(activeCoords.y);
    saveCurrentSheetData();
  };

  const handleDeleteColumn = () => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    worksheet.deleteColumn(activeCoords.x);
    saveCurrentSheetData();
  };

  const handleExportCSV = () => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    try {
      const data: string[][] = worksheet.getData();
      const csvContent = data
        .map((row) =>
          row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const currentTab = sheetsList[activeSheetIndex];
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${page?.title || "spreadsheet"}_${currentTab.title}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export CSV failed:", e);
    }
  };

  const handleUndo = () => sheetInstanceRef.current?.[0]?.undo();
  const handleRedo = () => sheetInstanceRef.current?.[0]?.redo();

  const handleStyle = (property: string, value: string) => {
    const worksheet = sheetInstanceRef.current?.[0];
    if (!worksheet) return;

    const cellName = `${String.fromCharCode(65 + activeCoords.x)}${activeCoords.y + 1}`;
    worksheet.setStyle(cellName, property, value);
    saveCurrentSheetData();
  };

  return (
    <div className="w-full my-3 space-y-2">
      {/* Header Info & Presence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Google Sheets Mode
          </span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            Auto-saves
          </span>
        </div>
        <PresenceAvatars />
      </div>

      {/* Google Sheets Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200">
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <button
            title="Undo"
            onClick={handleUndo}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Undo2 size={15} />
          </button>
          <button
            title="Redo"
            onClick={handleRedo}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Redo2 size={15} />
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          {/* Formatting */}
          <button
            title="Bold"
            onClick={() => handleStyle("font-weight", "bold")}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Bold size={15} />
          </button>
          <button
            title="Italic"
            onClick={() => handleStyle("font-style", "italic")}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Italic size={15} />
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          {/* Alignment */}
          <button
            title="Align Left"
            onClick={() => handleStyle("text-align", "left")}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <AlignLeft size={15} />
          </button>
          <button
            title="Align Center"
            onClick={() => handleStyle("text-align", "center")}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <AlignCenter size={15} />
          </button>
          <button
            title="Align Right"
            onClick={() => handleStyle("text-align", "right")}
            className="rounded p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <AlignRight size={15} />
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          {/* Row & Column */}
          <button
            onClick={() => handleAddRows(1)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Insert row below active cell"
          >
            <Plus size={13} /> Row
          </button>
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Insert column"
          >
            <Plus size={13} /> Col
          </button>
          <button
            onClick={handleDeleteRow}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Delete current row"
          >
            <Trash2 size={13} /> Row
          </button>
          <button
            onClick={handleDeleteColumn}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Delete current column"
          >
            <Trash2 size={13} /> Col
          </button>
        </div>

        {/* Functions & CSV Export */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              onClick={() => setShowFormulasHelp((v) => !v)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-indigo-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <HelpCircle size={13} /> Functions
            </button>
            {showFormulasHelp && (
              <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border border-zinc-700 bg-zinc-900 p-2 shadow-xl text-xs space-y-1">
                <p className="font-semibold text-zinc-300 mb-1">Common Formulas:</p>
                <button
                  onClick={() => { insertFormulaTemplate("=SUM(B1:B10)"); setShowFormulasHelp(false); }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
                >
                  <code>=SUM(B1:B10)</code>
                </button>
                <button
                  onClick={() => { insertFormulaTemplate("=AVERAGE(B1:B10)"); setShowFormulasHelp(false); }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
                >
                  <code>=AVERAGE(B1:B10)</code>
                </button>
                <button
                  onClick={() => { insertFormulaTemplate("=COUNT(B1:B10)"); setShowFormulasHelp(false); }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
                >
                  <code>=COUNT(B1:B10)</code>
                </button>
                <button
                  onClick={() => { insertFormulaTemplate("=MAX(B1:B10)"); setShowFormulasHelp(false); }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
                >
                  <code>=MAX(B1:B10)</code>
                </button>
                <button
                  onClick={() => { insertFormulaTemplate("=MIN(B1:B10)"); setShowFormulasHelp(false); }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
                >
                  <code>=MIN(B1:B10)</code>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="Download current sheet as CSV"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Formula Bar (fx) */}
      <form
        onSubmit={handleApplyFormula}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <span className="flex min-w-10 items-center justify-center rounded bg-zinc-200 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {selectedCellName}
        </span>
        <span className="font-serif italic font-bold text-zinc-400">fx</span>
        <input
          value={formulaValue}
          onChange={(e) => setFormulaValue(e.target.value)}
          placeholder="Enter a value or formula (e.g. =SUM(B1:B5))"
          className="flex-1 bg-transparent text-xs text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
        />
        <button
          type="submit"
          className="rounded bg-indigo-600 px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-indigo-500"
        >
          Apply
        </button>
      </form>

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        <div ref={sheetContainerRef} />
      </div>

      {/* Google Sheets Multi-Tab Bar & Bottom Extender */}
      <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {/* Top: Add Rows */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span>Add</span>
            <input
              type="number"
              min={1}
              max={500}
              value={rowsToAdd}
              onChange={(e) => setRowsToAdd(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 rounded border border-zinc-300 bg-white px-2 py-0.5 text-center text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <span>more rows at the bottom</span>
            <button
              onClick={() => handleAddRows(rowsToAdd)}
              className="rounded bg-zinc-200 px-3 py-1 font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              + Add rows
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Table size={13} />
            <span>Scroll horizontally or vertically</span>
          </div>
        </div>

        {/* Bottom: Google Sheets Multi-Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1">
          <button
            onClick={handleAddTab}
            title="Add sheet"
            className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus size={14} />
            <span>Add Sheet</span>
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

          {sheetsList.map((sheet, index) => {
            const isActive = index === activeSheetIndex;
            return (
              <div
                key={sheet.id}
                onClick={() => handleSwitchTab(index)}
                className={`group flex items-center gap-2 cursor-pointer rounded-t border-b-2 px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-indigo-500 bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                }`}
              >
                <FileSpreadsheet size={13} />
                <span>{sheet.title}</span>

                {/* Edit sheet name */}
                <button
                  title="Rename sheet"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameTab(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-indigo-400"
                >
                  <Edit2 size={11} />
                </button>

                {/* Delete tab (if more than 1 tab) */}
                {sheetsList.length > 1 && (
                  <button
                    title="Delete sheet"
                    onClick={(e) => handleDeleteTab(index, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
