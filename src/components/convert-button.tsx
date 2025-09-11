import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Button component for triggering the Docker Compose to Nix conversion.
 * Displays a prominent call-to-action with loading state support.
 */
interface ConvertButtonProps {
  /** Function to call when the button is clicked */
  onConvert: () => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
}

export function ConvertButton({ onConvert, disabled }: ConvertButtonProps) {
  return (
    <div className="flex justify-center mb-8">
      <Button
        onClick={onConvert}
        className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <ArrowRight className="h-5 w-5" />
          <span>Convert to Nix</span>
        </div>
      </Button>
    </div>
  );
}
