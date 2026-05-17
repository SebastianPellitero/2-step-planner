#!/bin/bash

# Start Docker Desktop if daemon isn't running
if ! docker info > /dev/null 2>&1; then
  echo "Starting Docker Desktop..."
  "/c/Program Files/Docker/Docker/Docker Desktop.exe" &
  echo "Waiting for Docker to be ready..."
  until docker info > /dev/null 2>&1; do
    sleep 2
  done
  echo "Docker is ready!"
fi

# Start existing container or create a new one
docker start holiday-db 2>/dev/null || docker run --name holiday-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=holiday_planner \
  -p 5432:5432 -d postgres

echo "Database started."

# Start all dev servers
npm run dev
