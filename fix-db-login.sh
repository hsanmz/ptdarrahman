#!/usr/bin/env bash
# ============================================================
# PTDARRAHMAN — Script Sinkronisasi Password DB & Seeder Akun
# ============================================================
# Script ini:
#   1. Memeriksa kredensial MySQL di container ptd-mysql
#   2. Menyelaraskan user 'root' & 'ptdarrahman' dengan .env.ip
#   3. Memastikan semua migrasi Alembic tuntas
#   4. Menjalankan seeder akun awal (superadmin, adminppdb, admincp)
#   5. Menampilkan daftar akun aktif & kredensial login siap pakai
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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.ip ]; then
  log_err "File .env.ip tidak ditemukan di $ROOT_DIR!"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.ip
set +a

MYSQL_ROOT_PASS="${MYSQL_ROOT_PASSWORD:-ptdarrahman_root_pass}"
MYSQL_USER_NAME="${MYSQL_USER:-ptdarrahman}"
MYSQL_USER_PASS="${MYSQL_PASSWORD:-ptdarrahman_pass123}"
MYSQL_DB="${MYSQL_DATABASE:-ptdarrahman}"
PUBLIC_IP="${PUBLIC_IP:-103.55.37.77}"

log_info "1/4. Memeriksa koneksi ke container MySQL (ptd-mysql)..."

# Deteksi password root yang sedang aktif di MySQL
WORKING_ROOT_PASS=""
for test_pass in "$MYSQL_ROOT_PASS" "ptdarrahman_root_pass" ""; do
  if docker exec ptd-mysql mysql -uroot -p"$test_pass" -e "SELECT 1;" >/dev/null 2>&1; then
    WORKING_ROOT_PASS="$test_pass"
    log_ok "Koneksi ke MySQL dengan root berhasil."
    break
  fi
done

if [ -z "$WORKING_ROOT_PASS" ]; then
  log_warn "Password root container tidak cocok dengan .env.ip. Melakukan reset password..."
  docker exec -i ptd-mysql sh -c "cat > /tmp/reset_pass.sql << 'EOF'
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';
CREATE USER IF NOT EXISTS '${MYSQL_USER_NAME}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_USER_PASS}';
ALTER USER '${MYSQL_USER_NAME}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_USER_PASS}';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER_NAME}'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF"
  docker exec -i ptd-mysql sh -c 'mysql -u root < /tmp/reset_pass.sql 2>/dev/null || true'
  
  if docker exec ptd-mysql mysql -uroot -p"$MYSQL_ROOT_PASS" -e "SELECT 1;" >/dev/null 2>&1; then
    WORKING_ROOT_PASS="$MYSQL_ROOT_PASS"
    log_ok "Password MySQL berhasil disetel ke kredensial .env.ip!"
  else
    log_warn "Restarting MySQL container..."
    docker compose --env-file .env.ip -f docker-compose.ip.yml restart mysql
    sleep 5
    WORKING_ROOT_PASS="$MYSQL_ROOT_PASS"
  fi
fi

# Terapkan sinkronisasi permission penuh
log_info "2/4. Menyelaraskan izin user '$MYSQL_USER_NAME' dan 'root' untuk host '%'..."
docker exec -i ptd-mysql mysql -uroot -p"${WORKING_ROOT_PASS:-$MYSQL_ROOT_PASS}" <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASS';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASS';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASS';
CREATE USER IF NOT EXISTS '$MYSQL_USER_NAME'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_USER_PASS';
ALTER USER '$MYSQL_USER_NAME'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_USER_PASS';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER_NAME'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF
log_ok "User MySQL sudah diselaraskan. phpMyAdmin dan API siap terkoneksi."

# Jalankan Alembic migrasi
log_info "3/4. Menjalankan migrasi database Alembic..."
docker compose --env-file .env.ip -f docker-compose.ip.yml exec -T api alembic upgrade heads

# Jalankan seeder akun
log_info "4/4. Menjalankan database seeder (membuat user admin jika belum ada)..."
docker compose --env-file .env.ip -f docker-compose.ip.yml exec -T api python -m scripts.seed

echo
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}  SEMUA AKUN & DATABASE BERHASIL DISINKRONKAN!             ${COLOR_RESET}"
echo -e "${COLOR_GREEN}============================================================${COLOR_RESET}"
echo
echo -e "Daftar User di Database saat ini:"
docker exec -i ptd-mysql mysql -uroot -p"$MYSQL_ROOT_PASS" -e "SELECT id, username, user_type, is_active FROM ${MYSQL_DB}.users;" 2>/dev/null || true
echo
echo -e "${COLOR_CYAN}1. phpMyAdmin (http://${PUBLIC_IP}:8085):${COLOR_RESET}"
echo -e "   Server   : mysql"
echo -e "   Username : root"
echo -e "   Password : ${MYSQL_ROOT_PASS}"
echo -e "   (Atau Username: ${MYSQL_USER_NAME} | Password: ${MYSQL_USER_PASS})"
echo -e "   *PENTING: Pastikan tidak ada spasi saat mengetik username & password!*"
echo
echo -e "${COLOR_CYAN}2. Superadmin Panel (http://${PUBLIC_IP}:5173):${COLOR_RESET}"
echo -e "   Username : superadmin"
echo -e "   Password : SuperAdmin123!."
echo
echo -e "${COLOR_CYAN}3. Admin PPDB Portal (http://${PUBLIC_IP}:5174/admin/login):${COLOR_RESET}"
echo -e "   Username : adminppdb"
echo -e "   Password : adminppdb123!."
echo
echo -e "${COLOR_CYAN}4. Admin Company Profile (http://${PUBLIC_IP}:3000/admin):${COLOR_RESET}"
echo -e "   Username : admincp"
echo -e "   Password : admincp123!."
echo
