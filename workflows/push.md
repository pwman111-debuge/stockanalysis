---
description: 생성된 투자 성과 리뷰 보고서를 GitHub 저장소로 배포하는 절차
---

# 성과 리뷰 보고서 배포 가이드 (Push SOP)

본 가이드(SOP)는 `투자성과 리뷰` 폴더 내에 생성된 리포트 파일을 외부 GitHub 전용 저장소로 안전하게 배포하기 위한 절차를 정의합니다.

## 1. 배포 대상 정보
- **저장소 URL:** `https://github.com/pwman111-debuge/stockanalysis`
- **배포 방식:** Git Push (Main Branch)

## 2. 실행 시점 (Trigger)
- 성과 리뷰 보고서 생성이 완료된 후 사용자가 **"Push 하자"**, **"배포해줘"**, **"업로드 진행"**과 같은 명령을 내릴 때 실행합니다.

## 3. 배포 표준 절차 (Step-by-Step)
1. **로컬 Git 상태 감지:** 현재 폴더가 Git 저장소인지 확인하고, 변경된 리포트 파일 리스트를 추출합니다.
2. **변경 사항 스테이징:** `git add` 명령을 사용하여 배포할 파일을 준비합니다.
3. **커밋 메시지 작성:** `[Review] YYYY-MM-DD 성과 리뷰 보고서 신규 배포` 형식을 따릅니다.
4. **원격 저장소 전송:** `origin main` 브랜치로 푸시를 수행하여 배포를 완료합니다.

---

// turbo
## 성과 리뷰 보고서 자동 배포
1. Git 로컬 저장소 초기화 및 원격 저장소 연결 확인 (`https://github.com/pwman111-debuge/stockanalysis`)
2. 변경된 모든 MD 리포트 파일 추가 (`git add -A`)
3. 표준 커밋 메시지 자동 생성 및 반영 (`git commit -m "[Review] 성과 리뷰 보고서 자동 업데이트"`)
4. 최종 원격 저장소 반영 (`git push origin main`)
