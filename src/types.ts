export type OrderType = "ekspor" | "impor" | "repo";
export type OrderStatus = "open" | "in_progress" | "done" | "cancel";
export type TripStatus = "pre_trip" | "on_trip" | "end_trip" | "cancel";
export type UnitStatus = "utilized" | "standby" | "downtime";
export type ServiceType = "EXPORT" | "REPO FULL" | "REPO EMPTY" | "IMPORT";

export type UserRole = "Super Admin" | "Internal CS" | "Operations Staff" | "Fleet Dispatcher" | "Management Executive" | "Guest";
export type UserStatus = "active" | "pending" | "inactive";

export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  registeredAt: string;
  lastLoginAt?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  freightType?: string;
  freightType2?: ServiceType | string;
  status: OrderStatus;
  customer: string;
  origin: string;
  destination: string;
  unitType: string;
  eta: string;
  source?: string;
  bookingDate?: string;
  quantity?: number;
  notes?: string;
  lastUpdateCS?: string;
  driver?: string;
  vehiclePlate?: string;
  sourceSheetName?: string;
  sourceUrl?: string;
  poolingId?: string;
  noJobOrder?: string;
  commercialRoute?: string;
  statusPooling?: string;
  statusRealtime?: string;
  requestStuffing?: string;
}

export interface FormulaRule {
  id: string;
  targetField: "status" | "type" | "lastUpdateCS" | "customNote";
  conditionType: "contains" | "equals" | "starts_with" | "is_not_empty" | "always";
  conditionValue: string;
  resultValue: string;
}

export interface ColumnMapping {
  headerRowIndex?: number;
  idField?: string;
  typeField?: string;
  freightTypeField?: string;
  freightType2Field?: string;
  commercialRouteField?: string;
  statusField?: string;
  customerField?: string;
  originField?: string;
  destinationField?: string;
  unitTypeField?: string;
  quantityField?: string;
  etaField?: string;
  lastUpdateCSField?: string;
  driverField?: string;
  vehiclePlateField?: string;
  statusRealtimeField?: string;
}

export interface SheetSource {
  id: string;
  name: string;
  url: string;
  spreadsheetId?: string;
  gid?: string;
  enabled: boolean;
  lastSyncedAt?: string;
  rowCount?: number;
  status?: "success" | "error" | "pending";
  errorMessage?: string;
  headerRowIndex?: number;
  columnMapping?: ColumnMapping;
  formulaRules?: FormulaRule[];
}

export interface Shipment {
  id: string;
  orderRef: string;
  type: OrderType;
  freightType?: string;
  freightType2?: ServiceType | string;
  tripStatus: TripStatus;
  unit: string;
  driver: string;
  currentLocation: string;
  eta: string;
  bookingDate?: string;
  customer?: string;
  quantity?: number;
  lastUpdateCS?: string;
  orderStatus?: string;
  commercialRoute?: string;
  origin?: string;
  destination?: string;
  notes?: string;
  requestStuffing?: string;
}

export interface TikProStatusItem {
  key: string;
  label: string;
  count: number;
  icon?: string;
  colorClass?: string;
  badgeColor?: string;
}

export interface TikProTruck {
  id: string;
  platNomor: string;
  driverName: string;
  phone: string;
  jenisMobil: string;
  vendor: string;
  status: string;
  fo: string;
  dn: string;
  noContainer: string;
  jenisProduk?: string;
  lokasiMuat?: string;
  timbang1?: string;
  timbang2?: string;
  terakhirUpdate: string;
}

export interface TikProMirrorData {
  lastSyncedAt: string;
  vendorName: string;
  userEmail: string;
  accessRole: string;
  totalArmadaTerdaftar: number;
  dalamTugasAlokasi: number;
  standbyTersedia: number;
  totalVendorMitra: number;
  statusBreakdown: Record<string, number>;
  statusItems: TikProStatusItem[];
  trucks: TikProTruck[];
}

export interface FleetUnit {
  unitId: string;
  unitType: string;
  status: UnitStatus;
  lastLocation: string;
  lastUpdate: string;
  downtimeCategory?: string;
}
