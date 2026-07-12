#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== TransitOps Full-Stack Setup ===${NC}"
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed or not in PATH. Please install Node.js v22+.${NC}"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm is not installed or not in PATH. Please install npm v10+.${NC}"
    exit 1
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}ERROR: PostgreSQL (psql command) is not installed or not in PATH. Please install PostgreSQL v16+.${NC}"
    exit 1
fi

echo -e "${GREEN}✔ All prerequisites are installed!${NC}\n"

# Check backend .env
if [ ! -f "WEBSITE/backend/.env" ]; then
    echo -e "${YELLOW}Creating WEBSITE/backend/.env from example...${NC}"
    cp WEBSITE/backend/.env.example WEBSITE/backend/.env
    echo -e "${YELLOW}⚠ WEBSITE/backend/.env created — please update your DATABASE_URL and JWT_SECRET before starting.${NC}\n"
fi

echo -e "${YELLOW}Installing Backend dependencies...${NC}"
cd WEBSITE/backend || exit
npm install
echo -e "${YELLOW}Generating Prisma Client...${NC}"
npx prisma generate
cd ../..

echo -e "${YELLOW}Installing Frontend dependencies...${NC}"
cd WEBSITE/frontend || exit
npm install
cd ../..

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}  Setup Completed Successfully! 🎉  ${NC}"
echo -e "${GREEN}=====================================${NC}\n"

echo -e "${CYAN}To run the backend, open a terminal and run:${NC}"
echo -e "  cd WEBSITE/backend"
echo -e "  npm run dev\n"

echo -e "${CYAN}To run the frontend, open a second terminal and run:${NC}"
echo -e "  cd WEBSITE/frontend"
echo -e "  npm run dev\n"
