import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyC19AOb9d5OHHbb0EiwDdQJQbcMqU_Jagg",
  authDomain: "export-ikk.firebaseapp.com",
  projectId: "export-ikk",
  storageBucket: "export-ikk.firebasestorage.app",
  messagingSenderId: "214387882283",
  appId: "1:214387882283:web:621fb14dd1f76433802d6e",
  measurementId: "G-646GE863FP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface TruckDoc {
  id: string;
  plat_nomor: string;
  nama_driver?: string;
  no_hp?: string;
  jenis_mobil?: string;
  vendor?: string;
  status: string;
  fo?: string;
  dn?: string;
  no_container?: string;
  jenis_produk?: string;
  daftar_dco?: string;
  tgl_timbang_1?: string;
  tgl_timbang_2?: string;
  lokasi_muat?: string;
  terakhir_update?: number | string;
  createdAt?: number;
}

export interface RitaseDoc {
  id: string;
  plat_nomor: string;
  vendor: string;
  jenis_mobil?: string;
  nama_driver?: string;
  no_hp?: string;
  dn?: string;
  no_container?: string;
  jenis_produk?: string;
  daftar_dco?: string;
  tgl_timbang_1?: string;
  tgl_timbang_2?: string;
  fo?: string;
  tgl_selesai: number;
}

export interface MasterStatusDoc {
  id: string;
  name: string;
  order?: number;
  createdAt?: number;
}

export interface MasterJenisTruckDoc {
  id: string;
  name: string;
  createdAt?: number;
}

export interface MasterJenisProdukDoc {
  id: string;
  name: string;
  createdAt?: number;
}

export interface UserDoc {
  id: string;
  email: string;
  name: string;
  role: "admin" | "emkl" | string;
  createdAt?: number;
}

export interface RepoDoc {
  id: string;
  fo?: string;
  dn?: string;
  no_container?: string;
  vendor?: string;
  nama_driver?: string;
  no_hp?: string;
  plat_nomor?: string;
  lokasi_repo?: string;
  tgl_masuk_repo?: string;
  tgl_open?: string;
  nama_kapal?: string;
  status_repo: "Aktif" | "Selesai" | string;
  tgl_selesai_repo?: number | null;
  createdAt?: number;
}

export async function loginWithCredentials(email = "pdt@ikk.com", pass = "pdt@ikk.com") {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function logoutUser() {
  return await firebaseSignOut(auth);
}
