import { createElement, type ReactNode } from "react";

export type NotificationItem = {
  id: string;
  group: "Bugün" | "Dün" | "Daha eski";
  text: string;
  time: string;
  unread: boolean;
};

export const initialNotifications: NotificationItem[] = [
  { id: "1", group: "Bugün", text: "Bütçe Detayı ekranı oluşturuldu.", time: "15 dk önce", unread: true },
  { id: "2", group: "Bugün", text: "Figma dışa aktarımın hazır.", time: "1 saat önce", unread: true },
  { id: "3", group: "Dün", text: "Melo Wellness projesine yorum eklendi.", time: "Dün 14:20", unread: false },
  { id: "4", group: "Daha eski", text: "Kredi bakiyen 10'un altına düştü.", time: "3 gün önce", unread: false },
];

export const searchItems = ["Kişisel Finans", "Melo Wellness", "Nora Market", "Aether AI", "Apex Wealth şablonu"];

export function SvgIcon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return createElement("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": true, style: { flexShrink: 0 },
  }, children);
}

const path = (d: string) => createElement("path", { d });
const rect = (props: Record<string, string>) => createElement("rect", props);
const circle = (props: Record<string, string>) => createElement("circle", props);
const icon = (children: ReactNode, size?: number) => SvgIcon({ children, ...(size ? { size } : {}) });

export const HomeIcon = () => icon([path("M3 12L12 3l9 9"), path("M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9")]);
export const GridIcon = () => icon([rect({ x: "3", y: "3", width: "7", height: "7", rx: "1" }), rect({ x: "14", y: "3", width: "7", height: "7", rx: "1" }), rect({ x: "14", y: "14", width: "7", height: "7", rx: "1" }), rect({ x: "3", y: "14", width: "7", height: "7", rx: "1" })]);
export const UsersIcon = () => icon([path("M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"), circle({ cx: "9", cy: "7", r: "4" }), path("M23 21v-2a4 4 0 0 1 0 7.75")]);
export const LayoutIcon = () => icon([rect({ x: "3", y: "3", width: "18", height: "7", rx: "1" }), rect({ x: "3", y: "14", width: "7", height: "7", rx: "1" }), rect({ x: "14", y: "14", width: "7", height: "7", rx: "1" })]);
export const LayersIcon = () => icon(path("M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"));
export const CreditIcon = () => icon([rect({ x: "1", y: "4", width: "22", height: "16", rx: "2" }), path("M1 10h22")], 14);
export const SettingsIcon = () => icon([circle({ cx: "12", cy: "12", r: "3" }), path("M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z")]);
export const HelpIcon = () => icon([circle({ cx: "12", cy: "12", r: "10" }), path("M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01")], 14);
export const SearchIcon = () => icon([circle({ cx: "11", cy: "11", r: "8" }), path("M21 21l-4.35-4.35")], 14);
export const BellIcon = () => icon([path("M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"), path("M13.73 21a2 2 0 0 1-3.46 0")], 15);
