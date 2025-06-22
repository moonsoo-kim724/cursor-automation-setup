# 🚀 Cursor 개발 자동화 환경 

> **완전 자동화된 개발 환경**: Python, Git, WSL, Vooster AI까지 원클릭으로 설치!

## 📋 기능 목록

✅ **자동 설치 도구들**
- Python 3.10
- Git & GitHub CLI  
- WSL Ubuntu 24.04
- Node.js & npm

✅ **Cursor 완전 자동화**
- 키보드 단축키 설정
- 프로젝트 자동 모니터링
- 가상환경 자동 설정
- Git 자동 커밋 & 푸시

✅ **Vooster AI 통합**
- 작업 우선순위 자동 분석
- 기술 스택별 자동 실행  
- 연속 작업 자동 처리

✅ **WSL Claude 자동화**
- Claude 프로세스 자동 관리
- 터미널 통합 실행

---

## 🔥 **새 PC에 원클릭 설치** 

### **1단계: PowerShell 관리자 실행**
```powershell
# Windows + X → A (관리자 PowerShell)
```

### **2단계: 이 저장소 클론**
```powershell
# GitHub에서 클론 (실제 URL로 교체)
git clone https://github.com/사용자명/cursor-automation-setup.git C:\Cursor_Project\Cursor설정관리용
cd C:\Cursor_Project\Cursor설정관리용
```

### **3단계: 원클릭 설치 실행**
```powershell
# 실행 정책 변경 (일시적)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 자동 설치 실행
.\quick-install.ps1
```

### **4단계: 완료!** 🎉
- 모든 개발 도구가 자동으로 설치됩니다
- Cursor 설정이 자동으로 적용됩니다  
- C:\Dev 폴더에서 개발을 시작하세요!

---

## ⌨️ **키보드 단축키**

| 단축키 | 기능 |
|--------|------|
| `Ctrl+Alt+S` | 📊 프로젝트 상태 확인 |
| `Ctrl+Alt+V` | 🐍 Python 가상환경 활성화 |
| `Ctrl+Alt+G` | 📝 Git 자동 커밋 & 푸시 |
| `Ctrl+Alt+N` | 📦 Node.js 의존성 설치 |
| `Ctrl+Alt+U` | 📋 requirements.txt 업데이트 |
| `Ctrl+Alt+C` | 🤖 Claude 터미널 실행 |
| `Ctrl+Alt+Shift+V` | 🎯 Vooster AI 작업 관리 |
| `Ctrl+Alt+R` | 🔄 모든 서비스 재시작 |

---

## 📁 **프로젝트 구조**

```
C:\Dev\                      # 모든 프로젝트의 홈
├── Python\                  # Python 프로젝트
├── Web\                     # 웹 프로젝트 (React, Next.js)
├── Data\                    # 데이터 분석 프로젝트  
└── API\                     # API 서버 프로젝트

C:\Cursor_Project\Cursor설정관리용\
├── scripts\                 # 자동화 스크립트
│   ├── project-monitor.ps1  # 프로젝트 모니터링
│   ├── vooster-ai-automation.ps1  # Vooster AI 자동화
│   └── quick-install.ps1    # 원클릭 설치
├── settings\                # Cursor 설정 파일
│   ├── settings.json        # IDE 설정
│   ├── keybindings.json     # 키바인딩
│   └── tasks.json           # 작업 설정
├── wsl-setup\               # WSL 설정
│   └── claude-auto-start.sh # Claude 자동 시작
└── README.md                # 이 파일
```

---

## 🎯 **사용 방법**

### **새 프로젝트 시작**
1. Cursor에서 `C:\Dev` 폴더 열기
2. 새 폴더 생성 (예: `my-awesome-project`)  
3. 폴더를 열면 **자동으로 모든 설정 적용**!

### **Python 프로젝트**
- 가상환경 자동 생성 및 활성화
- requirements.txt 자동 관리
- FastAPI 기본 구조 생성

### **웹 프로젝트**  
- Next.js + TypeScript + Tailwind CSS 자동 설정
- 필수 패키지 자동 설치
- 모던 UI 컴포넌트 구조

### **Git 자동화**
- 자동 `git init`
- 자동 `.gitignore` 생성
- 자동 GitHub 저장소 생성 및 연결

---

## 🤖 **Vooster AI 작업 관리**

### **자동 작업 분류**
- **NEXTJS**: Next.js 프로젝트 자동 설정
- **PYTHON**: Python 가상환경 + FastAPI  
- **GIT**: Git 저장소 + GitHub 연동

### **작업 자동 실행**
1. 프로젝트 폴더 열기
2. Vooster AI 자동 연결 (프로젝트 UID: NJIV)
3. 우선순위별 작업 자동 실행
4. 완료 후 다음 작업 자동 진행

---

## 🐧 **WSL Claude 자동화**

### **Claude 명령어**
```bash
# WSL에서 사용 가능한 명령어
claude-start    # Claude 시작
claude-status   # 상태 확인  
claude-restart  # 재시작
```

### **자동 시작 설정**
- Cursor 폴더 열 때 자동 실행
- `Ctrl+Alt+C`로 즉시 Claude 터미널

---

## 🔧 **문제 해결**

### **설정이 적용되지 않을 때**
```powershell
# Cursor 재시작
# WSL 재시작  
wsl --shutdown
```

### **GitHub 인증**
```powershell
# GitHub CLI 로그인
gh auth login
```

### **Python 가상환경 문제**
```powershell
# 가상환경 수동 생성
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### **WSL 문제**
```powershell
# WSL 완전 재시작
wsl --shutdown
wsl
```

---

## 🎊 **설치 후 확인사항**

✅ **필수 도구 설치 확인**
```powershell
python --version    # Python 3.10.x
git --version       # git version 2.x
gh --version        # gh version 2.x
wsl --version       # WSL 버전 확인
```

✅ **Cursor 설정 확인**
- `Ctrl+Alt+S` 프로젝트 상태 확인 작동
- 자동 완성 및 IntelliSense 작동
- 터미널 통합 작동

✅ **개발 환경 확인**  
- `C:\Dev` 폴더 존재
- WSL Ubuntu 실행 가능
- Claude 터미널 실행 가능

---

## 📞 **지원 및 업데이트**

### **자동 업데이트**
```powershell
# 설정 폴더에서 실행
cd C:\Cursor_Project\Cursor설정관리용
git pull origin main
.\quick-install.ps1
```

### **수동 설정**
각 스크립트와 설정 파일은 독립적으로 실행 가능합니다.

---

## 🏆 **주요 특징**

🔥 **완전 자동화**: 클릭 한 번으로 모든 설정 완료  
🎯 **스마트 감지**: 프로젝트 타입 자동 인식  
⚡ **빠른 실행**: 키보드 단축키로 즉시 실행  
🤖 **AI 통합**: Vooster AI 작업 관리 자동화  
🔄 **지속적 동기화**: 모든 PC에서 동일한 환경  

---

**🚀 이제 모든 PC에서 동일한 최적화된 개발 환경을 사용하세요!**
