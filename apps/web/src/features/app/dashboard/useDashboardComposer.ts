import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { templates } from "../dashboard.data";
import { useDashboardAdvancedOptions } from "../useDashboardAdvancedOptions";
import { generationService } from "../../../services";

const PROJECT_ID = "prj_finance_01";

export function useDashboardComposer() {
  const navigate = useNavigate();
  const location = useLocation();
  const advancedOptions = useDashboardAdvancedOptions();
  const { selectedPlatform, screenScope } = advancedOptions;
  const [creationMode, setCreationMode] = useState<"mobile" | "web" | "redesign">("mobile");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedQuickStart, setSelectedQuickStart] = useState<string | null>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);

  const startGeneration = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerationError(null);
    try {
      const job = await generationService.create(PROJECT_ID, {
        brief: prompt.trim(),
        platform: creationMode === "web" ? "web" : selectedPlatform === "Android" ? "android" : "ios",
        screenScope,
      });
      navigate(`/app/projeler/${job.projectId}/studio?jobId=${job.id}`);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Üretim başlatılamadı.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectQuickStart = (chipPrompt: string) => {
    setPrompt(chipPrompt);
    setSelectedQuickStart(chipPrompt);
    document.getElementById("design-prompt")?.focus();
  };

  const handlePromptChange = (value: string, textarea: HTMLTextAreaElement) => {
    setPrompt(value);
    setSelectedQuickStart(null);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  };

  const selectReference = (file?: File) => {
    if (file) setReferenceName(file.name);
  };

  const handleSelectTemplate = (templatePrompt: string) => {
    setCreationMode("mobile");
    setPrompt(templatePrompt);
    const textarea = document.getElementById("design-prompt");
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const templateKey = params.get("template");
    const templateId = templateKey === "finance"
      ? "finance_pro"
      : templateKey === "wellness"
        ? "calm_wellness"
        : templateKey === "commerce"
          ? "warm_organic"
          : null;
    const template = templates.find((item) => item.id === templateId);
    if (template) {
      setCreationMode("mobile");
      setPrompt(template.prompt);
    }
    if (params.get("focus") !== "prompt" && !template) return;
    window.setTimeout(() => document.getElementById("design-prompt")?.focus(), 0);
  }, [location.search]);

  return {
    ...advancedOptions,
    creationMode,
    setCreationMode,
    prompt,
    generating,
    generationError,
    setGenerating,
    selectedQuickStart,
    referenceInputRef,
    referenceName,
    startGeneration,
    handleSelectQuickStart,
    handlePromptChange,
    selectReference,
    handleSelectTemplate,
  };
}

export type DashboardComposerState = ReturnType<typeof useDashboardComposer>;
