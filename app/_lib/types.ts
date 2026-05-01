// Frontend / API contract types shared between route handlers and the UI.

export type Region = "เหนือ" | "กลาง" | "อีสาน" | "ใต้" | "ตะวันออก" | "ตะวันตก";

export interface Place {
  id: number;
  nameTh: string;
  nameEn: string | null;
  nearby: string | null;
  address: string | null;
  region: string | null;
  soi: string | null;
  road: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  type: string | null;
  subtype: string | null;
  contactInfo: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  line: string | null;
  tiktok: string | null;
  youtube: string | null;
  openingHours: string | null;
  description: string | null;
  activities: string | null;
  bestTime: string | null;
  feeThaiAdult: string | null;
  feeThaiChild: string | null;
  feeForeignAdult: string | null;
  feeForeignChild: string | null;
  notes: string | null;
  coords: { lat: number; lng: number } | null;
  images: string[];
}

export interface PlaceCardSummary {
  id: number;
  nameTh: string;
  nameEn: string | null;
  province: string | null;
  type: string | null;
  cover: string | null;
  coords: { lat: number; lng: number } | null;
}

export interface Favorite {
  favoriteId: number;
  place: PlaceCardSummary;
  note: string | null;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: { placeId: number; title: string }[];
  timestamp?: number;
}

export interface PlaceFilter {
  province?: string;
  type?: string;
  q?: string;
}
