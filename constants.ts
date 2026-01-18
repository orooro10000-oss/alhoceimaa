import { Category } from "./types";
import { Trees, Umbrella, Mountain, Castle, Tent, Home, Building2, Snowflake, Flame, Waves, Sun } from "lucide-react";

// تم تحديث الرقم بناءً على طلبك
export const HOST_PHONE_NUMBER = "00212676025001"; 

export const CATEGORIES: Category[] = [
  { label: 'شاطئية', icon: 'Umbrella' },
  { label: 'أكواخ', icon: 'Trees' },
  { label: 'رائج', icon: 'Flame' },
  { label: 'مسابح مذهلة', icon: 'Waves' },
  { label: 'جزر', icon: 'Sun' },
  { label: 'قصور', icon: 'Castle' },
  { label: 'تخييم', icon: 'Tent' },
  { label: 'منازل صغيرة', icon: 'Home' },
  { label: 'قطبية', icon: 'Snowflake' },
  { label: 'مدن', icon: 'Building2' },
  { label: 'جبال', icon: 'Mountain' },
];

export const NEIGHBORHOODS = [
  "ميرادور (Mirador)",
  "مورو فيخو (Moro Viejo)",
  "سيدي عابد (Sidi Abid)",
  "شاطئ كيمادو (Quemado)",
  "كالا بونيتا (Calabonita)",
  "وسط المدينة (Centre Ville)",
  "صبادية (Sabadia)",
  "تجزئة البادسي (Badsi)",
  "حي المنزه",
  "باريو (Barrio)",
  "إسلي (Isly)",
  "تالا يوسف (Tala Youssef)"
];

export const SUGGESTED_TITLES = [
  "شقة فاخرة بإطلالة بانورامية على البحر",
  "فيلا رائعة مع مسبح خاص وحديقة",
  "ستوديو أنيق في موقع مركزي",
  "منزل عائلي واسع قريب من الشاطئ",
  "شقة مودرن في ميرادور للعائلات",
  "بنتهاوس مع تراس كبير وإطلالة",
  "شاليه مريح في تالا يوسف",
  "إقامة هادئة ومريحة وسط المدينة",
  "شقة مفروشة بالكامل للكراء اليومي",
  "منزل تقليدي بلمسة عصرية"
];

export const MOCK_USER = {
  id: 'host_123',
  name: 'Hamza', // Updated Name
  role: 'host' as const,
  avatar: 'https://picsum.photos/100/100',
};