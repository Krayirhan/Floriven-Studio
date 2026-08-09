import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { findDesignTemplate, type DesignTemplateId } from "@floriven/design-spec";
import { useDashboardAdvancedOptions } from "../useDashboardAdvancedOptions";
import { generationService } from "../../../services";

export function useDashboardComposer() {
  const navigate = useNavigate();
  const location = useLocation();
  const advancedOptions = useDashboardAdvancedOptions();
  const { selectedPlatform, screenScope, setAdvancedDirection } = advancedOptions;
  const [creationMode, setCreationMode] = useState<"mobile" | "web" | "redesign">("mobile");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedQuickStart, setSelectedQuickStart] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<DesignTemplateId | null>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);

  const startGeneration = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerationError(null);
    try {
      const projectId = `prj_${crypto.randomUUID()}`;
      const job = await generationService.create(projectId, {
        brief: prompt.trim(),
        platform: creationMode === "web" ? "web" : selectedPlatform === "Android" ? "android" : "ios",
        screenScope,
        designMode: selectedTemplateId ? "template" : "auto",
        ...(selectedTemplateId ? { stylePresetId: selectedTemplateId } : {}),
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
    setSelectedTemplateId(null);
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

  const handleSelectTemplate = (templateId: string) => {
    const template = findDesignTemplate(templateId);
    if (!template) return;
    setCreationMode("mobile");
    setSelectedTemplateId(template.id);
    setAdvancedDirection(template.name);
    const textarea = document.getElementById("design-prompt");
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const template = findDesignTemplate(params.get("template") ?? undefined);
    if (template) {
      setCreationMode("mobile");
      setSelectedTemplateId(template.id);
      setAdvancedDirection(template.name);
    }
    if (params.get("focus") !== "prompt" && !template) return;
    window.setTimeout(() => document.getElementById("design-prompt")?.focus(), 0);
  }, [location.search, setAdvancedDirection]);

  return {
    ...advancedOptions,
    creationMode,
    setCreationMode,
    prompt,
    generating,
    generationError,
    setGenerating,
    selectedQuickStart,
    selectedTemplateId,
    selectedTemplate: findDesignTemplate(selectedTemplateId ?? undefined),
    referenceInputRef,
    referenceName,
    startGeneration,
    handleSelectQuickStart,
    handlePromptChange,
    selectReference,
    handleSelectTemplate,
    useAutoDesign: () => { setSelectedTemplateId(null); setAdvancedDirection("Otomatik"); },
  };
}

export type DashboardComposerState = ReturnType<typeof useDashboardComposer>;
