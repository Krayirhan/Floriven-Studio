import { useState } from "react";
import type { LeftTab, RightTab } from "../studio.types";

export function useStudioUiState() {
  const [leftTab, setLeftTab] = useState<LeftTab>("screens");
  const [rightTab, setRightTab] = useState<RightTab>("design");
  const [prompt, setPrompt] = useState("");
  const [brief, setBrief] = useState(
    "Kişisel finans uygulaması, 25–40 yaş arası profesyoneller için. iOS öncelikli mobil uygulama. Stil: clean, modern, güven veren. Accent renk: turuncu. Ekranlar: Ana Sayfa, İşlemler, Bütçe Detayı.",
  );

  return {
    leftTab,
    rightTab,
    prompt,
    brief,
    setLeftTab,
    setRightTab,
    setPrompt,
    setBrief,
  };
}
