import { useEffect, useState } from "react";
import { generationService, type GenerationJob } from "../../../services";

export function useGenerationJob(jobId: string | null) {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const nextJob = await generationService.get(jobId);
        if (!active) return;
        setJob(nextJob);
        if (nextJob.status === "queued" || nextJob.status === "processing") {
          timer = setTimeout(load, 1500);
        }
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "Üretim durumu alınamadı.");
      }
    };

    void load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  return { job, error };
}
