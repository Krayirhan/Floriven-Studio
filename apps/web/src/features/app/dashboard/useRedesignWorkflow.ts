import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { UploadedScreen } from "../dashboard.data";
import { generationService } from "../../../services";

export function useRedesignWorkflow(generating: boolean, setGenerating: Dispatch<SetStateAction<boolean>>) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploadedScreen, setUploadedScreen] = useState<UploadedScreen | null>(null);
  const [isDraggingScreenshot, setIsDraggingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [redesignStage, setRedesignStage] = useState<"upload" | "analyzing" | "ready" | "generated">("upload");
  const [preservationRules, setPreservationRules] = useState<string[]>([
    "İçeriği koru",
    "Kullanıcı aksiyonlarını koru",
    "Navigasyonu koru",
    "Veri alanlarını koru",
  ]);
  const [designDirection, setDesignDirection] = useState("Otomatik");
  const [variationCount, setVariationCount] = useState(3);
  const [redesignInstruction, setRedesignInstruction] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const togglePreservationRule = (rule: string) => {
    setPreservationRules((prev) => prev.includes(rule) ? prev.filter((item) => item !== rule) : [...prev, rule]);
  };

  const selectScreenshot = (file?: File) => {
    if (!file) return;
    const supportedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      setUploadError("Yalnızca PNG, JPG veya WebP dosyaları yükleyebilirsin.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ekran görüntüsü en fazla 10 MB olabilir.");
      return;
    }
    if (uploadedScreen) URL.revokeObjectURL(uploadedScreen.previewUrl);
    setUploadedScreen({ name: file.name, previewUrl: URL.createObjectURL(file) });
    setUploadError(null);
    setRedesignStage("analyzing");
    window.setTimeout(() => setRedesignStage("ready"), 650);
  };

  const clearScreenshot = () => {
    if (uploadedScreen) URL.revokeObjectURL(uploadedScreen.previewUrl);
    setUploadedScreen(null);
    setUploadError(null);
    setRedesignStage("upload");
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const startRedesign = async () => {
    if (!uploadedScreen || redesignStage !== "ready") return;
    setGenerating(true);
    setGenerationError(null);
    try {
      await generationService.create("prj_finance_01", {
        brief: redesignInstruction.trim() || "Yüklenen ekranın işlevlerini koruyarak yeniden tasarla.",
        platform: "ios",
        screenScope: "redesign",
      });
      setGenerating(false);
      setRedesignStage("generated");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Yeniden tasarım başlatılamadı.");
      setGenerating(false);
    }
  };

  return {
    uploadInputRef, uploadedScreen, isDraggingScreenshot, setIsDraggingScreenshot,
    uploadError, redesignStage, preservationRules, designDirection, variationCount,
    redesignInstruction, generationError, generating, setDesignDirection, setVariationCount,
    setRedesignInstruction, togglePreservationRule, selectScreenshot, clearScreenshot,
    startRedesign,
  };
}

export type RedesignWorkflowState = ReturnType<typeof useRedesignWorkflow>;
