import { useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  loginWithCredentials,
  logoutUser,
  TruckDoc,
  RitaseDoc,
  MasterStatusDoc,
  MasterJenisTruckDoc,
  MasterJenisProdukDoc,
  UserDoc,
  RepoDoc
} from "../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export function useFirebaseRealtime() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>("emkl");
  const [vendorName, setVendorName] = useState<string>("Pancaran Darat");
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firestore Collections State
  const [trucks, setTrucks] = useState<TruckDoc[]>([]);
  const [ritase, setRitase] = useState<RitaseDoc[]>([]);
  const [masterStatuses, setMasterStatuses] = useState<MasterStatusDoc[]>([]);
  const [masterJenisTruck, setMasterJenisTruck] = useState<MasterJenisTruckDoc[]>([]);
  const [masterJenisProduk, setMasterJenisProduk] = useState<MasterJenisProdukDoc[]>([]);
  const [masterUsers, setMasterUsers] = useState<UserDoc[]>([]);
  const [repo, setRepo] = useState<RepoDoc[]>([]);

  // Track real-time sync timestamp
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString("id-ID"));
  const [scheduledNotice, setScheduledNotice] = useState<string | null>(null);

  // Scheduled refresh times: 09:00, 13:00, 15:00, 17:00, 19:00, 23:00
  const SCHEDULED_HOURS = [9, 13, 15, 17, 19, 23];

  const getNextScheduledRefresh = useCallback(() => {
    const now = new Date();
    const curH = now.getHours();
    const curM = now.getMinutes();

    let nextH = SCHEDULED_HOURS.find((h) => h > curH || (h === curH && curM === 0));
    let isTomorrow = false;

    if (nextH === undefined) {
      nextH = SCHEDULED_HOURS[0]; // 9 AM tomorrow
      isTomorrow = true;
    }

    const nextDate = new Date(now);
    if (isTomorrow) nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(nextH, 0, 0, 0);

    const diffMs = Math.max(0, nextDate.getTime() - now.getTime());
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      nextHour: nextH,
      label: `${String(nextH).padStart(2, "0")}:00 WIB${isTomorrow ? " (Besok)" : ""}`,
      countdownText: `${hoursLeft}j ${minutesLeft}m`
    };
  }, []);

  const [nextSchedule, setNextSchedule] = useState(getNextScheduledRefresh());

  // Timer effect to trigger auto-refresh & update countdown
  useEffect(() => {
    let lastTriggeredHour = -1;

    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      setNextSchedule(getNextScheduledRefresh());

      // Check if current time matches schedule (at 00 minutes and 00-03 seconds)
      if (SCHEDULED_HOURS.includes(h) && m === 0 && s < 5 && lastTriggeredHour !== h) {
        lastTriggeredHour = h;
        const syncTimeString = now.toLocaleTimeString("id-ID");
        setLastSyncTime(syncTimeString);
        setScheduledNotice(`Auto Refresh Jadwal Jam ${String(h).padStart(2, "0")}:00 Berhasil Ditrigger (${syncTimeString})`);
        
        setTimeout(() => setScheduledNotice(null), 5000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getNextScheduledRefresh]);

  // 1. Auth Observer & Auto Login for pdt@ikk.com if needed
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDocSnap = await getDoc(doc(db, "users", user.uid));
          if (userDocSnap.exists()) {
            const uData = userDocSnap.data();
            setUserRole(uData.role || "emkl");
            setVendorName(uData.name || "Pancaran Darat");
          } else {
            // Default for pdt@ikk.com
            if (user.email === "pdt@ikk.com") {
              setUserRole("emkl");
              setVendorName("Pancaran Darat");
            }
          }
        } catch (err: any) {
          console.error("User doc fetch error:", err);
        }
        setAuthError(null);
        setAuthLoading(false);
      } else {
        // Attempt auto login with pdt@ikk.com / pdt@ikk.com
        try {
          await loginWithCredentials("pdt@ikk.com", "pdt@ikk.com");
        } catch (err: any) {
          console.error("Auto login error:", err);
          setCurrentUser(null);
          setAuthError("Gagal login otomatis. Silakan login manual.");
          setAuthLoading(false);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  // 2. Real-Time Snapshot Listeners
  useEffect(() => {
    if (!currentUser) return;

    // A. Master Statuses
    const unsubStatuses = onSnapshot(collection(db, "master_statuses"), (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MasterStatusDoc));
      raw.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : (a.createdAt || 0);
        const orderB = b.order !== undefined ? b.order : (b.createdAt || 0);
        if (orderA === orderB) return (a.createdAt || 0) - (b.createdAt || 0);
        return orderA - orderB;
      });
      setMasterStatuses(raw);
    });

    // B. Master Jenis Truck
    const unsubJenisTruck = onSnapshot(query(collection(db, "master_jenis_truck"), orderBy("createdAt")), (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MasterJenisTruckDoc));
      setMasterJenisTruck(raw);
    });

    // C. Master Jenis Produk
    const unsubJenisProduk = onSnapshot(query(collection(db, "master_jenis_produk"), orderBy("createdAt")), (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MasterJenisProdukDoc));
      setMasterJenisProduk(raw);
    });

    // D. Users (if admin or general)
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserDoc));
      setMasterUsers(raw);
    });

    // E. Trucks
    let qTrucks = collection(db, "trucks") as any;
    if (userRole === "emkl" && vendorName && vendorName !== "ALL") {
      qTrucks = query(collection(db, "trucks"), where("vendor", "==", vendorName));
    }
    const unsubTrucks = onSnapshot(qTrucks, (snap: any) => {
      const raw = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as TruckDoc));
      setTrucks(raw);
    });

    // F. Ritase (Limit 1000)
    let qRitase = query(collection(db, "ritase"), orderBy("tgl_selesai", "desc"), limit(1000));
    if (userRole === "emkl" && vendorName && vendorName !== "ALL") {
      qRitase = query(collection(db, "ritase"), where("vendor", "==", vendorName), orderBy("tgl_selesai", "desc"), limit(1000));
    }
    const unsubRitase = onSnapshot(qRitase, (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RitaseDoc));
      setRitase(raw);
    });

    // G. Repo (Limit 1000)
    const qRepo = query(collection(db, "repo"), orderBy("createdAt", "desc"), limit(1000));
    const unsubRepo = onSnapshot(qRepo, (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RepoDoc));
      setRepo(raw);
    });

    return () => {
      unsubStatuses();
      unsubJenisTruck();
      unsubJenisProduk();
      unsubUsers();
      unsubTrucks();
      unsubRitase();
      unsubRepo();
    };
  }, [currentUser, userRole, vendorName]);

  // --- ACTIONS ---

  // Update status for a truck
  const updateTruckStatus = useCallback(async (
    truckId: string,
    updates: {
      status: string;
      nama_driver?: string;
      no_hp?: string;
      dn?: string;
      jenis_produk?: string;
      daftar_dco?: string;
      tgl_timbang_1?: string;
      tgl_timbang_2?: string;
      fo?: string;
      no_container?: string;
      lokasi_muat?: string;
    }
  ) => {
    const isTersedia = updates.status.toLowerCase() === "tersedia";
    let dataUpdate: Record<string, any> = {
      status: updates.status,
      nama_driver: updates.nama_driver || "",
      no_hp: updates.no_hp || "",
      terakhir_update: Date.now()
    };

    if (!isTersedia) {
      dataUpdate = {
        ...dataUpdate,
        dn: updates.dn || "",
        jenis_produk: updates.jenis_produk || "",
        daftar_dco: updates.daftar_dco || "",
        tgl_timbang_1: updates.tgl_timbang_1 || "",
        tgl_timbang_2: updates.tgl_timbang_2 || "",
        fo: updates.fo || "",
        no_container: updates.no_container || "",
        lokasi_muat: updates.lokasi_muat || ""
      };
    } else {
      dataUpdate = {
        ...dataUpdate,
        dn: "",
        jenis_produk: "",
        daftar_dco: "",
        tgl_timbang_1: "",
        tgl_timbang_2: "",
        fo: "",
        no_container: "",
        lokasi_muat: ""
      };
    }

    await updateDoc(doc(db, "trucks", truckId), dataUpdate);
  }, []);

  // Finish Delivery (move to ritase & reset truck)
  const finishTruckDelivery = useCallback(async (
    truck: TruckDoc,
    details: {
      nama_driver: string;
      no_hp: string;
      dn: string;
      no_container: string;
      jenis_produk: string;
      daftar_dco: string;
      tgl_timbang_1: string;
      tgl_timbang_2: string;
      fo: string;
    }
  ) => {
    // 1. Add to ritase
    await addDoc(collection(db, "ritase"), {
      plat_nomor: truck.plat_nomor,
      vendor: truck.vendor || vendorName,
      jenis_mobil: truck.jenis_mobil || "Trailer 40ft HC",
      nama_driver: details.nama_driver,
      no_hp: details.no_hp,
      dn: details.dn,
      no_container: details.no_container,
      jenis_produk: details.jenis_produk,
      daftar_dco: details.daftar_dco,
      tgl_timbang_1: details.tgl_timbang_1,
      tgl_timbang_2: details.tgl_timbang_2,
      fo: details.fo,
      tgl_selesai: Date.now()
    });

    // 2. Reset truck status
    await updateDoc(doc(db, "trucks", truck.id), {
      status: "Tersedia",
      dn: "",
      jenis_produk: "",
      daftar_dco: "",
      tgl_timbang_1: "",
      tgl_timbang_2: "",
      fo: "",
      no_container: "",
      lokasi_muat: "",
      terakhir_update: Date.now()
    });
  }, [vendorName]);

  // Add new truck
  const addTruck = useCallback(async (newTruckData: {
    plat_nomor: string;
    nama_driver?: string;
    no_hp?: string;
    jenis_mobil?: string;
    vendor?: string;
    status?: string;
    fo?: string;
    dn?: string;
    no_container?: string;
    lokasi_muat?: string;
  }) => {
    await addDoc(collection(db, "trucks"), {
      plat_nomor: newTruckData.plat_nomor,
      nama_driver: newTruckData.nama_driver || "TERSEDIA (STANDBY)",
      no_hp: newTruckData.no_hp || "-",
      jenis_mobil: newTruckData.jenis_mobil || "Trailer 40ft HC",
      vendor: newTruckData.vendor || vendorName,
      status: newTruckData.status || "Tersedia",
      fo: newTruckData.fo || "",
      dn: newTruckData.dn || "",
      no_container: newTruckData.no_container || "",
      lokasi_muat: newTruckData.lokasi_muat || "",
      createdAt: Date.now(),
      terakhir_update: Date.now()
    });
  }, [vendorName]);

  // Delete truck
  const deleteTruck = useCallback(async (truckId: string) => {
    await deleteDoc(doc(db, "trucks", truckId));
  }, []);

  // Add Repo
  const addRepo = useCallback(async (selectedRitaseIds: string[], lokasiRepo: string) => {
    const promises = selectedRitaseIds.map((ritaseId) => {
      const r = ritase.find((x) => x.id === ritaseId) || {};
      return addDoc(collection(db, "repo"), {
        fo: r.fo || "-",
        dn: r.dn || "-",
        no_container: r.no_container || "-",
        vendor: r.vendor || "-",
        nama_driver: r.nama_driver || "-",
        no_hp: r.no_hp || "-",
        plat_nomor: r.plat_nomor || "-",
        lokasi_repo: lokasiRepo,
        tgl_masuk_repo: "",
        tgl_open: "",
        nama_kapal: "",
        status_repo: "Aktif",
        tgl_selesai_repo: null,
        createdAt: Date.now()
      });
    });
    await Promise.all(promises);
  }, [ritase]);

  // Finish Repo
  const finishRepo = useCallback(async (repoId: string) => {
    await updateDoc(doc(db, "repo", repoId), {
      status_repo: "Selesai",
      tgl_selesai_repo: Date.now()
    });
  }, []);

  // Update Repo Detail
  const updateRepoDetail = useCallback(async (
    repoId: string,
    details: {
      tgl_masuk_repo: string;
      tgl_open: string;
      nama_kapal: string;
    }
  ) => {
    await updateDoc(doc(db, "repo", repoId), details);
  }, []);

  // Delete Repo
  const deleteRepo = useCallback(async (repoId: string) => {
    await deleteDoc(doc(db, "repo", repoId));
  }, []);

  const triggerManualRefresh = useCallback(() => {
    const now = new Date();
    const syncTimeString = now.toLocaleTimeString("id-ID");
    setLastSyncTime(syncTimeString);
    setNextSchedule(getNextScheduledRefresh());
  }, [getNextScheduledRefresh]);

  return {
    currentUser,
    userRole,
    vendorName,
    authLoading,
    authError,
    trucks,
    ritase,
    masterStatuses,
    masterJenisTruck,
    masterJenisProduk,
    masterUsers,
    repo,
    lastSyncTime,
    nextSchedule,
    scheduledNotice,
    scheduledHours: SCHEDULED_HOURS,
    triggerManualRefresh,
    login: loginWithCredentials,
    logout: logoutUser,
    updateTruckStatus,
    finishTruckDelivery,
    addTruck,
    deleteTruck,
    addRepo,
    finishRepo,
    updateRepoDetail,
    deleteRepo
  };
}
