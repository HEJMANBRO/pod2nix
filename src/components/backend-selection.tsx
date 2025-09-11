import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BackendSelectionProps {
  backend: "docker" | "podman";
  setBackend: (backend: "docker" | "podman") => void;
}

export function BackendSelection({
  backend,
  setBackend,
}: BackendSelectionProps) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Container Backend</CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose between Docker and Podman for container management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="docker"
              name="backend"
              value="docker"
              checked={backend === "docker"}
              onChange={(e) =>
                setBackend(e.target.value as "docker" | "podman")
              }
              className="h-4 w-4 text-primary border-border bg-secondary focus:ring-primary focus:ring-offset-background"
            />
            <Label
              htmlFor="docker"
              className="text-muted-foreground cursor-pointer"
            >
              Docker
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="podman"
              name="backend"
              value="podman"
              checked={backend === "podman"}
              onChange={(e) =>
                setBackend(e.target.value as "docker" | "podman")
              }
              className="h-4 w-4 text-primary border-border bg-secondary focus:ring-primary focus:ring-offset-background"
            />
            <Label
              htmlFor="podman"
              className="text-muted-foreground cursor-pointer"
            >
              Podman
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
