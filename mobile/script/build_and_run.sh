#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-start}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

show_usage() {
  cat <<'USAGE'
usage: ./script/build_and_run.sh [mode]

Modes:
  start, run        Start the Expo dev server
  --ios, ios        Start Expo and open iOS
  --android, android
                   Start Expo and open Android
  --web, web        Start Expo for web
  --dev-client, dev-client
                   Start Expo in development-client mode
  --tunnel, tunnel Start Expo using tunnel transport
  --export-web, export-web
                   Export the web build locally
  --doctor, doctor Run Expo diagnostics
  --help, help     Show this help
USAGE
}

run_doctor() {
  npx expo-doctor
}

case "$MODE" in
  start|run)
    exec npx expo start
    ;;
  --ios|ios)
    exec npx expo start --ios
    ;;
  --android|android)
    exec npx expo start --android
    ;;
  --web|web)
    exec npx expo start --web
    ;;
  --dev-client|dev-client)
    exec npx expo start --dev-client
    ;;
  --tunnel|tunnel)
    exec npx expo start --tunnel
    ;;
  --export-web|export-web)
    exec npx expo export --platform web
    ;;
  --doctor|doctor)
    run_doctor
    ;;
  --help|help)
    show_usage
    ;;
  *)
    show_usage >&2
    exit 2
    ;;
esac

