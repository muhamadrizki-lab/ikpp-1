import React, { useState } from "react";
import { TruckDoc, MasterStatusDoc, MasterJenisTruckDoc, MasterJenisProdukDoc } from "../lib/firebase";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Phone,
  AlertCircle,
  X,
  Save,
  Check
} from "lucide-react";

interface DaftarArmadaViewProps {
  trucks: TruckDoc[];
  masterStatuses: MasterStatusDoc[];
  masterJenisTruck: MasterJenisTruckDoc[];
  masterJenisProduk: MasterJenisProdukDoc[];
  onUpdateStatus: (truckId: string, updates: any) => Promise<void>;
  onFinishDelivery: (truck: TruckDoc, details: any) => Promise<void>;
  onAddTruck: (truckData: any) => Promise<void>;
  onDeleteTruck: (truckId: string) => Promise<void>;
}

export default function DaftarArmadaView({
  trucks,
  masterStatuses,
  masterJenisTruck,
  masterJenisProduk,
  onUpdateStatus,
  onFinishDelivery,
  onAddTruck,
  onDeleteTruck
}: DaftarArmadaViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State for Update Status
  const [editingTruck, setEditingTruck] = useState<TruckDoc | null>(null);
  const [formStatus, setFormStatus] = useState<string>("TERSEDIA");
  const [formDriver, setFormDriver] = useState<string>("");
  const [formHp, setFormHp] = useState<string>("");
  const [formDn, setFormDn] = useState<string>("");
  const [formFo, setFormFo] = useState<string>("");
  const [formContainer, setFormContainer] = useState<string>("");
  const [formProduk, setFormProduk] = useState<string>("");
  const [formArrive, setFormArrive] = useState<string>("");
  const [formTimbang1, setFormTimbang1] = useState<string>("");
  const [formTimbang2, setFormTimbang2] = useState<string>("");
  const [formLokasi, setFormLokasi] = useState<string>("");

  // Modal State for Add Truck
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPlat, setNewPlat] = useState<string>("");
  const [newDriver, setNewDriver] = useState<string>("");
  const [newHp, setNewHp] = useState<string>("");
  const [newJenisTruck, setNewJenisTruck] = useState<string>("Trailer 40ft HC");

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const defaultStatusList = [
    "TERSEDIA",
    "MUAT DEPO",
    "OTW IKK",
    "DAFTAR DCO - ESTIMASI",
    "GUDANG ANTRI MUAT",
    "OTW PELABUHAN",
    "BONGKAR PORT / DONE",
    "STORING / LAKA",
    "NO DRIVER",
    "TUNGGU LOKASI",
    "GROUNDING",
    "REPO FULL",
    "REPO EMPTY",
    "TUNGGU KARTU EKSPOR"
  ];

  const statusOptions = masterStatuses.length > 0 ? masterStatuses.map((s) => s.name) : defaultStatusList;

  // Filter trucks list
  const filteredTrucks = trucks.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (t.status || "").toUpperCase() === statusFilter.toUpperCase() ||
      (statusFilter === "TERSEDIA" && (t.status || "").toUpperCase() === "STANDBY");

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (t.plat_nomor || "").toLowerCase().includes(query) ||
      (t.nama_driver || "").toLowerCase().includes(query) ||
      (t.fo || "").toLowerCase().includes(query) ||
      (t.dn || "").toLowerCase().includes(query) ||
      (t.no_container || "").toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  // Open Edit Modal
  const handleOpenEdit = (truck: TruckDoc) => {
    setEditingTruck(truck);
    setFormStatus(truck.status || "TERSEDIA");
    setFormDriver(truck.nama_driver || "");
    setFormHp(truck.no_hp || "");
    setFormDn(truck.dn || "");
    setFormFo(truck.fo || "");
    setFormContainer(truck.no_container || "");
    setFormProduk(truck.jenis_produk || "");
    setFormArrive(truck.daftar_dco || "");
    setFormTimbang1(truck.tgl_timbang_1 || "");
    setFormTimbang2(truck.tgl_timbang_2 || "");
    setFormLokasi(truck.lokasi_muat || "");
  };

  // Submit Update Status
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTruck) return;

    setActionLoading(true);
    try {
      await onUpdateStatus(editingTruck.id, {
        status: formStatus,
        nama_driver: formDriver,
        no_hp: formHp,
        dn: formDn,
        fo: formFo,
        no_container: formContainer,
        jenis_produk: formProduk,
        daftar_dco: formArrive,
        tgl_timbang_1: formTimbang1,
        tgl_timbang_2: formTimbang2,
        lokasi_muat: formLokasi
      });
      setFeedbackMessage({ type: "success", text: `Status armada ${editingTruck.plat_nomor} berhasil diperbarui!` });
      setEditingTruck(null);
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Gagal memperbarui status." });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Submit Finish Delivery
  const handleFinish = async (truck: TruckDoc) => {
    if (
      !truck.nama_driver ||
      !truck.dn ||
      !truck.no_container ||
      !truck.fo
    ) {
      alert("Mohon lengkapi data supir, DN, Container, dan FO pada armada sebelum menandai Selesai Delivery!");
      handleOpenEdit(truck);
      return;
    }

    if (!confirm(`Selesaikan delivery untuk armada ${truck.plat_nomor}? Data akan diarsipkan ke Laporan Ritase.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await onFinishDelivery(truck, {
        nama_driver: truck.nama_driver || formDriver,
        no_hp: truck.no_hp || formHp,
        dn: truck.dn || formDn,
        no_container: truck.no_container || formContainer,
        jenis_produk: truck.jenis_produk || formProduk,
        daftar_dco: truck.daftar_dco || formArrive,
        tgl_timbang_1: truck.tgl_timbang_1 || formTimbang1,
        tgl_timbang_2: truck.tgl_timbang_2 || formTimbang2,
        fo: truck.fo || formFo
      });
      setFeedbackMessage({ type: "success", text: `Delivery ${truck.plat_nomor} selesai dan berhasil dipindahkan ke Ritase!` });
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Gagal menyelesaikan delivery." });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Submit Add Truck
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlat.trim()) return;

    setActionLoading(true);
    try {
      await onAddTruck({
        plat_nomor: newPlat.trim().toUpperCase(),
        nama_driver: newDriver.trim() || "TERSEDIA (STANDBY)",
        no_hp: newHp.trim() || "-",
        jenis_mobil: newJenisTruck,
        status: "TERSEDIA"
      });
      setFeedbackMessage({ type: "success", text: `Armada baru ${newPlat.toUpperCase()} berhasil ditambahkan!` });
      setShowAddModal(false);
      setNewPlat("");
      setNewDriver("");
      setNewHp("");
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Gagal menambah armada." });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Submit Delete Truck
  const handleDelete = async (truck: TruckDoc) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus unit ${truck.plat_nomor}?`)) return;
    setActionLoading(true);
    try {
      await onDeleteTruck(truck.id);
      setFeedbackMessage({ type: "success", text: `Unit ${truck.plat_nomor} telah dihapus!` });
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Gagal menghapus unit." });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-200"
          }`}
        >
          {feedbackMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header controls & Add Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <span>Daftar Armada Terdaftar</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
              {filteredTrucks.length} Unit
            </span>
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">
            Kelola data truck, perbarui status pengiriman, dan selesaikan ritase secara langsung
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Unit Armada</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 shrink-0">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">SEMUA STATUS</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Plat, Driver, FO, DN..."
            className="pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
      </div>

      {/* Fleet List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-700">
              <th className="p-3 w-10 text-center">No.</th>
              <th className="p-3">Plat Nomor</th>
              <th className="p-3">Vendor</th>
              <th className="p-3">Status Armada</th>
              <th className="p-3">Driver & Kontak</th>
              <th className="p-3">Jenis Truck</th>
              <th className="p-3">FO / DN</th>
              <th className="p-3">No. Container</th>
              <th className="p-3 text-center">Aksi Operasional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-slate-200">
            {filteredTrucks.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 dark:text-slate-500 font-semibold">
                  Tidak ada armada terdaftar.
                </td>
              </tr>
            ) : (
              filteredTrucks.map((truck, idx) => (
                <tr key={truck.id ? `${truck.id}_${idx}` : `truck-${idx}`} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-black text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                    {truck.plat_nomor}
                  </td>
                  <td className="p-3 font-bold text-gray-700 dark:text-slate-300">{truck.vendor || "Pancaran Darat"}</td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 whitespace-nowrap">
                      {truck.status || "TERSEDIA"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900 dark:text-slate-100">{truck.nama_driver || "-"}</div>
                    {truck.no_hp && truck.no_hp !== "-" && (
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{truck.no_hp}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-slate-400 font-medium">
                    {truck.jenis_mobil || "Trailer 40ft HC"}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-xs text-gray-800 dark:text-slate-200">FO: {truck.fo || "-"}</div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400">DN: {truck.dn || "-"}</div>
                  </td>
                  <td className="p-3 font-bold text-gray-800 dark:text-slate-200">{truck.no_container || "-"}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(truck)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        title="Update Status / Detail"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Update</span>
                      </button>

                      {(truck.status || "").toLowerCase() !== "tersedia" && (
                        <button
                          onClick={() => handleFinish(truck)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          title="Selesaikan Delivery"
                        >
                          <Check className="w-3 h-3" />
                          <span>Selesai</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(truck)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Hapus Unit"
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

      {/* Edit / Update Status Modal */}
      {editingTruck && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-slate-100">
                  Update Status Armada: <span className="text-blue-600 dark:text-blue-400">{editingTruck.plat_nomor}</span>
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-400">
                  Perbarui informasi pengiriman dan lokasi terkini
                </p>
              </div>
              <button
                onClick={() => setEditingTruck(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Pilih Status Baru *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Nama Supir / Driver</label>
                  <input
                    type="text"
                    value={formDriver}
                    onChange={(e) => setFormDriver(e.target.value)}
                    placeholder="Nama Supir"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Kontak / No. HP Driver</label>
                  <input
                    type="text"
                    value={formHp}
                    onChange={(e) => setFormHp(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Nomor FO</label>
                  <input
                    type="text"
                    value={formFo}
                    onChange={(e) => setFormFo(e.target.value)}
                    placeholder="6100510..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Nomor DN</label>
                  <input
                    type="text"
                    value={formDn}
                    onChange={(e) => setFormDn(e.target.value)}
                    placeholder="FI00000..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">No. Container</label>
                  <input
                    type="text"
                    value={formContainer}
                    onChange={(e) => setFormContainer(e.target.value)}
                    placeholder="ONEU1234567"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Jenis Produk</label>
                  <select
                    value={formProduk}
                    onChange={(e) => setFormProduk(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Jenis Produk --</option>
                    {masterJenisProduk.map((jp) => (
                      <option key={jp.id} value={jp.name}>
                        {jp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Lokasi Muat</label>
                  <input
                    type="text"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    placeholder="EXPORT PM 3 / DEPO..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Tgl / Jam Tiba di IKK</label>
                  <input
                    type="datetime-local"
                    value={formArrive}
                    onChange={(e) => setFormArrive(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Timbang 1</label>
                  <input
                    type="datetime-local"
                    value={formTimbang1}
                    onChange={(e) => setFormTimbang1(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Timbang 2</label>
                  <input
                    type="datetime-local"
                    value={formTimbang2}
                    onChange={(e) => setFormTimbang2(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTruck(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionLoading ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Truck Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-gray-900 dark:text-slate-100">Tambah Unit Armada Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Plat Nomor *</label>
                <input
                  type="text"
                  required
                  value={newPlat}
                  onChange={(e) => setNewPlat(e.target.value)}
                  placeholder="Contoh: B 9814 UFY"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Nama Driver Initial</label>
                <input
                  type="text"
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  placeholder="Nama Driver / TERSEDIA (STANDBY)"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">No. HP Driver</label>
                <input
                  type="text"
                  value={newHp}
                  onChange={(e) => setNewHp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Jenis Mobil / Truck</label>
                <select
                  value={newJenisTruck}
                  onChange={(e) => setNewJenisTruck(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Trailer 40ft HC">Trailer 40ft HC</option>
                  <option value="Trailer 20ft">Trailer 20ft</option>
                  {masterJenisTruck.map((j) => (
                    <option key={j.id} value={j.name}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{actionLoading ? "Menambah..." : "Tambah Unit"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
