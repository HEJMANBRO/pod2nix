import { GitBranch } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";

const { version, homepage } = APP_CONFIG;

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="text-xl font-bold text-accent">pod</span>
              <span className="text-2xl font-bold text-foreground">2</span>
              <span className="text-xl font-bold text-primary">nix</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:text-primary transition-colors text-xs font-mono bg-secondary text-muted-foreground rounded border border-border"
            >
              <a href={homepage} target="_blank" rel="noopener noreferrer">
                <GitBranch className="w-5 h-5" />v{version}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
