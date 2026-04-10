#!/bin/bash
# ============================================
# IndustrieON Activiteitenplanner
# Start script voor lokale ontwikkeling
# ============================================

echo "=========================================="
echo "  IndustrieON Activiteitenplanner"
echo "=========================================="
echo ""

# Controleer of Node.js geinstalleerd is
if ! command -v node &> /dev/null; then
    echo "FOUT: Node.js is niet geinstalleerd!"
    echo "Installeer Node.js via: https://nodejs.org"
    exit 1
fi

BASISMAP="$(cd "$(dirname "$0")" && pwd)"

# Backend dependencies installeren als dat nog niet is gebeurd
if [ ! -d "$BASISMAP/backend/node_modules" ]; then
    echo "Backend dependencies installeren..."
    cd "$BASISMAP/backend" && npm install
fi

# Frontend dependencies installeren als dat nog niet is gebeurd
if [ ! -d "$BASISMAP/frontend/node_modules" ]; then
    echo "Frontend dependencies installeren..."
    cd "$BASISMAP/frontend" && npm install
fi

# Database vullen als deze nog niet bestaat
if [ ! -f "$BASISMAP/backend/industrieon.db" ]; then
    echo "Database aanmaken en vullen met voorbeelddata..."
    cd "$BASISMAP/backend" && node seed.js
fi

echo ""
echo "Backend starten op http://localhost:5000"
cd "$BASISMAP/backend" && node server.js &
BACKEND_PID=$!

echo "Frontend starten op http://localhost:3000"
cd "$BASISMAP/frontend" && npm start &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "  Applicatie is gestart!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "=========================================="
echo ""
echo "Druk op Ctrl+C om te stoppen"

# Wacht tot een van de processen stopt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
