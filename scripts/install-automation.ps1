# Cursor 프로젝트 자동화 시스템 설치 스크립트
# Author: Cursor 자동화 시스템
# 목적: 모든 설정을 자동으로 적용하고 시스템 활성화

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipWSL,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup
)

# 색상 및 이모지 설정
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

function Show-Banner {
    Clear-Host
    Write-ColorOutput @"
🚀 ========================================
   Cursor 프로젝트 자동화 시스템 설치
   Version 2.0 - 2025 Edition
========================================
"@ "Header"
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Backup-ExistingSettings {
    if ($SkipBackup) {
        Write-ColorOutput "⏭️  백업 건너뛰기..." "Info"
        return
    }
    
    Write-ColorOutput "💾 기존 설정 백업 중..." "Info"
    
    $backupDir = "C:\cursor-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Cursor 설정 백업
    $cursorConfigPath = "$env:APPDATA\Cursor\User"
    if (Test-Path $cursorConfigPath) {
        Copy-Item -Path $cursorConfigPath -Destination "$backupDir\cursor-user" -Recurse -Force
        Write-ColorOutput "✅ Cursor 사용자 설정 백업 완료" "Success"
    }
    
    # Git 설정 백업
    if (Test-Path "$env:USERPROFILE\.gitconfig") {
        Copy-Item -Path "$env:USERPROFILE\.gitconfig" -Destination "$backupDir\.gitconfig" -Force
        Write-ColorOutput "✅ Git 설정 백업 완료" "Success"
    }
    
    Write-ColorOutput "📁 백업 위치: $backupDir" "Info"
}

function Install-Prerequisites {
    Write-ColorOutput "📦 필수 구성 요소 확인 중..." "Info"
    
    # PowerShell 실행 정책 설정
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-ColorOutput "✅ PowerShell 실행 정책 설정 완료" "Success"
    } catch {
        Write-ColorOutput "⚠️  PowerShell 실행 정책 설정 실패: $($_.Exception.Message)" "Warning"
    }
    
    # Git 확인
    try {
        $gitVersion = git --version 2>$null
        Write-ColorOutput "✅ Git 확인: $gitVersion" "Success"
    } catch {
        Write-ColorOutput "❌ Git이 설치되지 않았습니다. 먼저 Git을 설치하세요." "Error"
        return $false
    }
    
    # Python 확인
    try {
        $pythonVersion = python --version 2>$null
        Write-ColorOutput "✅ Python 확인: $pythonVersion" "Success"
    } catch {
        Write-ColorOutput "❌ Python이 설치되지 않았습니다. 먼저 Python을 설치하세요." "Error"
        return $false
    }
    
    # GitHub CLI 확인
    try {
        $ghVersion = gh --version 2>$null | Select-Object -First 1
        Write-ColorOutput "✅ GitHub CLI 확인: $ghVersion" "Success"
    } catch {
        Write-ColorOutput "❌ GitHub CLI가 설치되지 않았습니다. 먼저 GitHub CLI를 설치하세요." "Error"
        return $false
    }
    
    return $true
}

function Install-CursorSettings {
    Write-ColorOutput "⚙️  Cursor 설정 적용 중..." "Info"
    
    $cursorUserPath = "$env:APPDATA\Cursor\User"
    if (!(Test-Path $cursorUserPath)) {
        New-Item -ItemType Directory -Path $cursorUserPath -Force | Out-Null
    }
    
    $currentDir = Split-Path -Parent $PSCommandPath
    $settingsDir = Join-Path (Split-Path -Parent $currentDir) "settings"
    
    # settings.json 복사
    $settingsSource = Join-Path $settingsDir "settings.json"
    $settingsTarget = Join-Path $cursorUserPath "settings.json"
    if (Test-Path $settingsSource) {
        Copy-Item -Path $settingsSource -Destination $settingsTarget -Force
        Write-ColorOutput "✅ settings.json 적용 완료" "Success"
    }
    
    # keybindings.json 복사
    $keybindingsSource = Join-Path $settingsDir "keybindings.json"
    $keybindingsTarget = Join-Path $cursorUserPath "keybindings.json"
    if (Test-Path $keybindingsSource) {
        Copy-Item -Path $keybindingsSource -Destination $keybindingsTarget -Force
        Write-ColorOutput "✅ keybindings.json 적용 완료" "Success"
    }
    
    # tasks.json을 모든 프로젝트에 적용하기 위한 전역 설정
    $globalTasksPath = "$env:APPDATA\Cursor\User\tasks.json"
    $tasksSource = Join-Path $settingsDir "tasks.json"
    if (Test-Path $tasksSource) {
        Copy-Item -Path $tasksSource -Destination $globalTasksPath -Force
        Write-ColorOutput "✅ 전역 tasks.json 적용 완료" "Success"
    }
}

function Setup-WSLIntegration {
    if ($SkipWSL) {
        Write-ColorOutput "⏭️  WSL 설정 건너뛰기..." "Info"
        return
    }
    
    Write-ColorOutput "🐧 WSL 통합 설정 중..." "Info"
    
    try {
        # WSL Ubuntu 24.04 상태 확인
        $wslStatus = wsl -l -v 2>$null
        if ($wslStatus -match "Ubuntu-24.04") {
            Write-ColorOutput "✅ WSL Ubuntu-24.04 감지됨" "Success"
            
            # Claude 자동 시작 스크립트를 WSL에 복사
            $currentDir = Split-Path -Parent $PSCommandPath
            $wslSetupDir = Join-Path (Split-Path -Parent $currentDir) "wsl-setup"
            $claudeScript = Join-Path $wslSetupDir "claude-auto-start.sh"
            
            if (Test-Path $claudeScript) {
                # WSL 홈 디렉토리에 스크립트 복사
                wsl -d Ubuntu-24.04 -e bash -c "mkdir -p ~/.cursor-automation"
                wsl -d Ubuntu-24.04 -e bash -c "cp /mnt/c/Users/7F-P-CNT-04-PC/Cursor_Project/Cursor설정관리용/wsl-setup/claude-auto-start.sh ~/.cursor-automation/"
                wsl -d Ubuntu-24.04 -e bash -c "chmod +x ~/.cursor-automation/claude-auto-start.sh"
                
                # 자동 시작 설정 실행
                wsl -d Ubuntu-24.04 -e bash -c "~/.cursor-automation/claude-auto-start.sh setup"
                
                Write-ColorOutput "✅ WSL Claude 자동 시작 설정 완료" "Success"
            }
        } else {
            Write-ColorOutput "⚠️  WSL Ubuntu-24.04가 설치되지 않았습니다" "Warning"
        }
    } catch {
        Write-ColorOutput "⚠️  WSL 설정 중 오류: $($_.Exception.Message)" "Warning"
    }
}

function Setup-ProjectDirectories {
    Write-ColorOutput "📁 프로젝트 디렉토리 설정 중..." "Info"
    
    $projectDirs = @(
        "C:\Dev",
        "C:\Dev\Python",
        "C:\Dev\Web",
        "C:\Dev\Data",
        "C:\Dev\API"
    )
    
    foreach ($dir in $projectDirs) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-ColorOutput "✅ 생성됨: $dir" "Success"
        } else {
            Write-ColorOutput "✅ 존재함: $dir" "Info"
        }
    }
}

function Create-DesktopShortcuts {
    Write-ColorOutput "🔗 바탕화면 바로가기 생성 중..." "Info"
    
    $WshShell = New-Object -comObject WScript.Shell
    
    # 프로젝트 모니터링 바로가기
    $shortcut1 = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\프로젝트 상태 확인.lnk")
    $shortcut1.TargetPath = "powershell.exe"
    $shortcut1.Arguments = "-ExecutionPolicy Bypass -File `"C:\Users\7F-P-CNT-04-PC\Cursor_Project\Cursor설정관리용\scripts\project-monitor.ps1`""
    $shortcut1.WorkingDirectory = "C:\Dev"
    $shortcut1.IconLocation = "shell32.dll,21"
    $shortcut1.Save()
    
    # 개발 폴더 바로가기
    $shortcut2 = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\개발 폴더.lnk")
    $shortcut2.TargetPath = "C:\Dev"
    $shortcut2.IconLocation = "shell32.dll,4"
    $shortcut2.Save()
    
    Write-ColorOutput "✅ 바탕화면 바로가기 생성 완료" "Success"
}

function Test-Installation {
    Write-ColorOutput "🔍 설치 확인 중..." "Info"
    
    $tests = @()
    
    # Cursor 설정 확인
    if (Test-Path "$env:APPDATA\Cursor\User\settings.json") {
        $tests += @{ Name = "Cursor settings.json"; Status = $true }
    } else {
        $tests += @{ Name = "Cursor settings.json"; Status = $false }
    }
    
    if (Test-Path "$env:APPDATA\Cursor\User\keybindings.json") {
        $tests += @{ Name = "Cursor keybindings.json"; Status = $true }
    } else {
        $tests += @{ Name = "Cursor keybindings.json"; Status = $false }
    }
    
    if (Test-Path "$env:APPDATA\Cursor\User\tasks.json") {
        $tests += @{ Name = "Cursor tasks.json"; Status = $true }
    } else {
        $tests += @{ Name = "Cursor tasks.json"; Status = $false }
    }
    
    # 디렉토리 확인
    if (Test-Path "C:\Dev") {
        $tests += @{ Name = "개발 디렉토리"; Status = $true }
    } else {
        $tests += @{ Name = "개발 디렉토리"; Status = $false }
    }
    
    # WSL 확인
    if (!$SkipWSL) {
        try {
            $wslTest = wsl -d Ubuntu-24.04 -e bash -c "test -f ~/.cursor-automation/claude-auto-start.sh && echo 'OK'" 2>$null
            $tests += @{ Name = "WSL Claude 스크립트"; Status = ($wslTest -eq "OK") }
        } catch {
            $tests += @{ Name = "WSL Claude 스크립트"; Status = $false }
        }
    }
    
    # 결과 출력
    Write-ColorOutput "`n📊 설치 확인 결과:" "Header"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Header"
    
    $successCount = 0
    foreach ($test in $tests) {
        if ($test.Status) {
            Write-ColorOutput "   ✅ $($test.Name)" "Success"
            $successCount++
        } else {
            Write-ColorOutput "   ❌ $($test.Name)" "Error"
        }
    }
    
    $totalTests = $tests.Count
    $successRate = [math]::Round(($successCount / $totalTests) * 100, 1)
    
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Header"
    Write-ColorOutput "📈 성공률: $successCount/$totalTests ($successRate%)" "Info"
    
    return ($successRate -ge 80)
}

function Show-UsageInstructions {
    Write-ColorOutput "`n🎯 사용 방법:" "Header"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Header"
    Write-ColorOutput "📋 단축키:" "Info"
    Write-ColorOutput "   Ctrl+Alt+S : 프로젝트 상태 확인" "Info"
    Write-ColorOutput "   Ctrl+Alt+R : 서비스 전체 재시작" "Info"
    Write-ColorOutput "   Ctrl+Alt+V : Python 가상환경 활성화" "Info"
    Write-ColorOutput "   Ctrl+Alt+G : Git 자동 커밋 `& 푸시" "Info"
    Write-ColorOutput "   Ctrl+Alt+N : Node.js 의존성 설치" "Info"
    Write-ColorOutput "   Ctrl+Alt+U : requirements.txt 업데이트" "Info"
    Write-ColorOutput "   Ctrl+Alt+C : Claude 터미널에서 실행" "Info"
    
    Write-ColorOutput "`n🎮 자동 기능:" "Info"
    Write-ColorOutput "   • 프로젝트 폴더 열기 시 자동 분석" "Info"
    Write-ColorOutput "   • 기술 스택 자동 감지" "Info"
    Write-ColorOutput "   • Python 가상환경 자동 활성화" "Info"
    Write-ColorOutput "   • Claude MCP 서버 자동 시작" "Info"
    Write-ColorOutput "   • Git 상태 자동 모니터링" "Info"
    
    Write-ColorOutput "`n📁 프로젝트 생성:" "Info"
    Write-ColorOutput "   1. C:\Dev 폴더에서 새 프로젝트 생성" "Info"
    Write-ColorOutput "   2. Cursor로 폴더 열기" "Info"
    Write-ColorOutput "   3. 자동으로 모든 설정 적용!" "Info"
    
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Header"
}

# 메인 실행
try {
    Show-Banner
    
    Write-ColorOutput "🔐 관리자 권한 확인 중..." "Info"
    if (!(Test-Administrator)) {
        Write-ColorOutput "⚠️  일부 기능에는 관리자 권한이 필요할 수 있습니다." "Warning"
    }
    
    Write-ColorOutput "🔄 설치 시작..." "Info"
    
    # 단계별 설치
    if (!(Install-Prerequisites)) {
        throw "필수 구성 요소가 충족되지 않았습니다."
    }
    
    Backup-ExistingSettings
    Install-CursorSettings
    Setup-WSLIntegration
    Setup-ProjectDirectories
    Create-DesktopShortcuts
    
    Write-ColorOutput "`n🎉 설치 완료!" "Success"
    
    # 설치 확인
    if (Test-Installation) {
        Write-ColorOutput "✅ 모든 구성 요소가 성공적으로 설치되었습니다!" "Success"
        Show-UsageInstructions
        
        Write-ColorOutput "`n🚀 Cursor를 다시 시작하여 새 설정을 적용하세요!" "Header"
        
        # Cursor 재시작 제안
        $restart = Read-Host "`n지금 Cursor를 재시작하시겠습니까? (y/N)"
        if ($restart -eq 'y' -or $restart -eq 'Y') {
            Write-ColorOutput "🔄 Cursor 재시작 중..." "Info"
            try {
                Stop-Process -Name "Cursor" -Force -ErrorAction SilentlyContinue
                Start-Sleep 2
                Start-Process "cursor"
                Write-ColorOutput "✅ Cursor 재시작 완료!" "Success"
            } catch {
                Write-ColorOutput "⚠️  수동으로 Cursor를 재시작해주세요." "Warning"
            }
        }
        
    } else {
        Write-ColorOutput "⚠️  일부 구성 요소 설치에 실패했습니다. 위의 오류를 확인하세요." "Warning"
    }
    
} catch {
    Write-ColorOutput "❌ 설치 중 오류 발생: $($_.Exception.Message)" "Error"
    Write-ColorOutput "💡 관리자 권한으로 다시 시도하거나 수동 설치를 진행하세요." "Info"
} 