import { useEffect, useRef, useState, useCallback } from "react";
import jspreadsheet, { WorksheetInstance } from "jspreadsheet-ce";
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
  Sigma,
} from "lucide-react";

interface SheetTab {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[][];
}

interface SpreadsheetEditorProps {
  pageId: string;
}

const DEFAULT_SHEETS: SheetTab[] = [
  {
    id: "sheet-1",
    title: "Sheet1",
    data: [
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ],
  },
];

export default function SpreadsheetEditor({ pageId }: SpreadsheetEditorProps) {
  const { pages, updateContent, flushContent } = usePageStore();
  const currentPage = pages.find((p) => p.id === pageId);

  // Initialize sheets from page content JSON if exists
  const [sheetsList, setSheetsList] = useState<SheetTab[]>(() => {
    if (currentPage?.content) {
      try {
        const parsed = JSON.parse(currentPage.content);
        if (parsed.type === "spreadsheet" && Array.isArray(parsed.sheets) && parsed.sheets.length > 0) {
          return parsed.sheets;
        }
        if (parsed.type === "spreadsheet" && Array.isArray(parsed.data)) {
          return [{ id: "sheet-1", title: "Sheet1", data: parsed.data }];
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_SHEETS;
  });

  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const sheetInstanceRef = useRef<WorksheetInstance[] | null>(null);

  // Ref to prevent echo loops when remote events update the sheet
  const isRemoteChangeRef = useRef<boolean>(false);

  // Keep stable refs to avoid recreating useEffect listeners & causing re-renders
  const activeSheetIndexRef = useRef(activeSheetIndex);
  const sheetsListRef = useRef(sheetsList);
  const pageIdRef = useRef(pageId);

  useEffect(() => {
    activeSheetIndexRef.current = activeSheetIndex;
  }, [activeSheetIndex]);

  useEffect(() => {
    sheetsListRef.current = sheetsList;
  }, [sheetsList]);

  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);

  // Google Sheets formula bar state
  const [selectedCellName, setSelectedCellName] = useState<string>("A1");
  const [formulaValue, setFormulaValue] = useState<string>("");
  const [activeCoords, setActiveCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    activeCoordsRef.current = activeCoords;
  }, [activeCoords]);
  const [rowsToAdd, setRowsToAdd] = useState<number>(10);
  const [showFormulasHelp, setShowFormulasHelp] = useState<boolean>(false);

  // Liveblocks hooks
  const broadcast = useBroadcastEvent();
  const broadcastRef = useRef(broadcast);
  useEffect(() => {
    broadcastRef.current = broadcast;
  }, [broadcast]);

  // Reliable helper to retrieve the active jspreadsheet worksheet instance
  const getActiveWorksheet = useCallback((): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (sheetInstanceRef.current && sheetInstanceRef.current.length > 0 && sheetInstanceRef.current[0]) {
      return sheetInstanceRef.current[0];
    }
    const container = sheetContainerRef.current;
    if (!container) return null;
    const parentSpreadsheet = (container as any).spreadsheet; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (parentSpreadsheet && parentSpreadsheet.worksheets && parentSpreadsheet.worksheets.length > 0) {
      return parentSpreadsheet.worksheets[0];
    }
    const jssEl = container.querySelector(".jss") as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (jssEl && jssEl.jspreadsheet) {
      return jssEl.jspreadsheet;
    }
    return null;
  }, []);

  const saveCurrentSheetData = useCallback(() => {
    const worksheet = getActiveWorksheet();
    if (!worksheet) return;

    try {
      const currentData = worksheet.getData();
      const updatedSheets = sheetsListRef.current.map((sheet, idx) => {
        if (idx === activeSheetIndexRef.current) {
          return { ...sheet, data: currentData };
        }
        return sheet;
      });

      sheetsListRef.current = updatedSheets;
      setSheetsList(updatedSheets);

      const payload = JSON.stringify({
        type: "spreadsheet",
        sheets: updatedSheets,
        data: updatedSheets[0]?.data ?? [],
      });
      updateContent(pageIdRef.current, payload);
    } catch (err) {
      console.error("Failed to get sheet data:", err);
    }
  }, [getActiveWorksheet, updateContent]);

  // Liveblocks real-time cell change listener
  useEventListener(({ event }) => {
    if (event.type === "SHEET_CELL_CHANGE") {
      const targetSheetIndex = typeof event.sheetIndex === "number" ? event.sheetIndex : 0;
      const targetX = Number(event.x);
      const targetY = Number(event.y);
      const targetVal = event.value;

      // 1. Update in-memory sheetsList data regardless of active tab
      const updatedSheets = sheetsListRef.current.map((sheet, idx) => {
        if (idx === targetSheetIndex) {
          const newData = (sheet.data || []).map((row) => [...row]);
          while (newData.length <= targetY) {
            newData.push([]);
          }
          while (newData[targetY].length <= targetX) {
            newData[targetY].push("");
          }
          newData[targetY][targetX] = targetVal;
          return { ...sheet, data: newData };
        }
        return sheet;
      });
      sheetsListRef.current = updatedSheets;
      setSheetsList(updatedSheets);

      // Persist to page store
      const payload = JSON.stringify({
        type: "spreadsheet",
        sheets: updatedSheets,
        data: updatedSheets[0]?.data ?? [],
      });
      updateContent(pageIdRef.current, payload);

      // 2. If the active tab matches, update the active jspreadsheet instance
      if (targetSheetIndex === activeSheetIndexRef.current) {
        const worksheet = getActiveWorksheet();
        if (worksheet && typeof worksheet.setValueFromCoords === "function") {
          isRemoteChangeRef.current = true;
          try {
            worksheet.setValueFromCoords(targetX, targetY, targetVal, true);
          } catch (e) {
            console.error("Failed to apply remote sheet change to grid:", e);
          } finally {
            isRemoteChangeRef.current = false;
          }
        }

        // Direct DOM fallback to guarantee immediate visual reflection
        const container = sheetContainerRef.current;
        if (container) {
          const cellEl = container.querySelector(
            `td[data-x="${targetX}"][data-y="${targetY}"]`
          ) as HTMLElement | null;
          if (cellEl) {
            cellEl.innerText = targetVal !== null && targetVal !== undefined ? String(targetVal) : "";
          }
        }

        // If currently focused on this cell, refresh formula bar
        if (activeCoordsRef.current.x === targetX && activeCoordsRef.current.y === targetY) {
          setFormulaValue(targetVal !== null && targetVal !== undefined ? String(targetVal) : "");
        }
      }
    }
  });

  const updateFormulaBar = useCallback((x: number, y: number) => {
    const worksheet = getActiveWorksheet();
    if (!worksheet) return;

    const colLetter = String.fromCharCode(65 + x);
    const rowNumber = y + 1;
    setSelectedCellName(`${colLetter}${rowNumber}`);
    setActiveCoords({ x, y });

    const rawValue = worksheet.getValueFromCoords(x, y) ?? "";
    setFormulaValue(String(rawValue));
  }, [getActiveWorksheet]);

  // Keep change handler stable
  const handleAfterChanges = useCallback((changes: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (isRemoteChangeRef.current) return;

    saveCurrentSheetData();

    if (Array.isArray(changes)) {
      for (const change of changes) {
        broadcastRef.current({
          type: "SHEET_CELL_CHANGE",
          sheetIndex: activeSheetIndexRef.current,
          x: Number(change.x),
          y: Number(change.y),
          value: change.value,
        });
      }
    }
  }, [saveCurrentSheetData]);

  // Initialize or reload current active worksheet ONLY when pageId or activeSheetIndex changes
  useEffect(() => {
    const containerEl = sheetContainerRef.current;
    if (!containerEl) return;

    containerEl.innerHTML = "";

    const activeSheet = sheetsListRef.current[activeSheetIndex] || DEFAULT_SHEETS[0];
    const initialData = activeSheet.data && activeSheet.data.length > 0
      ? activeSheet.data
      : [["", "", "", ""]];

    const worksheetConfig: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      data: initialData,
      minDimensions: [8, 25],
      tableOverflow: true,
      tableWidth: "100%",
      tableHeight: "500px",
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
      onafterchanges: (_instance: any, changes: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        handleAfterChanges(changes);
      },
      onchange: (_instance: any, _cell: any, x: any, y: any, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (isRemoteChangeRef.current) return;
        saveCurrentSheetData();
        broadcastRef.current({
          type: "SHEET_CELL_CHANGE",
          sheetIndex: activeSheetIndexRef.current,
          x: Number(x),
          y: Number(y),
          value,
        });
      },
    };

    const sheets = jspreadsheet(containerEl, {
      worksheets: [worksheetConfig],
      onload: (instance: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (instance && instance.worksheets) {
          sheetInstanceRef.current = instance.worksheets;
        }
      },
      onafterchanges: (_instance: any, changes: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        handleAfterChanges(changes);
      },
      onchange: (_instance: any, _cell: any, x: any, y: any, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (isRemoteChangeRef.current) return;
        saveCurrentSheetData();
        broadcastRef.current({
          type: "SHEET_CELL_CHANGE",
          sheetIndex: activeSheetIndexRef.current,
          x: Number(x),
          y: Number(y),
          value,
        });
      },
      onselection: (_instance: any, x1: number, y1: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        updateFormulaBar(x1, y1);
      },
      ondeleterow: () => saveCurrentSheetData(),
      oninsertrow: () => saveCurrentSheetData(),
      ondeletecolumn: () => saveCurrentSheetData(),
      oninsertcolumn: () => saveCurrentSheetData(),
    });

    if (sheets && Array.isArray(sheets) && sheets.length > 0) {
      sheetInstanceRef.current = sheets;
    }

    return () => {
      flushContent(pageId);
      if (containerEl) {
        containerEl.innerHTML = "";
      }
      sheetInstanceRef.current = null;
    };
  }, [activeSheetIndex, pageId, handleAfterChanges, updateFormulaBar, saveCurrentSheetData, flushContent]);

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

  const handleDeleteTab = (index: number) => {
    if (sheetsList.length <= 1) {
      alert("Cannot delete the only sheet.");
      return;
    }
    if (!confirm(`Delete "${sheetsList[index].title}"?`)) return;

    const updated = sheetsList.filter((_, idx) => idx !== index);
    setSheetsList(updated);

    let nextActive = activeSheetIndex;
    if (nextActive >= updated.length) {
      nextActive = updated.length - 1;
    }
    setActiveSheetIndex(nextActive);

    const payload = JSON.stringify({
      type: "spreadsheet",
      sheets: updated,
      data: updated[0]?.data ?? [],
    });
    updateContent(pageId, payload);
  };

  // Formula bar commit
  const handleFormulaCommit = () => {
    const worksheet = getActiveWorksheet();
    if (!worksheet) return;
    worksheet.setValueFromCoords(activeCoords.x, activeCoords.y, formulaValue, true);
    saveCurrentSheetData();
  };

  // Add extra rows
  const handleAddRows = () => {
    const worksheet = getActiveWorksheet();
    if (!worksheet) return;
    const count = Number(rowsToAdd) || 10;
    worksheet.insertRow(count);
    saveCurrentSheetData();
  };

  // CSV Export
  const handleExportCSV = () => {
    const worksheet = getActiveWorksheet();
    if (!worksheet) return;

    try {
      const data = worksheet.getData();
      const csvContent =
        "data:text/csv;charset=utf-8," +
        data.map((row: any[]) => row.map((val) => `"${val ?? ""}"`).join(",")).join("\n"); // eslint-disable-line @typescript-eslint/no-explicit-any
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `${currentPage?.title || "Spreadsheet"}-${sheetsList[activeSheetIndex]?.title || "Sheet"}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export CSV failed", e);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    const worksheet = getActiveWorksheet();
    if (worksheet && typeof worksheet.undo === "function") {
      worksheet.undo();
      saveCurrentSheetData();
    }
  };

  const handleRedo = () => {
    const worksheet = getActiveWorksheet();
    if (worksheet && typeof worksheet.redo === "function") {
      worksheet.redo();
      saveCurrentSheetData();
    }
  };

  // Formatting actions
  const applyStyle = (property: string, value: string) => {
    const worksheet = getActiveWorksheet();
    if (!worksheet) return;

    const selected = worksheet.getSelected?.();
    if (!selected || selected.length < 4) return;

    const [x1, y1, x2, y2] = selected;
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const colLetter = String.fromCharCode(65 + x);
        const cellName = `${colLetter}${y + 1}`;
        worksheet.setStyle?.(cellName, property, value);
      }
    }
    saveCurrentSheetData();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Collaboration presence banner & title */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-500" size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Collaborative Spreadsheet
          </span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
        <div className="flex items-center gap-3">
          <PresenceAvatars />
        </div>
      </div>

      {/* Main Google Sheets Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-sm select-none">
        {/* Undo / Redo */}
        <button
          onClick={handleUndo}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={handleRedo}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Text styling */}
        <button
          onClick={() => applyStyle("font-weight", "bold")}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 font-bold"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => applyStyle("font-style", "italic")}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 italic"
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Alignments */}
        <button
          onClick={() => applyStyle("text-align", "left")}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => applyStyle("text-align", "center")}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => applyStyle("text-align", "right")}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Export */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          title="Download as CSV"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Functions Help button */}
        <button
          onClick={() => setShowFormulasHelp(!showFormulasHelp)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
          title="View Supported Formulas"
        >
          <Sigma size={14} />
          <span>Formulas</span>
        </button>
      </div>

      {/* Formula Bar (Google Sheets style fx bar) */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs">
        {/* Selected cell coordinate */}
        <div className="flex h-7 w-14 items-center justify-center rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
          {selectedCellName}
        </div>

        {/* fx symbol */}
        <span className="font-serif italic font-bold text-zinc-400 dark:text-zinc-500 select-none">
          fx
        </span>

        {/* Input box */}
        <input
          type="text"
          value={formulaValue}
          onChange={(e) => setFormulaValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFormulaCommit();
            }
          }}
          onBlur={handleFormulaCommit}
          placeholder="Enter a value or formula (e.g., =SUM(A1:A5) or =B1*C1)"
          className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:focus:border-indigo-400"
        />
      </div>

      {/* Formulas Help Panel */}
      {showFormulasHelp && (
        <div className="relative border-b border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 text-xs">
          <button
            onClick={() => setShowFormulasHelp(false)}
            className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={14} />
          </button>
          <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
            <HelpCircle size={14} /> Supported Formulas & Syntax
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-600 dark:text-zinc-400">
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=SUM(A1:A5)</span> - Total sum</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=AVERAGE(B1:B10)</span> - Mean</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=COUNT(C1:C10)</span> - Count items</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=MAX(A1:A10)</span> - Highest value</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=MIN(A1:A10)</span> - Lowest value</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=B1*C1</span> - Math operators (*, /, +, -)</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=IF(A1&gt;10, &quot;Yes&quot;, &quot;No&quot;)</span> - Conditional</div>
            <div><span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">=ROUND(A1, 2)</span> - Round to decimals</div>
          </div>
        </div>
      )}

      {/* Spreadsheet Main Canvas */}
      <div className="relative flex-1 overflow-auto bg-zinc-100/50 dark:bg-zinc-950 p-2">
        <div ref={sheetContainerRef} className="spreadsheet-container w-full" />
      </div>

      {/* Bottom Row: Tab Bar & Add Rows */}
      <div className="flex flex-wrap items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs">
        {/* Left: Sheet tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {sheetsList.map((sheet, index) => {
            const isActive = index === activeSheetIndex;
            return (
              <div
                key={sheet.id || index}
                onClick={() => handleSwitchTab(index)}
                className={`group flex items-center gap-1.5 rounded-t border px-3 py-1 cursor-pointer transition-colors ${
                  isActive
                    ? "border-zinc-300 border-b-transparent bg-white text-zinc-900 font-semibold dark:border-zinc-700 dark:border-b-transparent dark:bg-zinc-950 dark:text-zinc-100"
                    : "border-transparent bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Table size={13} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"} />
                <span>{sheet.title}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameTab(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ml-0.5"
                  title="Rename sheet"
                >
                  <Edit2 size={11} />
                </button>

                {sheetsList.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTab(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 ml-0.5"
                    title="Delete sheet"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddTab}
            className="flex items-center justify-center rounded p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 ml-1"
            title="Add sheet"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Right: Quick row adder */}
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
          <span>Add</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={rowsToAdd}
            onChange={(e) => setRowsToAdd(Number(e.target.value))}
            className="w-14 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-0.5 text-center text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
          <span>more rows</span>
          <button
            onClick={handleAddRows}
            className="rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
