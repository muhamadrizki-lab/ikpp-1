import React, { useState, useEffect } from "react";
import { SheetSource, ColumnMapping, FormulaRule } from "../types";
import { 
  X, 
  Plus, 
  Link2, 
  FileSpreadsheet, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Edit2,
  Sliders,
  HelpCircle,
  Table,
  Zap,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info
} from "lucide-react";

export const DEFAULT_SHEET_SOURCES: SheetSource[] = [
  {
    id: "sheet-2",
    name: "POOLING SINARMAS",
    url: "https://docs.google.com/spreadsheets/d/1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU/edit?gid=1444994189",
    spreadsheetId: "1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU",
    gid: "1444994189",
    enabled: true,
    status: "pending",
    columnMapping: {
      idField: "ID POOLING ORDER",
      customerField: "CUSTOMER",
      originField: "ORIGIN",
      destinationField: "DESTINATION",
      unitTypeField: "UNIT TYPE",
      statusField: "STATUS",
      lastUpdateCSField: "LAST UPDATE CS",
      quantityField: "QUANTITY"
    },
    formulaRules: [
      {
        id: "rule-1",
        targetField: "status",
        conditionType: "contains",
        conditionValue: "FINISH",
        resultValue: "done"
      },
      {
        id: "rule-2",
        targetField: "status",
        conditionType: "contains",
        conditionValue: "COMPLETE",
        resultValue: "done"
      },
      {
        id: "rule-3",
        targetField: "status",
        conditionType: "contains",
        conditionValue: "WAITING",
        resultValue: "open"
      }
    ]
  },
  {
    id: "sheet-1",
    name: "EXECUTED SINARMAS",
    url: "https://docs.google.com/spreadsheets/d/1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU/edit?gid=714297382",
    spreadsheetId: "1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU",
    gid: "714297382",
    enabled: false,
    status: "pending"
  },
  {
    id: "sheet-3",
    name: "MASTER SINARMAS",
    url: "https://docs.google.com/spreadsheets/d/1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU/edit?gid=0",
    spreadsheetId: "1pavvP7EtzMvHiIhCP5X_aoTVP5nLkV03Vw_IV0iQkxU",
    gid: "0",
    enabled: false,
    status: "pending"
  }
];

interface SheetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: SheetSource[];
  onUpdateSources: (newSources: SheetSource[]) => void;
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
}

export default function SheetManagerModal({
  isOpen,
  onClose,
  sources,
  onUpdateSources,
  onSyncAll,
  isSyncing
}: SheetManagerModalProps) {
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetUrl, setNewSheetUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Looker Studio Studio Mode state
  const [activeStudioSheetId, setActiveStudioSheetId] = useState<string | null>(null);
  const [inspectedHeaders, setInspectedHeaders] = useState<string[]>([]);
  const [inspectedRows, setInspectedRows] = useState<Record<string, string>[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Active studio source draft
  const [mappingDraft, setMappingDraft] = useState<ColumnMapping>({});
  const [rulesDraft, setRulesDraft] = useState<FormulaRule[]>([]);
  const [headerRowIndexDraft, setHeaderRowIndexDraft] = useState<number>(0);

  if (!isOpen) return null;

  const extractDocMeta = (url: string) => {
    let docId = "";
    let gid = "0";

    const docMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (docMatch && docMatch[1]) {
      docId = docMatch[1];
    }

    const gidMatch = url.match(/[?&]gid=([0-9]+)/) || url.match(/#gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      gid = gidMatch[1];
    }

    return { docId, gid };
  };

  const activeStudioSheet = sources.find((s) => s.id === activeStudioSheetId);

  // Open Looker Studio Editor for a sheet
  const handleOpenStudio = async (source: SheetSource) => {
    setActiveStudioSheetId(source.id);
    setMappingDraft(source.columnMapping || {});
    setRulesDraft(source.formulaRules || []);
    setHeaderRowIndexDraft(source.headerRowIndex ?? 0);
    setInspectError(null);

    // Auto-inspect spreadsheet headers
    inspectSpreadsheet(source.url, source.headerRowIndex ?? 0);
  };

  const inspectSpreadsheet = async (url: string, rowOffset: number) => {
    setIsInspecting(true);
    setInspectError(null);
    try {
      const res = await fetch("/api/sheets/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, headerRowIndex: rowOffset })
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.headers)) {
        setInspectedHeaders(json.headers);
        setInspectedRows(json.sampleRows || []);
      } else {
        setInspectError(json.message || "Gagal membaca header spreadsheet");
      }
    } catch (err: any) {
      setInspectError(err?.message || "Gagal menghubungkan ke server");
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSaveStudioConfig = () => {
    if (!activeStudioSheetId) return;

    const updated = sources.map((s) =>
      s.id === activeStudioSheetId
        ? {
            ...s,
            headerRowIndex: headerRowIndexDraft,
            columnMapping: mappingDraft,
            formulaRules: rulesDraft
          }
        : s
    );

    onUpdateSources(updated);
    setActiveStudioSheetId(null);
  };

  const handleAddSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetUrl.trim()) {
      setErrorMsg("Masukkan URL Google Spreadsheet yang valid.");
      return;
    }

    const name = newSheetName.trim() || `Sheet ${sources.length + 1}`;
    const { docId, gid } = extractDocMeta(newSheetUrl);

    const newSource: SheetSource = {
      id: `sheet-${Date.now()}`,
      name,
      url: newSheetUrl.trim(),
      spreadsheetId: docId || undefined,
      gid,
      enabled: true,
      status: "pending"
    };

    onUpdateSources([...sources, newSource]);
    setNewSheetName("");
    setNewSheetUrl("");
    setShowAddForm(false);
    setErrorMsg(null);
  };

  const handleToggleEnable = (id: string) => {
    const updated = sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onUpdateSources(updated);
  };

  const handleDelete = (id: string) => {
    if (sources.length <= 1) {
      alert("Anda harus menyisakan minimal 1 Google Sheet source.");
      return;
    }
    const updated = sources.filter((s) => s.id !== id);
    onUpdateSources(updated);
  };

  const handleStartEdit = (source: SheetSource) => {
    setEditingId(source.id);
    setEditName(source.name);
    setEditUrl(source.url);
  };

  const handleSaveEdit = (id: string) => {
    const { docId, gid } = extractDocMeta(editUrl);
    const updated = sources.map((s) =>
      s.id === id
        ? {
            ...s,
            name: editName.trim() || s.name,
            url: editUrl.trim() || s.url,
            spreadsheetId: docId || s.spreadsheetId,
            gid
          }
        : s
    );
    onUpdateSources(updated);
    setEditingId(null);
  };

  const handleResetDefaults = () => {
    if (confirm("Kembalikan daftar koneksi sheet ke preset awal (Sinarmas Sheets)?")) {
      onUpdateSources(DEFAULT_SHEET_SOURCES);
    }
  };

  const handleAddFormulaRule = () => {
    const newRule: FormulaRule = {
      id: `rule-${Date.now()}`,
      targetField: "status",
      conditionType: "contains",
      conditionValue: "FINISH",
      resultValue: "done"
    };
    setRulesDraft([...rulesDraft, newRule]);
  };

  const handleRemoveFormulaRule = (id: string) => {
    setRulesDraft(rulesDraft.filter((r) => r.id !== id));
  };

  const activeCount = sources.filter((s) => s.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            {activeStudioSheet ? (
              <button
                onClick={() => setActiveStudioSheetId(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                title="Kembali ke Daftar Sheets"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {activeStudioSheet ? (
                  <>
                    <span>Setting Looker Studio:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{activeStudioSheet.name}</span>
                  </>
                ) : (
                  <>
                    <span>Koneksi Google Spreadsheets</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold">
                      {activeCount} Aktif
                    </span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeStudioSheet
                  ? "Atur mapping kolom secara manual dan tentukan rumus/logika transformasi seperti di Looker Studio."
                  : "Hubungkan dan gabungkan data order dari beberapa link Google Spreadsheet sekaligus."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeStudioSheet ? (
            /* ========================================================================= */
            /* LOOKER STUDIO MANUAL SETTINGS & FORMULA STUDIO MODE */
            /* ========================================================================= */
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Toolbar & Inspect Info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Offset Header Row:
                  </span>
                  <select
                    value={headerRowIndexDraft}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value, 10);
                      setHeaderRowIndexDraft(idx);
                      inspectSpreadsheet(activeStudioSheet.url, idx);
                    }}
                    className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  >
                    <option value={0}>Baris 1 (Default)</option>
                    <option value={1}>Baris 2</option>
                    <option value={2}>Baris 3</option>
                    <option value={3}>Baris 4</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => inspectSpreadsheet(activeStudioSheet.url, headerRowIndexDraft)}
                  disabled={isInspecting}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 hover:bg-emerald-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? "animate-spin text-emerald-600" : ""}`} />
                  <span>{isInspecting ? "Membaca Sheet..." : "Ulangi Inspeksi Header"}</span>
                </button>
              </div>

              {inspectError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inspectError}</span>
                </div>
              )}

              {/* Detected Sheet Headers Badge Cloud */}
              {inspectedHeaders.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Kolom Ditemukan di Spreadsheet ({inspectedHeaders.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 max-h-24 overflow-y-auto">
                    {inspectedHeaders.map((hdr, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        {hdr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Looker Studio Column Field Mapping Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    1. Tentukan Mapping Kolom (Looker Studio Field Selector)
                  </h3>
                  <span className="text-[11px] text-slate-400">Pilih nama kolom di spreadsheet yang sesuai</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Order ID (Nomor PO / Order)", key: "idField", placeholder: "ID POOLING ORDER / ID ORDER" },
                    { label: "Nama Customer / Pelanggan", key: "customerField", placeholder: "CUSTOMER / PELANGGAN" },
                    { label: "Lokasi Asal (Origin)", key: "originField", placeholder: "ORIGIN / ASAL" },
                    { label: "Lokasi Tujuan (Destination)", key: "destinationField", placeholder: "DESTINATION / TUJUAN" },
                    { label: "Tipe Unit / Armada", key: "unitTypeField", placeholder: "UNIT TYPE / ARMADA" },
                    { label: "Last Update CS", key: "lastUpdateCSField", placeholder: "LAST UPDATE CS / STATUS CDO" },
                    { label: "Status Order", key: "statusField", placeholder: "STATUS / KETERANGAN" },
                    { label: "Tipe Freight (Ekspor/Impor)", key: "typeField", placeholder: "TIPE / FREIGHT TYPE" },
                    { label: "Quantity", key: "quantityField", placeholder: "QUANTITY / QTY" },
                    { label: "ETA / Date", key: "etaField", placeholder: "ETA / TANGGAL" },
                    { label: "Driver Name", key: "driverField", placeholder: "DRIVER / SUPIR" },
                    { label: "Nopol Kendaraan", key: "vehiclePlateField", placeholder: "NOPOL / PLAT" }
                  ].map((field) => {
                    const currentVal = (mappingDraft as any)[field.key] || "";

                    return (
                      <div key={field.key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {field.label}
                        </label>
                        {inspectedHeaders.length > 0 ? (
                          <select
                            value={currentVal}
                            onChange={(e) =>
                              setMappingDraft({ ...mappingDraft, [field.key]: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                          >
                            <option value="">-- Auto Match Default --</option>
                            {inspectedHeaders.map((hdr, i) => (
                              <option key={i} value={hdr}>
                                {hdr}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={currentVal}
                            onChange={(e) =>
                              setMappingDraft({ ...mappingDraft, [field.key]: e.target.value })
                            }
                            placeholder={field.placeholder}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Looker Studio Formulas & Custom Rules Section */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      2. Tentukan Rumus & Logika Transformasi (Calculated Rules)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Buat aturan CASE WHEN/IF otomatis untuk menentukan status atau tipe berdasarkan kata kunci di kolom CS.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddFormulaRule}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Rumus Baru</span>
                    </button>
                  </div>
                </div>

                {/* Formula Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newRule: FormulaRule = {
                        id: `rule-${Date.now()}`,
                        targetField: "status",
                        conditionType: "contains",
                        conditionValue: "FINISH",
                        resultValue: "done"
                      };
                      setRulesDraft([...rulesDraft, newRule]);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    + FINISH = Status Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newRule: FormulaRule = {
                        id: `rule-${Date.now()}`,
                        targetField: "status",
                        conditionType: "contains",
                        conditionValue: "CANCEL",
                        resultValue: "open"
                      };
                      setRulesDraft([...rulesDraft, newRule]);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                  >
                    + CANCEL = Status Open (Antrian)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newRule: FormulaRule = {
                        id: `rule-${Date.now()}`,
                        targetField: "type",
                        conditionType: "contains",
                        conditionValue: "IMPORT",
                        resultValue: "impor"
                      };
                      setRulesDraft([...rulesDraft, newRule]);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 cursor-pointer"
                  >
                    + IMPORT = Tipe Impor
                  </button>
                </div>

                {/* Active Rules List */}
                {rulesDraft.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    Belum ada rumus khusus. Klik "+ Tambah Rumus Baru" atau pilih preset di atas.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {rulesDraft.map((rule, idx) => (
                      <div
                        key={rule.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center gap-2"
                      >
                        <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 w-16 shrink-0">
                          Rumus #{idx + 1}
                        </span>

                        <span className="text-xs font-semibold text-slate-500">JIKA</span>

                        <select
                          value={rule.targetField}
                          onChange={(e) => {
                            const updated = rulesDraft.map((r) =>
                              r.id === rule.id ? { ...r, targetField: e.target.value as any } : r
                            );
                            setRulesDraft(updated);
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                          <option value="lastUpdateCS">Last Update CS</option>
                          <option value="status">Status Order</option>
                          <option value="type">Tipe Freight</option>
                          <option value="customNote">Catatan Note</option>
                        </select>

                        <select
                          value={rule.conditionType}
                          onChange={(e) => {
                            const updated = rulesDraft.map((r) =>
                              r.id === rule.id ? { ...r, conditionType: e.target.value as any } : r
                            );
                            setRulesDraft(updated);
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                          <option value="contains">Mengandung (Contains)</option>
                          <option value="equals">Sama Dengan (Equals)</option>
                          <option value="starts_with">Diawali (Starts With)</option>
                          <option value="is_not_empty">Tidak Kosong</option>
                          <option value="always">Selalu (Always)</option>
                        </select>

                        {rule.conditionType !== "always" && rule.conditionType !== "is_not_empty" && (
                          <input
                            type="text"
                            value={rule.conditionValue}
                            onChange={(e) => {
                              const updated = rulesDraft.map((r) =>
                                r.id === rule.id ? { ...r, conditionValue: e.target.value } : r
                              );
                              setRulesDraft(updated);
                            }}
                            placeholder="Kata Kunci..."
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 max-w-36"
                          />
                        )}

                        <span className="text-xs font-semibold text-slate-500">MAKA UBAH KE</span>

                        <input
                          type="text"
                          value={rule.resultValue}
                          onChange={(e) => {
                            const updated = rulesDraft.map((r) =>
                              r.id === rule.id ? { ...r, resultValue: e.target.value } : r
                            );
                            setRulesDraft(updated);
                          }}
                          placeholder="Hasil (cth: done, open, impor)"
                          className="px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 max-w-40"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveFormulaRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg ml-auto cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sample Data Live Inspector */}
              {inspectedRows.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    Preview Data Mentah dari Spreadsheet ({inspectedRows.length} Baris Sampel)
                  </h3>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <tr>
                          {inspectedHeaders.slice(0, 7).map((h, i) => (
                            <th key={i} className="p-2 border-b border-slate-200 dark:border-slate-700 truncate max-w-32">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inspectedRows.map((r, rowIdx) => (
                          <tr key={rowIdx} className="border-b border-slate-200/60 dark:border-slate-800">
                            {inspectedHeaders.slice(0, 7).map((h, colIdx) => (
                              <td key={colIdx} className="p-2 truncate max-w-32 text-slate-700 dark:text-slate-300">
                                {r[h] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* STANDARD MULTI-SHEET LIST VIEW */
            /* ========================================================================= */
            <>
              {/* Action Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Link Spreadsheet</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDefaults}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Preset
                  </button>
                  <button
                    onClick={() => {
                      onSyncAll();
                    }}
                    disabled={isSyncing || activeCount === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200/80 dark:border-emerald-800 rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-emerald-600" : ""}`} />
                    <span>{isSyncing ? "Menyinkronkan..." : "Sinkronkan Semua Sheet Aktif"}</span>
                  </button>
                </div>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <form onSubmit={handleAddSheet} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Tambah Google Spreadsheet Baru
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      Batal
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Nama Sheet / Cabang
                      </label>
                      <input
                        type="text"
                        value={newSheetName}
                        onChange={(e) => setNewSheetName(e.target.value)}
                        placeholder="Contoh: POOLING SINARMAS"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        URL Google Spreadsheet (Format Edit / Export)
                      </label>
                      <input
                        type="url"
                        value={newSheetUrl}
                        onChange={(e) => setNewSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                    >
                      Simpan Source
                    </button>
                  </div>
                </form>
              )}

              {/* Sources List */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Daftar Link Spreadsheet Terhubung ({sources.length})
                </h3>

                {sources.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Belum ada link spreadsheet. Klik "Tambah Link Spreadsheet" untuk menambahkan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sources.map((source) => {
                      const isEditing = editingId === source.id;

                      return (
                        <div
                          key={source.id}
                          className={`p-4 rounded-xl border transition-all ${
                            source.enabled
                              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
                              : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-65"
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                  placeholder="Nama Sheet"
                                />
                                <input
                                  type="text"
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                  placeholder="URL Google Spreadsheet"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(source.id)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 rounded-lg"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                              <div className="flex items-start gap-3 min-w-0">
                                {/* Toggle Switch */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleEnable(source.id)}
                                  className={`mt-0.5 relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    source.enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                      source.enabled ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                      {source.name}
                                    </span>
                                    {source.status === "success" && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        <span>{source.rowCount ?? 0} Order</span>
                                      </span>
                                    )}
                                    {source.formulaRules && source.formulaRules.length > 0 && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span>{source.formulaRules.length} Rumus Active</span>
                                      </span>
                                    )}
                                    {source.status === "error" && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200/80 dark:border-rose-800">
                                        <AlertCircle className="w-3 h-3 text-rose-500" />
                                        <span>Error</span>
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                    {source.url}
                                  </p>

                                  {source.errorMessage && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                                      {source.errorMessage}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenStudio(source)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                                >
                                  <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Setting Looker Studio</span>
                                </button>

                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Buka Spreadsheet di Tab Baru"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleStartEdit(source)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Edit Link/Nama"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(source.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                  title="Hapus Source"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Guide Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Petunjuk Setting Looker Studio:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                  <li>Klik tombol <strong>"Setting Looker Studio"</strong> pada setiap sheet untuk memetakan nama kolom secara presisi.</li>
                  <li>Anda dapat menentukan rumus logika (e.g. jika kolom CS = FINISH maka status = DONE).</li>
                  <li>Sistem mendukung penggabungan unlimited link Google Spreadsheet secara bersamaan secara real-time.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          {activeStudioSheet ? (
            <>
              <button
                onClick={() => setActiveStudioSheetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveStudioConfig}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Simpan Konfigurasi Looker Studio
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeCount} dari {sources.length} sheet diaktifkan
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
