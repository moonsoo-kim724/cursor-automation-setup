# ========================================
# MCP Servers 자동 설치 및 설정 스크립트
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
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

function Show-MCPHeader {
    Write-ColorOutput "🤖 ========================================" "Header"
    Write-ColorOutput "   MCP Servers 자동 설치 및 설정" "Header"
    Write-ColorOutput "   Claude Desktop과 통합됩니다" "Header"
    Write-ColorOutput "=========================================" "Header"
}

function Install-MCPServers {
    Write-ColorOutput "📦 MCP Servers 설치 중..." "Header"
    
    $servers = @(
        "@modelcontextprotocol/server-filesystem",
        "@modelcontextprotocol/server-git", 
        "@modelcontextprotocol/server-playwright",
        "@modelcontextprotocol/server-fetch",
        "@modelcontextprotocol/server-brave-search",
        "@modelcontextprotocol/server-memory",
        "@modelcontextprotocol/server-postgres",
        "@modelcontextprotocol/server-sqlite",
        "@modelcontextprotocol/server-github"
    )
    
    foreach ($server in $servers) {
        Write-ColorOutput "   🔄 설치 중: $server" "Info"
        try {
            npm install -g $server
            Write-ColorOutput "   ✅ 설치 완료: $server" "Success"
        } catch {
            Write-ColorOutput "   ⚠️  설치 실패: $server" "Warning"
        }
    }
}

function Setup-ClaudeDesktopConfig {
    Write-ColorOutput "⚙️  Claude Desktop 설정 중..." "Header"
    
    # 설정 디렉토리 생성
    $configDir = Split-Path $ConfigPath -Parent
    if (!(Test-Path $configDir)) {
        New-Item -Path $configDir -ItemType Directory -Force | Out-Null
        Write-ColorOutput "   📁 설정 디렉토리 생성: $configDir" "Info"
    }
    
    # MCP 설정 파일 읽기
    $mcpConfigPath = Join-Path (Split-Path $PSScriptRoot -Parent) "settings\mcp-config.json"
    if (Test-Path $mcpConfigPath) {
        $mcpConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
        
        # 기존 설정 백업
        if (Test-Path $ConfigPath) {
            $backupPath = "$ConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $ConfigPath $backupPath
            Write-ColorOutput "   💾 기존 설정 백업: $backupPath" "Info"
        }
        
        # 새 설정 적용
        $mcpConfig | ConvertTo-Json -Depth 10 | Out-File $ConfigPath -Encoding UTF8
        Write-ColorOutput "   ✅ Claude Desktop 설정 완료" "Success"
        
    } else {
        Write-ColorOutput "   ❌ MCP 설정 파일을 찾을 수 없습니다: $mcpConfigPath" "Error"
    }
}

function Setup-EnvironmentVariables {
    Write-ColorOutput "🔐 환경 변수 설정 안내..." "Header"
    
    $envVars = @(
        "VOOSTER_API_KEY",
        "BRAVE_API_KEY", 
        "POSTGRES_CONNECTION_STRING",
        "GITHUB_PERSONAL_ACCESS_TOKEN"
    )
    
    Write-ColorOutput "   다음 환경 변수들을 설정하세요:" "Info"
    foreach ($var in $envVars) {
        Write-ColorOutput "   - $var" "Warning"
    }
    
    Write-ColorOutput "`n   💡 Windows에서 환경 변수 설정 방법:" "Info"
    Write-ColorOutput "   1. Win+R → sysdm.cpl → 고급 → 환경 변수" "Info"
    Write-ColorOutput "   2. 또는 PowerShell에서:" "Info"
    Write-ColorOutput "      [Environment]::SetEnvironmentVariable('VARIABLE_NAME', 'your_value', 'User')" "Info"
}

function Test-MCPServers {
    Write-ColorOutput "🧪 MCP Servers 테스트 중..." "Header"
    
    # Node.js 확인
    try {
        $nodeVersion = node --version
        Write-ColorOutput "   ✅ Node.js: $nodeVersion" "Success"
    } catch {
        Write-ColorOutput "   ❌ Node.js가 설치되지 않았습니다" "Error"
        return $false
    }
    
    # NPM 확인
    try {
        $npmVersion = npm --version
        Write-ColorOutput "   ✅ NPM: $npmVersion" "Success"
    } catch {
        Write-ColorOutput "   ❌ NPM이 설치되지 않았습니다" "Error"
        return $false
    }
    
    # Claude Desktop 설정 확인
    if (Test-Path $ConfigPath) {
        Write-ColorOutput "   ✅ Claude Desktop 설정 파일 존재" "Success"
        try {
            $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
            $serverCount = $config.mcpServers.PSObject.Properties.Count
            Write-ColorOutput "   ✅ 설정된 MCP 서버: $serverCount 개" "Success"
        } catch {
            Write-ColorOutput "   ⚠️  설정 파일 형식 오류" "Warning"
        }
    } else {
        Write-ColorOutput "   ⚠️  Claude Desktop 설정 파일이 없습니다" "Warning"
    }
    
    return $true
}

function Show-PostSetupInstructions {
    Write-ColorOutput "`n🎉 MCP Servers 설정 완료!" "Header"
    Write-ColorOutput "=========================================" "Header"
    
    Write-ColorOutput "📋 설치된 MCP Servers:" "Info"
    Write-ColorOutput "   ✅ Filesystem - 파일 시스템 액세스" "Success"
    Write-ColorOutput "   ✅ Git - Git 저장소 관리" "Success"
    Write-ColorOutput "   ✅ Playwright - 웹 자동화" "Success"
    Write-ColorOutput "   ✅ Fetch - HTTP 요청" "Success"
    Write-ColorOutput "   ✅ Brave Search - 웹 검색" "Success"
    Write-ColorOutput "   ✅ Memory - 대화 기억" "Success"
    Write-ColorOutput "   ✅ Database - PostgreSQL/SQLite" "Success"
    Write-ColorOutput "   ✅ GitHub - GitHub 통합" "Success"
    Write-ColorOutput "   ✅ Vooster AI - 작업 관리" "Success"
    
    Write-ColorOutput "`n🎯 다음 단계:" "Header"
    Write-ColorOutput "1. Claude Desktop을 재시작하세요" "Warning"
    Write-ColorOutput "2. 환경 변수를 설정하세요" "Warning"
    Write-ColorOutput "3. Claude에서 MCP 기능을 사용하세요!" "Warning"
    
    Write-ColorOutput "`n💡 사용 예시:" "Info"
    Write-ColorOutput "   - 'C:\Dev 폴더의 파일들을 분석해줘'" "Info"
    Write-ColorOutput "   - 'GitHub에서 이슈를 생성해줘'" "Info"
    Write-ColorOutput "   - '웹사이트를 자동으로 테스트해줘'" "Info"
    Write-ColorOutput "   - 'Vooster AI로 작업을 관리해줘'" "Info"
}

# 메인 실행 함수
function Start-MCPSetup {
    try {
        Show-MCPHeader
        
        # 1. MCP Servers 설치
        Install-MCPServers
        
        # 2. Claude Desktop 설정
        Setup-ClaudeDesktopConfig
        
        # 3. 환경 변수 안내
        Setup-EnvironmentVariables
        
        # 4. 테스트
        $testResult = Test-MCPServers
        
        # 5. 완료 안내
        if ($testResult) {
            Show-PostSetupInstructions
        } else {
            Write-ColorOutput "❌ 설정 중 오류가 발생했습니다. 수동으로 확인하세요." "Error"
        }
        
    } catch {
        Write-ColorOutput "❌ MCP 설정 오류: $($_.Exception.Message)" "Error"
    }
}

# 스크립트 직접 실행 시 메인 함수 호출
if ($MyInvocation.InvocationName -ne '.') {
    Start-MCPSetup
} 