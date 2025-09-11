import { beforeEach, describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
import {
  convertComposeToNix,
  extractNetworks,
  extractVolumes,
  generateContainerConfig,
  generateExtraOptions,
  generateNetworkServices,
  generateNixConfig,
  generateSystemdServiceConfig,
  generateTraefikConfig,
  generateVolumeServices,
  mapRestartPolicy,
  parseEnvArray,
  parseLabelsArray,
  parseTraefikLabels,
} from "../../src/lib/converter";
import type { TraefikService } from "../../src/types/traefik";

// Mock the yaml parse function
vi.mock("yaml", () => ({
  parse: vi.fn(),
}));

const mockParse = vi.mocked(parse);

describe("convertComposeToNix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert valid Docker Compose YAML to Nix config", () => {
    const yamlContent = `
version: '3.8'
services:
  web:
    image: nginx
    ports:
      - "80:80"
`;
    const expectedCompose = {
      version: "3.8",
      services: {
        web: {
          image: "nginx",
          ports: ["80:80"],
        },
      },
    };

    mockParse.mockReturnValue(expectedCompose);

    const result = convertComposeToNix(yamlContent);

    expect(mockParse).toHaveBeenCalledWith(yamlContent);
    expect(result).toContain('virtualisation.oci-containers.containers."web"');
    expect(result).toContain('image = "nginx"');
    expect(result).toContain('ports = [\n      "80:80"\n    ]');
  });

  it("should throw error when no services found", () => {
    const yamlContent = `
version: '3.8'
`;
    mockParse.mockReturnValue({ version: "3.8" });

    expect(() => convertComposeToNix(yamlContent)).toThrow(
      "No services found in Docker Compose file",
    );
  });

  it("should handle invalid YAML", () => {
    mockParse.mockImplementation(() => {
      throw new Error("Invalid YAML");
    });

    expect(() => convertComposeToNix("invalid yaml")).toThrow(
      "Failed to convert Docker Compose: Invalid YAML",
    );
  });

  it("should use default project name when name is not provided", () => {
    const yamlContent = `
services:
  app:
    image: myapp
`;
    mockParse.mockReturnValue({
      services: {
        app: { image: "myapp" },
      },
    });

    const result = convertComposeToNix(yamlContent);

    expect(result).toContain("app");
  });

  it("should support podman backend", () => {
    const yamlContent = `
services:
  db:
    image: postgres
`;
    mockParse.mockReturnValue({
      services: {
        db: { image: "postgres" },
      },
    });

    const result = convertComposeToNix(yamlContent, "podman");

    expect(result).toContain("virtualisation.podman = {\n    enable = true;");
  });

  it("should handle Traefik services", () => {
    const yamlContent = `
services:
  web:
    image: nginx
    labels:
      - traefik.enable=true
      - traefik.http.routers.web.rule=Host(\`example.com\`)
      - traefik.http.services.web.loadbalancer.server.port=80
`;
    const traefikServices: Array<TraefikService> = [];

    mockParse.mockReturnValue({
      services: {
        web: {
          image: "nginx",
          labels: [
            "traefik.enable=true",
            "traefik.http.routers.web.rule=Host(`example.com`)",
            "traefik.http.services.web.loadbalancer.server.port=80",
          ],
        },
      },
    });

    const result = convertComposeToNix(yamlContent, "docker", traefikServices);

    expect(result).toContain("services.traefik.dynamicConfigOptions.http");
  });

  it("should handle volumes and networks", () => {
    const yamlContent = `
services:
  app:
    image: myapp
    volumes:
      - data:/app/data
volumes:
  data:
networks:
  frontend:
`;
    mockParse.mockReturnValue({
      services: {
        app: {
          image: "myapp",
          volumes: ["data:/app/data"],
        },
      },
      volumes: {
        data: {},
      },
      networks: {
        frontend: {},
      },
    });

    const result = convertComposeToNix(yamlContent);

    expect(result).toContain('systemd.services."docker-volume-data"');
    expect(result).toContain('systemd.services."docker-network-frontend"');
  });

  it("should not have double empty lines in output", () => {
    const yamlContent = `
services:
  app:
    image: myapp
    volumes:
      - data:/app/data
volumes:
  data:
`;
    mockParse.mockReturnValue({
      services: {
        app: {
          image: "myapp",
          volumes: ["data:/app/data"],
        },
      },
      volumes: {
        data: {},
      },
    });

    const result = convertComposeToNix(yamlContent);

    expect(result).not.toMatch(/\n\n\n/);
  });
});

describe("parseEnvArray", () => {
  it("should parse environment variables from array", () => {
    const envArray = ["KEY1=value1", "KEY2=value2"];

    const result = parseEnvArray(envArray);

    expect(result).toEqual({
      KEY1: "value1",
      KEY2: "value2",
    });
  });

  it("should handle values with equals signs", () => {
    const envArray = ["URL=https://example.com?param=value"];

    const result = parseEnvArray(envArray);

    expect(result).toEqual({
      URL: "https://example.com?param=value",
    });
  });

  it("should return empty object for empty array", () => {
    const result = parseEnvArray([]);

    expect(result).toEqual({});
  });
});

describe("parseLabelsArray", () => {
  it("should parse labels from array", () => {
    const labelsArray = ["key1=value1", "key2=value2"];

    const result = parseLabelsArray(labelsArray);

    expect(result).toEqual({
      key1: "value1",
      key2: "value2",
    });
  });

  it("should handle empty array", () => {
    const result = parseLabelsArray([]);

    expect(result).toEqual({});
  });
});

describe("mapRestartPolicy", () => {
  it("should map restart policies correctly", () => {
    expect(mapRestartPolicy("always")).toBe("always");
    expect(mapRestartPolicy("unless-stopped")).toBe("always");
    expect(mapRestartPolicy("on-failure")).toBe("on-failure");
    expect(mapRestartPolicy("no")).toBeNull();
    expect(mapRestartPolicy("unknown")).toBe("on-failure");
  });
});

describe("parseTraefikLabels", () => {
  it("should parse Traefik labels into services", () => {
    const labels = {
      "traefik.enable": "true",
      "traefik.http.routers.web.rule": "Host(`example.com`)",
      "traefik.http.services.web.loadbalancer.server.port": "8080",
      "traefik.http.routers.web.entrypoints": "websecure",
      "traefik.http.routers.web.tls.certresolver": "letsencrypt",
    };

    const result = parseTraefikLabels(labels, "web");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "web",
      url: "http://web:8080",
      host: "example.com",
      entrypoint: "websecure",
      certResolver: "letsencrypt",
      enableTLS: true,
    });
  });

  it("should return empty array when no labels", () => {
    const result = parseTraefikLabels(undefined, "service");

    expect(result).toEqual([]);
  });

  it("should handle array labels", () => {
    const labels = [
      "traefik.enable=true",
      "traefik.http.routers.app.rule=Host(`app.com`)",
    ];

    const result = parseTraefikLabels(labels, "app");

    expect(result).toHaveLength(0); // No port specified
  });
});

describe("generateContainerConfig", () => {
  it("should generate container config with basic properties", () => {
    const service: any = {
      image: "nginx",
      ports: ["80:80"],
      environment: { KEY: "value" },
    };

    const result = generateContainerConfig("web", service, "test");

    expect(result).toContain('image = "nginx"');
    expect(result).toContain('ports = [\n      "80:80"\n    ]');
    expect(result).toContain('environment = {\n      "KEY" = "value";\n    }');
  });

  it("should handle volumes", () => {
    const service: any = {
      volumes: ["data:/var/data"],
    };

    const result = generateContainerConfig("app", service, "test");

    expect(result).toContain('volumes = [\n      "data:/var/data"\n    ]');
  });

  it("should handle command as array", () => {
    const service: any = {
      command: ["nginx", "-g", "daemon off;"],
    };

    const result = generateContainerConfig("web", service, "test");

    expect(result).toContain('cmd = [ "nginx" "-g" "daemon off;" ]');
  });

  it("should handle labels excluding traefik", () => {
    const service: any = {
      labels: {
        "custom.label": "value",
        "traefik.enable": "true",
      },
    };

    const result = generateContainerConfig("web", service, "test");

    expect(result).toContain(
      'labels = {\n      "custom.label" = "value";\n    }',
    );
    expect(result).not.toContain("traefik.enable");
  });
});

describe("generateSystemdServiceConfig", () => {
  it("should generate systemd config for restart policy", () => {
    const service: any = {
      restart: "always",
    };

    const result = generateSystemdServiceConfig("web", service, "docker");

    expect(result).toContain('Restart = lib.mkOverride 90 "always"');
  });

  it("should handle systemd labels", () => {
    const service: any = {
      labels: {
        "pod2nix.systemd.service.RestartSec": "5",
        "pod2nix.systemd.unit.After": "network.target",
      },
    };

    const result = generateSystemdServiceConfig("web", service, "docker");

    expect(result).toContain('RestartSec = lib.mkOverride 90 "5"');
    expect(result).toContain('After = lib.mkOverride 90 "network.target"');
  });

  it("should return null when no config needed", () => {
    const service: any = {};

    const result = generateSystemdServiceConfig("web", service, "docker");

    expect(result).toBeNull();
  });
});

describe("generateExtraOptions", () => {
  it("should generate privileged option", () => {
    const service: any = { privileged: true };

    const result = generateExtraOptions(service);

    expect(result).toEqual(["--privileged"]);
  });

  it("should generate capability options", () => {
    const service: any = {
      cap_add: ["NET_ADMIN"],
      cap_drop: ["ALL"],
    };

    const result = generateExtraOptions(service);

    expect(result).toEqual(["--cap-add=NET_ADMIN", "--cap-drop=ALL"]);
  });

  it("should generate resource limits", () => {
    const service: any = {
      deploy: {
        resources: {
          limits: {
            cpus: "1.5",
            memory: "512m",
          },
        },
      },
    };

    const result = generateExtraOptions(service);

    expect(result).toEqual(["--cpus=1.5", "--memory=512m"]);
  });

  it("should handle healthcheck", () => {
    const service: any = {
      healthcheck: {
        test: ["CMD", "curl", "localhost"],
      },
    };

    const result = generateExtraOptions(service);

    expect(result).toEqual(["--health-cmd=CMD curl localhost"]);
  });
});

describe("extractVolumes", () => {
  it("should extract volumes from compose", () => {
    const compose: any = {
      volumes: { data: {}, logs: {} },
      services: {
        app: { volumes: ["data:/app/data"] },
      },
    };

    const result = extractVolumes(compose);

    expect(result).toEqual(["data", "logs"]);
  });

  it("should handle named volumes in services", () => {
    const compose: any = {
      services: {
        db: { volumes: ["mysql_data"] },
      },
    };

    const result = extractVolumes(compose);

    expect(result).toEqual(["mysql_data"]);
  });
});

describe("extractNetworks", () => {
  it("should extract networks from compose", () => {
    const compose: any = {
      networks: { frontend: {}, backend: {} },
    };

    const result = extractNetworks(compose);

    expect(result).toEqual(["frontend", "backend"]);
  });
});

describe("generateVolumeServices", () => {
  it("should generate volume services", () => {
    const result = generateVolumeServices(["data"], "docker");

    expect(result).toContain('systemd.services."docker-volume-data"');
    expect(result).toContain("docker volume create data");
  });

  it("should return empty string for no volumes", () => {
    const result = generateVolumeServices([], "docker");

    expect(result).toBe("");
  });
});

describe("generateNetworkServices", () => {
  it("should generate network services", () => {
    const result = generateNetworkServices(["frontend"], "docker");

    expect(result).toContain('systemd.services."docker-network-frontend"');
    expect(result).toContain("docker network create frontend");
  });
});

describe("generateNixConfig", () => {
  it("should generate complete Nix config", () => {
    const config = {
      backend: "docker",
      containers: "container config",
      systemdServices: "systemd config",
      volumeServices: "volume config",
      networkServices: "network config",
      traefikConfig: "traefik config",
    };

    const result = generateNixConfig(config);

    expect(result).toContain("virtualisation.docker = {\n    enable = true;");
    expect(result).toContain("container config");
    expect(result).toContain("systemd config");
    expect(result).toContain("volume config");
    expect(result).toContain("network config");
    expect(result).toContain("traefik config");
  });
});

describe("generateTraefikConfig", () => {
  it("should generate Traefik config for services", () => {
    const services: Array<TraefikService> = [
      {
        name: "web",
        url: "http://web:80",
        host: "example.com",
        entrypoint: "web",
        enableTLS: true,
        certResolver: "letsencrypt",
      },
    ];

    const result = generateTraefikConfig(services);

    expect(result).toContain("services.traefik.dynamicConfigOptions.http");
    expect(result).toContain("web.loadBalancer.servers");
    expect(result).toContain("routers = {\n      web = {");
    expect(result).toContain("Host(`example.com`)");
  });

  it("should return empty string for no services", () => {
    const result = generateTraefikConfig([]);

    expect(result).toBe("");
  });
});
