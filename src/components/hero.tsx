export function Hero() {
  return (
    <section className="relative py-12 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Docker Compose <span className="text-primary">→</span> NixOS
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Transform your Docker Compose files into NixOS container
            configurations with ease.
          </p>
        </div>
      </div>
    </section>
  );
}
