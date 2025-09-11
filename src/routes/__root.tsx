import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import appCss from "../styles.css?url";

const SEO_DESCRIPTION =
  "Effortlessly convert Docker Compose files to NixOS configurations. Supports systemd services, Traefik integration, and advanced container orchestration for streamlined DevOps workflows.";

const SEO_KEYWORDS =
  "docker, docker-compose, compose, nixos, nix, nixos configuration, converter, systemd, containers, container orchestration, devops, devops tools";

export const Route = createRootRoute({
  head: () => ({
    title: "pod2nix - Convert Docker Compose to NixOS Configuration",
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "description",
        content: SEO_DESCRIPTION,
      },
      {
        name: "keywords",
        content: SEO_KEYWORDS,
      },
      {
        name: "author",
        content: "pod2nix",
      },
      {
        property: "og:title",
        content: "pod2nix - Docker Compose to NixOS Converter",
      },
      {
        property: "og:description",
        content: SEO_DESCRIPTION,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://kaiiiiiiiii.github.io/pod2nix/",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "pod2nix - Docker Compose to NixOS Converter",
      },
      {
        name: "twitter:description",
        content: SEO_DESCRIPTION,
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/pod2nix/favicon.ico",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "canonical",
        href: "https://kaiiiiiiiii.github.io/pod2nix/",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
