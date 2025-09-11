import { ArrowRight, FileCode, Terminal } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Pod2Nix automatically converts your Docker Compose configurations
            into proper NixOS systemd services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-lg mb-4">
              <FileCode className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Docker Compose
            </h3>
            <p className="text-muted-foreground">
              Paste your existing docker-compose.yml configuration. Supports
              volumes, networks, environment variables, and service
              dependencies.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
              <ArrowRight className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Conversion
            </h3>
            <p className="text-muted-foreground">
              Automatically translates Docker services to NixOS systemd services
              with proper container configurations and networking.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-lg mb-4">
              <Terminal className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              NixOS Config
            </h3>
            <p className="text-muted-foreground">
              Get a complete NixOS configuration ready to use with
              virtualisation.docker or virtualisation.podman.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
