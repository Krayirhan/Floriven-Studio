import { useMemo, useState } from "react";

export function useDashboardAdvancedOptions() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("iOS");
  const [screenScope, setScreenScope] = useState("AI belirlesin");
  const [advancedDirection, setAdvancedDirection] = useState("Otomatik");
  const [advancedVariations, setAdvancedVariations] = useState(3);
  const [qualityMode, setQualityMode] = useState("Standart");
  const [webLayoutType, setWebLayoutType] = useState("Dashboard");
  const [webResponsiveTarget, setWebResponsiveTarget] = useState("Full responsive");
  const [webPageScope, setWebPageScope] = useState("Temel sayfalar");

  const advancedSummary = useMemo(
    () => [
      selectedPlatform !== "iOS" ? selectedPlatform : null,
      screenScope !== "AI belirlesin" ? screenScope : null,
      advancedDirection !== "Otomatik" ? advancedDirection : null,
      advancedVariations !== 3 ? `${advancedVariations} varyasyon` : null,
      qualityMode !== "Standart" ? qualityMode : null,
    ].filter(Boolean).join(" · "),
    [selectedPlatform, screenScope, advancedDirection, advancedVariations, qualityMode],
  );

  return {
    showAdvanced,
    setShowAdvanced,
    selectedPlatform,
    setSelectedPlatform,
    screenScope,
    setScreenScope,
    advancedDirection,
    setAdvancedDirection,
    advancedVariations,
    setAdvancedVariations,
    qualityMode,
    setQualityMode,
    webLayoutType,
    setWebLayoutType,
    webResponsiveTarget,
    setWebResponsiveTarget,
    webPageScope,
    setWebPageScope,
    advancedSummary,
  };
}
