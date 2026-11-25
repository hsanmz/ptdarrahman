#!/usr/bin/env bash
# ============================================================
# PTDARRAHMAN — SERVER AUTO-UPDATE (Jalankan di Server)
# ============================================================
# Satu perintah untuk menarik perubahan git, menjalankan migrasi database,
# me-rebuild container yang relevan, membersihkan cache docker, dan memverifikasi
# bahwa seluruh service berjalan sehat.
#
# Pemakaian di server:
#   cd ~/project-ppdb && ./scripts/server-update.sh
# ============================================================

set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_GREEN="\033[1;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_CYAN="\033[1;36m"
COLOR_RED="\033[1;31m"

log_info() { echo -e "${COLOR_CYAN}[INFO]${COLOR_RESET} $1"; }
log_ok()   { echo -e "${COLOR_GREEN}[OK]${COLOR_RESET} $1"; }
log_warn() { echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $1"; }
log_err()  { echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_DIR}"

echo -e "${COLOR_CYAN}============================================================${COLOR_RESET}"
echo -e "${COLOR_CYAN}  PTDARRAHMAN — One-Click Automated Server Update           ${COLOR_RESET}"
echo -e "${COLOR_CYAN}============================================================${COLOR_RESET}"

# 1. Update kode via Git
log_info "1/5. Memperbarui kode dari Git remote (branch main)..."
if [ -d .git ]; then
  # Simpan stashed changes lokal bila ada
  git fetch origin main
  # Pastikan file lokal tidak menghalangi pull bersih
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo "main")
  log_info "Cabang aktif: ${CURRENT_BRANCH}"
  git merge --ff-only origin/main || {
    log_warn "Fast-forward merge gagal. Mencoba git pull standar..."
    git pull origin main --no-rebase || {
      log_err "Git pull gagal! Ada konflik berkas di server. Periksa 'git status'."
      exit 1
    }
  }
  log_ok "Kode berhasil diperbarui ke $(git rev-parse --short HEAD)"
else
  log_warn "Direktori bukan git repository, melewati git pull."
fi

# 2. Tentukan Mode Deployment (Production Nginx atau Stack Preview)
log_info "2/5. Memeriksa konfigurasi deployment..."
COMPOSE_MODE=""
if [ -f ".env.prod" ] && [ -f "docker-compose.prod.yml" ]; then
  # Cek apakah container nginx prod sedang berjalan
  if docker ps --format '{{.Names}}' | grep -q 'ptarrahman-prod-nginx'; then
    COMPOSE_MODE="production"
  fi
fi

if [ -z "$COMPOSE_MODE" ]; then
  if [ -f "stack.sh" ] && [ -f "docker-compose.server-db.yml" ]; then
    COMPOSE_MODE="preview_stack"
  else
    COMPOSE_MODE="standard"
  fi
fi

log_info "Mode aktif terdeteksi: ${COMPOSE_MODE}"

# 3. Jalankan Migrasi Database (Alembic)
log_info "3/5. Memeriksa & menjalankan migrasi database..."
API_CONTAINER=$(docker ps -q -f "name=api" | head -n 1)
if [ -n "$API_CONTAINER" ]; then
  log_info "Menjalankan 'alembic upgrade heads' di container (${API_CONTAINER})..."
  docker exec "$API_CONTAINER" alembic upgrade heads || {
    log_warn "Migrasi via container lama gagal, akan dijalankan ulang setelah restart container."
  }
  log_ok "Migrasi database selesai."
else
  log_warn "Container API belum menyala. Migrasi akan dijalankan setelah container build."
fi

# 4. Rebuild & Restart Container
log_info "4/5. Melakukan rebuild & restart container..."
case "$COMPOSE_MODE" in
  production)
    log_info "Menjalankan: docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build"
    docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
    ;;
  preview_stack)
    log_info "Menjalankan: ./stack.sh up --build"
    ./stack.sh up --build
    ;;
  *)
    log_info "Menjalankan: docker compose up -d --build"
    docker compose up -d --build
    ;;
esac
log_ok "Container berhasil di-rebuild dan dijalankan."

# Jalankan migrasi ulang jika tadi API belum menyala
API_CONTAINER_NEW=$(docker ps -q -f "name=api" | head -n 1)
if [ -n "$API_CONTAINER_NEW" ]; then
  log_info "Memastikan migrasi alembic & seeder pada container baru..."
  docker exec "$API_CONTAINER_NEW" alembic upgrade heads || true
  docker exec -w /app "$API_CONTAINER_NEW" python -m scripts.seed || true
fi

# 5. Bersihkan image docker bekas (dangling) agar harddisk server tidak penuh
log_info "5/5. Membersihkan image docker lama (dangling image cleanup)..."
docker image prune -f > /dev/null 2>&1 || true
log_ok "Pembersihan storage selesai."

# Healthcheck Ringkas
echo ""
log_info "Verifikasi Status Service:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "project|ptarrahman|NAME" || docker ps

echo ""
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}  UPDATE SELESAI & BERHASIL! Website siap digunakan.        ${COLOR_RESET}"
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
