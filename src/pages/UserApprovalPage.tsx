import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  UserX, 
  UserPlus, 
  Search, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Mail, 
  User, 
  Shield, 
  Lock, 
  Filter,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { UserAccount, UserStatus, UserRole } from "../types";
import { getUsers, updateUserStatus, deleteUser, addUserDirect } from "../lib/userStore";

export default function UserApprovalPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | UserStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New User Form State
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Operations Staff");
  const [newDepartment, setNewDepartment] = useState("Operations");
  const [newPassword, setNewPassword] = useState("12345678");
  const [newStatus, setNewStatus] = useState<UserStatus>("active");

  const loadData = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (user: UserAccount) => {
    const updated = updateUserStatus(user.id, "active");
    setUsers(updated);
    showToast(`Akun ${user.fullName} (${user.email}) telah BERHASIL DISETUJUI & DIAKTIFKAN! User sekarang dapat login.`, "success");
  };

  const handleDeactivate = (user: UserAccount) => {
    if (user.email.toLowerCase() === "digital.solution@pancaran-logistic.id") {
      showToast("Tindakan Ditolak: Akun Super Admin Utama tidak dapat dinonaktifkan!", "error");
      return;
    }
    const updated = updateUserStatus(user.id, "inactive");
    setUsers(updated);
    showToast(`Akun ${user.fullName} telah DINONAKTIFKAN. Akses login user dicabut.`, "error");
  };

  const handleDelete = (user: UserAccount) => {
    if (user.email.toLowerCase() === "digital.solution@pancaran-logistic.id") {
      showToast("Tindakan Ditolak: Akun Super Admin Utama tidak dapat dihapus!", "error");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${user.fullName} (${user.email}) secara permanen?`)) {
      const updated = deleteUser(user.id);
      setUsers(updated);
      showToast(`Akun ${user.fullName} telah dihapus dari sistem.`, "success");
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPassword) {
      showToast("Mohon lengkapi semua bidang yang wajib diisi.", "error");
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      showToast(`Email ${newEmail} sudah terdaftar di sistem!`, "error");
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      fullName: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      passwordHash: newPassword,
      role: newRole,
      department: newDepartment || newRole,
      status: newStatus,
      registeredAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    const updated = addUserDirect(newUser);
    setUsers(updated);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewFullName("");
    setNewEmail("");
    setNewPassword("12345678");

    showToast(`Akun ${newUser.fullName} (${newUser.email}) berhasil dibuat dengan status '${newUser.status.toUpperCase()}'.`, "success");
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesStatus = filterStatus === "all" ? true : u.status === filterStatus;
    const matchesRole = selectedRoleFilter === "all" ? true : u.role === selectedRoleFilter;
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesRole && matchesSearch;
  });

  // Statistics
  const totalCount = users.length;
  const pendingCount = users.filter(u => u.status === "pending").length;
  const activeCount = users.filter(u => u.status === "active").length;
  const inactiveCount = users.filter(u => u.status === "inactive").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 max-w-lg transition-all animate-bounce ${
            toastMessage.type === "success" 
              ? "bg-emerald-900 text-white border-emerald-500 shadow-emerald-900/40" 
              : "bg-red-900 text-white border-red-500 shadow-red-900/40"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}



      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div 
          onClick={() => setFilterStatus("all")}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            filterStatus === "all" ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total User</span>
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalCount}</div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Semua akun terdaftar</p>
        </div>

        {/* Pending Approval (CRITICAL HIGHLIGHT) */}
        <div 
          onClick={() => setFilterStatus("pending")}
          className={`bg-sky-50/60 dark:bg-sky-950/30 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "pending" ? "border-sky-500 ring-2 ring-sky-500/30" : "border-sky-200 dark:border-sky-900/50"
          }`}
        >
          {pendingCount > 0 && (
            <span className="absolute top-3 right-3 w-3 h-3 bg-sky-500 rounded-full animate-ping" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-sky-800 dark:text-sky-400 uppercase tracking-wider">Pending Approval</span>
            <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">{pendingCount}</div>
          <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300 mt-1">Menunggu persetujuan Super Admin</p>
        </div>

        {/* Active Users */}
        <div 
          onClick={() => setFilterStatus("active")}
          className={`bg-emerald-50/50 dark:bg-emerald-950/30 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            filterStatus === "active" ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-emerald-200 dark:border-emerald-900/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">User Aktif</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-1">Bisa login ke portal</p>
        </div>

        {/* Inactive Users */}
        <div 
          onClick={() => setFilterStatus("inactive")}
          className={`bg-rose-50/50 dark:bg-rose-950/30 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            filterStatus === "inactive" ? "border-rose-500 ring-2 ring-rose-500/30" : "border-rose-200 dark:border-rose-900/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Non-Aktif</span>
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{inactiveCount}</div>
          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mt-1">Akses login ditolak</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Add User Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-slate-900 text-white dark:bg-sky-600 shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Semua ({totalCount})
          </button>
          
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === "pending"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                : "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Approval ({pendingCount})</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === "active"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>User Aktif ({activeCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === "inactive"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Non-Aktif ({inactiveCount})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, role..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={loadData}
            title="Refresh User Data"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Add User Direct Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User Baru</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Daftar Pengguna Internal ({filteredUsers.length})
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
              Aksi persetujuan langsung memutakhirkan akses login pengguna secara realtime.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-6">Informasi User</th>
                <th className="py-3.5 px-4">Role & Departemen</th>
                <th className="py-3.5 px-4">Tanggal Registrasi</th>
                <th className="py-3.5 px-4">Status Hak Akses</th>
                <th className="py-3.5 px-6 text-right">Tindakan Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <UserX className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold">Tidak ada data pengguna yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuperAdminAccount = user.email.toLowerCase() === "digital.solution@pancaran-logistic.id";
                  const isCSAccount = user.email.toLowerCase() === "cs@pancaran-logistic.id";

                  return (
                    <tr 
                      key={user.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        user.status === "pending" ? "bg-sky-50/20 dark:bg-sky-950/10" : ""
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                            isSuperAdminAccount 
                              ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                              : isCSAccount
                              ? "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                              <span>{user.fullName}</span>
                              {isSuperAdminAccount && (
                                <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Super Admin
                                </span>
                              )}
                              {isCSAccount && (
                                <span className="bg-sky-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Internal CS
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{user.role}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{user.department}</span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {user.registeredAt}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {user.status === "active" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>AKTIF (Bisa Login)</span>
                          </span>
                        )}

                        {user.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>MENUNGGU APPROVAL</span>
                          </span>
                        )}

                        {user.status === "inactive" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>NON-AKTIF (Ditolak)</span>
                          </span>
                        )}
                      </td>

                      {/* Approval Actions */}
                      <td className="py-4 px-6 text-right">
                        {isSuperAdminAccount ? (
                          <span className="text-[11px] font-bold text-slate-400 italic">Protected Main Admin</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {user.status !== "active" && (
                              <button
                                onClick={() => handleApprove(user)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-105 text-xs"
                                title="Setujui dan aktifkan login"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Setujui & Aktifkan</span>
                              </button>
                            )}

                            {user.status === "active" && (
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer text-xs"
                                title="Non-aktifkan hak login"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Non-Aktifkan</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New User Direct */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <span>Tambah User Baru (Super Admin)</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ahmad Rizky"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Logistik Pancaran</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ahmad@pancaran-logistic.id"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Role / Jabatan</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="Operations Staff">Operations Staff</option>
                    <option value="Fleet Dispatcher">Fleet Dispatcher</option>
                    <option value="Internal CS">Internal CS</option>
                    <option value="Management Executive">Management Executive</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Awal</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="active">Langsung AKTIF</option>
                    <option value="pending">Pending Approval</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password Access</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
