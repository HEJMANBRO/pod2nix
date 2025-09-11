// Shared Traefik types used across UI and converter
import { z } from "zod";

export const traefikServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.url("Invalid URL"),
  host: z.string().min(1, "Host is required"),
  entrypoint: z.string().min(1, "Entrypoint is required"),
  certResolver: z.string().optional(),
  enableTLS: z.boolean(),
});

export type TraefikService = z.infer<typeof traefikServiceSchema>;
