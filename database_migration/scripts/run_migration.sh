#!/usr/bin/env bash
# SABO ARENA DATABASE MIGRATION RUNNER
# Purpose: Orchestrate pre-checks, dry-run, live migration, reporting, and error recovery.
# Requires: psql available, environment variable DATABASE_URL or --db argument.
# PostgreSQL >= 14 (Supabase compatible)

set -euo pipefail
IFS=$'\n\t'

# Colors
RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[1;33m"; BLUE="\033[0;34m"; NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR") )"
MIG_DIR="$ROOT_DIR/migrations"
LOG_DIR="$ROOT_DIR/logs"
REPORT_DIR="$ROOT_DIR/reports"
mkdir -p "$LOG_DIR" "$REPORT_DIR"

DATE_TAG="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/migration_$DATE_TAG.log"
REPORT_JSON="$REPORT_DIR/migration_report_$DATE_TAG.json"
STATE_FILE="$ROOT_DIR/.migration_state"

DB_URL="${DATABASE_URL:-}"
MODE=""
FORCE="false"
SKIP_DRY="false"
BATCH_PROFILES=1000
BATCH_TOURNAMENTS=500

usage() {
  cat <<EOF
Usage: $0 --mode <dry-run|live|report> [--db <url>] [--force] [--skip-dry] \\
          [--profiles-batch N] [--tournaments-batch N]

Modes:
  dry-run   Run execute_safe_migration(TRUE) and store JSON report.
  live      Run execute_safe_migration(FALSE) (requires prior clean dry-run unless --skip-dry).
  report    Only generate migration report (no data changes).

Options:
  --db <url>            Database connection URL (or set DATABASE_URL env)
  --force               Bypass interactive confirmation for live mode
  --skip-dry            Allow live execution without a fresh dry-run (NOT recommended)
  --profiles-batch N    Override profiles batch size (default 1000) *informational only*
  --tournaments-batch N Override tournament batch size (default 500)  *informational only*

Artifacts:
  Logs:     $LOG_DIR
  Reports:  $REPORT_DIR
  State:    $STATE_FILE (tracks last successful dry-run timestamp)
EOF
  exit 1
}

log() { echo -e "$(date -u +'%Y-%m-%dT%H:%M:%SZ') | $1" | tee -a "$LOG_FILE" >&2; }
log_section() { log "${BLUE}==== $1 ==== ${NC}"; }
log_warn() { log "${YELLOW}WARN${NC} $1"; }
log_err() { log "${RED}ERROR${NC} $1"; }
log_ok() { log "${GREEN}OK${NC} $1"; }

fatal() { log_err "$1"; echo "FAILED" > "$STATE_FILE.failed"; exit 1; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || fatal "Missing required command: $1"; }

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --mode) MODE="$2"; shift 2;;
      --db) DB_URL="$2"; shift 2;;
      --force) FORCE="true"; shift;;
      --skip-dry) SKIP_DRY="true"; shift;;
      --profiles-batch) BATCH_PROFILES="$2"; shift 2;;
      --tournaments-batch) BATCH_TOURNAMENTS="$2"; shift 2;;
      -h|--help) usage;;
      *) log_warn "Unknown argument: $1"; usage;;
    esac
  done
  [[ -z "$MODE" ]] && usage
  [[ -z "$DB_URL" ]] && fatal "Database URL not provided (use --db or set DATABASE_URL)."
}

pre_checks() {
  log_section "Pre-migration checks"
  require_cmd psql

  log "Checking database connectivity..."
  if ! PGPASSWORD="" psql "$DB_URL" -c "SELECT 1" -q >/dev/null 2>&1; then
    fatal "Cannot connect to database using provided URL"
  fi
  log_ok "Database reachable"

  log "Verifying required functions existence (if already applied)..."
  local fn_missing=0
  for fn in execute_safe_migration generate_migration_report migrate_profiles_data; do
    if ! psql "$DB_URL" -qAt -c "SELECT 1 FROM pg_proc WHERE proname='$fn'" | grep -q 1; then
      log_warn "Function $fn not found yet (will exist after loading SQL scripts)"
      fn_missing=$((fn_missing+1))
    fi
  done

  log "Checking pending locks that might block migration (long running transactions)..."
  local blockers
  blockers=$(psql "$DB_URL" -F $'\t' -qAt -c "SELECT pid, state, query FROM pg_stat_activity WHERE state <> 'idle' AND now()-query_start > interval '5 minutes'") || true
  if [[ -n "$blockers" ]]; then
    log_warn "Long running transactions detected (review strongly recommended):";
    echo "$blockers" | tee -a "$LOG_FILE"
  else
    log_ok "No problematic long running transactions detected"
  fi

  log "Disk usage / table size snapshot (top 10)..."
  psql "$DB_URL" -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) size FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;" | tee -a "$LOG_FILE" || true

  log_ok "Pre-checks complete"
}

load_sql_files_if_needed() {
  # Idempotent applying of migration function definitions (no data mutation yet)
  log_section "Loading SQL definitions"
  for f in 001_migration_functions.sql 002_validation_scripts.sql 003_backward_compatibility.sql 004_master_migration.sql; do
    if [[ -f "$MIG_DIR/$f" ]]; then
      log "Applying $f"; psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$MIG_DIR/$f" >> "$LOG_FILE" 2>&1 || fatal "Failed applying $f"
    else
      fatal "Missing expected migration file: $f"
    fi
  done
  log_ok "SQL definitions loaded"
}

confirm_live() {
  [[ "$FORCE" == "true" ]] && return 0
  echo -ne "${YELLOW}You are about to run LIVE migration. Type 'yes' to continue: ${NC}" >&2
  read -r ans
  [[ "$ans" == "yes" ]] || fatal "Live migration aborted by user"
}

run_dry() {
  log_section "Dry-run migration"
  local out
  set +e
  out=$(psql "$DB_URL" -qAt -c "SELECT execute_safe_migration(TRUE)::text;" 2>>"$LOG_FILE")
  local ec=$?
  set -e
  if [[ $ec -ne 0 ]]; then
    fatal "Dry-run failed (see log)"
  fi
  echo "$out" | sed 's/^\s*//' > "$REPORT_JSON"
  log_ok "Dry-run report saved: $REPORT_JSON"
  date -u +%s > "$STATE_FILE.dry_success"
  summarize_report "$REPORT_JSON"
}

run_live() {
  if [[ ! -f "$STATE_FILE.dry_success" && "$SKIP_DRY" != "true" ]]; then
    fatal "No successful dry-run recorded. Use --skip-dry to override (not recommended)."
  fi
  confirm_live
  log_section "LIVE migration"
  local out
  set +e
  out=$(psql "$DB_URL" -qAt -c "SELECT execute_safe_migration(FALSE)::text;" 2>>"$LOG_FILE")
  local ec=$?
  set -e
  if [[ $ec -ne 0 ]]; then
    fatal "Live migration failed (see log). Consider running rollback_migration() manually."
  fi
  echo "$out" | sed 's/^\s*//' > "$REPORT_JSON"
  log_ok "Live migration report saved: $REPORT_JSON"
  summarize_report "$REPORT_JSON"
}

run_report_only() {
  log_section "Generate report only"
  local out
  set +e
  out=$(psql "$DB_URL" -qAt -c "SELECT generate_migration_report()::text;" 2>>"$LOG_FILE")
  local ec=$?
  set -e
  if [[ $ec -ne 0 ]]; then
    fatal "Report generation failed"
  fi
  echo "$out" | sed 's/^\s*//' > "$REPORT_JSON"
  log_ok "Report saved: $REPORT_JSON"
  summarize_report "$REPORT_JSON"
}

summarize_report() {
  local file="$1"
  log_section "Report summary"
  if command -v jq >/dev/null 2>&1; then
    jq '.integrity_summary' "$file" 2>/dev/null | tee -a "$LOG_FILE" || log_warn "Could not parse integrity_summary with jq"
  else
    log_warn "jq not installed - raw JSON head:"; head -n 5 "$file" | tee -a "$LOG_FILE"
  fi
}

main() {
  parse_args "$@"
  pre_checks
  load_sql_files_if_needed

  case "$MODE" in
    dry-run) run_dry;;
    live) run_live;;
    report) run_report_only;;
    *) usage;;
  esac

  log_section "Done"
  log_ok "Migration script finished successfully"
  echo "SUCCESS" > "$STATE_FILE.last"
}

main "$@"
