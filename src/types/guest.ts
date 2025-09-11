// Types for Wedding Guest Management System

export interface Guest {
  id: string;
  name: string;
  category: GuestCategory;
  companions: Companion[];
  allergies?: string;
  status: GuestStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  unitId?: string; // Reference to original invitation unit
}

export interface Companion {
  id: string;
  name: string;
  allergies?: string;
  status: GuestStatus;
}

export type GuestCategory = 
  | "family-his" 
  | "family-hers" 
  | "friends" 
  | "colleagues";

export type GuestStatus = 
  | "pending" 
  | "confirmed" 
  | "deleted";

export interface GuestFormData {
  name: string;
  category: GuestCategory;
  companionCount: number;
  companions: Array<{ name: string; allergies?: string }>;
  allergies?: string;
}

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  deleted: number;
  byCategory: Record<GuestCategory, number>;
  totalWithCompanions: number;
}

export const CATEGORY_LABELS: Record<GuestCategory, string> = {
  "family-his": "Famiglia di lui",
  "family-hers": "Famiglia di lei", 
  "friends": "Amici",
  "colleagues": "Colleghi"
};

export const STATUS_LABELS: Record<GuestStatus, string> = {
  "pending": "Da confermare",
  "confirmed": "Confermato",
  "deleted": "Eliminato"
};