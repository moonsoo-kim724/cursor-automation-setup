#!/bin/bash
# Claude 자동 시작 및 관리 스크립트
# 파일: claude-auto-start.sh

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 파일 설정
LOG_DIR="$HOME/.cursor-automation"
LOG_FILE="$LOG_DIR/claude.log"
PID_FILE="$LOG_DIR/claude.pid"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 로그 함수
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_color() {
    local color=$1
    local message=$2
    echo -e "${color}$(date '+%Y-%m-%d %H:%M:%S') - $message${NC}" | tee -a "$LOG_FILE"
}

# Claude 프로세스 확인
check_claude() {
    if pgrep -f "claude" > /dev/null; then
        local pid=$(pgrep -f "claude")
        log_color "$GREEN" "✅ Claude가 실행 중입니다 (PID: $pid)"
        return 0
    else
        log_color "$RED" "❌ Claude가 실행되지 않았습니다"
        return 1
    fi
}

# Claude 시작
start_claude() {
    log_color "$YELLOW" "🚀 Claude 시작 중..."
    
    # 기존 프로세스가 있으면 종료
    if pgrep -f "claude" > /dev/null; then
        log_color "$YELLOW" "⚠️  기존 Claude 프로세스 종료 중..."
        pkill -f "claude"
        sleep 2
    fi
    
    # Claude 시작 (백그라운드)
    nohup claude > "$LOG_FILE" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # 시작 확인
    sleep 3
    if check_claude; then
        log_color "$GREEN" "✅ Claude가 성공적으로 시작되었습니다 (PID: $pid)"
        return 0
    else
        log_color "$RED" "❌ Claude 시작에 실패했습니다"
        return 1
    fi
}

# Claude 중지
stop_claude() {
    log_color "$YELLOW" "🛑 Claude 중지 중..."
    
    if pgrep -f "claude" > /dev/null; then
        pkill -f "claude"
        sleep 2
        
        # 강제 종료 확인
        if pgrep -f "claude" > /dev/null; then
            log_color "$YELLOW" "⚠️  강제 종료 시도 중..."
            pkill -9 -f "claude"
            sleep 1
        fi
        
        if ! pgrep -f "claude" > /dev/null; then
            log_color "$GREEN" "✅ Claude가 성공적으로 중지되었습니다"
            rm -f "$PID_FILE"
            return 0
        else
            log_color "$RED" "❌ Claude 중지에 실패했습니다"
            return 1
        fi
    else
        log_color "$YELLOW" "ℹ️  실행 중인 Claude 프로세스가 없습니다"
        return 0
    fi
}

# Claude 재시작
restart_claude() {
    log_color "$BLUE" "🔄 Claude 재시작 중..."
    stop_claude
    sleep 2
    start_claude
}

# Claude 상태 확인
status_claude() {
    log_color "$CYAN" "📊 Claude 상태 확인 중..."
    
    if check_claude; then
        local pid=$(pgrep -f "claude")
        local start_time=$(ps -o lstart= -p $pid 2>/dev/null | xargs)
        log_color "$GREEN" "✅ Claude 실행 중"
        log_color "$CYAN" "   PID: $pid"
        log_color "$CYAN" "   시작 시간: $start_time"
        
        # 메모리 사용량 확인
        local memory=$(ps -o %mem= -p $pid 2>/dev/null | xargs)
        log_color "$CYAN" "   메모리 사용량: ${memory}%"
        
        # 로그 파일 크기 확인
        if [ -f "$LOG_FILE" ]; then
            local log_size=$(du -h "$LOG_FILE" | cut -f1)
            log_color "$CYAN" "   로그 파일 크기: $log_size"
        fi
        
        return 0
    else
        log_color "$RED" "❌ Claude가 실행되지 않았습니다"
        return 1
    fi
}

# 로그 보기
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        log_color "$CYAN" "📄 Claude 로그 (최근 20줄):"
        echo "----------------------------------------"
        tail -20 "$LOG_FILE"
        echo "----------------------------------------"
    else
        log_color "$YELLOW" "⚠️  로그 파일이 없습니다"
    fi
}

# 자동 시작 설정
setup_autostart() {
    log_color "$BLUE" "⚙️  자동 시작 설정 중..."
    
    # bashrc에 추가
    local bashrc="$HOME/.bashrc"
    local auto_start_line="# Cursor Claude 자동 시작"
    
    if ! grep -q "$auto_start_line" "$bashrc"; then
        echo "" >> "$bashrc"
        echo "$auto_start_line" >> "$bashrc"
        echo "claude-status() {" >> "$bashrc"
        echo "    bash '$PWD/claude-auto-start.sh' status" >> "$bashrc"
        echo "}" >> "$bashrc"
        echo "claude-start() {" >> "$bashrc"
        echo "    bash '$PWD/claude-auto-start.sh' start" >> "$bashrc"
        echo "}" >> "$bashrc"
        echo "claude-stop() {" >> "$bashrc"
        echo "    bash '$PWD/claude-auto-start.sh' stop" >> "$bashrc"
        echo "}" >> "$bashrc"
        echo "claude-restart() {" >> "$bashrc"
        echo "    bash '$PWD/claude-auto-start.sh' restart" >> "$bashrc"
        echo "}" >> "$bashrc"
        echo "claude-logs() {" >> "$bashrc"
        echo "    bash '$PWD/claude-auto-start.sh' logs" >> "$bashrc"
        echo "}" >> "$bashrc"
        echo "" >> "$bashrc"
        echo "# Claude 자동 시작 (새 세션에서)" >> "$bashrc"
        echo "if [ -t 1 ] && [ \"\$SHLVL\" = 1 ]; then" >> "$bashrc"
        echo "    bash '$PWD/claude-auto-start.sh' start >/dev/null 2>&1" >> "$bashrc"
        echo "fi" >> "$bashrc"
        
        log_color "$GREEN" "✅ 자동 시작 설정이 완료되었습니다"
        log_color "$CYAN" "💡 사용 가능한 명령어:"
        log_color "$CYAN" "   - claude-status: 상태 확인"
        log_color "$CYAN" "   - claude-start: 시작"
        log_color "$CYAN" "   - claude-stop: 중지"
        log_color "$CYAN" "   - claude-restart: 재시작"
        log_color "$CYAN" "   - claude-logs: 로그 확인"
    else
        log_color "$YELLOW" "⚠️  자동 시작이 이미 설정되어 있습니다"
    fi
}

# 도움말
show_help() {
    echo -e "${PURPLE}🤖 Claude 자동 관리 스크립트${NC}"
    echo -e "${CYAN}사용법: $0 [command]${NC}"
    echo ""
    echo -e "${YELLOW}사용 가능한 명령어:${NC}"
    echo -e "  ${GREEN}start${NC}     - Claude 시작"
    echo -e "  ${RED}stop${NC}      - Claude 중지"
    echo -e "  ${BLUE}restart${NC}   - Claude 재시작"
    echo -e "  ${CYAN}status${NC}    - Claude 상태 확인"
    echo -e "  ${PURPLE}logs${NC}      - 로그 확인"
    echo -e "  ${YELLOW}setup${NC}     - 자동 시작 설정"
    echo -e "  ${CYAN}help${NC}      - 도움말 표시"
    echo ""
    echo -e "${YELLOW}예시:${NC}"
    echo -e "  $0 start    # Claude 시작"
    echo -e "  $0 status   # 상태 확인"
    echo -e "  $0 logs     # 로그 확인"
}

# 메인 스크립트
main() {
    case "${1:-status}" in
        "start")
            start_claude
            ;;
        "stop")
            stop_claude
            ;;
        "restart")
            restart_claude
            ;;
        "status")
            status_claude
            ;;
        "logs")
            show_logs
            ;;
        "setup")
            setup_autostart
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_color "$RED" "❌ 알 수 없는 명령어: $1"
            show_help
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@" 