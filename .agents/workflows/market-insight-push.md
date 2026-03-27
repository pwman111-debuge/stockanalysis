---
description: 마켓 인사이트 보고서 GitHub Push 워크플로우
---

# 📥 마켓 인사이트 보고서 GitHub Push 워크플로우

이 워크플로우는 `마켓 인사이트` 폴더에서 생성된 보고서를 `krx-intelligence` 프로젝트의 `content/market-insight` 경로로 복사한 후, 지정된 GitHub 저장소로 자동 Push하는 과정을 정의합니다.

## 📌 실행 트리거
사용자가 **"push 하자"**, **"푸시해줘"**, 또는 **"/push"**라고 요청하면 이 워크플로우를 시작합니다. 
사용자가 "전권"을 부여하였으므로 추가 확인 없이 프로세스를 완료합니다.

## 🛠 단계별 프로세스

### 1단계: 대상 파일 식별 및 복사
1. `c:\Users\hwang\OneDrive\바탕 화면\안티그라비티폴더\마켓 인사이트` 폴더에서 가장 최근에 생성된 보고서 파일(예: `20260326_미국_이란_분쟁_분석_보고서.md`)을 찾습니다.
2. 해당 파일을 `c:\Users\hwang\OneDrive\바탕 화면\안티그라비티폴더\주식 정보 웹페이지\krx-intelligence\content\market-insight\` 경로로 복사합니다.

### 2단계: Git 저장소 설정 확인
// turbo-all
1. 작업 디렉토리를 `c:\Users\hwang\OneDrive\바탕 화면\안티그라비티폴더\주식 정보 웹페이지\krx-intelligence`로 간주합니다.
2. 원격 저장소(`origin`)가 `https://github.com/pwman111-debuge/stockanalysis`로 설정되어 있는지 확인합니다.
3. 설정되어 있지 않다면 다음 명령을 실행합니다:
   ```powershell
   git remote add origin https://github.com/pwman111-debuge/stockanalysis
   ```

### 3단계: Commit 및 Push 실행
// turbo-all
1. **변경사항 스테이징:**
   ```powershell
   git add content/market-insight/
   ```
2. **커밋 생성 (날짜 포함):**
   ```powershell
   git commit -m "Upload Market Insight report: $(Get-Date -Format 'yyyy-MM-dd')"
   ```
3. **원격 저장소로 Push:**
   ```powershell
   git push -u origin main
   ```

### 4단계: 완료 보고
1. Push가 성공하면 사용자에게 완료 메시지와 함께 GitHub 저장소 링크를 제공합니다.
   - 저장소 링크: https://github.com/pwman111-debuge/stockanalysis
