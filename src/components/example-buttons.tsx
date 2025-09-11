import { Button } from "@/components/ui/button";

interface ExampleButtonsProps {
  onLoadExample: (example: string) => void;
}

export function ExampleButtons({ onLoadExample }: ExampleButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onLoadExample("basic")}
        className="text-muted-foreground hover:text-foreground"
      >
        Basic
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onLoadExample("fullstack")}
        className="text-muted-foreground hover:text-foreground"
      >
        Full Stack
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onLoadExample("microservices")}
        className="text-muted-foreground hover:text-foreground"
      >
        Microservices
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onLoadExample("traefik")}
        className="text-muted-foreground hover:text-foreground"
      >
        Traefik
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onLoadExample("wireguard")}
        className="text-muted-foreground hover:text-foreground"
      >
        Wireguard
      </Button>
    </div>
  );
}
