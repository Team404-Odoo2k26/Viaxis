#!/bin/bash

# Define colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}    TransitOps — Local Startup Script     ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

echo -e "${GREEN}[INFO] Starting Next.js App Server (Frontend + API)...${NC}"
cd WEBSITE/frontend && npm run dev
