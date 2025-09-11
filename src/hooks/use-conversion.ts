import { useCallback, useState } from "react";
import type { TraefikService } from "@/types/traefik";

/**
 * Custom hook for managing Docker Compose to Nix conversion state and logic.
 * Handles conversion process, error states, and example loading.
 *
 * @returns Object containing state and handlers for conversion functionality
 */
export function useConversion() {
  const [dockerCompose, setDockerCompose] = useState("");
  const [nixConfig, setNixConfig] = useState("");
  const [error, setError] = useState("");
  const [backend, setBackend] = useState<"docker" | "podman">("docker");

  const handleConvert = useCallback(
    async (traefikServices: Array<TraefikService>) => {
      if (!dockerCompose.trim()) {
        setError("Please enter a Docker Compose configuration");
        return;
      }

      setError("");

      try {
        const { convertComposeToNix } = await import("@/lib/converter");
        const result = convertComposeToNix(
          dockerCompose,
          backend,
          traefikServices,
        );
        setNixConfig(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Conversion failed");
        setNixConfig("");
      }
    },
    [dockerCompose, backend],
  );

  const loadExample = useCallback(async (example: string) => {
    try {
      const { dockerTemplates } = await import("@/lib/docker-templates");
      setDockerCompose(
        dockerTemplates[example as keyof typeof dockerTemplates] || "",
      );
      setNixConfig("");
      setError("");
    } catch {
      setError("Failed to load example template");
    }
  }, []);

  return {
    dockerCompose,
    setDockerCompose,
    nixConfig,
    setNixConfig,
    error,
    setError,
    backend,
    setBackend,
    handleConvert,
    loadExample,
  };
}
