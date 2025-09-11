export const dockerTemplates = {
  basic: `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - ENV=production`,

  fullstack: `version: '3.8'
services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html
    depends_on:
      - backend
    labels:
      pod2nix.systemd.service.Restart: "always"

  backend:
    image: node:18-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:password@db:5432/myapp
    volumes:
      - ./app:/app
    working_dir: /app
    command: ["npm", "start"]
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`,

  microservices: `version: '3.8'
services:
  api-gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - user-service
      - order-service
      - payment-service

  user-service:
    image: myapp/user-service:latest
    ports:
      - "3001:3000"
    environment:
      SERVICE_NAME: user-service
      DATABASE_URL: postgresql://user:password@user-db:5432/users
    depends_on:
      - user-db
    labels:
      pod2nix.systemd.service.Restart: "on-failure"
      pod2nix.systemd.service.RestartSec: "5"

  order-service:
    image: myapp/order-service:latest
    ports:
      - "3002:3000"
    environment:
      SERVICE_NAME: order-service
      DATABASE_URL: postgresql://user:password@order-db:5432/orders
    depends_on:
      - order-db

  payment-service:
    image: myapp/payment-service:latest
    ports:
      - "3003:3000"
    environment:
      SERVICE_NAME: payment-service
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis

  user-db:
    image: postgres:15
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - user_data:/var/lib/postgresql/data

  order-db:
    image: postgres:15
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - order_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  user_data:
  order_data:
  redis_data:`,
  traefik: `version: '3.8'
services:
  backend:
    image: node:18-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:password@db:5432/myapp
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`example.com\`)"
      - "traefik.http.routers.backend.entrypoints=web"
      - "traefik.http.services.backend.loadbalancer.server.port=3000"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"
    volumes:
      - ./app:/app
    working_dir: /app
    command: ["npm", "start"]
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`,
  wireguard: `services:
  wireguard:
    image: linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=\${TIMEZONE}
      - SERVERURL=\${VPN_SERVER_URL} #optional
      - SERVERPORT=51820 #optional
      - PEERS=1 #optional
      - PEERDNS=auto #optional
      - INTERNAL_SUBNET=10.13.13.0 #optional
      - ALLOWEDIPS=0.0.0.0/0 #optional
    volumes:
      - /usr/share/appdata/wireguard/config:/config
      - /usr/src:/usr/src # location of kernel headers
      - /lib/modules:/lib/modules
    ports:
      - 51820:51820/udp
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped`,
};
