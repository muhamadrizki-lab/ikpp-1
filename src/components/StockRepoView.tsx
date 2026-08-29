import React, { useState } from "react";
import { RepoDoc, RitaseDoc } from "../lib/firebase";
import {
  Package,
  Plus,
  CheckCircle2,
  Trash2,
  Search,
  X,
  Save,
  Check,
  Ship,
  Calendar,
  AlertCircle
} from "lucide-react";

interface StockRepoViewProps {
  repo: RepoDoc[];
  ritase: RitaseDoc[];
  onAddRepo: (selectedRitaseIds: string[], lokasiRepo: string) => Promise<void>;
  onUpdateRepoDetail: (repoId: string, details: any) => Promise<void>;
  onFinishRepo: (repoId: string) => Promise<void>;
  onDeleteRepo: (repoId: string) => Promise<void>;
}

export default function StockRepoView({
  repo,
  ritase,
  onAddRepo,
  onUpdateRepoDetail,
  onFinishRepo,
  onDeleteRepo
}: StockRepoViewProps) {
  const [activeTab, setActiveTab] = useState<"AKTIF" | "HISTORIKAL">("AKTIF");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Add Repo
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedRitaseIds, setSelectedRitaseIds] = useState<string[]>([]);
  const [lokasiRepo, setLokasiRepo] = useState<string>("Gudang / Repo IKPP");

  // Modal Edit Detail Repo
  const [editingRepo, setEditingRepo] = useState<RepoDoc | null>(null);
  const [tglMasuk, setTglMasuk] = useState<string>("");
  const [tglOpen, setTglOpen] = useState<string>("");
  const [namaKapal, setNamaKapal] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeRepo = repo.filter((r) => r.status_repo !== "Selesai");
  const historicalRepo = repo.filter((r) => r.status_repo === "Selesai");

  const displayList = (activeTab === "AKTIF" ? activeRepo : historicalRepo).filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.fo || "").toLowerCase().includes(q) ||
      (r.dn || "").toLowerCase().includes(q) ||
      (r.no_container || "").toLowerCase().includes(q) ||
      (r.plat_nomor || "").toLowerCase().includes(q) ||
      (r.nama_driver || "").toLowerCase().includes(q) ||
      (r.nama_kapal || "").toLowerCase().includes(q)
    );
  });

  const toggleSelectRitase = (id: string) => {
    setSelectedRitaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRitaseIds.length === 0 || !lokasiRepo) {
      alert("Pilih minimal 1 FO dari Ritase dan isi Lokasi Repo!");
      return;
    }

    setLoading(true);
    try {
      await onAddRepo(selectedRitaseIds, lokasiRepo);
      setFeedback({ type: "success", text: `${selectedRitaseIds.length} FO berhasil ditambahkan ke Repo!` });
      setShowAddModal(false);
      setSelectedRitaseIds([]);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Gagal menambah data repo." });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleOpenEdit = (item: RepoDoc) => {
    setEditingRepo(item);
    setTglMasuk(item.tgl_masuk_repo || "");
    setTglOpen(item.tgl_open || "");
    setNamaKapal(item.nama_kapal || "");
  };

  const handleSaveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepo) return;

    setLoading(true);
    try {
      await onUpdateRepoDetail(editingRepo.id, {
        tgl_masuk_repo: tglMasuk,
        tgl_open: tglOpen,
        nama_kapal: namaKapal
      });
      setFeedback({ type: "success", text: `Detail repo FO ${editingRepo.fo} berhasil disimpan!` });
      setEditingRepo(null);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Gagal memperbarui detail repo." });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleFinish = async (item: RepoDoc) => {
    if (!item.tgl_masuk_repo || !item.tgl_open || !item.nama_kapal) {
      alert("Mohon lengkapi Detail Repo (Jam Masuk, Tgl Open, Nama Kapal) terlebih dahulu sebelum menandai Selesai!");
      handleOpenEdit(item);
      return;
    }

    if (!confirm(`Tandai Repo FO ${item.fo} sebagai Selesai?`)) return;

    setLoading(true);
    try {
      await onFinishRepo(item.id);
      setFeedback({ type: "success", text: `Repo FO ${item.fo} selesai dan dipindahkan ke Historikal Repo!` });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Gagal menyelesaikan repo." });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (item: RepoDoc) => {
    if (!confirm(`Hapus data Repo FO ${item.fo}?`)) return;
    setLoading(true);
    try {
      await onDeleteRepo(item.id);
      setFeedback({ type: "success", text: `Data Repo FO ${item.fo} telah dihapus!` });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Gagal menghapus repo." });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <span>Manajemen Stock Container (Repo)</span>
            <span className="text-xs font-bold bg-stone-100 text-stone-800 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
              {activeRepo.length} Aktif
            </span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">
            Pencatatan penumpukan kontainer repo sebelum dikirim ke pelabuhan / kapal
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Stock Repo</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("AKTIF")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer w-1/2 sm:w-auto ${
              activeTab === "AKTIF"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
          >
            Repo Aktif ({activeRepo.length})
          </button>
          <button
            onClick={() => setActiveTab("HISTORIKAL")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer w-1/2 sm:w-auto ${
              activeTab === "HISTORIKAL"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
          >
            Historikal Repo ({historicalRepo.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari FO, Container, Kapal..."
            className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 w-full"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
              <th className="p-3 w-10 text-center">No.</th>
              <th className="p-3">Nomor FO</th>
              <th className="p-3">DN & Container</th>
              <th className="p-3">Plat & Driver</th>
              <th className="p-3">Lokasi Repo</th>
              <th className="p-3">Jam Masuk Repo</th>
              <th className="p-3">Tanggal Open</th>
              <th className="p-3">Nama Kapal</th>
              <th className="p-3 text-center">Aksi Operasional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 dark:text-slate-500 font-semibold">
                  Tidak ada data stock repo.
                </td>
              </tr>
            ) : (
              displayList.map((item, idx) => (
                <tr key={item.id ? `${item.id}_${idx}` : `stock-${idx}`} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-black text-blue-600 dark:text-blue-400 text-xs">{item.fo || "-"}</td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900 dark:text-slate-100">{item.no_container || "-"}</div>
                    <div className="text-[10px] text-gray-500">DN: {item.dn || "-"}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-800 dark:text-slate-200">{item.plat_nomor || "-"}</div>
                    <div className="text-[10px] text-gray-500">{item.nama_driver || "-"}</div>
                  </td>
                  <td className="p-3 font-medium text-gray-700 dark:text-slate-300">{item.lokasi_repo || "-"}</td>
                  <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400">{item.tgl_masuk_repo || "-"}</td>
                  <td className="p-3 text-[11px] text-gray-500 dark:text-slate-400">{item.tgl_open || "-"}</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{item.nama_kapal || "-"}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Detail
                      </button>

                      {activeTab === "AKTIF" && (
                        <button
                          onClick={() => handleFinish(item)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Selesai</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Repo */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-gray-900 dark:text-slate-100">Tambah Stock Repo dari Ritase</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Pilih Lokasi Repo Tujuan *</label>
                <input
                  type="text"
                  required
                  value={lokasiRepo}
                  onChange={(e) => setLokasiRepo(e.target.value)}
                  placeholder="Gudang / Repo IKPP..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Pilih FO dari Laporan Ritase ({selectedRitaseIds.length} dipilih) *
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-800">
                  {ritase.length === 0 ? (
                    <p className="p-4 text-center text-gray-400">Belum ada data ritase.</p>
                  ) : (
                    ritase.map((r) => {
                      const isChecked = selectedRitaseIds.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className="flex items-center justify-between p-3 hover:bg-blue-50/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectRitase(r.id)}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-slate-100">FO: {r.fo || "-"}</div>
                              <div className="text-[10px] text-gray-500">
                                {r.plat_nomor} | Cont: {r.no_container || "-"}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Tambahkan ke Repo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Detail Repo */}
      {editingRepo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-gray-900 dark:text-slate-100">
                Update Detail Repo FO: <span className="text-blue-600">{editingRepo.fo}</span>
              </h3>
              <button onClick={() => setEditingRepo(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetail} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Jam / Tgl Masuk Repo</label>
                <input
                  type="text"
                  value={tglMasuk}
                  onChange={(e) => setTglMasuk(e.target.value)}
                  placeholder="Contoh: 27 Jul 2026, 14.30"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Tanggal Open Repo</label>
                <input
                  type="text"
                  value={tglOpen}
                  onChange={(e) => setTglOpen(e.target.value)}
                  placeholder="Contoh: 28 Jul 2026"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Nama Kapal Tujuan</label>
                <input
                  type="text"
                  value={namaKapal}
                  onChange={(e) => setNamaKapal(e.target.value)}
                  placeholder="Contoh: MV OCEAN EXPLORER"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRepo(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Detail Repo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
