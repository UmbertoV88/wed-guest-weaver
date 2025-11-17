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
  containsPrimary?: boolean; // True if this card contains the main guest
  ageGroup?: AgeGroup;
  bombonieraAssegnata?: boolean;
  primaryDbId?: string; // Real database ID for main guest (only when containsPrimary is true)
}

export interface Companion {
  id: string;
  name: string;
  allergies?: string;
  status: GuestStatus;
  ageGroup?: AgeGroup;
  bombonieraAssegnata?: boolean;
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

export type AgeGroup = 
  | "Adulto"
  | "Ragazzo" 
  | "Bambino";

export interface GuestFormData {
  name: string;
  category: GuestCategory;
  companionCount: number;
  companions: Array<{ name: string; allergies?: string; ageGroup?: AgeGroup }>;
  allergies?: string;
  ageGroup?: AgeGroup;
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

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  "Adulto": "Adulto",
  "Ragazzo": "Ragazzo",
  "Bambino": "Bambino"
};

// Emoji per badge compatti nelle card ospiti (solo sezione Tavoli e Non Assegnati)
export const CATEGORY_ICONS: Record<GuestCategory, string> = {
  "family-his": "🤵🏻",
  "family-hers": "👰🏻‍♀️",
  "friends": "🤝🏻",
  "colleagues": "💼"
};

export const AGE_GROUP_ICONS: Record<AgeGroup, string> = {
  "Adulto": "👨🏻‍🦳",
  "Ragazzo": "👦🏻",
  "Bambino": "🍼"
};