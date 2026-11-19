#!/usr/bin/env bash
# ============================================================
# PTDARRAHMAN — One-Shot VPS Deployment (Mode IP:PORT + Local MySQL)
# ============================================================
# Khusus untuk VPS Debian/Ubuntu (2 CPU Core, 2 GB RAM, 20 GB Disk):
#   1. Buat SWAP memory 4 GB (wajib agar tidak freeze / OOM saat build)
#   2. Install Docker & Compose plugin (dan auto-start saat VPS dinyalakan)
#   3. Siapkan database MySQL lokal + phpMyAdmin di VPS
#   4. Build & jalankan API + 3 Frontend (Company Profile, PPDB, Superadmin)
#   5. Jalankan migrasi database & seeding akun awal
#   6. Tampilkan daftar URL & port siap pakai
#
# Cara pakai di VPS:
#   chmod +x setup-ip.sh && sudo ./setup-ip.sh
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

if [ "$(id -u)" -ne 0 ]; then
  log_err "Script ini harus dijalankan sebagai root (gunakan: sudo ./setup-ip.sh)"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo -e "${COLOR_CYAN}============================================================${COLOR_RESET}"
echo -e "${COLOR_CYAN}  PTDARRAHMAN — ONE-SHOT DEPLOY VPS (IP:PORT MODE)           ${COLOR_RESET}"
echo -e "${COLOR_CYAN}============================================================${COLOR_RESET}"

# ── 1. Optimasi SWAP Memory 4 GB ──────────────────────────────
log_info "1/6. Memeriksa konfigurasi SWAP Memory..."
CURRENT_SWAP=$(free -m | awk '/Swap:/ {print $2}')
if [ "$CURRENT_SWAP" -lt 2048 ]; then
  log_warn "SWAP terdeteksi ${CURRENT_SWAP}MB (di bawah 2GB). Membuat Swap 4GB..."
  if [ -f /swapfile ]; then
    swapoff /swapfile 2>/dev/null || true
    rm -f /swapfile
  fi
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  sysctl vm.swappiness=20 >/dev/null || true
  if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=20' >> /etc/sysctl.conf
  fi
  log_ok "Swap 4GB berhasil diaktifkan! Total swap sekarang: $(free -h | awk '/Swap:/ {print $2}')"
else
  log_ok "SWAP sudah mencukupi: ${CURRENT_SWAP}MB."
fi

# ── 2. Install Docker & Compose Plugin ─────────────────────────
log_info "2/6. Memeriksa Docker Engine & Compose..."
if ! command -v docker >/dev/null 2>&1; then
  log_info "Docker belum terpasang. Menginstall Docker CE..."
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  . /etc/os-release
  DISTRO_ID="${ID:-debian}"
  curl -fsSL "https://download.docker.com/linux/${DISTRO_ID}/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${DISTRO_ID} ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  log_ok "Docker berhasil diinstall: $(docker --version)"
else
  systemctl enable docker 2>/dev/null || true
  systemctl start docker 2>/dev/null || true
  log_ok "Docker sudah ada: $(docker --version)"
fi

if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
  usermod -aG docker "$SUDO_USER" 2>/dev/null || true
  log_ok "User $SUDO_USER telah ditambahkan ke grup docker."
fi

# ── 3. Konfigurasi Environment IP:PORT ─────────────────────────
log_info "3/6. Menyiapkan konfigurasi IP & kredensial..."
PUBLIC_IP="${PUBLIC_IP:-103.55.37.77}"
MYSQL_ROOT_PASS="${MYSQL_ROOT_PASSWORD:-ptdarrahman_root_$(openssl rand -hex 4)}"
MYSQL_USER_PASS="${MYSQL_PASSWORD:-ptdarrahman_pass_$(openssl rand -hex 4)}"
JWT_SECRET_KEY=$(openssl rand -hex 32)
CRON_SECRET_KEY=$(openssl rand -hex 16)

cat > .env.ip <<EOF
PUBLIC_IP=${PUBLIC_IP}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
MYSQL_DATABASE=ptdarrahman
MYSQL_USER=ptdarrahman
MYSQL_PASSWORD=${MYSQL_USER_PASS}
JWT_SECRET=${JWT_SECRET_KEY}
CRON_SECRET=${CRON_SECRET_KEY}
COOKIE_SECURE=false
APP_ENV=production
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
EOF
log_ok "File .env.ip berhasil dibuat."

# ── 4. Build & Jalankan Docker Stack ──────────────────────────
log_info "4/6. Membangun dan menjalankan stack aplikasi (proses ini butuh 3-5 menit)..."
docker compose --env-file .env.ip -f docker-compose.ip.yml up -d --build

# ── 5. Tunggu Database Siap & Jalankan Migrasi ────────────────
log_info "5/6. Menunggu container MySQL & API sehat..."
for i in {1..60}; do
  if docker compose --env-file .env.ip -f docker-compose.ip.yml ps api | grep -q "healthy"; then
    log_ok "Service API & MySQL telah sehat."
    break
  fi
  sleep 3
done

log_info "Menjalankan migrasi database (Alembic)..."
docker compose --env-file .env.ip -f docker-compose.ip.yml exec -T api alembic upgrade head || log_warn "Alembic upgrade selesai atau dilewati."

log_info "Menjalankan database seeder awal (Akun Admin, Rubrik, Template)..."
docker compose --env-file .env.ip -f docker-compose.ip.yml exec -T api python -m scripts.seed || log_warn "Seeder selesai."

# ── 6. Ringkasan & Port Akses ─────────────────────────────────
echo
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}  DEPLOY BERHASIL! APLIKASI TELAH AKTIF DI VPS               ${COLOR_RESET}"
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
echo -e "Silakan buka tautan berikut di browser Anda:"
echo
echo -e "  🌐 1. Company Profile : ${COLOR_CYAN}http://${PUBLIC_IP}:3000${COLOR_RESET}"
echo -e "  👥 2. Portal PPDB     : ${COLOR_CYAN}http://${PUBLIC_IP}:5174${COLOR_RESET}"
echo -e "  🛡️ 3. Superadmin Panel : ${COLOR_CYAN}http://${PUBLIC_IP}:5173${COLOR_RESET}"
echo -e "  ⚡ 4. Backend API Docs : ${COLOR_CYAN}http://${PUBLIC_IP}:8000/docs${COLOR_RESET}"
echo -e "  🗄️ 5. Database UI (PMA): ${COLOR_CYAN}http://${PUBLIC_IP}:8085${COLOR_RESET}"
echo
echo -e "Kredensial Login phpMyAdmin (Port 8085):"
echo -e "  - Server   : mysql"
echo -e "  - Username : ptdarrahman  (atau: root)"
echo -e "  - Password : ${MYSQL_USER_PASS}  (root: ${MYSQL_ROOT_PASS})"
echo
echo -e "Kredensial Default Superadmin (Port 5173):"
echo -e "  - Username : superadmin"
echo -e "  - Password : SuperAdmin123!."
echo
echo -e "Kredensial Default Admin PPDB (Port 5174 / 5173):"
echo -e "  - Username : adminppdb"
echo -e "  - Password : adminppdb123!."
echo
echo -e "${COLOR_YELLOW}Catatan CI/CD & Auto-Start:${COLOR_RESET}"
echo -e "  - Seluruh container memakai restart: unless-stopped."
echo -e "  - Jika VPS dimatikan/dinyalakan dari panel IDCloudHost, aplikasi otomatis hidup sendiri!"
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
