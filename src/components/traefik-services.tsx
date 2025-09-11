import { Suspense, lazy } from "react";
import { Trash2 } from "lucide-react";
import type { TraefikService } from "@/types/traefik";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TraefikServiceDialog = lazy(() =>
  import("@/components/traefik-service-dialog").then((m) => ({
    default: m.TraefikServiceDialog,
  })),
);

interface TraefikServicesProps {
  traefikServices: Array<TraefikService>;
  setTraefikServices: (services: Array<TraefikService>) => void;
  onRemoveService: (index: number) => void;
}

export function TraefikServices({
  traefikServices,
  setTraefikServices,
  onRemoveService,
}: TraefikServicesProps) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">
          <div className="flex justify-between">
            Traefik Services
            <Suspense
              fallback={
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="text-muted-foreground"
                >
                  Loading…
                </Button>
              }
            >
              <TraefikServiceDialog
                services={traefikServices}
                onServicesChange={setTraefikServices}
              />
            </Suspense>
          </div>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Configure Traefik routing for your services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {traefikServices.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No Traefik services configured. Click "Add Service" to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {traefikServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-secondary/30 border border-border/50 rounded-lg p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-foreground">
                      {service.name}
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {service.host}
                    </span>
                    {service.enableTLS && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        TLS
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {service.url} • {service.entrypoint}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveService(index)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
