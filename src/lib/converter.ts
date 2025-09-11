import { parse } from "yaml";
import type { TraefikService } from "@/types/traefik";

export interface DockerComposeService {
  image?: string;
  container_name?: string;
  hostname?: string;
  environment?: Record<string, string | number> | Array<string>;
  ports?: Array<string>;
  volumes?: Array<string>;
  networks?: Record<string, NetworkConfig> | Array<string>;
  labels?: Record<string, string> | Array<string>;
  depends_on?: Array<string> | Record<string, DependsOnConfig>;
  restart?: string;
  command?: string | Array<string>;
  entrypoint?: string | Array<string>;
  working_dir?: string;
  user?: string;
  privileged?: boolean;
  cap_add?: Array<string>;
  cap_drop?: Array<string>;
  devices?: Array<string>;
  dns?: Array<string>;
  sysctls?: Record<string, string | number>;
  extra_hosts?: Array<string>;
  logging?: {
    driver?: string;
    options?: Record<string, string | number>;
  };
  healthcheck?: {
    test?: string | Array<string>;
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };
  deploy?: {
    resources?: {
      limits?: {
        cpus?: string;
        memory?: string;
      };
      reservations?: {
        cpus?: string;
        memory?: string;
      };
    };
  };
}

export interface NetworkConfig {
  driver?: string;
  external?: boolean;
  name?: string;
  ipam?: {
    driver?: string;
    config?: Array<{
      subnet?: string;
      gateway?: string;
    }>;
  };
}

export interface DependsOnConfig {
  condition?: string;
}

export interface VolumeConfig {
  driver?: string;
  external?: boolean;
  name?: string;
  driver_opts?: Record<string, string>;
}

export interface DockerCompose {
  version?: string;
  name?: string;
  services: Record<string, DockerComposeService>;
  networks?: Record<string, NetworkConfig>;
  volumes?: Record<string, VolumeConfig>;
}

/**
 * Converts Docker Compose YAML configuration to NixOS configuration.
 *
 * @param yamlContent - The Docker Compose YAML content as a string
 * @param backend - The container backend to use ("docker" or "podman")
 * @param traefikServices - Additional Traefik services to include in the configuration
 * @returns The generated NixOS configuration as a string
 * @throws Error when YAML parsing fails or no services are found
 */
export function convertComposeToNix(
  yamlContent: string,
  backend: "docker" | "podman" = "docker",
  traefikServices: Array<TraefikService> = [],
): string {
  try {
    const compose: DockerCompose = parse(yamlContent);

    if (!compose.services) {
      throw new Error("No services found in Docker Compose file");
    }

    const projectName = compose.name || "myproject";
    const containers: Array<string> = [];
    const systemdServices: Array<string> = [];
    const volumes = extractVolumes(compose);
    const networks = extractNetworks(compose);
    const allTraefikServices: Array<TraefikService> = [...traefikServices];

    // Convert each service
    for (const [serviceName, service] of Object.entries(compose.services)) {
      // Handle Traefik labels
      const svcTraefik = parseTraefikLabels(service.labels, serviceName);
      allTraefikServices.push(...svcTraefik);

      // Handle traefik.docker.network
      if (service.labels) {
        const labelMap = Array.isArray(service.labels)
          ? parseLabelsArray(service.labels)
          : service.labels;
        const network = labelMap["traefik.docker.network"];
        if (network) {
          if (!service.networks) service.networks = {};
          if (
            typeof service.networks === "object" &&
            !Array.isArray(service.networks)
          ) {
            service.networks[network] = {};
          } else if (Array.isArray(service.networks)) {
            if (!service.networks.includes(network))
              service.networks.push(network);
          }
        }
      }
      // Generate container config
      const containerConfig = generateContainerConfig(
        serviceName,
        service,
        projectName,
      );
      containers.push(containerConfig);

      // Generate systemd service extensions
      const systemdConfig = generateSystemdServiceConfig(
        serviceName,
        service,
        backend,
      );
      if (systemdConfig) {
        systemdServices.push(systemdConfig);
      }
    }

    // Generate volume services
    const volumeServices = generateVolumeServices(volumes, backend);
    const networkServices = generateNetworkServices(networks, backend);
    const traefikConfig = generateTraefikConfig(allTraefikServices);

    // Combine everything
    const nixConfig = generateNixConfig({
      backend,
      containers: containers.join("\n\n"),
      systemdServices: systemdServices.join("\n\n"),
      volumeServices,
      networkServices,
      traefikConfig,
    });

    return nixConfig;
  } catch (error) {
    throw new Error(
      `Failed to convert Docker Compose: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Generates NixOS container configuration for a single Docker Compose service.
 *
 * @param serviceName - The name of the service
 * @param service - The Docker Compose service configuration
 * @param projectName - The project name for volume naming
 * @returns The NixOS container configuration as a string
 */
export function generateContainerConfig(
  serviceName: string,
  service: DockerComposeService,
  projectName: string,
): string {
  const lines: Array<string> = [];

  lines.push(`  virtualisation.oci-containers.containers."${serviceName}" = {`);

  if (service.image) {
    lines.push(`    image = "${service.image}";`);
  }

  // Environment variables
  if (service.environment) {
    lines.push("    environment = {");
    const envVars = Array.isArray(service.environment)
      ? parseEnvArray(service.environment)
      : service.environment;

    for (const [key, value] of Object.entries(envVars)) {
      lines.push(`      "${key}" = "${value}";`);
    }
    lines.push("    };");
  }

  // Volumes
  if (service.volumes && service.volumes.length > 0) {
    lines.push("    volumes = [");
    for (const volume of service.volumes) {
      // Handle named volumes vs bind mounts
      const processedVolume = volume.includes(":")
        ? volume
        : `${projectName}_${volume}:${volume}:rw`;
      lines.push(`      "${processedVolume}"`);
    }
    lines.push("    ];");
  }

  // Ports
  if (service.ports && service.ports.length > 0) {
    lines.push("    ports = [");
    for (const port of service.ports) {
      lines.push(`      "${port}"`);
    }
    lines.push("    ];");
  }

  // Command
  if (service.command) {
    const cmd = Array.isArray(service.command)
      ? service.command
      : service.command.split(" ");
    lines.push(`    cmd = [ ${cmd.map((c) => `"${c}"`).join(" ")} ];`);
  }

  // Working directory
  if (service.working_dir) {
    lines.push(`    workdir = "${service.working_dir}";`);
  }

  // User
  if (service.user) {
    lines.push(`    user = "${service.user}";`);
  }

  // Labels
  if (service.labels) {
    const allLabels = Array.isArray(service.labels)
      ? parseLabelsArray(service.labels)
      : service.labels;
    const labels = Object.fromEntries(
      Object.entries(allLabels).filter(([key]) => !key.startsWith("traefik.")),
    );

    if (Object.keys(labels).length > 0) {
      lines.push("    labels = {");
      for (const [key, value] of Object.entries(labels)) {
        lines.push(`      "${key}" = "${value}";`);
      }
      lines.push("    };");
    }
  }

  // Dependencies
  if (service.depends_on) {
    const deps = Array.isArray(service.depends_on)
      ? service.depends_on
      : Object.keys(service.depends_on);

    if (deps.length > 0) {
      lines.push("    dependsOn = [");
      for (const dep of deps) {
        lines.push(`      "${dep}"`);
      }
      lines.push("    ];");
    }
  }

  // Logging
  if (service.logging?.driver) {
    const driver =
      service.logging.driver === "json-file"
        ? "journald"
        : service.logging.driver;
    lines.push(`    log-driver = "${driver}";`);
  }

  // Extra options for advanced features
  const extraOptions = generateExtraOptions(service);
  if (extraOptions.length > 0) {
    lines.push("    extraOptions = [");
    extraOptions.forEach((option) => lines.push(`      "${option}"`));
    lines.push("    ];");
  }

  lines.push("  };");
  return lines.join("\n");
}

/**
 * Generates systemd service configuration for a Docker Compose service.
 * Handles restart policies and custom systemd labels.
 *
 * @param serviceName - The name of the service
 * @param service - The Docker Compose service configuration
 * @param backend - The container backend ("docker" or "podman")
 * @returns The systemd service configuration as a string, or null if no config needed
 */
export function generateSystemdServiceConfig(
  serviceName: string,
  service: DockerComposeService,
  backend: string,
): string | null {
  const lines: Array<string> = [];
  let hasConfig = false;

  // Check for pod2nix labels for systemd config
  const labels = service.labels
    ? Array.isArray(service.labels)
      ? parseLabelsArray(service.labels)
      : service.labels
    : {};

  lines.push(`  systemd.services."${backend}-${serviceName}" = {`);

  // Service config
  const serviceConfig: Array<string> = [];

  // Restart policy
  if (service.restart) {
    const restartPolicy = mapRestartPolicy(service.restart);
    if (restartPolicy) {
      serviceConfig.push(
        `      Restart = lib.mkOverride 90 "${restartPolicy}";`,
      );
      hasConfig = true;
    }
  }

  // Check for systemd labels
  for (const [key, value] of Object.entries(labels)) {
    if (key.startsWith("pod2nix.systemd.service.")) {
      const systemdKey = key.replace("pod2nix.systemd.service.", "");
      serviceConfig.push(`      ${systemdKey} = lib.mkOverride 90 "${value}";`);
      hasConfig = true;
    }
  }

  if (serviceConfig.length > 0) {
    lines.push("    serviceConfig = {");
    lines.push(...serviceConfig);
    lines.push("    };");
  }

  // Unit config
  const unitConfig: Array<string> = [];
  for (const [key, value] of Object.entries(labels)) {
    if (key.startsWith("pod2nix.systemd.unit.")) {
      const systemdKey = key.replace("pod2nix.systemd.unit.", "");
      unitConfig.push(`      ${systemdKey} = lib.mkOverride 90 "${value}";`);
      hasConfig = true;
    }
  }

  if (unitConfig.length > 0) {
    lines.push("    unitConfig = {");
    lines.push(...unitConfig);
    lines.push("    };");
  }

  lines.push("  };");

  return hasConfig ? lines.join("\n") : null;
}

/**
 * Generates additional container options from Docker Compose service configuration.
 * Includes privileged mode, capabilities, devices, DNS, sysctls, etc.
 *
 * @param service - The Docker Compose service configuration
 * @returns Array of docker/podman command line options
 */
export function generateExtraOptions(
  service: DockerComposeService,
): Array<string> {
  const options: Array<string> = [];

  // Privileged mode
  if (service.privileged) {
    options.push("--privileged");
  }

  // Capabilities
  if (service.cap_add) {
    service.cap_add.forEach((cap) => options.push(`--cap-add=${cap}`));
  }
  if (service.cap_drop) {
    service.cap_drop.forEach((cap) => options.push(`--cap-drop=${cap}`));
  }

  // Devices
  if (service.devices) {
    service.devices.forEach((device) => options.push(`--device=${device}`));
  }

  // DNS
  if (service.dns) {
    service.dns.forEach((dns) => options.push(`--dns=${dns}`));
  }

  // Sysctls
  if (service.sysctls) {
    for (const [key, value] of Object.entries(service.sysctls)) {
      options.push(`--sysctl=${key}=${value}`);
    }
  }

  // Extra hosts
  if (service.extra_hosts) {
    service.extra_hosts.forEach((host) => options.push(`--add-host=${host}`));
  }

  // Resource limits
  if (service.deploy?.resources?.limits) {
    const limits = service.deploy.resources.limits;
    if (limits.cpus) {
      options.push(`--cpus=${limits.cpus}`);
    }
    if (limits.memory) {
      options.push(`--memory=${limits.memory}`);
    }
  }

  // Health check
  if (service.healthcheck?.test) {
    const test = Array.isArray(service.healthcheck.test)
      ? service.healthcheck.test.join(" ")
      : service.healthcheck.test;
    options.push(`--health-cmd=${test}`);
  }

  return options;
}

/**
 * Extracts named volumes from Docker Compose configuration.
 * Includes volumes defined in the top-level volumes section and referenced in services.
 *
 * @param compose - The parsed Docker Compose configuration
 * @returns Array of unique volume names
 */
export function extractVolumes(compose: DockerCompose): Array<string> {
  const volumes = new Set<string>();

  // Named volumes from compose file
  if (compose.volumes) {
    Object.keys(compose.volumes).forEach((vol) => volumes.add(vol));
  }

  // Volumes referenced in services
  for (const service of Object.values(compose.services)) {
    if (service.volumes) {
      service.volumes.forEach((volume) => {
        // Check if it's a named volume (no path separator)
        if (!volume.includes("/")) {
          if (volume.includes(":")) {
            const volName = volume.split(":")[0];
            volumes.add(volName);
          } else {
            // Named volume without colon
            volumes.add(volume);
          }
        }
      });
    }
  }

  return Array.from(volumes);
}

/**
 * Extracts network names from Docker Compose configuration.
 *
 * @param compose - The parsed Docker Compose configuration
 * @returns Array of network names
 */
export function extractNetworks(compose: DockerCompose): Array<string> {
  const networks = new Set<string>();

  if (compose.networks) {
    Object.keys(compose.networks).forEach((net) => networks.add(net));
  }

  return Array.from(networks);
}

/**
 * Generates systemd services for managing Docker/Podman volumes.
 * Creates oneshot services that ensure volumes exist on startup.
 *
 * @param volumes - Array of volume names
 * @param backend - The container backend ("docker" or "podman")
 * @returns The systemd volume services configuration as a string
 */
export function generateVolumeServices(
  volumes: Array<string>,
  backend: string,
): string {
  if (volumes.length === 0) return "";

  const lines: Array<string> = [];

  volumes.forEach((volume) => {
    lines.push(`  systemd.services."${backend}-volume-${volume}" = {`);
    lines.push("    path = [ pkgs.docker ];");
    lines.push("    serviceConfig = {");
    lines.push('      Type = "oneshot";');
    lines.push("      RemainAfterExit = true;");
    lines.push(`      ExecStart = "${backend} volume create ${volume}";`);
    lines.push(`      ExecStop = "${backend} volume rm -f ${volume}";`);
    lines.push("    };");
    lines.push('    wantedBy = [ "multi-user.target" ];');
    lines.push("  };");
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Generates systemd services for managing Docker/Podman networks.
 * Creates oneshot services that ensure networks exist on startup.
 *
 * @param networks - Array of network names
 * @param backend - The container backend ("docker" or "podman")
 * @returns The systemd network services configuration as a string
 */
export function generateNetworkServices(
  networks: Array<string>,
  backend: string,
): string {
  if (networks.length === 0) return "";

  const lines: Array<string> = [];

  networks.forEach((network) => {
    lines.push(`  systemd.services."${backend}-network-${network}" = {`);
    lines.push("    path = [ pkgs.docker ];");
    lines.push("    serviceConfig = {");
    lines.push('      Type = "oneshot";');
    lines.push("      RemainAfterExit = true;");
    lines.push(`      ExecStart = "${backend} network create ${network}";`);
    lines.push(`      ExecStop = "${backend} network rm -f ${network}";`);
    lines.push("    };");
    lines.push('    wantedBy = [ "multi-user.target" ];');
    lines.push("  };");
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Assembles the complete NixOS configuration from all components.
 *
 * @param config - Object containing all configuration parts
 * @param config.backend - The container backend ("docker" or "podman")
 * @param config.containers - The container configurations
 * @param config.systemdServices - The systemd service customizations
 * @param config.volumeServices - The volume management services
 * @param config.networkServices - The network management services
 * @param config.traefikConfig - The Traefik configuration
 * @returns The complete NixOS configuration as a string
 */
export function generateNixConfig(config: {
  backend: string;
  containers: string;
  systemdServices: string;
  volumeServices: string;
  networkServices: string;
  traefikConfig: string;
}): string {
  const {
    backend,
    containers,
    systemdServices,
    volumeServices,
    networkServices,
    traefikConfig,
  } = config;

  const result = `{ pkgs, lib, ... }:

{
  # Runtime
  virtualisation.${backend} = {
    enable = true;
    autoPrune.enable = true;
  };
  virtualisation.oci-containers.backend = "${backend}";

  # Containers
${containers}

${
  systemdServices
    ? `  # Systemd service customizations\n${systemdServices}\n`
    : ""
}
${volumeServices ? `  # Volume services\n${volumeServices}` : ""}
${networkServices ? `  # Network services\n${networkServices}` : ""}
${traefikConfig ? `  # Traefik configuration\n${traefikConfig}` : ""}
}`;
  return result.replace(/\n{3,}/g, "\n\n");
}

/**
 * Parses environment variables from Docker Compose array format.
 * Converts ["KEY1=value1", "KEY2=value2"] to { KEY1: "value1", KEY2: "value2" }
 *
 * @param envArray - Array of environment variable strings in KEY=value format
 * @returns Object with environment variable key-value pairs
 */
export function parseEnvArray(envArray: Array<string>): Record<string, string> {
  const result: Record<string, string> = {};
  envArray.forEach((env) => {
    const [key, ...valueParts] = env.split("=");
    result[key] = valueParts.join("=");
  });
  return result;
}

/**
 * Parses labels from Docker Compose array format.
 * Converts ["key1=value1", "key2=value2"] to { key1: "value1", key2: "value2" }
 *
 * @param labelsArray - Array of label strings in key=value format
 * @returns Object with label key-value pairs
 */
export function parseLabelsArray(
  labelsArray: Array<string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  labelsArray.forEach((label) => {
    const [key, ...valueParts] = label.split("=");
    result[key] = valueParts.join("=");
  });
  return result;
}

/**
 * Generates Traefik dynamic configuration from Traefik services.
 * Creates routers and services configuration for HTTP routing.
 *
 * @param services - Array of Traefik service configurations
 * @returns The Traefik configuration as a string, or empty string if no services
 */
export function generateTraefikConfig(services: Array<TraefikService>): string {
  if (services.length === 0) return "";

  const lines: Array<string> = [];

  lines.push("  services.traefik.dynamicConfigOptions.http = {");

  // Generate services section
  if (services.length > 0) {
    lines.push("    services = {");
    services.forEach((service) => {
      if (service.name && service.url) {
        lines.push(`      ${service.name}.loadBalancer.servers = [`);
        lines.push(`        {`);
        lines.push(`          url = "${service.url}";`);
        lines.push(`        }`);
        lines.push(`      ];`);
        lines.push("");
      }
    });
    lines.push("    };");
    lines.push("");
  }

  // Generate routers section
  if (services.length > 0) {
    lines.push("    routers = {");
    services.forEach((service) => {
      if (service.name && service.host) {
        lines.push(`      ${service.name} = {`);
        lines.push(`        rule = "Host(\`${service.host}\`)";`);
        if (service.enableTLS && service.certResolver) {
          lines.push(`        tls = {`);
          lines.push(`          certResolver = "${service.certResolver}";`);
          lines.push(`        };`);
        }
        lines.push(`        service = "${service.name}";`);
        if (service.entrypoint) {
          lines.push(`        entrypoints = "${service.entrypoint}";`);
        }
        lines.push(`      };`);
        lines.push("");
      }
    });
    lines.push("    };");
  }

  lines.push("  };");
  lines.push("");

  return lines.join("\n");
}

/**
 * Maps Docker Compose restart policies to systemd restart policies.
 *
 * @param restart - The Docker Compose restart policy
 * @returns The corresponding systemd restart policy, or null for "no"
 */
export function mapRestartPolicy(restart: string): string | null {
  switch (restart) {
    case "always":
      return "always";
    case "unless-stopped":
      return "always";
    case "on-failure":
      return "on-failure";
    case "no":
      return null;
    default:
      return "on-failure";
  }
}

/**
 * Parses Traefik labels from Docker Compose service labels.
 * Extracts routing configuration and creates TraefikService objects.
 *
 * @param labels - The service labels (object or array format)
 * @param serviceName - The name of the Docker Compose service
 * @returns Array of parsed Traefik services
 */
export function parseTraefikLabels(
  labels: Record<string, string> | Array<string> | undefined,
  serviceName: string,
): Array<TraefikService> {
  if (!labels) return [];

  const labelMap = Array.isArray(labels) ? parseLabelsArray(labels) : labels;

  const traefikServices: Record<string, Partial<TraefikService>> = {};

  for (const [key, value] of Object.entries(labelMap)) {
    if (!key.startsWith("traefik.")) continue;

    const parts = key.split(".");
    if (parts.length < 3) continue;

    const [, section, type, name, ...rest] = parts;
    if (section !== "http" || !["routers", "services"].includes(type)) continue;

    if (!traefikServices[name]) {
      traefikServices[name] = { name };
    }

    const service = traefikServices[name];

    if (type === "routers") {
      if (rest[0] === "rule") {
        // Extract host from Host(`host`)
        const match = value.match(/Host\(`([^`]+)`\)/);
        if (match) service.host = match[1];
      } else if (rest[0] === "entrypoints") {
        service.entrypoint = value;
      } else if (rest[0] === "tls" && rest[1] === "certresolver") {
        service.certResolver = value;
        service.enableTLS = true;
      }
    } else if (type === "services") {
      if (rest.join(".") === "loadbalancer.server.port") {
        service.url = `http://${serviceName}:${value}`;
      }
    }
  }

  // Check for enable
  if (labelMap["traefik.enable"] === "true") {
    // Enable all services
    for (const service of Object.values(traefikServices)) {
      if (!service.url) continue; // Skip if no port
      // Ensure required fields
    }
  }

  return Object.values(traefikServices).filter(
    (s): s is TraefikService => !!(s.name && s.url && s.host),
  );
}
