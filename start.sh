#!/bin/bash

# Define colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}    TransitOps — Local Startup Script     ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

echo -e "${YELLOW}[INFO] Starting Backend Server (Express + Prisma)...${NC}"
cd WEBSITE/backend && npm run dev &
BACKEND_PID=$!
cd ../..

echo -e "${YELLOW}[INFO] Starting Frontend Server (Next.js)...${NC}"
cd WEBSITE/frontend && npm run dev &
FRONTEND_PID=$!
cd ../..

echo -e "\n${GREEN}[SUCCESS] Both servers are launching in the background!${NC}"
echo -e "Press Ctrl+C to stop both processes."

# Clean up processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
