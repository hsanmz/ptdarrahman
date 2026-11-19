#!/usr/bin/env bash
# ============================================================
# PTDARRAHMAN — REMOTE DEPLOYMENT DARI LOKAL (Manual CI/CD)
# ============================================================
# Jalankan script ini dari laptop/PC lokal (WSL/Linux/Mac).
# Script ini akan:
# 1. Memeriksa status git lokal (memastikan commit sudah rapi).
# 2. Melakukan git push ke origin main.
# 3. Menghubungi server via SSH (Tailscale).
# 4. Menjalankan auto-update di server dan menampilkan log live.
#
# Pemakaian di laptop/lokal:
#   ./scripts/deploy-remote.sh
# ============================================================

set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_GREEN="\033[1;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_CYAN="\033[1;36m"
COLOR_RED="\033[1;31m"

log_info() { echo -e "${COLOR_CYAN}[LOKAL]${COLOR_RESET} $1"; }
log_ok()   { echo -e "${COLOR_GREEN}[LOKAL]${COLOR_RESET} $1"; }
log_warn() { echo -e "${COLOR_YELLOW}[LOKAL]${COLOR_RESET} $1"; }
log_err()  { echo -e "${COLOR_RED}[LOKAL]${COLOR_RESET} $1"; }

SERVER_USER="${SERVER_USER:-HugoEdmoundo}"
SERVER_HOST="${SERVER_HOST:-100.82.98.114}"
SERVER_DIR="${SERVER_DIR:-~/project-ppdb}"

echo -e "${COLOR_CYAN}============================================================${COLOR_RESET}"
echo -e "${COLOR_CYAN}  PTDARRAHMAN — Deploy to Server (${SERVER_USER}@${SERVER_HOST})  ${COLOR_RESET}"
echo -e "${COLOR_CYAN}============================================================${COLOR_RESET}"

# 1. Cek git status lokal
if [ -n "$(git status --porcelain)" ]; then
  log_warn "Ada perubahan file lokal yang belum di-commit:"
  git status --short
  read -p "Ingin commit dan push perubahan di atas sekarang? (y/N): " -r CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    read -p "Tulis pesan commit: " -r COMMIT_MSG
    git add -A
    git commit -m "${COMMIT_MSG:-deploy: update server}"
  else
    log_warn "Melanjutkan tanpa commit perubahan lokal yang belum disimpan..."
  fi
fi

# 2. Push ke remote
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log_info "Memastikan branch '${CURRENT_BRANCH}' ter-push ke GitHub..."
git push origin "${CURRENT_BRANCH}" || {
  log_warn "Git push gagal atau tidak ada perubahan remote baru. Melanjutkan koneksi server..."
}

# 3. Trigger remote update via SSH
log_info "Menghubungi server via SSH (${SERVER_USER}@${SERVER_HOST})..."
ssh -t -o ConnectTimeout=10 "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_DIR} && chmod +x scripts/server-update.sh && ./scripts/server-update.sh"

echo ""
log_ok "Deployment remote selesai! Website di server telah terupdate."
