import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ExampleButtons } from "@/components/example-buttons";
import { ConversionForm } from "@/components/conversion-form";
import { BackendSelection } from "@/components/backend-selection";
import { TraefikServices } from "@/components/traefik-services";
import { ConvertButton } from "@/components/convert-button";
import { ErrorDisplay } from "@/components/error-display";
import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/footer";
import { useConversion } from "@/hooks/use-conversion";
import { useTraefikServices } from "@/hooks/use-traefik-services";

export const Route = createFileRoute("/")({
  component: App,
  pendingComponent: () => (
    <div className="max-w-7xl mx-auto p-6 text-muted-foreground">Loading…</div>
  ),
  errorComponent: ({ error }: { error: unknown }) => (
    <div className="max-w-2xl mx-auto my-8" role="alert">
      <div className="bg-destructive/50 border border-destructive/50 rounded-lg p-4">
        <h3 className="text-destructive font-medium">Something went wrong</h3>
        <pre className="text-xs mt-2 overflow-auto">{String(error)}</pre>
      </div>
    </div>
  ),
});

function App() {
  const {
    dockerCompose,
    setDockerCompose,
    nixConfig,
    error,
    backend,
    setBackend,
    handleConvert,
    loadExample,
  } = useConversion();

  const {
    traefikServices,
    setTraefikServices,
    copied,
    handleRemoveService,
    handleCopy,
  } = useTraefikServices();

  const onConvert = () => handleConvert(traefikServices);
  const onCopy = () => handleCopy(nixConfig);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative">
        <Header />

        <main role="main">
          <Hero />

          <section className="py-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ExampleButtons onLoadExample={loadExample} />

              <ConversionForm
                dockerCompose={dockerCompose}
                setDockerCompose={setDockerCompose}
                nixConfig={nixConfig}
                onCopy={onCopy}
                copied={copied}
              />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <BackendSelection backend={backend} setBackend={setBackend} />

                <TraefikServices
                  traefikServices={traefikServices}
                  setTraefikServices={setTraefikServices}
                  onRemoveService={handleRemoveService}
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
              <ConvertButton
                onConvert={onConvert}
                disabled={!dockerCompose.trim()}
              />

              <ErrorDisplay error={error} />
            </div>
          </section>

          <HowItWorks />
        </main>

        <Footer />
      </div>
    </div>
  );
}
