# K-Wiki

An AI-powered wiki website for game designing, built with Next.js 15, Keycloak authentication, PostgreSQL, and MinIO object storage.

## 🚀 Quick Start

K-Wiki supports three deployment modes to fit your development and production needs:

### 1. Local Development (macOS + OrbStack)
Perfect for macOS developers using OrbStack. Next.js runs on the host with hot reload, backend services in Docker.

```bash
docker compose up -d postgres keycloak minio
cp .env.orbstack-dev.example .env.local
pnpm install
pnpm dev
```

**Access:** `http://localhost:3000`
**Documentation:** [Local Development with OrbStack](docs/deployment/local-dev-orbstack.md)

### 2. Local Development (Standard Docker)
Works on all platforms. Next.js runs on the host, backend services in Docker with localhost ports.

```bash
docker compose up -d postgres keycloak minio
cp .env.docker-dev.example .env.local
pnpm install
pnpm dev
```

**Access:** `http://localhost:3000`
**Documentation:** [Local Development with Standard Docker](docs/deployment/local-dev-docker.md)

### 3. Production/Staging Deployment
Full Docker deployment with Nginx gateway. All services containerized.

```bash
cp .env.standard.example .env
# Update .env with your domain and secrets
docker compose up -d --build
```

**Access:** `http://localhost` or your custom domain
**Documentation:** [Standard Deployment](docs/deployment/standard.md)

## 📚 Documentation

### Deployment Guides
- **[Local Development (OrbStack)](docs/deployment/local-dev-orbstack.md)** - macOS development with OrbStack domains
- **[Local Development (Docker)](docs/deployment/local-dev-docker.md)** - Standard Docker development setup
- **[Standard Deployment](docs/deployment/standard.md)** - Production/staging deployment with custom domain
- **[OrbStack Setup](docs/deployment/orbstack-setup.md)** - OrbStack installation and configuration

### Project Documentation
- **[CLAUDE.md](CLAUDE.md)** - Project overview, architecture, and development guidelines for AI assistants

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4, DaisyUI 5
- **Authentication:** NextAuth.js 5 + Keycloak (OIDC)
- **Database:** PostgreSQL 17
- **Storage:** MinIO (S3-compatible object storage)
- **Gateway:** Nginx (production)
- **Runtime:** Node.js 20+, pnpm 8+

### Services
All services communicate via Docker internal networking:
- **app** (`app:3000`) - Next.js application
- **postgres** (`postgres:5432`) - Application and Keycloak database
- **keycloak** (`keycloak:8080`) - Identity and access management
- **minio** (`minio:9000`) - Object storage for files/images
- **nginx** - HTTP gateway (production mode only)

## 🔧 Common Commands

### Development
```bash
# Start development server
pnpm dev

# Run linter
pnpm lint

# Type checking
pnpm type-check

# Build for production
pnpm build
```

### Docker Management
```bash
# View service status
docker compose ps

# View logs
docker compose logs -f [service]

# Restart a service
docker compose restart [service]

# Stop all services
docker compose down

# Stop and remove all data (destructive)
docker compose down -v
```

### Database Operations
```bash
# PostgreSQL shell
docker compose exec postgres psql -U kwiki -d k_wiki

# Run SQL script
docker compose exec -T postgres psql -U kwiki -d k_wiki < schema.sql

# Backup database
docker compose exec -T postgres pg_dump -U kwiki k_wiki > backup.sql
```

## 🔐 Environment Configuration

Three environment templates are provided for different deployment scenarios:

- **`.env.orbstack-dev.example`** - Local development with OrbStack (macOS)
- **`.env.docker-dev.example`** - Local development with standard Docker
- **`.env.standard.example`** - Production/staging deployment

### Required Environment Variables

```bash
# Generate secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET

# Essential variables
NEXTAUTH_URL=<your-app-url>
NEXTAUTH_SECRET=<generated-secret>
KEYCLOAK_CLIENT_ID=k-wiki-client
KEYCLOAK_CLIENT_SECRET=<from-keycloak-console>
KEYCLOAK_ISSUER=<keycloak-url>/realms/k-wiki
```

See deployment guides for complete configuration details.

## 📝 Key Files

| File | Purpose |
|------|---------|
| [src/auth.ts](src/auth.ts) | NextAuth configuration with Keycloak provider |
| [src/lib/db.ts](src/lib/db.ts) | PostgreSQL connection pool and utilities |
| [src/app/layout.tsx](src/app/layout.tsx) | Root layout with SessionProvider |
| [docker-compose.yml](docker-compose.yml) | Service orchestration configuration |
| [Dockerfile](Dockerfile) | Multi-stage Next.js production build |
| [nginx/nginx.conf](nginx/nginx.conf) | Nginx gateway configuration |

## 🐛 Troubleshooting

### Common Issues

**Keycloak Certificate Errors**
```bash
# Use HTTP (not HTTPS) for KEYCLOAK_ISSUER in development
KEYCLOAK_ISSUER=http://keycloak.k-wiki.orb.local/realms/k-wiki
```

**Database Connection Failed**
```bash
# Verify PostgreSQL is running
docker compose ps postgres
docker compose logs postgres
```

**Port Conflicts**
```bash
# Check which process is using a port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

**Keycloak Redirect Issues**
- Ensure "Valid Redirect URIs" in Keycloak matches `NEXTAUTH_URL + /api/auth/callback/keycloak`
- Check "Web Origins" matches `NEXTAUTH_URL`

See deployment guides for detailed troubleshooting steps.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MinIO Documentation](https://min.io/docs/)
- [OrbStack Documentation](https://docs.orbstack.dev/)

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/k-wiki/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/k-wiki/discussions)

---

Built with ❤️ for game designers