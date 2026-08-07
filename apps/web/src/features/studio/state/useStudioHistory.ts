import { useCallback, useState } from "react";

export function useStudioHistory() {
  const [revision, setRevision] = useState(14);
  const [history, setHistory] = useState<string[]>([]);

  const incrementRevision = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  const addHistoryEntry = useCallback((entry: string) => {
    setHistory((items) => [entry, ...items].slice(0, 8));
  }, []);

  return { revision, history, addHistoryEntry, incrementRevision };
}
