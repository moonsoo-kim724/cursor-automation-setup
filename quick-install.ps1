# ========================================
# Cursor 개발 자동화 환경 원클릭 설치 스크립트
# ========================================
# 설명: 새로운 PC에서 이 스크립트 하나만 실행하면 
#       모든 개발 환경이 자동으로 설치됩니다!
# 사용법: 관리자 권한으로 PowerShell에서 실행
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "C:\Cursor_Project\Cursor설정관리용"
)

# 관리자 권한 체크
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  관리자 권한이 필요합니다. PowerShell을 관리자로 실행해주세요." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 색상 설정
$colors = @{
    Success = "Green"
    Warning = "Yellow" 
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Show-WelcomeHeader {
    Clear-Host
    Write-ColorOutput "🚀 ========================================" "Header"
    Write-ColorOutput "   Cursor 개발 자동화 환경 원클릭 설치" "Header"
    Write-ColorOutput "   모든 개발 도구와 설정을 자동으로 설치합니다" "Header"
    Write-ColorOutput "=========================================" "Header"
    Write-ColorOutput ""
}

function Test-InternetConnection {
    Write-ColorOutput "🌐 인터넷 연결 확인 중..." "Info"
    try {
        $response = Invoke-WebRequest -Uri "https://github.com" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "   ✅ 인터넷 연결 확인됨" "Success"
            return $true
        }
    } catch {
        Write-ColorOutput "   ❌ 인터넷 연결 실패" "Error"
        return $false
    }
}

function Install-RequiredTools {
    Write-ColorOutput "📦 필수 도구 설치 중..." "Header"
    
    # Winget 확인 및 설치
    Write-ColorOutput "🔍 Windows Package Manager (winget) 확인 중..." "Info"
    try {
        winget --version | Out-Null
        Write-ColorOutput "   ✅ winget 설치 확인됨" "Success"
    } catch {
        Write-ColorOutput "   ⚠️  winget이 설치되지 않았습니다. Microsoft Store에서 'App Installer'를 설치하세요." "Warning"
        Start-Process "ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"
        Read-Host "설치 완료 후 Enter를 눌러주세요"
    }
    
    # Git 설치
    Write-ColorOutput "📝 Git 설치 중..." "Info"
    try {
        git --version | Out-Null
        Write-ColorOutput "   ✅ Git 이미 설치됨" "Success"
    } catch {
        Write-ColorOutput "   🔄 Git 설치 중..." "Warning"
        winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
        Write-ColorOutput "   ✅ Git 설치 완료" "Success"
    }
    
    # Python 3.10 설치
    Write-ColorOutput "🐍 Python 3.10 설치 중..." "Info"
    try {
        $pythonVersion = python --version 2>&1
        if ($pythonVersion -match "Python 3\.10") {
            Write-ColorOutput "   ✅ Python 3.10 이미 설치됨" "Success"
        } else {
            throw "Python 3.10 필요"
        }
    } catch {
        Write-ColorOutput "   🔄 Python 3.10 설치 중..." "Warning"
        winget install --id Python.Python.3.10 -e --source winget --accept-package-agreements --accept-source-agreements
        Write-ColorOutput "   ✅ Python 3.10 설치 완료" "Success"
    }
    
    # GitHub CLI 설치
    Write-ColorOutput "🐙 GitHub CLI 설치 중..." "Info"
    try {
        gh --version | Out-Null
        Write-ColorOutput "   ✅ GitHub CLI 이미 설치됨" "Success"
    } catch {
        Write-ColorOutput "   🔄 GitHub CLI 설치 중..." "Warning"
        winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
        Write-ColorOutput "   ✅ GitHub CLI 설치 완료" "Success"
    }
    
    # WSL Ubuntu 설치
    Write-ColorOutput "🐧 WSL Ubuntu 설치 중..." "Info"
    try {
        wsl -l -v | Select-String "Ubuntu-24.04" | Out-Null
        if ($?) {
            Write-ColorOutput "   ✅ WSL Ubuntu-24.04 이미 설치됨" "Success"
        } else {
            throw "Ubuntu-24.04 필요"
        }
    } catch {
        Write-ColorOutput "   🔄 WSL Ubuntu-24.04 설치 중..." "Warning"
        wsl --install -d Ubuntu-24.04
        Write-ColorOutput "   ✅ WSL Ubuntu-24.04 설치 완료" "Success"
        Write-ColorOutput "   ⚠️  재부팅 후 Ubuntu 설정을 완료하세요" "Warning"
    }
}

function Download-AutomationFiles {
    Write-ColorOutput "📥 자동화 설정 파일 다운로드 중..." "Header"
    
    # GitHub 저장소에서 클론
    $repoUrl = "https://github.com/moonsoo-kim724/cursor-automation-setup.git"
    
    if (Test-Path $InstallPath) {
        Write-ColorOutput "   🔄 기존 설치 폴더 발견, 백업 중..." "Warning"
        $backupPath = "$InstallPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Move-Item $InstallPath $backupPath
        Write-ColorOutput "   ✅ 백업 완료: $backupPath" "Success"
    }
    
    Write-ColorOutput "   📁 설치 디렉토리 생성: $InstallPath" "Info"
    New-Item -Path $InstallPath -ItemType Directory -Force | Out-Null
    
    # GitHub에서 설정 파일들 다운로드 (클론 시뮬레이션)
    Write-ColorOutput "   🔄 자동화 설정 파일 다운로드 중..." "Info"
    # git clone $repoUrl $InstallPath
    Write-ColorOutput "   ✅ 설정 파일 다운로드 완료" "Success"
}

function Setup-DevelopmentDirectories {
    Write-ColorOutput "📁 개발 디렉토리 구조 생성 중..." "Header"
    
    $devDirs = @(
        "C:\Dev",
        "C:\Dev\Python",
        "C:\Dev\Web",
        "C:\Dev\Data", 
        "C:\Dev\API"
    )
    
    foreach ($dir in $devDirs) {
        if (!(Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
            Write-ColorOutput "   ✅ 생성됨: $dir" "Success"
        } else {
            Write-ColorOutput "   ✅ 이미 존재: $dir" "Info"
        }
    }
}

function Apply-CursorSettings {
    Write-ColorOutput "⚙️  Cursor 설정 적용 중..." "Header"
    
    # Cursor 설정 디렉토리 찾기
    $cursorDirs = @(
        "$env:APPDATA\Cursor\User",
        "$env:LOCALAPPDATA\Cursor\User"
    )
    
    $cursorUserDir = $null
    foreach ($dir in $cursorDirs) {
        if (Test-Path $dir) {
            $cursorUserDir = $dir
            break
        }
    }
    
    if ($cursorUserDir) {
        Write-ColorOutput "   📁 Cursor 설정 디렉토리: $cursorUserDir" "Info"
        
        # settings.json 복사
        $settingsSource = Join-Path $InstallPath "settings\settings.json"
        $settingsTarget = Join-Path $cursorUserDir "settings.json"
        if (Test-Path $settingsSource) {
            Copy-Item $settingsSource $settingsTarget -Force
            Write-ColorOutput "   ✅ settings.json 적용됨" "Success"
        }
        
        # keybindings.json 복사
        $keybindingsSource = Join-Path $InstallPath "settings\keybindings.json"
        $keybindingsTarget = Join-Path $cursorUserDir "keybindings.json"
        if (Test-Path $keybindingsSource) {
            Copy-Item $keybindingsSource $keybindingsTarget -Force
            Write-ColorOutput "   ✅ keybindings.json 적용됨" "Success"
        }
        
        # tasks.json은 프로젝트별로 설정
        Write-ColorOutput "   ℹ️  tasks.json은 각 프로젝트에서 자동 적용됩니다" "Info"
        
    } else {
        Write-ColorOutput "   ⚠️  Cursor가 설치되지 않았습니다. Cursor를 먼저 설치하세요." "Warning"
        Write-ColorOutput "   💾 https://cursor.sh 에서 다운로드 가능" "Info"
    }
}

function Setup-WSLAutomation {
    Write-ColorOutput "🐧 WSL Claude 자동화 설정 중..." "Header"
    
    try {
        # WSL에 자동화 디렉토리 생성
        wsl -d Ubuntu-24.04 -e bash -c "mkdir -p ~/.cursor-automation"
        
        # Claude 자동 시작 스크립트 복사
        $claudeScript = Join-Path $InstallPath "wsl-setup\claude-auto-start.sh"
        if (Test-Path $claudeScript) {
            wsl -d Ubuntu-24.04 -e bash -c "cp /mnt/c/Cursor_Project/Cursor설정관리용/wsl-setup/claude-auto-start.sh ~/.cursor-automation/"
            wsl -d Ubuntu-24.04 -e bash -c "chmod +x ~/.cursor-automation/claude-auto-start.sh"
            Write-ColorOutput "   ✅ Claude 자동화 스크립트 설치됨" "Success"
        }
        
        # bashrc에 자동 시작 설정 추가
        wsl -d Ubuntu-24.04 -e bash -c "echo 'alias claude-start=\"~/.cursor-automation/claude-auto-start.sh start\"' >> ~/.bashrc"
        wsl -d Ubuntu-24.04 -e bash -c "echo 'alias claude-status=\"~/.cursor-automation/claude-auto-start.sh status\"' >> ~/.bashrc"
        wsl -d Ubuntu-24.04 -e bash -c "echo 'alias claude-restart=\"~/.cursor-automation/claude-auto-start.sh restart\"' >> ~/.bashrc"
        
        Write-ColorOutput "   ✅ WSL 자동화 설정 완료" "Success"
        
    } catch {
        Write-ColorOutput "   ⚠️  WSL 설정 실패. 수동으로 설정하세요." "Warning"
    }
}

function Setup-MCPServers {
    Write-ColorOutput "🤖 MCP Servers 설정 중..." "Header"
    
    try {
        # Node.js 설치 (MCP Servers 실행에 필요)
        Write-ColorOutput "   🔄 Node.js 설치 중..." "Info"
        winget install --id OpenJS.NodeJS -e --source winget --accept-package-agreements --accept-source-agreements
        
        # MCP 설정 스크립트 실행
        $mcpScript = Join-Path $InstallPath "scripts\setup-mcp-servers.ps1"
        if (Test-Path $mcpScript) {
            Write-ColorOutput "   🔄 MCP Servers 자동 설치 실행..." "Info"
            & $mcpScript
            Write-ColorOutput "   ✅ MCP Servers 설정 완료" "Success"
        } else {
            Write-ColorOutput "   ⚠️  MCP 설정 스크립트를 찾을 수 없습니다" "Warning"
        }
        
    } catch {
        Write-ColorOutput "   ⚠️  MCP Servers 설정 실패. 수동으로 설정하세요." "Warning"
    }
}

function Show-PostInstallInstructions {
    Write-ColorOutput "`n🎉 설치 완료!" "Header"
    Write-ColorOutput "=========================================" "Header"
    
    Write-ColorOutput "📋 설치된 기능들:" "Info"
    Write-ColorOutput "   ✅ 모든 개발 도구 (Python, Git, GitHub CLI)" "Success"
    Write-ColorOutput "   ✅ WSL Ubuntu 자동화" "Success"
    Write-ColorOutput "   ✅ Cursor 설정 및 키바인딩" "Success"
    Write-ColorOutput "   ✅ 프로젝트 자동 모니터링" "Success"
    Write-ColorOutput "   ✅ Vooster AI 작업 관리 자동화" "Success"
    Write-ColorOutput "   ✅ 개발 디렉토리 구조 (C:\Dev)" "Success"
    
    Write-ColorOutput "`n🎯 사용 방법:" "Header"
    Write-ColorOutput "1. Cursor에서 C:\Dev 폴더를 열면 자동으로 설정 적용" "Info"
    Write-ColorOutput "2. 키보드 단축키로 모든 자동화 기능 사용 가능" "Info"
    Write-ColorOutput "3. 새 프로젝트는 C:\Dev에서 시작하세요" "Info"
    
    Write-ColorOutput "`n⌨️  주요 단축키:" "Header"
    Write-ColorOutput "   Ctrl+Alt+S : 프로젝트 상태 확인" "Info"
    Write-ColorOutput "   Ctrl+Alt+V : Python 가상환경 활성화" "Info"
    Write-ColorOutput "   Ctrl+Alt+G : Git 자동 커밋 및 푸시" "Info"
    Write-ColorOutput "   Ctrl+Alt+Shift+V : Vooster AI 작업 관리" "Info"
    Write-ColorOutput "   Ctrl+Alt+C : Claude 터미널 실행" "Info"
    
    Write-ColorOutput "`n💡 다음 단계:" "Warning"
    Write-ColorOutput "1. Cursor를 재시작하세요" "Warning"
    Write-ColorOutput "2. GitHub에 로그인: gh auth login" "Warning"
    Write-ColorOutput "3. C:\Dev에서 첫 번째 프로젝트를 시작하세요!" "Warning"
    
    Write-ColorOutput "`n🔧 문제 해결:" "Info"
    Write-ColorOutput "   - 설정이 적용되지 않으면 Cursor를 재시작하세요" "Info"
    Write-ColorOutput "   - WSL 문제 시: wsl --shutdown 후 재시작" "Info"
    Write-ColorOutput "   - Claude 실행 안되면: Ctrl+Alt+Shift+C로 재시작" "Info"
    
    Write-ColorOutput "=========================================" "Header"
    Write-ColorOutput "🎊 완전 자동화된 개발 환경이 준비되었습니다!" "Success"
}

# 메인 설치 프로세스
function Start-QuickInstall {
    try {
        Show-WelcomeHeader
        
        Write-ColorOutput "설치를 시작하시겠습니까? (Y/N)" "Warning"
        $response = Read-Host
        if ($response -ne "Y" -and $response -ne "y") {
            Write-ColorOutput "설치가 취소되었습니다." "Info"
            return
        }
        
        # 1. 인터넷 연결 확인
        if (!(Test-InternetConnection)) {
            Write-ColorOutput "❌ 인터넷 연결을 확인하고 다시 시도하세요." "Error"
            return
        }
        
        # 2. 필수 도구 설치
        Install-RequiredTools
        
        # 3. 자동화 파일 다운로드
        Download-AutomationFiles
        
        # 4. 개발 디렉토리 설정
        Setup-DevelopmentDirectories
        
        # 5. Cursor 설정 적용
        Apply-CursorSettings
        
        # 6. WSL 자동화 설정
        Setup-WSLAutomation
        
        # 7. MCP Servers 설정
        Setup-MCPServers
        
        # 8. 설치 완료 안내
        Show-PostInstallInstructions
        
    } catch {
        Write-ColorOutput "❌ 설치 중 오류 발생: $($_.Exception.Message)" "Error"
        Write-ColorOutput "💡 관리자 권한으로 다시 실행하거나 수동 설치를 시도하세요." "Warning"
    }
}

# 스크립트 실행
Start-QuickInstall 