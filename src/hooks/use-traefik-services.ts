import { useCallback, useState } from "react";
import type { TraefikService } from "@/types/traefik";

/**
 * Custom hook for managing Traefik services state and operations.
 * Handles service list management, clipboard operations, and UI feedback.
 *
 * @returns Object containing Traefik services state and handlers
 */
export function useTraefikServices() {
  const [traefikServices, setTraefikServices] = useState<Array<TraefikService>>(
    [],
  );
  const [copied, setCopied] = useState(false);

  const handleRemoveService = useCallback((index: number) => {
    setTraefikServices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCopy = useCallback(async (nixConfig: string) => {
    if (nixConfig) {
      await navigator.clipboard.writeText(nixConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return {
    traefikServices,
    setTraefikServices,
    copied,
    handleRemoveService,
    handleCopy,
  };
}
