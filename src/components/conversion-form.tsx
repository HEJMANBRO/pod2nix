import { Check, Copy, FileCode, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Form component for Docker Compose input and NixOS output display.
 * Provides a side-by-side interface for editing Docker Compose YAML and viewing generated Nix configuration.
 */
interface ConversionFormProps {
  /** The current Docker Compose YAML content */
  dockerCompose: string;
  /** Function to update the Docker Compose content */
  setDockerCompose: (value: string) => void;
  /** The generated NixOS configuration */
  nixConfig: string;
  /** Function to copy the Nix config to clipboard */
  onCopy: () => void;
  /** Whether the content has been copied */
  copied: boolean;
}

export function ConversionForm({
  dockerCompose,
  setDockerCompose,
  nixConfig,
  onCopy,
  copied,
}: ConversionFormProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="h-5 w-5 text-accent" />
              <CardTitle className="text-foreground">Docker Compose</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-accent/10 text-accent border-accent/30"
            >
              YAML
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Paste your existing docker-compose.yml configuration. Supports
            volumes, networks, environment variables, and service dependencies.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative group">
            <textarea
              id="docker-compose-input"
              aria-label="Docker Compose YAML"
              value={dockerCompose}
              onChange={(e) => setDockerCompose(e.target.value)}
              className="w-full h-80 bg-secondary/50 border border-border/50 rounded-lg p-4 text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              placeholder="Paste your docker-compose.yml here..."
            />
            <div className="absolute top-3 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDockerCompose("")}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">
                NixOS Configuration
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30"
            >
              NIX
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Get a complete NixOS configuration ready to use with
            virtualisation.docker or virtualisation.podman.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative group">
            <textarea
              id="nix-config-output"
              aria-label="Generated NixOS configuration"
              value={nixConfig}
              readOnly
              className="w-full h-80 bg-secondary/50 border border-border/50 rounded-lg p-4 text-foreground font-mono text-sm resize-none focus:outline-none"
              placeholder="Click 'Convert to Nix' to generate NixOS configuration..."
            />
            {nixConfig && (
              <div className="absolute top-3 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopy}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
