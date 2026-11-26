#!/bin/bash
# ============================================================
# PTDARRAHMAN — Frontend container entrypoint
# Menjalankan 3 buah UI (hanya menyajikan UI, tanpa backend):
#   :3000  companyprofile (Next.js)
#   :5173  superadmin      (Vite preview)
#   :5174  ppdb            (Vite preview)
# ============================================================
set -euo pipefail

echo "──────────────────────────────────────────────"
echo " PTDARRAHMAN — Frontend container (Optimized Standalone)"
echo "   companyprofile : http://0.0.0.0:3000 (Next.js Standalone)"
echo "   superadmin     : http://0.0.0.0:5173 (Static SPA)"
echo "   ppdb           : http://0.0.0.0:5174 (Static SPA)"
echo "──────────────────────────────────────────────"

node /workspace/apps/companyprofile/server.js &
PID_NEXT=$!
echo "[frontend] companyprofile (Next.js Standalone) → :3000 (pid $PID_NEXT)"

node /usr/local/bin/spa-server.js 5173 /workspace/apps/superadmin/dist &
PID_SUPER=$!
echo "[frontend] superadmin (Static SPA) → :5173 (pid $PID_SUPER)"

node /usr/local/bin/spa-server.js 5174 /workspace/apps/ppdb/dist &
PID_PPDB=$!
echo "[frontend] ppdb (Static SPA) → :5174 (pid $PID_PPDB)"

# Tunggu proses pertama yang berhenti. Jika ada yang crash, seluruh container berhenti
# (sinyal ke orkestrator untuk restart), agar UI tidak tampil separuh-separuh.
wait -n "$PID_NEXT" "$PID_PPDB" "$PID_SUPER"
exit_code=$?
echo "[frontend] Salah satu proses berhenti (exit $exit_code) — mematikan container."
kill "$PID_NEXT" "$PID_PPDB" "$PID_SUPER" 2>/dev/null || true
exit $exit_code
