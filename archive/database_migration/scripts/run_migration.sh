#!/usr/bin/env bash
# CLEAN REWRITE - SABO ARENA MIGRATION RUNNER (corrupted original replaced)
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[1;33m"; BLUE="\033[0;34m"; NC="\033[0m"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
MIG_DIR="$ROOT_DIR/database_migration/migrations"
LOG_DIR="$ROOT_DIR/logs"
REPORT_DIR="$ROOT_DIR/reports"
mkdir -p "$LOG_DIR" "$REPORT_DIR"
DATE_TAG="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/migration_$DATE_TAG.log"
REPORT_JSON="$REPORT_DIR/migration_report_$DATE_TAG.json"
STATE_FILE="$ROOT_DIR/.migration_state"

DB_URL="${DATABASE_URL:-}"
MODE=""
FORCE=false
SKIP_DRY=false
PERF_THRESHOLD_PCT=5
MAX_ACTIVE_SESSIONS=30

usage(){ cat <<EOF
Usage: $0 --mode <dry-run|live|report|validate-only|cleanup> [--db URL] [--force] [--skip-dry]
	Modes:
		dry-run        Apply SQL (excluding destructive cleanup) then execute migration in dry-run mode
		live           Run full migration (excluding cleanup) after successful dry-run
		report         Show extended report only (no migration execution)
		validate-only  Same as report but enforces gate
		cleanup        Apply post-migration cleanup script 005 (only after live & gates passed)
EOF
exit 1; }

log(){ echo -e "$(date -u +%FT%TZ) | $1" | tee -a "$LOG_FILE" >&2; }
log_section(){ log "${BLUE}==== $1 ====${NC}"; }
log_warn(){ log "${YELLOW}WARN${NC} $1"; }
log_err(){ log "${RED}ERROR${NC} $1"; }
log_ok(){ log "${GREEN}OK${NC} $1"; }
fatal(){ log_err "$1"; exit 1; }

parse_args(){
	while [[ $# -gt 0 ]]; do
		case "$1" in
			--mode) MODE="$2"; shift 2;;
			--db) DB_URL="$2"; shift 2;;
			--force) FORCE=true; shift;;
			--skip-dry) SKIP_DRY=true; shift;;
			-h|--help) usage;;
			*) log_warn "Unknown arg $1"; usage;;
		esac
	done
	[[ -z "$MODE" ]] && usage
	[[ -z "$DB_URL" ]] && fatal "Missing DB URL"
	return 0
}

pre_checks(){
	log_section "PreChecks"
	command -v psql >/dev/null || fatal "psql missing"
	psql "$DB_URL" -qAt -c 'SELECT 1' >/dev/null || fatal "DB unreachable"
	log_ok "DB reachable"
	local active
	active=$(psql "$DB_URL" -qAt -c "SELECT count(*) FROM pg_stat_activity WHERE state <> 'idle' AND pid<>pg_backend_pid();" || echo 0)
	[[ $active -le $MAX_ACTIVE_SESSIONS ]] || fatal "Too many active sessions ($active)"
	log_ok "Active sessions acceptable ($active)"
}

load_sql(){
	log_section "Load SQL"
	local base_files=(
		000_optimized_schema.sql
		001_migration_functions.sql
		002_validation_scripts.sql
		003_backward_compatibility.sql
		004_master_migration.sql
		006_advanced_validation.sql
		007_backward_compatibility.sql
		008_advanced_optimizations.sql
		009_security_audit_system.sql
		010_performance_monitoring.sql
		011_deployment_automation.sql
		012_rollback_system.sql
		013_monitoring_system.sql
		014_maintenance_automation.sql
		015_business_intelligence.sql
	)
	local cleanup_file=005_cleanup_procedures.sql
	local files_to_apply=("${base_files[@]}")
	if [[ "$MODE" == "cleanup" ]]; then
		files_to_apply=("$cleanup_file")
		log_warn "Running in CLEANUP mode – ONLY applying $cleanup_file"
	fi
	for f in "${files_to_apply[@]}"; do
		if [[ -f "$MIG_DIR/$f" ]]; then
			log "Applying $f"
			psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$MIG_DIR/$f" >>"$LOG_FILE" 2>&1 || fatal "Failed applying $f"
		else
			log_warn "Missing $f (skipping)"
		fi
	done
	log_ok "SQL apply phase complete"
}

enrich_report(){
	local file="$1"
	command -v jq >/dev/null 2>&1 || return 0
	local enrich
	enrich=$(psql "$DB_URL" -qAt -c "WITH m AS (SELECT row_to_json(t) latest FROM (SELECT * FROM performance_metrics ORDER BY captured_at DESC LIMIT 1)t), b AS(SELECT count(*) pending FROM domain_events WHERE processed_at IS NULL) SELECT json_build_object('latest_performance',m.latest,'event_backlog',(SELECT pending FROM b))::text FROM m,b;" 2>/dev/null || echo '{}')
	jq --argjson e "$enrich" '. + {operational_enrichment:$e}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

performance_gate(){
	local file="$1"; command -v jq >/dev/null || return 0
	local threshold=$PERF_THRESHOLD_PCT fail=0
	jq -r '.performance_benchmarks? // [] | map(.label)|unique[]|select(test("_old$"))' "$file" | while read -r old; do
		local base="${old%_old}" o n
		o=$(jq -r --arg l "$old" '.performance_benchmarks[]|select(.label==$l).total_time_ms' "$file" 2>/dev/null)
		n=$(jq -r --arg l "${base}_new" '.performance_benchmarks[]|select(.label==$l).total_time_ms' "$file" 2>/dev/null)
		[[ -z "$o" || -z "$n" || $o == null || $n == null ]] && continue
		awk -v o="$o" -v n="$n" -v t="$threshold" 'BEGIN{ if(n>o*(1+t/100.0)) exit 1}' || fail=1
	done
	[[ $fail -eq 0 ]] || return 1
}

append_recommendations(){
	local file=$1; command -v jq >/dev/null || return 0
	local recs=()
	jq -e '.advanced_integrity_v2[]?|select(.severity=="FAIL")' "$file" >/dev/null 2>&1 && recs+=("Resolve FAIL integrity checks")
	jq -e '.data_sampling.status=="FAIL"' "$file" >/dev/null 2>&1 && recs+=("Investigate data sampling mismatches")
	[[ ${#recs[@]} -eq 0 ]] && recs+=("All gates passed – monitor before legacy decommission")
	jq --argjson r "$(printf '%s\n' "${recs[@]}" | jq -R . | jq -s .)" '. + {recovery_recommendations:$r}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

summarize(){ local file=$1; command -v jq >/dev/null && jq '.integrity_summary' "$file" || head -n 40 "$file"; }

gate(){
	local file=$1 mode=$2 mismatch=false
	if command -v jq >/dev/null; then
		jq -e '.integrity_summary[]|select(.status!="OK")' "$file" >/dev/null 2>&1 && mismatch=true
		jq -e '.advanced_integrity_v2[]?|select(.severity=="FAIL")' "$file" >/dev/null 2>&1 && mismatch=true
		jq -e '.data_sampling.status=="FAIL"' "$file" >/dev/null 2>&1 && mismatch=true
		performance_gate "$file" || mismatch=true
	else
		grep -q '"status":"MISMATCH"' "$file" && mismatch=true
	fi
	if $mismatch; then
		log_err "GATE FAIL $mode"; append_recommendations "$file"; exit 2
	else
		log_ok "GATE PASS $mode"; append_recommendations "$file"
	fi
}

run_dry(){
	log_section "DryRun"
	local out
	out=$(psql "$DB_URL" -qAt -c "SELECT execute_safe_migration(TRUE)::text;" 2>>"$LOG_FILE") || fatal "Dry-run failed"
	out=$(psql "$DB_URL" -qAt -c "SELECT extended_migration_report()::text;" 2>>"$LOG_FILE") || fatal "Extended report failed"
	echo "$out" > "$REPORT_JSON"
	enrich_report "$REPORT_JSON" || true
	summarize "$REPORT_JSON"
	gate "$REPORT_JSON" dry-run
	date -u +%s > "$STATE_FILE.dry_success"
}

run_live(){
	[[ -f "$STATE_FILE.dry_success" || $SKIP_DRY == true ]] || fatal "No successful dry-run"
	$FORCE || { echo -n "Type yes to continue LIVE: " >&2; read -r a; [[ $a == yes ]] || fatal "Aborted"; }
	log_section "LiveMigration"
	capture_pre_migration_snapshot || true
	local out
	out=$(psql "$DB_URL" -qAt -c "SELECT execute_safe_migration(FALSE)::text;" 2>>"$LOG_FILE") || fatal "Live migration failed"
	out=$(psql "$DB_URL" -qAt -c "SELECT extended_migration_report()::text;" 2>>"$LOG_FILE") || fatal "Extended report failed"
	echo "$out" > "$REPORT_JSON"
	enrich_report "$REPORT_JSON" || true
	summarize "$REPORT_JSON"
	gate "$REPORT_JSON" live
}

run_validate(){
	log_section "ValidateOnly"
	local out
	out=$(psql "$DB_URL" -qAt -c "SELECT extended_migration_report()::text;" 2>>"$LOG_FILE") || fatal "Validation report failed"
	echo "$out" > "$REPORT_JSON"
	enrich_report "$REPORT_JSON" || true
	summarize "$REPORT_JSON"
	gate "$REPORT_JSON" validate-only
}

run_report(){
	log_section "ReportOnly"
	local out
	out=$(psql "$DB_URL" -qAt -c "SELECT extended_migration_report()::text;" 2>>"$LOG_FILE") || fatal "Report failed"
	echo "$out" > "$REPORT_JSON"
	enrich_report "$REPORT_JSON" || true
	summarize "$REPORT_JSON"
	gate "$REPORT_JSON" report
}

capture_pre_migration_snapshot(){
	local f="$REPORT_DIR/pre_migration_snapshot_$DATE_TAG.json"
	psql "$DB_URL" -qAt -c "SELECT json_build_object('profiles',(SELECT count(*) FROM profiles),'tournaments',(SELECT count(*) FROM tournaments))::text" > "$f" 2>>"$LOG_FILE" || true
}

main(){
	set +e
	parse_args "$@"
	local PARSE_EC=$?
	set -e
	echo "[DEBUG] parse_args exit=$PARSE_EC" >&2
	log_section "Args"; log "MODE=$MODE FORCE=$FORCE SKIP_DRY=$SKIP_DRY"
	pre_checks
	load_sql
	case "$MODE" in
		dry-run) run_dry;;
		live) run_live;;
		report) run_report;;
		validate-only) run_validate;;
		cleanup) log_section "Cleanup"; log_warn "Ensure gates previously passed before cleanup"; ;;
		*) usage;;
	esac
	log_section "Done"; log_ok "Finished"; echo SUCCESS > "$STATE_FILE.last"
}

main "$@"
DATE_TAG="$(date +%Y%m%d_%H%M%S)"; LOG_FILE="$LOG_DIR/migration_$DATE_TAG.log"; REPORT_JSON="$REPORT_DIR/migration_report_$DATE_TAG.json"; STATE_FILE="$ROOT_DIR/.migration_state"
