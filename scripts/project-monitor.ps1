# 프로젝트 자동 모니터링 및 기술 스택 감지 스크립트
# Author: Cursor 자동화 시스템
# 목적: 프로젝트 폴더를 열 때 자동으로 기술 스택 감지 및 필요한 서비스 실행

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = (Get-Location).Path
)

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

function Show-Header {
    Write-ColorOutput "🚀 ========================================" "Header"
    Write-ColorOutput "   Cursor 프로젝트 자동화 모니터링 시스템" "Header"
    Write-ColorOutput "   Project: $(Split-Path $ProjectPath -Leaf)" "Header"
    Write-ColorOutput "=========================================" "Header"
}

function Test-TechStack {
    param([string]$Path)
    
    $detected = @{
        Python = $false
        NodeJS = $false
        NextJS = $false
        TailwindCSS = $false
        ShadcnUI = $false
        FastAPI = $false
        Django = $false
        React = $false
        TypeScript = $false
        Git = $false
    }
    
    # Python 감지
    if ((Test-Path "$Path/requirements.txt") -or 
        (Test-Path "$Path/pyproject.toml") -or 
        (Test-Path "$Path/setup.py") -or
        (Test-Path "$Path/.venv") -or
        (Get-ChildItem "$Path" -Filter "*.py" -ErrorAction SilentlyContinue)) {
        $detected.Python = $true
    }
    
    # Node.js 감지
    if ((Test-Path "$Path/package.json") -or (Test-Path "$Path/node_modules")) {
        $detected.NodeJS = $true
        
        # package.json 상세 분석
        if (Test-Path "$Path/package.json") {
            $packageJson = Get-Content "$Path/package.json" -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
            
            if ($packageJson.dependencies -or $packageJson.devDependencies) {
                $deps = @()
                if ($packageJson.dependencies) { $deps += $packageJson.dependencies.PSObject.Properties.Name }
                if ($packageJson.devDependencies) { $deps += $packageJson.devDependencies.PSObject.Properties.Name }
                
                # 프레임워크 감지
                if ($deps -contains "next" -or $deps -contains "@next/core") { $detected.NextJS = $true }
                if ($deps -contains "react" -or $deps -contains "@types/react") { $detected.React = $true }
                if ($deps -contains "tailwindcss") { $detected.TailwindCSS = $true }
                if ($deps -contains "@shadcn/ui" -or $deps -contains "shadcn-ui") { $detected.ShadcnUI = $true }
                if ($deps -contains "typescript" -or $deps -contains "@types/node") { $detected.TypeScript = $true }
            }
        }
    }
    
    # Python 웹 프레임워크 감지
    if ($detected.Python) {
        if (Test-Path "$Path/requirements.txt") {
            $requirements = Get-Content "$Path/requirements.txt" -ErrorAction SilentlyContinue
            if ($requirements -match "fastapi|FastAPI") { $detected.FastAPI = $true }
            if ($requirements -match "django|Django") { $detected.Django = $true }
        }
    }
    
    # Git 감지
    if (Test-Path "$Path/.git") { $detected.Git = $true }
    
    return $detected
}

function Start-AutoServices {
    param([hashtable]$TechStack, [string]$ProjectPath)
    
    Write-ColorOutput "🔧 감지된 기술 스택에 따른 서비스 자동 실행..." "Info"
    
    $services = @()
    
    # Python 가상환경 활성화
    if ($TechStack.Python) {
        if (Test-Path "$ProjectPath/.venv/Scripts/Activate.ps1") {
            Write-ColorOutput "🐍 Python 가상환경 활성화 중..." "Info"
            & "$ProjectPath/.venv/Scripts/Activate.ps1"
            $services += "Python 가상환경"
        } else {
            Write-ColorOutput "⚠️  Python 가상환경이 없습니다. 생성하시겠습니까? (python -m venv .venv)" "Warning"
        }
    }
    
    # Node.js 의존성 설치 확인
    if ($TechStack.NodeJS -and !(Test-Path "$ProjectPath/node_modules")) {
        Write-ColorOutput "📦 Node.js 의존성이 설치되지 않았습니다. npm install을 실행하시겠습니까?" "Warning"
    }
    
    # Claude MCP 서버 시작
    Write-ColorOutput "🤖 Claude MCP 서버 시작 중..." "Info"
    Start-Job -ScriptBlock {
        wsl -d Ubuntu-24.04 -e bash -c "cd ~ && claude &"
    } -Name "ClaudeMCP" | Out-Null
    $services += "Claude MCP 서버"
    
    # Vooster AI 작업 관리 자동화 시작
    Write-ColorOutput "🚀 Vooster AI 작업 관리 자동화 시작 중..." "Info"
    try {
        $voosterScript = Join-Path (Split-Path $PSScriptRoot -Parent) "scripts\vooster-ai-automation.ps1"
        if (Test-Path $voosterScript) {
            Start-Job -ScriptBlock {
                param($script, $path)
                & $script -ProjectPath $path
            } -ArgumentList $voosterScript, $ProjectPath -Name "VoosterAI" | Out-Null
            $services += "Vooster AI 작업 관리"
        } else {
            Write-ColorOutput "   ⚠️  Vooster AI 스크립트를 찾을 수 없습니다" "Warning"
        }
    } catch {
        Write-ColorOutput "   ⚠️  Vooster AI 시작 실패: $($_.Exception.Message)" "Warning"
    }
    
    # Git 상태 확인
    if ($TechStack.Git) {
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-ColorOutput "📝 변경된 파일이 있습니다. 자동 커밋하시겠습니까?" "Warning"
        }
    }
    
    return $services
}

function Show-ProjectStatus {
    param([hashtable]$TechStack, [array]$RunningServices, [string]$ProjectPath)
    
    Write-ColorOutput "`n📊 프로젝트 상태 대시보드" "Header"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Header"
    
    # 기술 스택 표시
    Write-ColorOutput "🛠️  감지된 기술 스택:" "Info"
    foreach ($tech in $TechStack.GetEnumerator()) {
        if ($tech.Value) {
            $icon = switch ($tech.Name) {
                "Python" { "🐍" }
                "NodeJS" { "💚" }
                "NextJS" { "⚡" }
                "TailwindCSS" { "🎨" }
                "ShadcnUI" { "🎭" }
                "FastAPI" { "🚀" }
                "Django" { "🎸" }
                "React" { "⚛️" }
                "TypeScript" { "📘" }
                "Git" { "📝" }
                default { "✅" }
            }
            Write-ColorOutput "   $icon $($tech.Name)" "Success"
        }
    }
    
    # 실행 중인 서비스
    Write-ColorOutput "`n🔧 실행 중인 서비스:" "Info"
    if ($RunningServices.Count -gt 0) {
        foreach ($service in $RunningServices) {
            Write-ColorOutput "   ✅ $service" "Success"
        }
    } else {
        Write-ColorOutput "   ❌ 실행 중인 서비스가 없습니다" "Warning"
    }
    
    # 권장 다음 단계
    Write-ColorOutput "`n💡 권장 다음 단계:" "Info"
    
    if ($TechStack.Python -and !(Test-Path "$ProjectPath/.venv")) {
        Write-ColorOutput "   📦 Python 가상환경 생성: python -m venv .venv" "Warning"
    }
    
    if ($TechStack.NodeJS -and !(Test-Path "$ProjectPath/node_modules")) {
        Write-ColorOutput "   📦 Node.js 의존성 설치: npm install" "Warning"
    }
    
    if (!$TechStack.Git) {
        Write-ColorOutput "   📝 Git 저장소 초기화: git init" "Warning"
    }
    
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Header"
}

function Save-ProjectConfig {
    param([hashtable]$TechStack, [string]$ProjectPath)
    
    $config = @{
        ProjectName = Split-Path $ProjectPath -Leaf
        ProjectPath = $ProjectPath
        TechStack = $TechStack
        LastChecked = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        AutoServices = @()
    }
    
    # 자동 실행 서비스 설정
    if ($TechStack.Python) { $config.AutoServices += "python-venv" }
    if ($TechStack.NodeJS) { $config.AutoServices += "node-deps-check" }
    $config.AutoServices += "claude-mcp"
    if ($TechStack.Git) { $config.AutoServices += "git-status" }
    
    $configPath = "$ProjectPath/.cursor-project-config.json"
    $config | ConvertTo-Json -Depth 3 | Out-File -FilePath $configPath -Encoding UTF8
    
    Write-ColorOutput "💾 프로젝트 설정이 저장되었습니다: .cursor-project-config.json" "Success"
}

# 메인 실행
try {
    Show-Header
    
    Write-ColorOutput "🔍 프로젝트 분석 중..." "Info"
    $detectedTech = Test-TechStack -Path $ProjectPath
    
    Write-ColorOutput "🚀 자동 서비스 시작 중..." "Info"
    $runningServices = Start-AutoServices -TechStack $detectedTech -ProjectPath $ProjectPath
    
    Show-ProjectStatus -TechStack $detectedTech -RunningServices $runningServices -ProjectPath $ProjectPath
    
    Save-ProjectConfig -TechStack $detectedTech -ProjectPath $ProjectPath
    
    Write-ColorOutput "`n🎉 프로젝트 자동화 설정 완료!" "Success"
    Write-ColorOutput "💡 단축키: Ctrl+Alt+S (상태 확인), Ctrl+Alt+R (서비스 재시작)" "Info"
    
} catch {
    Write-ColorOutput "❌ 오류 발생: $($_.Exception.Message)" "Error"
} 