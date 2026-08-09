import { DESIGN_TEMPLATES, type DesignTemplate } from "@floriven/design-spec";

export type VisualDirection = DesignTemplate["strategy"]["visualDirection"];

export interface ProjectItem {
  id: string;
  name: string;
  direction: string;
  screens: number;
  lastUpdated: string;
  description: string;
}

export interface UploadedScreen {
  name: string;
  previewUrl: string;
}

export const templates = DESIGN_TEMPLATES;

export const projectsList: ProjectItem[] = [
  { id: "prj_finance_01", name: "Kişisel Finans", direction: "Kesin ve analitik", screens: 4, lastUpdated: "5 dk önce", description: "Bütçe, gelir ve harcama yönetimi mobil deneyimi." },
  { id: "prj_wellness_02", name: "Melo Wellness", direction: "Sakin ve destekleyici", screens: 4, lastUpdated: "1 sa. önce", description: "Alışkanlık takip ve meditasyon akışı." },
  { id: "prj_shop_03", name: "Nora Market", direction: "Sıcak ve ürün odaklı", screens: 4, lastUpdated: "Dün", description: "Kahve seçimi ve abonelik e-ticaret akışı." },
];

export const quickStarts = [
  { label: "Kişisel finans", prompt: "Genç profesyoneller için bütçe, gelir, harcama ve hedef yönetimi sunan bir kişisel finans uygulaması tasarla." },
  { label: "Wellness tracker", prompt: "Günlük alışkanlık, meditasyon ve uyku takibi sunan kişisel wellness uygulaması tasarla." },
  { label: "E-ticaret", prompt: "Bağımsız üreticilerin ürünlerini keşfetme, kaydetme ve satın alma akışı olan bir pazar yeri tasarla." },
  { label: "AI asistan", prompt: "Araştırma, görev planlama ve çıktı geçmişini yöneten üretken yapay zekâ çalışma alanı tasarla." },
  { label: "Eğitim", prompt: "Ders yol haritası, günlük pratik ve ilerleme analizi sunan bir dil öğrenme uygulaması tasarla." },
];
