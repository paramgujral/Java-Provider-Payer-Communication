#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║         HealthConnectAI — Startup            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Prerequisites check ───────────────────────────────────────────────────────
check() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌  $1 not found. Please install it first."
    exit 1
  fi
}
check java
check mvn
check node
check npm

echo "✅  Prerequisites OK"
echo ""

# ── Backend ───────────────────────────────────────────────────────────────────
echo "▶  Starting Spring Boot backend on :8080 …"
cd "$BACKEND"
mvn spring-boot:run -q &
BACKEND_PID=$!
echo "   PID $BACKEND_PID"

# Wait for backend
echo "   Waiting for backend to be ready…"
for i in $(seq 1 30); do
  if curl -s http://localhost:8080/actuator/health &>/dev/null || \
     curl -s http://localhost:8080/swagger-ui.html &>/dev/null; then
    echo "   ✅  Backend ready"
    break
  fi
  sleep 2
done

# ── Frontend ──────────────────────────────────────────────────────────────────
echo ""
echo "▶  Starting Angular frontend on :4200 …"
cd "$FRONTEND"

if [ ! -d node_modules ]; then
  echo "   Installing npm dependencies…"
  npm install --silent
fi

npm start &
FRONTEND_PID=$!
echo "   PID $FRONTEND_PID"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  App is starting up:                         ║"
echo "║  Frontend  →  http://localhost:4200          ║"
echo "║  Backend   →  http://localhost:8080          ║"
echo "║  Swagger   →  http://localhost:8080/swagger-ui.html  ║"
echo "║  H2 DB     →  http://localhost:8080/h2-console       ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Demo Credentials:                           ║"
echo "║  provider@healthconnect.com  / password123   ║"
echo "║  payer@healthconnect.com     / password123   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Keep alive and kill both on Ctrl+C
trap "echo ''; echo 'Shutting down…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
