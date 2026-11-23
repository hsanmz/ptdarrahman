#!/usr/bin/env bash
# ============================================================
# PTDARRAHMAN — One-Shot Production Deploy (VPS Ubuntu/Debian)
# ============================================================
# Satu perintah, semua urusan deploy beres:
#   1. Install Docker + Compose plugin (kalau belum ada)
#   2. Minta konfigurasi SEKALI di awal (interaktif)
#   3. Generate .env.prod, apps/api/.env, apps/whatsapp/.env
#   4. Build + jalankan docker-compose.prod.yml
#   5. Terbitkan sertifikat Let's Encrypt (kalau domain diisi)
#   6. Cetak ringkasanakses
#
# Pakai:
#   chmod +x deploy-prod.sh && ./deploy-prod.sh
#
# TIDAK menyimpan password VPS / credential apa pun ke file.
# Semua rahasia di-input saat script jalan dan masuk ke .env (gitignored).
# ============================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()      { echo -e "${GREEN}[OK]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
die()     { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
ask()     { read -rp "$(echo -e "${CYAN}$1${NC}")" __v; echo "$__v"; }
ask_sec() { read -rsp "$(echo -e "${CYAN}$1${NC}")" __v; echo; echo "$__v"; }

# ── 0. Posisi & root check ──────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"
[ "$(id -u)" -eq 0 ] || die "Jalankan sebagai root (sudo ./deploy-prod.sh)."
ok "Root direktori: $ROOT_DIR"

# ── 1. Prasyarat: Docker ────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  info "Docker belum ada. Menginstall Docker Engine + Compose plugin..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  ok "Docker terinstall."
else
  ok "Docker sudah ada: $(docker --version)"
fi
docker info >/dev/null 2>&1 || die "Docker daemon tidak aktif. Cek: systemctl status docker"

# ── 2. Kumpulkan konfigurasi (SEKALI) ──────────────────────────────────────
echo
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  KONFIGURASI DEPLOY — diisi sekali, script yang kerja   ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo

DOMAIN_CP=$(ask "Domain Company Profile [ptdarrahman.com]: ")
DOMAIN_CP=${DOMAIN_CP:-ptdarrahman.com}
DOMAIN_PPDB=$(ask "Domain PPDB [ppdb.ptdarrahman.com]: ")
DOMAIN_PPDB=${DOMAIN_PPDB:-ppdb.$DOMAIN_CP}
DOMAIN_SA=$(ask "Domain Superadmin [admin.ptdarrahman.com]: ")
DOMAIN_SA=${DOMAIN_SA:-admin.$DOMAIN_CP}
DOMAIN_API=$(ask "Domain API [api.ptdarrahman.com]: ")
DOMAIN_API=${DOMAIN_API:-api.$DOMAIN_CP}

LE_EMAIL=$(ask "Email Let's Encrypt [admin@$DOMAIN_CP]: ")
LE_EMAIL=${LE_EMAIL:-admin@$DOMAIN_CP}

echo
read -rp "$(echo -e "${CYAN}Pakai HTTPS/Let's Encrypt? [y/N] (N = HTTP-only via IP, DNS belum siap): ${NC}")" USE_TLS
USE_TLS=${USE_TLS:-n}

echo
info "Kredensial database & Midtrans (tidak ditampilkan di layar):"
MYSQL_HOST=$(ask "MySQL host [srv1322.hstgr.io]: "); MYSQL_HOST=${MYSQL_HOST:-srv1322.hstgr.io}
MYSQL_PORT=$(ask "MySQL port [3306]: "); MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=$(ask "MySQL user [ptdarrahman]: "); MYSQL_USER=${MYSQL_USER:-ptdarrahman}
MYSQL_PASS=$(ask_sec "MySQL password: ")
MYSQL_DB=$(ask "MySQL database [ptdarrahman]: "); MYSQL_DB=${MYSQL_DB:-ptdarrahman}

echo
MIDTRANS_SERVER=$(ask "Midtrans SERVER key (kosongkan kalau belum ada): ")
MIDTRANS_CLIENT=$(ask "Midtrans CLIENT key (kosongkan kalau belum ada): ")
read -rp "$(echo -e "${CYAN}Midtrans production mode? [y/N]: ${NC}")" MIDTRANS_PROD
MIDTRANS_PROD=${MIDTRANS_PROD:-n}
[ "$MIDTRANS_PROD" = "y" ] && MIDTRANS_IS_PROD=true || MIDTRANS_IS_PROD=false

# ── 3. Generate secrets ────────────────────────────────────────────────────
gen() { openssl rand -hex "${1:-32}"; }
JWT_SECRET=$(gen 32)
CRON_SECRET=$(gen 16)
WA_API_KEY=$(gen 32)
WA_HOOK_SECRET=$(gen 32)
ok "Secret otomatis digenerate (JWT, CRON, WA)."

# ── 4. Tulis file .env ─────────────────────────────────────────────────────
SCHEME="http"; [ "$USE_TLS" = "y" ] && SCHEME="https"

cat > .env.prod <<EOF
DOMAIN_COMPANYPROFILE=$DOMAIN_CP
DOMAIN_PPDB=$DOMAIN_PPDB
DOMAIN_SUPERADMIN=$DOMAIN_SA
DOMAIN_API=$DOMAIN_API
PUBLIC_API_URL=$SCHEME://$DOMAIN_API
PUBLIC_PPDB_URL=$SCHEME://$DOMAIN_PPDB
PUBLIC_COMPANYPROFILE_URL=$SCHEME://$DOMAIN_CP
PUBLIC_FALLBACK_API_URL=
LETSENCRYPT_EMAIL=$LE_EMAIL
HTTP_PORT=80
HTTPS_PORT=443
APP_ENV=production
EOF
ok ".env.prod dibuat."

mkdir -p apps/api apps/whatsapp

cat > apps/api/.env <<EOF
APP_ENV=production
APP_DEBUG=false
MYSQL_HOST=$MYSQL_HOST
MYSQL_PORT=$MYSQL_PORT
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASS
MYSQL_DATABASE=$MYSQL_DB
MYSQL_SSL=false
REDIS_URL=redis://redis:6379/0
JWT_SECRET=$JWT_SECRET
CRON_SECRET=$CRON_SECRET
COOKIE_SECURE=$([ "$USE_TLS" = "y" ] && echo true || echo false)
MIDTRANS_SERVER_KEY=$MIDTRANS_SERVER
MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT
MIDTRANS_IS_PRODUCTION=$MIDTRANS_IS_PROD
CORS_ORIGINS=$SCHEME://$DOMAIN_CP,$SCHEME://$DOMAIN_PPDB,$SCHEME://$DOMAIN_SA
WA_SERVICE_URL=http://whatsapp:3100
WA_SERVICE_API_KEY=$WA_API_KEY
WA_WEBHOOK_SECRET=$WA_HOOK_SECRET
EOF
ok "apps/api/.env dibuat."

cat > apps/whatsapp/.env <<EOF
NODE_ENV=production
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
API_KEY=$WA_API_KEY
WEBHOOK_SECRET=$WA_HOOK_SECRET
WEBHOOK_URL=http://api:8000/notifications/webhook/whatsapp
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=1
EOF
ok "apps/whatsapp/.env dibuat."

cat > apps/ppdb/.env <<EOF
VITE_API_URL=$SCHEME://$DOMAIN_API
EOF
cat > apps/superadmin/.env <<EOF
VITE_API_URL=$SCHEME://$DOMAIN_API
EOF
cat > apps/companyprofile/.env <<EOF
NEXT_PUBLIC_API_URL=$SCHEME://$DOMAIN_API
NEXT_PUBLIC_FALLBACK_API_URL=
NEXT_PUBLIC_PORTAL_URL=$SCHEME://$DOMAIN_PPDB
EOF
ok "Frontend .env dibuat."

# ── 5. Build + up ──────────────────────────────────────────────────────────
info "Build & jalankan stack production (ini yang paling lama, sabar...)"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo
info "Menunggu container sehat (maks 180 detik)..."
for i in $(seq 1 60); do
  unhealthy=$(docker compose --env-file .env.prod -f docker-compose.prod.yml ps --format '{{.Status}}' \
    | grep -c 'starting\|unhealthy' || true)
  [ "$unhealthy" -eq 0 ] && break
  sleep 3
done
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

# ── 6. Migrasi database & seeding ───────────────────────────────────────────
info "Jalankan Alembic migration..."
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T api \
  alembic upgrade heads || warn "Migration gagal — cek koneksi MySQL di apps/api/.env"

info "Jalankan database seeder awal (Akun Admin, Rubrik, Template, Company Profile)..."
docker cp apps/api/scripts/. ptd-api:/app/scripts/ 2>/dev/null || true
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T -w /app api \
  python -m scripts.seed || warn "Seeder selesai atau dilewati."

# ── 7. Sertifikat TLS (opsional) ────────────────────────────────────────────
if [ "$USE_TLS" = "y" ]; then
  info "Menerbitkan sertifikat Let's Encrypt..."
  chmod +x scripts/prod-certs.sh 2>/dev/null || true
  if [ -f scripts/prod-certs.sh ]; then
    ./scripts/prod-certs.sh || warn "Sertifikat gagal — cek DNS A record ke IP ini."
  else
    warn "scripts/prod-certs.sh tidak ditemukan. Terbit manual dari docs/DOCKER_PRODUCTION.md §6."
  fi
else
  warn "Mode HTTP-only. Situs aktif di http://<IP>:80 — HTTPS belum ada."
fi

# ── 8. Ringkasan ────────────────────────────────────────────────────────────
echo
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOY SELESAI                                       ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo "  Company Profile : $SCHEME://$DOMAIN_CP"
echo "  Portal PPDB     : $SCHEME://$DOMAIN_PPDB"
echo "  Superadmin      : $SCHEME://$DOMAIN_SA"
echo "  API health      : $SCHEME://$DOMAIN_API/health"
echo
echo "  Cek log   : docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f"
echo "  Restart   : docker compose --env-file .env.prod -f docker-compose.prod.yml restart"
echo
warn "Terakhir: WHATSAPP butuh scan QR sekali. Buka panel Superadmin → menu WhatsApp → scan."
warn "Dan JANGAN LUPA ganti password root VPS via panel IDCloudHost."
ok "Selesai."
