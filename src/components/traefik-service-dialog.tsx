import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import type { TraefikService } from "@/types/traefik";
import { traefikServiceSchema } from "@/types/traefik";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TraefikServiceDialogProps {
  services: Array<TraefikService>;
  onServicesChange: (services: Array<TraefikService>) => void;
}

export function TraefikServiceDialog({
  services,
  onServicesChange,
}: TraefikServiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      url: "",
      host: "",
      entrypoint: "web",
      certResolver: "",
      enableTLS: false,
    } as TraefikService,
    validators: {
      onSubmit: traefikServiceSchema,
    },
    onSubmit: ({ value }) => {
      onServicesChange([...services, value]);
      form.reset();
      setIsOpen(false);
    },
  });

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={setIsOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="text-muted-foreground hover:text-foreground -mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="text-foreground">
              Add Traefik Service
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="text-muted-foreground">
              Configure a new Traefik service with routing and TLS settings.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <div className="grid gap-4 py-4">
              <form.Field
                name="name"
                validators={{
                  onChange: traefikServiceSchema.shape.name,
                }}
                children={(field) => (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="name"
                      className="text-right text-muted-foreground"
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="col-span-3 bg-secondary border-border text-foreground"
                      placeholder="my-service"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm col-start-2 col-span-3">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <form.Field
                name="url"
                validators={{
                  onChange: traefikServiceSchema.shape.url,
                }}
                children={(field) => (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="url"
                      className="text-right text-muted-foreground"
                    >
                      URL
                    </Label>
                    <Input
                      id="url"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="col-span-3 bg-secondary border-border text-foreground"
                      placeholder="http://localhost:3000"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm col-start-2 col-span-3">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <form.Field
                name="host"
                validators={{
                  onChange: traefikServiceSchema.shape.host,
                }}
                children={(field) => (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="host"
                      className="text-right text-muted-foreground"
                    >
                      Host
                    </Label>
                    <Input
                      id="host"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="col-span-3 bg-secondary border-border text-foreground"
                      placeholder="example.com"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm col-start-2 col-span-3">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <form.Field
                name="entrypoint"
                validators={{
                  onChange: traefikServiceSchema.shape.entrypoint,
                }}
                children={(field) => (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="entrypoint"
                      className="text-right text-muted-foreground"
                    >
                      Entrypoint
                    </Label>
                    <Input
                      id="entrypoint"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="col-span-3 bg-secondary border-border text-foreground"
                      placeholder="web"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm col-start-2 col-span-3">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <form.Field
                name="certResolver"
                validators={{
                  onChange: traefikServiceSchema.shape.certResolver,
                }}
                children={(field) => (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="certResolver"
                      className="text-right text-muted-foreground"
                    >
                      Cert Resolver
                    </Label>
                    <Input
                      id="certResolver"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="col-span-3 bg-secondary border-border text-foreground"
                      placeholder="letsencrypt (optional)"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm col-start-2 col-span-3">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <form.Field
                name="enableTLS"
                validators={{
                  onChange: traefikServiceSchema.shape.enableTLS,
                }}
                children={(field) => (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="enableTLS"
                      className="text-right text-muted-foreground"
                    >
                      Enable TLS
                    </Label>
                    <div className="col-span-3">
                      <input
                        type="checkbox"
                        id="enableTLS"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="rounded border-border bg-secondary text-primary focus:ring-primary"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-red-500 text-sm">
                          {field.state.meta.errors[0]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              Add Service
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
